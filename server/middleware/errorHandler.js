const { HttpError } = require('../utils/httpErrors')

/**
 * Central error handler. Express 5 forwards errors thrown in async handlers here,
 * so controllers only throw and never build error responses themselves.
 */
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err)

  if (err instanceof HttpError) {
    return res.status(err.status).json({ ok: false, message: err.message })
  }
  // Unique index violation, e.g. a repeated email or category name
  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || {}).join(', ') || 'Value'
    return res.status(409).json({ ok: false, message: `${fields} already in use` })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ ok: false, message: `Invalid ${err.path}` })
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ ok: false, message: err.message })
  }
  // Client errors from Express itself, such as malformed JSON or a too large body
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ ok: false, message: 'Invalid request' })
  }

  // Full error with its stack, tied to the request log line by the request id
  req.log.error({ err }, `${req.method} ${req.originalUrl} failed: ${err.message}`)
  return res.status(500).json({ ok: false, message: 'Internal server error', requestId: req.id })
}

module.exports = errorHandler
