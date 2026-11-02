const crypto = require('crypto')
const { waitUntil } = require('@vercel/functions')
const User = require('../models/usersModels')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const { JWT_ALGORITHM } = require('../middleware/auth')
const { jwtSecret, siteUrl, isProduction, corsOrigins } = require('../config')
const mailer = require('../services/mailer')
const { passwordFields } = require('../services/passwords')
const logger = require('../logger')
const { badRequest, unauthorized, notFound, conflict } = require('../utils/httpErrors')

// Same message for unknown email and wrong password, to avoid user enumeration
const INVALID_CREDENTIALS = 'Invalid email or password'
const IN_USE = 'Email or username already in use'

// Never send password hashes to the client
const toPublicUser = (user) => ({ _id: user._id, username: user.username, email: user.email, role: user.role })

// Session token and public data returned by login and register
const sessionFor = (user) => ({
  token: jwt.sign({ _id: user._id, username: user.username, email: user.email, role: user.role }, jwtSecret, {
    expiresIn: '1d',
    algorithm: JWT_ALGORITHM,
  }),
  username: user.username,
  email: user.email,
  role: user.role,
})

const ensureAvailable = async (email, username) => {
  if (await User.exists({ $or: [{ email }, { username }] })) throw conflict(IN_USE)
}

// Registering also signs the user in
const register = async (req, res) => {
  const { username, email, password } = req.body
  await ensureAvailable(email, username)
  const user = await User.create({ username, email, password: await argon2.hash(password), role: 'user' })
  res.status(201).json({ ok: true, message: `Welcome ${user.username}!`, ...sessionFor(user) })
}

const login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  const match = user ? await argon2.verify(user.password, password) : false
  if (!match) throw unauthorized(INVALID_CREDENTIALS)
  res.json({ ok: true, message: `Hi ${user.username}!`, ...sessionFor(user) })
}

// The token was already verified by requireAuth
const me = (req, res) => {
  const { _id, username, email, role } = req.user
  res.json({ ok: true, user: { _id, username, email, role } })
}

const findAllUsers = async (req, res) => {
  res.send(await User.find().select('-password'))
}

const addNewUser = async (req, res) => {
  const { username, email, password, role } = req.body
  await ensureAvailable(email, username)
  const done = await User.create({ username, email, password: await argon2.hash(password), role })
  res.status(201).json({ ok: true, user: toPublicUser(done) })
}

const deleteUser = async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw badRequest('You cannot delete your own account')
  const removed = await User.deleteOne({ _id: req.params.id })
  if (!removed.deletedCount) throw notFound('User not found')
  res.send({ removed })
}

const updateUser = async (req, res) => {
  const { username, role } = req.body
  if (String(req.params.id) === String(req.user._id) && role && role !== 'admin') {
    throw badRequest('You cannot remove your own admin role')
  }
  const updateData = {}
  if (role) updateData.role = role
  if (username) updateData.username = username
  const updated = await User.updateOne({ _id: req.params.id }, updateData)
  if (!updated.matchedCount) throw notFound('User not found')
  res.send({ updated })
}

// Closes the other sessions and returns a new one for this device
const changePassword = async (req, res) => {
  const { currentPassword, password } = req.body
  const user = await User.findById(req.user._id)
  if (!user) throw unauthorized('Invalid or expired token')
  if (!(await argon2.verify(user.password, currentPassword))) throw badRequest('The current password is not correct')
  Object.assign(user, await passwordFields(password))
  await user.save()
  res.json({ ok: true, message: 'Password changed', ...sessionFor(user) })
}

const RESET_TOKEN_MS = 60 * 60 * 1000
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

// From the configuration, never from the request: a forged Host header could not redirect the link
const resetUrlBase = () => siteUrl || (isProduction ? null : corsOrigins[0])

// Looks for the user and sends the email. The fictional users of the sample content have no real inbox
const sendRecovery = async (email) => {
  try {
    const user = await User.findOne({ email, seed: { $ne: true } })
    if (!user) return
    const base = resetUrlBase()
    if (!base) {
      logger.error('Password recovery email not sent: SITE_URL is not configured')
      return
    }
    const token = crypto.randomBytes(32).toString('hex')
    await User.updateOne(
      { _id: user._id },
      { resetTokenHash: hashToken(token), resetTokenExpires: new Date(Date.now() + RESET_TOKEN_MS) }
    )
    // In the fragment (#), which browsers do not send: the token stays out of the server logs
    await mailer.sendPasswordResetEmail(user, `${base}/reset-password#token=${token}`)
  } catch (error) {
    logger.error({ err: error }, 'Password recovery failed')
  }
}

// Answers first and works afterwards, so neither the text nor the time reveals which emails are registered.
// waitUntil keeps a serverless function alive until the work ends; on a normal server it just runs
const forgotPassword = (req, res) => {
  res.json({ ok: true, message: 'If that email is registered, we have sent a link to reset the password' })
  waitUntil(sendRecovery(req.body.email))
}

// Works once. The user signs in afterwards, with every old session closed
const resetPassword = async (req, res) => {
  const { token, password } = req.body
  const user = await User.findOne({ resetTokenHash: hashToken(token), resetTokenExpires: { $gt: new Date() } })
  if (!user) throw badRequest('This link is not valid or has expired. Please ask for a new one')
  await User.updateOne(
    { _id: user._id },
    { ...(await passwordFields(password)), $unset: { resetTokenHash: 1, resetTokenExpires: 1 } }
  )
  res.json({ ok: true, message: 'Password changed. You can sign in now' })
}

module.exports = {
  register,
  login,
  me,
  changePassword,
  forgotPassword,
  resetPassword,
  findAllUsers,
  addNewUser,
  deleteUser,
  updateUser,
}
