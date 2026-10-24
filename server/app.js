// The Express application, without starting it (index.js connects and listens; tests use it directly)
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
// One log line per request, with an id that is also sent back in the X-Request-Id header
// and in 500 responses, so a user report can be matched with its log line
const { randomUUID } = require('crypto')
const logger = require('./logger')
const REQUEST_ID = /^[\w-]{1,64}$/
app.use(
  require('pino-http')({
    logger,
    genReqId: (req, res) => {
      const incoming = req.headers['x-request-id']
      const id = typeof incoming === 'string' && REQUEST_ID.test(incoming) ? incoming : randomUUID()
      res.setHeader('X-Request-Id', id)
      return id
    },
    // Health checks and static files would only add noise
    autoLogging: { ignore: (req) => req.url === '/api/health' || /^\/(static|assets)\//.test(req.url) },
    customLogLevel: (req, res, err) =>
      err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
    customSuccessMessage: (req, res, responseTime) =>
      `${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${Math.round(responseTime)}ms`,
    customErrorMessage: (req, res) => `${req.method} ${req.originalUrl || req.url} ${res.statusCode}`,
    // Short entries: the message already has method, URL and status
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url, ip: req.raw?.ip ?? req.remoteAddress }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  })
)

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

// =============== SEO ==============================
const seo = require('./controllers/seoController')
app.get('/robots.txt', seo.robots)
app.get('/sitemap.xml', seo.sitemap)
app.get('/experience/:id', seo.experiencePage)

// index: false so "/" also goes through the SPA handler below
app.use(express.static(config.clientDistDir, { setHeaders: setAvifHeader, index: false }))

// Any other path is a client route: serve the SPA
app.get('/{*splat}', seo.indexPage)

// =============== GLOBAL ERROR HANDLER =====================
// Express 5 forwards errors thrown in async handlers here
app.use(require('./middleware/errorHandler'))

module.exports = app
