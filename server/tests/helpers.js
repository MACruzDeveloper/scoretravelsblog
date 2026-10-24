// Test setup: an in-memory MongoDB, the Express app and helpers to create users and data.
// Each test file runs in its own process (node --test), so each one gets a fresh database.
const fs = require('fs')
const os = require('os')
const path = require('path')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongo
let uploadsDir

/**
 * Starts the database and loads the app. Environment variables must be set before
 * requiring config.js, so the app is required here and not at the top of the file.
 */
const setup = async () => {
  mongo = await MongoMemoryServer.create()
  uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stb-uploads-'))
  Object.assign(process.env, {
    NODE_ENV: 'test',
    ATLAS_URL: mongo.getUri('scoretravels-test'),
    JWT_SECRET: 'test-secret-that-is-long-enough-for-the-check',
    UPLOADS_DIR: uploadsDir,
    // Empty values stop dotenv from loading the real ones from .env: no emails are sent
    SMTP_USER: '',
    SMTP_PASS: '',
    SMTP_TO: '',
    SMTP_FROM: '',
  })

  const mongoose = require('mongoose')
  await mongoose.connect(process.env.ATLAS_URL)
  const app = require('../app')
  // Unique indexes (one vote per user, category names...) must exist before the tests
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()))

  // Off by default so tests can repeat requests; rate limit tests turn them on
  require('../middleware/rateLimit').setRateLimitsEnabled(false)

  const request = require('supertest')(app)
  return { app, request, uploadsDir }
}

const teardown = async () => {
  const mongoose = require('mongoose')
  await mongoose.disconnect()
  await mongo.stop()
  fs.rmSync(uploadsDir, { recursive: true, force: true })
}

// Empties every collection but keeps the indexes
const clearDatabase = async () => {
  const mongoose = require('mongoose')
  await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})))
}

/**
 * Creates a user straight in the database and returns it with a valid session token.
 * Skips /api/auth/register on purpose: it is rate limited (5 per hour).
 */
const createUser = async ({ username = 'user', role = 'user', password = 'supersecret1' } = {}) => {
  const argon2 = require('argon2')
  const jwt = require('jsonwebtoken')
  const User = require('../models/usersModels')
  const { jwtSecret } = require('../config')
  const user = await User.create({
    username,
    email: `${username}@test.dev`,
    password: await argon2.hash(password),
    role,
  })
  const token = jwt.sign({ _id: user._id, username, email: user.email, role }, jwtSecret, { algorithm: 'HS256' })
  return { user, token, auth: { Authorization: `Bearer ${token}` } }
}

// Small valid JPEG for upload tests
const sampleImage = async () => {
  const sharp = require('sharp')
  return sharp({ create: { width: 40, height: 30, channels: 3, background: '#b17634' } })
    .jpeg()
    .toBuffer()
}

module.exports = { setup, teardown, clearDatabase, createUser, sampleImage }
