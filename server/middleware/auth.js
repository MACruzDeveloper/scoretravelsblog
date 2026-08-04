const jwt = require('jsonwebtoken')

const jwt_secret = process.env.JWT_SECRET

const extractToken = (req) => {
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return header || null
}

const requireAuth = (req, res, next) => {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ ok: false, message: 'Authentication required' })
  }
  try {
    const payload = jwt.verify(token, jwt_secret)
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

module.exports = { requireAuth, requireAdmin }
