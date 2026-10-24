const { rateLimit } = require('express-rate-limit')

// Tests switch the limits off, except the ones that check them (skipped requests are not counted)
let enabled = true
const setRateLimitsEnabled = (value) => {
  enabled = value
}

const limiter = (windowMinutes, limit, message) =>
  rateLimit({
    skip: () => !enabled,
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { ok: false, message },
  })

// Generous global cap for the whole API
const apiLimiter = limiter(15, 1000, 'Too many requests, please try again later')

// Brute force protection on credentials
const loginLimiter = limiter(15, 10, 'Too many login attempts, please try again in 15 minutes')
const registerLimiter = limiter(60, 5, 'Too many accounts created, please try again later')

// Contact form: avoid spam and SMTP costs
const emailLimiter = limiter(60, 5, 'Too many messages sent, please try again later')

// User generated content
const writeLimiter = limiter(15, 60, 'Too many requests, please slow down')

module.exports = { apiLimiter, loginLimiter, registerLimiter, emailLimiter, writeLimiter, setRateLimitsEnabled }
