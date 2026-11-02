const argon2 = require('argon2')

// What to save when a password changes: the hash, and the date that closes the sessions started before it.
// Tokens carry their date in whole seconds: rounding down keeps the session started right after a change valid
const passwordFields = async (password) => ({
  password: await argon2.hash(password),
  passwordChangedAt: new Date(Math.floor(Date.now() / 1000) * 1000),
})

module.exports = { passwordFields }
