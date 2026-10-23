// Loads and validates server/.env; exits with a clear message if something is wrong
const config = require('./config')
const app = require('./app')

// Safety net for promises rejected outside a request (should not happen)
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason instanceof Error ? reason.message : reason)
})

// =============== START SERVER =====================
// Connect to the database first so no request is served without it
const mongoose = require('mongoose')

async function start() {
  try {
    await mongoose.connect(config.mongoUrl)
    console.log('Connected to the DB')
  } catch (error) {
    console.error('ERROR: Could not connect to the database:', error.message)
    process.exit(1)
  }

  const server = app.listen(config.port, () => console.log(`server listening on port ${config.port}`))

  // Graceful shutdown: stop accepting requests, then close the DB connection
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`)
    server.close(async () => {
      await mongoose.disconnect()
      process.exit(0)
    })
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

start()
