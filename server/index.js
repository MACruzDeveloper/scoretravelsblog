// Loads and validates server/.env; exits with a clear message if something is wrong
const config = require('./config')
const express = require('express')
const path = require('path')
const app = express()

// Behind nginx or another reverse proxy, so rate limiting sees the real client IP
if (config.trustProxy) app.set('trust proxy', config.trustProxy)

// =============== SECURITY HEADERS =====================
const helmet = require('helmet')
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://unpkg.com'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.basemaps.cartocdn.com',
          'https://tile.openstreetmap.org',
          'https://*.tile.openstreetmap.org',
          'https://unpkg.com',
        ],
        connectSrc: ["'self'", 'https://nominatim.openstreetmap.org', 'https://restcountries.com'],
        mediaSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        // Enable once the site is served over HTTPS
        upgradeInsecureRequests: null,
      },
    },
    crossOriginEmbedderPolicy: false,
    // The dev client (Vite on another port) loads images from this server
    crossOriginResourcePolicy: false,
  })
)

// =============== LOGGING =====================
const morgan = require('morgan')
app.use(morgan(config.isProduction ? 'combined' : 'dev'))

// =============== BODY PARSER SETTINGS =====================
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))

//================ CORS ================================
const cors = require('cors')
const allowedOrigins = config.corsOrigins
app.use(
  cors({
    // Requests without Origin (same origin, curl) are allowed; cross origin only from the list
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
  })
)

// =============== ROUTES ==============================
app.use('/api', require('./routes'))

const setAvifHeader = (res, filePath) => {
  if (filePath.endsWith('.avif')) {
    res.setHeader('Content-Type', 'image/avif')
  }
}

// Uploaded images live outside the client folder (UPLOADS_DIR, see config.js)
app.use('/static/images', express.static(config.uploadsDir, { setHeaders: setAvifHeader }))

app.use('/static', express.static(path.join(__dirname, '../client/public'), { setHeaders: setAvifHeader }))
// Missing static files are a real 404, not the SPA index.html
app.use('/static', (req, res) => res.status(404).end())

app.use(express.static(path.join(__dirname, '../client/dist'), { setHeaders: setAvifHeader }))

// Any other path is a client route: serve the SPA
app.get('/{*splat}', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'))
})

// =============== GLOBAL ERROR HANDLER =====================
// Express 5 forwards errors thrown in async handlers here
app.use(require('./middleware/errorHandler'))

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
