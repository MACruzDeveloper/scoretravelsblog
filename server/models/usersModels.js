const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    // Sessions started before this date are no longer valid
    passwordChangedAt: { type: Date, select: false },
    // Password recovery: only a hash of the emailed token is stored, and it expires
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
    // Sample content from scripts/seed-experiences.js; scripts/clear-seed.js removes it
    seed: { type: Boolean, select: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('users', userSchema)
