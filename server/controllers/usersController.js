const User = require('../models/usersModels')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const { JWT_ALGORITHM } = require('../middleware/auth')
const jwt_secret = process.env.JWT_SECRET

// Same message for unknown email and wrong password, to avoid user enumeration
const INVALID_CREDENTIALS = 'Invalid email or password'

const isDuplicateKey = (error) => error && error.code === 11000

// Never send password hashes to the client
const toPublicUser = (user) => ({ _id: user._id, username: user.username, email: user.email, role: user.role })

const register = async (req, res) => {
  const { username, email, password } = req.body
  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) return res.status(409).json({ ok: false, message: 'Email or username already in use' })
    const hash = await argon2.hash(password)
    await User.create({ username, email, password: hash, role: 'user' })
    res.status(201).json({ ok: true, message: 'Successful register' })
  } catch (error) {
    if (isDuplicateKey(error)) return res.status(409).json({ ok: false, message: 'Email or username already in use' })
    console.error('Register failed:', error.message)
    res.status(500).json({ ok: false, message: 'Registration failed' })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    const match = user ? await argon2.verify(user.password, password) : false
    if (!match) return res.status(401).json({ ok: false, message: INVALID_CREDENTIALS })

    const token = jwt.sign(
      { _id: user._id, username: user.username, email: user.email, role: user.role },
      jwt_secret,
      { expiresIn: '1d', algorithm: JWT_ALGORITHM }
    )
    res.json({ ok: true, message: `Hi ${user.username}!`, token, username: user.username, email: user.email, role: user.role })
  } catch (error) {
    console.error('Login failed:', error.message)
    res.status(500).json({ ok: false, message: 'Login failed' })
  }
}

const verify_token = (req, res) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : header
  if (!token) return res.status(401).json({ ok: false, message: 'No token provided' })
  try {
    const succ = jwt.verify(token, jwt_secret, { algorithms: [JWT_ALGORITHM] })
    return res.json({ ok: true, succ })
  } catch (error) {
    return res.status(401).json({ ok: false, message: 'Invalid or expired token' })
  }
}

const findAllUsers = async (req, res) => {
  try {
    const us = await User.find().select('-password')
    res.send(us)
  }
  catch (error) {
    console.error('Fetch users failed:', error.message)
    res.status(500).json({ ok: false, message: 'Error fetching users' })
  }
}

const addNewUser = async (req, res) => {
  const { username, email, password, role } = req.body
  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) return res.status(409).json({ ok: false, message: 'Email or username already in use' })
    const hash = await argon2.hash(password)
    const done = await User.create({ username, email, password: hash, role })
    res.status(201).json({ ok: true, user: toPublicUser(done) })
  }
  catch (error) {
    if (isDuplicateKey(error)) return res.status(409).json({ ok: false, message: 'Email or username already in use' })
    console.error('Create user failed:', error.message)
    res.status(500).json({ ok: false, message: 'Error creating user' })
  }
}

const deleteUser = async (req, res) => {
  const { _id } = req.body
  if (String(_id) === String(req.user._id)) {
    return res.status(400).json({ ok: false, message: 'You cannot delete your own account' })
  }
  try {
    const removed = await User.deleteOne({ _id })
    res.send({ removed })
  }
  catch (error) {
    console.error('Delete user failed:', error.message)
    res.status(500).json({ ok: false, message: 'Error deleting user' })
  }
}

const updateUser = async (req, res) => {
  const { _id, username, role } = req.body
  if (String(_id) === String(req.user._id) && role && role !== 'admin') {
    return res.status(400).json({ ok: false, message: 'You cannot remove your own admin role' })
  }
  try {
    const updateData = {}
    if (role) updateData.role = role
    if (username) updateData.username = username
    const updated = await User.updateOne({ _id }, updateData)
    res.send({ updated })
  }
  catch (error) {
    if (isDuplicateKey(error)) return res.status(409).json({ ok: false, message: 'Username already in use' })
    console.error('Update user failed:', error.message)
    res.status(500).json({ ok: false, message: 'Error updating user' })
  }
}

module.exports = { register, login, verify_token, findAllUsers, addNewUser, deleteUser, updateUser }
