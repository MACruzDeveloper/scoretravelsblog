const User = require('../models/usersModels')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const { JWT_ALGORITHM } = require('../middleware/auth')
const { jwtSecret } = require('../config')
const { badRequest, unauthorized, notFound, conflict } = require('../utils/httpErrors')

// Same message for unknown email and wrong password, to avoid user enumeration
const INVALID_CREDENTIALS = 'Invalid email or password'
const IN_USE = 'Email or username already in use'

// Never send password hashes to the client
const toPublicUser = (user) => ({ _id: user._id, username: user.username, email: user.email, role: user.role })

const ensureAvailable = async (email, username) => {
  if (await User.exists({ $or: [{ email }, { username }] })) throw conflict(IN_USE)
}

const register = async (req, res) => {
  const { username, email, password } = req.body
  await ensureAvailable(email, username)
  await User.create({ username, email, password: await argon2.hash(password), role: 'user' })
  res.status(201).json({ ok: true, message: 'Successful register' })
}

const login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  const match = user ? await argon2.verify(user.password, password) : false
  if (!match) throw unauthorized(INVALID_CREDENTIALS)

  const token = jwt.sign({ _id: user._id, username: user.username, email: user.email, role: user.role }, jwtSecret, {
    expiresIn: '1d',
    algorithm: JWT_ALGORITHM,
  })
  res.json({
    ok: true,
    message: `Hi ${user.username}!`,
    token,
    username: user.username,
    email: user.email,
    role: user.role,
  })
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

module.exports = { register, login, me, findAllUsers, addNewUser, deleteUser, updateUser }
