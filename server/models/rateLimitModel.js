const mongoose = require('mongoose')

// Counters of the rate limits, shared by every serverless instance (middleware/mongoRateLimitStore.js).
// _id is the limit plus a hash of the IP
const rateLimitSchema = new mongoose.Schema({
  _id: String,
  hits: { type: Number, required: true },
  resetAt: { type: Date, required: true },
})

// MongoDB deletes expired counters on its own
rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('ratelimits', rateLimitSchema)
