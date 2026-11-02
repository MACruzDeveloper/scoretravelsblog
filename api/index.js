// Vercel entry point: every request that is not a static file (see vercel.json) reaches the Express app
const path = require('path')

// The build moves index.html here, so "/" also reaches Express (security headers and SEO tags)
process.env.CLIENT_DIST_DIR ||= path.join(__dirname, '..', 'client', 'server-html')

module.exports = require('../server/serverless')
