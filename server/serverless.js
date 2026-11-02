// Request handler for serverless hosting (Vercel, see api/index.js). index.js is the entry point on a
// server of your own: it connects first and then listens; here each instance connects on its first request
const mongoose = require('mongoose')
const config = require('./config')
const logger = require('./logger')
const app = require('./app')

// One connection per instance, shared by its requests. A failed attempt is retried by the next request
let connecting
const connectToDatabase = () => {
  connecting ??= mongoose.connect(config.mongoUrl, { serverSelectionTimeoutMS: 8000 }).catch((error) => {
    connecting = undefined
    throw error
  })
  return connecting
}

module.exports = async (req, res) => {
  try {
    await connectToDatabase()
  } catch (error) {
    logger.error({ err: error }, 'Could not connect to the database')
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ ok: false, message: 'Service temporarily unavailable' }))
    return
  }
  app(req, res)
}
