// Loads and validates server/.env; exits with a clear message if something is wrong
const config = require('./config')
const logger = require('./logger')
const app = require('./app')

// Safety nets for errors outside a request (should not happen)
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled rejection')
})
// After an uncaught exception the process state is unknown: log it and let systemd restart it
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception')
  process.exit(1)
})

// =============== START SERVER =====================
// Connect to the database first so no request is served without it
const mongoose = require('mongoose')

// Mongoose reconnects on its own; the logs show when the database drops and comes back
mongoose.connection.on('disconnected', () => logger.warn('Database disconnected'))
mongoose.connection.on('reconnected', () => logger.info('Database reconnected'))

async function start() {
  try {
    await mongoose.connect(config.mongoUrl)
    logger.info('Connected to the database')
  } catch (error) {
    logger.fatal({ err: error }, 'Could not connect to the database')
    process.exit(1)
  }

  const server = app.listen(config.port, () => logger.info(`Server listening on port ${config.port}`))

  // Graceful shutdown: stop accepting requests, then close the DB connection
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down`)
    server.close(async () => {
      await mongoose.disconnect()
      process.exit(0)
    })
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

start()
