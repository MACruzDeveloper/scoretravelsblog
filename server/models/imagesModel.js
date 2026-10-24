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
  },
  { timestamps: true }
)

module.exports = mongoose.model('images', imagesSchema)
