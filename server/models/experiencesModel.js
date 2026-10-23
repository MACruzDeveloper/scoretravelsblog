const mongoose = require('mongoose')
const Schema = mongoose.Schema

const experienceSchema = new mongoose.Schema(
  {
    user: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    title: { type: String, required: true },
    city: { type: Schema.Types.ObjectId, ref: 'cities' },
    category: { type: String, ref: 'categories' },
    date: { type: Date, default: Date.now },
    image: { type: String, default: '' },
    images: { type: [String], default: [], maxlength: 5 },
    content: { type: String },
    // Average of the votes and how many there are, kept in sync by services/scoreService.js
    score: { type: Number },
    votes: { type: Number, default: 0 },
    // Moderation: what users create waits for an admin; only 'published' is public
    status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, default: '' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
)

// Indexes for the list filters and sort orders
experienceSchema.index({ date: -1 })
experienceSchema.index({ score: -1 })
experienceSchema.index({ category: 1 })
experienceSchema.index({ city: 1 })
experienceSchema.index({ status: 1, date: -1 })
experienceSchema.index({ userId: 1 })

module.exports = mongoose.model('experiences', experienceSchema)
