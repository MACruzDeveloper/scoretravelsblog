const mongoose = require('mongoose')

const imagesSchema = new mongoose.Schema(
  {
    title: String,
    // Who uploaded it (users upload images for their own experiences)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    featured: {
      type: Boolean,
      default: false,
    },
    filename: {
      type: String,
      required: true,
    },
    width: Number,
    height: Number,
    // Sample content from scripts/seed-experiences.js; scripts/clear-seed.js removes it
    seed: { type: Boolean, select: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('images', imagesSchema)
