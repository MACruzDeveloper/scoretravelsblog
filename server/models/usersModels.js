const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    // Sample content from scripts/seed-experiences.js; scripts/clear-seed.js removes it
    seed: { type: Boolean, select: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('users', userSchema)
