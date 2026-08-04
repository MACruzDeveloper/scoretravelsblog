const User = require('../models/usersModels')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const jwt_secret = process.env.JWT_SECRET

const register = async (req, res) => {
  const { username, email, password, password2 } = req.body
  if (!username || !email || !password || !password2) return res.json({ ok: false, message: 'All field are required' })
  if (password !== password2) return res.json({ ok: false, message: 'Passwords must match' })
  if (!validator.isEmail(email)) return res.json({ ok: false, message: 'Please provide a valid email' })

  try {
    const user = await User.findOne({ email })
    if (user) return res.json({ ok: false, message: 'Email already in use' })
    const hash = await argon2.hash(password)
    const newUser = {
      username,
      email,
      password: hash,
      role: 'author'
    }
    await User.create(newUser)
    res.json({ ok: true, message: 'Successful register' })
  } catch (error) {
    res.json({ ok: false, error })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.json({ ok: false, message: 'All field are required' })
  if (!validator.isEmail(email)) return res.json({ ok: false, message: 'Please provide a valid email' })

  try {
    const user = await User.findOne({ email })
    if (!user) return res.json({ ok: false, message: 'Please provide a valid email' })
    const match = await argon2.verify(user.password, password)
    if (match) {
      const token = jwt.sign(
        { _id: user._id, username: user.username, email: user.email, role: user.role },
        jwt_secret,
        { expiresIn: '30d' }
      )
      const role = user.role
      res.json({ ok: true, message: `Hi ${user.username}!`, token, username: user.username, email, role })
    } else return res.json({ ok: false, message: 'Invalid password' })
  } catch (error) {
    res.json({ ok: false, error })
  }
}

const verify_token = (req, res) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : header
  if (!token) return res.json({ ok: false, message: 'No token provided' })
  try {
    const succ = jwt.verify(token, jwt_secret)
    return res.json({ ok: true, succ })
  } catch (error) {
    return res.json({ ok: false, message: 'Invalid or expired token' })
  }
}

const findAllUsers = async (req, res) => {
  try {
    const us = await User.find()
    res.send(us)
  }
  catch (error) {
    res.send({ error })
  }
}

const addNewUser = async (req, res) => {
  let params = req.body
  try {
    if (!params.username || !params.email || !params.password) {
      return res.status(400).json({ ok: false, message: 'username, email and password are required' })
    }
    if (!validator.isEmail(params.email)) {
      return res.status(400).json({ ok: false, message: 'Please provide a valid email' })
    }
    const existing = await User.findOne({ email: params.email })
    if (existing) return res.status(400).json({ ok: false, message: 'Email already in use' })
    const hash = await argon2.hash(params.password)
    const done = await User.create({ 
      username: params.username,
      email: params.email, 
      password: hash,
      role: params.role === 'admin' ? 'admin' : 'author'
    })
    res.send({ ok: true, user: { _id: done._id, username: done.username, email: done.email, role: done.role } })
  }
  catch (error) {
    res.send({ error })
  }
}

const deleteUser = async (req, res) => {
  let { _id } = req.body
  try {
    const removed = await User.deleteOne({ _id: _id })
    res.send({ removed })
  }
  catch (error) {
    res.send({ error })
  }
}

const updateUser = async (req, res) => {
  let params = req.body

  try {
    const updateData = {}
    if (params.role) updateData.role = params.role
    if (typeof params.username === 'string') updateData.username = params.username
    const updated = await User.updateOne(
      { _id: params._id }, updateData
    )
    res.send({ updated })
  }
  catch (error) {
    res.send({ error })
  }
}

module.exports = { register, login, verify_token, findAllUsers, addNewUser, deleteUser, updateUser }