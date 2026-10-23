const mongoose = require('mongoose')

const imagesSchema = new mongoose.Schema(
  {
    title: String,
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
