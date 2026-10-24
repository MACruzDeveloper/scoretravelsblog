/**
 * Server for the Playwright end-to-end tests (client/e2e):
 * in-memory MongoDB with an admin and a category, serving the e2e client build.
 * Usage: node tests/e2e-server.js  (started by Playwright, see client/playwright.config.ts)
 */
const path = require('path')
const fs = require('fs')
const os = require('os')
const { MongoMemoryServer } = require('mongodb-memory-server')

const PORT = Number(process.env.E2E_PORT) || 4173

async function main() {
  const mongo = await MongoMemoryServer.create()
  Object.assign(process.env, {
    NODE_ENV: 'test',
    PORT: String(PORT),
    ATLAS_URL: mongo.getUri('scoretravels-e2e'),
    JWT_SECRET: 'e2e-secret-that-is-long-enough-for-the-check',
    UPLOADS_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'stb-e2e-uploads-')),
    CLIENT_DIST_DIR: path.join(__dirname, '..', '..', 'client', 'e2e', 'dist'),
    // No real emails
    SMTP_USER: '',
    SMTP_PASS: '',
    SMTP_TO: '',
    SMTP_FROM: '',
  })

  const mongoose = require('mongoose')
  const argon2 = require('argon2')
  await mongoose.connect(process.env.ATLAS_URL)
  const app = require('../app')
  require('../middleware/rateLimit').setRateLimitsEnabled(false)
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()))

  // Seed: the admin who moderates and a category to choose
  const User = require('../models/usersModels')
  const Category = require('../models/categoriesModel')
  await User.create({
    username: 'admin',
    email: 'admin@e2e.dev',
    password: await argon2.hash('supersecret1'),
    role: 'admin',
  })
  await Category.create({ name: 'Ocio' })

  const server = app.listen(PORT, () => console.log(`e2e server on http://localhost:${PORT}`))
  const stop = async () => {
    server.close()
    await mongoose.disconnect()
    await mongo.stop()
    process.exit(0)
  }
  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
