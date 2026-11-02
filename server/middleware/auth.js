const jwt = require('jsonwebtoken')

const { jwtSecret: jwt_secret } = require('../config')
const User = require('../models/usersModels')
// Pin the algorithm so tokens signed with anything else are rejected
const JWT_ALGORITHM = 'HS256'

const extractToken = (req) => {
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return header || null
}

const verify = async (token) => {
  const payload = jwt.verify(token, jwt_secret, { algorithms: [JWT_ALGORITHM] })
  // Changing the password closes the sessions started before it
  const user = await User.findById(payload._id).select('passwordChangedAt').lean()
  if (user?.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime()) {
    throw new jwt.JsonWebTokenError('Session closed by a password change')
  }
  return payload
}

// Only a bad token means "not signed in": a database failure must reach the error handler
const isTokenError = (error) => error instanceof jwt.JsonWebTokenError

// For routes that work for everyone but show more to a signed in user:
// sets req.user when the token is valid and simply continues otherwise
const optionalAuth = async (req, res, next) => {
  const token = extractToken(req)
  if (token) {
    try {
      req.user = await verify(token)
    } catch (error) {
      // An invalid token is treated like no token on public routes
      if (!isTokenError(error)) throw error
    }
  }
  return next()
}

const requireAuth = async (req, res, next) => {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ ok: false, message: 'Authentication required' })
  }
  try {
    req.user = await verify(token)
  } catch (error) {
    if (!isTokenError(error)) throw error
    return res.status(401).json({ ok: false, message: 'Invalid or expired token' })
  }
  return next()
}

const requireAdmin = (req, res, next) => {
  return requireAuth(req, res, () => {
    if (req.user && req.user.role === 'admin') return next()
    return res.status(403).json({ ok: false, message: 'Admin access required' })
  })
}

// Admins can act on anything; users only on what they created
const isOwnerOrAdmin = (user, doc) =>
  Boolean(user) && (user.role === 'admin' || String(doc.userId) === String(user._id))

module.exports = { optionalAuth, requireAuth, requireAdmin, isOwnerOrAdmin, JWT_ALGORITHM }
