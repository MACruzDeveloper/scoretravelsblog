const jwt = require('jsonwebtoken')

const { jwtSecret: jwt_secret } = require('../config')
// Pin the algorithm so tokens signed with anything else are rejected
const JWT_ALGORITHM = 'HS256'

const extractToken = (req) => {
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return header || null
}

const verify = (token) => jwt.verify(token, jwt_secret, { algorithms: [JWT_ALGORITHM] })

// For routes that work for everyone but show more to a signed in user:
// sets req.user when the token is valid and simply continues otherwise
const optionalAuth = (req, res, next) => {
  const token = extractToken(req)
  if (token) {
    try {
      req.user = verify(token)
    } catch {
      // An invalid token is treated like no token on public routes
    }
  }
  return next()
}

const requireAuth = (req, res, next) => {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ ok: false, message: 'Authentication required' })
  }
  try {
    const payload = verify(token)
    req.user = payload
    return next()
  } catch (error) {
    return res.status(401).json({ ok: false, message: 'Invalid or expired token' })
  }
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
