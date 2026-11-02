const { rateLimit } = require('express-rate-limit')
const { MongoRateLimitStore } = require('./mongoRateLimitStore')

// Tests switch the limits off, except the ones that check them (skipped requests are not counted)
let enabled = true
const setRateLimitsEnabled = (value) => {
  enabled = value
}

const limiter = (windowMinutes, limit, message, options = {}) =>
  rateLimit({
    skip: () => !enabled,
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { ok: false, message },
    ...options,
  })

// For what attackers target: counters shared by all the instances. If the database fails the request goes on,
// as those routes need the database anyway and would answer the error themselves
const sharedLimiter = (name, windowMinutes, limit, message) =>
  limiter(windowMinutes, limit, message, { store: new MongoRateLimitStore(name), passOnStoreError: true })

// Generous global cap for the whole API
const apiLimiter = limiter(15, 1000, 'Too many requests, please try again later')

// Brute force protection on credentials
const loginLimiter = sharedLimiter('login', 15, 10, 'Too many login attempts, please try again in 15 minutes')
const registerLimiter = sharedLimiter('register', 60, 5, 'Too many accounts created, please try again later')

// Password recovery: each request can send an email
const passwordResetLimiter = sharedLimiter('password-reset', 60, 5, 'Too many requests, please try again later')

// Contact form: avoid spam and SMTP costs
const emailLimiter = sharedLimiter('email', 60, 5, 'Too many messages sent, please try again later')

// User generated content
const writeLimiter = limiter(15, 60, 'Too many requests, please slow down')

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  emailLimiter,
  writeLimiter,
  setRateLimitsEnabled,
}
