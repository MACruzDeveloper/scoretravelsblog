const mongoose = require('mongoose')
const Schema = mongoose.Schema

const citySchema = new Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  countryCode: { type: String, required: true },
  continent: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
})

// Unicidad por nombre + país, no solo por nombre
citySchema.index({ name: 1, countryCode: 1 }, { unique: true })

module.exports = mongoose.model('cities', citySchema)
