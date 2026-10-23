require('dotenv').config({ quiet: true });
const express = require("express");
const path = require('path');
const app = express();
const port = process.env.PORT || process.env.port || 3040;
const isProduction = process.env.NODE_ENV === 'production';

// =============== ENVIRONMENT CHECK =====================
const missingEnv = ['JWT_SECRET', 'ATLAS_URL'].filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn('WARNING: JWT_SECRET should be at least 32 characters long');
}

// Behind nginx or another reverse proxy, so rate limiting sees the real client IP
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);

// =============== SECURITY HEADERS =====================
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://unpkg.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://*.basemaps.cartocdn.com', 'https://tile.openstreetmap.org', 'https://*.tile.openstreetmap.org', 'https://unpkg.com'],
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
}));

// =============== LOGGING =====================
const morgan = require('morgan');
app.use(morgan(isProduction ? 'combined' : 'dev'));

// =============== BODY PARSER SETTINGS =====================
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

//================ CORS ================================
const cors = require('cors');
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  // Requests without Origin (same origin, curl) are allowed; cross origin only from the list
  origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
}));

// =============== ROUTES ==============================
app.use('/api', require('./routes'));

const setAvifHeader = (res, filePath) => {
  if (filePath.endsWith('.avif')) {
    res.setHeader('Content-Type', 'image/avif');
  }
};

// Uploaded images (outside the client folder, see utils/paths.js)
const { UPLOADS_DIR } = require('./utils/paths');
app.use('/static/images', express.static(UPLOADS_DIR, { setHeaders: setAvifHeader }));

app.use('/static', express.static(path.join(__dirname, '../client/public'), { setHeaders: setAvifHeader }));
// Missing static files are a real 404, not the SPA index.html
app.use('/static', (req, res) => res.status(404).end());

app.use(express.static(path.join(__dirname, '../client/dist'), { setHeaders: setAvifHeader }));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// =============== GLOBAL ERROR HANDLER =====================
app.use((err, req, res, next) => {
  // Client errors such as malformed JSON or a too large body
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ ok: false, message: 'Invalid request' });
  }
  console.error('Unhandled error:', err.message);
  res.status(500).json({ ok: false, message: 'Internal server error' });
});

// Express 4 does not catch rejected promises from async handlers.
// Log them instead of letting Node crash the process.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason instanceof Error ? reason.message : reason);
});

// =============== START SERVER =====================
// Connect to the database first so no request is served without it
const mongoose = require('mongoose');

async function start() {
  try {
    await mongoose.connect(process.env.ATLAS_URL);
    console.log('Connected to the DB');
  } catch (error) {
    console.error('ERROR: Could not connect to the database:', error.message);
    process.exit(1);
  }

  const server = app.listen(port, () => console.log(`server listening on port ${port}`));

  // Graceful shutdown: stop accepting requests, then close the DB connection
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();
