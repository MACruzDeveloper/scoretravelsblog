const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Case-insensitive comparison: 'ocio' and 'Ocio' are the same category
const CASE_INSENSITIVE = { locale: 'en', strength: 2 }

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
  },
  { timestamps: true }
)

categorySchema.index({ name: 1 }, { unique: true, collation: CASE_INSENSITIVE })

// Experiences store the category name, so lookups by name must ignore case too
categorySchema.statics.findByName = function (name) {
  return this.findOne({ name }).collation(CASE_INSENSITIVE)
}

module.exports = mongoose.model('categories', categorySchema)
