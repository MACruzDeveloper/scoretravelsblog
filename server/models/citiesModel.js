const mongoose = require('mongoose')
const Schema = mongoose.Schema

const citySchema = new Schema(
  {
    name: { type: String, required: true },
    // A whole country can also be the place of an experience
    type: { type: String, enum: ['city', 'country'], default: 'city' },
    country: { type: String, required: true },
    countryCode: { type: String, required: true },
    continent: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    // Sample content from scripts/seed-experiences.js; scripts/clear-seed.js removes it
    seed: { type: Boolean, select: false },
  },
  { timestamps: true }
)

// Unicidad por nombre + país, no solo por nombre
citySchema.index({ name: 1, countryCode: 1 }, { unique: true })

module.exports = mongoose.model('cities', citySchema)
