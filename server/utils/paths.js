const path = require('path')

// Uploaded images live outside the client bundle so they are never committed
// or overwritten by a build. Override with UPLOADS_DIR in production.
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads', 'images')

module.exports = { UPLOADS_DIR }
