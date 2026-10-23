const City = require('../models/citiesModel')
const Experience = require('../models/experiencesModel')
const { notFound, conflict } = require('../utils/httpErrors')

const findAllCities = async (req, res) => {
  res.send(await City.find().sort({ name: 1 }))
}

const findCitiesByContinent = async (req, res) => {
  res.send(await City.find({ continent: req.params.continent }).sort({ country: 1, name: 1 }))
}

const findCitiesByCountry = async (req, res) => {
  res.send(await City.find({ country: req.params.country }).sort({ name: 1 }))
}

// Upsert: the same name + country code returns the existing city
const addNewCity = async (req, res) => {
  const { name, country, countryCode, continent, lat, lng } = req.body
  const city = await City.findOneAndUpdate(
    { name, countryCode },
    { name, country, countryCode, continent, lat, lng },
    { upsert: true, returnDocument: 'after', runValidators: true }
  )
  res.send({ city })
}

const updateCity = async (req, res) => {
  const updated = await City.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  })
  if (!updated) throw notFound('City not found')
  res.send({ updated })
}

const deleteCity = async (req, res) => {
  const inUse = await Experience.exists({ city: req.params.id })
  if (inUse) throw conflict('City cannot be deleted because it has associated experiences')
  const removed = await City.deleteOne({ _id: req.params.id })
  if (!removed.deletedCount) throw notFound('City not found')
  res.send({ removed })
}

module.exports = { findAllCities, findCitiesByContinent, findCitiesByCountry, addNewCity, updateCity, deleteCity }
