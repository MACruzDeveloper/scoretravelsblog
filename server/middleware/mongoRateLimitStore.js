const crypto = require('crypto')
const RateLimit = require('../models/rateLimitModel')

const DUPLICATE_KEY = 11000

// express-rate-limit store that keeps the counters in MongoDB. In memory each serverless instance would
// count on its own, and attempts spread over instances would rarely reach the limit
class MongoRateLimitStore {
  // Different limits must not share counters
  constructor(prefix) {
    this.prefix = prefix
  }

  init(options) {
    this.windowMs = options.windowMs
  }

  // The hash keeps IP addresses out of the database
  idOf(key) {
    return `${this.prefix}:${crypto.createHash('sha256').update(key).digest('hex')}`
  }

  async increment(key) {
    const now = new Date()
    const expired = { $lte: [{ $ifNull: ['$resetAt', now] }, now] }
    // One atomic update: a window that has ended starts again, concurrent requests all count.
    // On the driver's collection, as Mongoose refuses update pipelines by default
    const update = () =>
      RateLimit.collection.findOneAndUpdate(
        { _id: this.idOf(key) },
        [
          {
            $set: {
              hits: { $cond: [expired, 1, { $add: ['$hits', 1] }] },
              resetAt: { $cond: [expired, new Date(now.getTime() + this.windowMs), '$resetAt'] },
            },
          },
        ],
        { upsert: true, returnDocument: 'after' }
      )
    // Two first requests at once can both try to insert: the loser just counts on the winner's document
    const counter = await update().catch((error) => {
      if (error.code === DUPLICATE_KEY) return update()
      throw error
    })
    return { totalHits: counter.hits, resetTime: counter.resetAt }
  }

  async decrement(key) {
    await RateLimit.collection.updateOne({ _id: this.idOf(key) }, { $inc: { hits: -1 } })
  }

  async resetKey(key) {
    await RateLimit.collection.deleteOne({ _id: this.idOf(key) })
  }
}

module.exports = { MongoRateLimitStore }
