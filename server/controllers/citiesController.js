const City = require('../models/citiesModel')
const Experience = require('../models/experiencesModel')

class citiesController {

  async findAllCities(req, res) {
    try {
      const cities = await City.find().sort({ name: 1 })
      res.send(cities)
    } catch (error) {
      res.status(500).send({ ok: false, message: 'Error fetching cities' })
    }
  }

  async findCitiesByContinent(req, res) {
    try {
      const cities = await City.find({ 
        continent: req.params.continent 
      }).sort({ country: 1, name: 1 })
      res.send(cities)
    } catch (error) {
      res.status(500).send({ ok: false, message: 'Error fetching cities' })
    }
  }

  async findCitiesByCountry(req, res) {
    try {
      const cities = await City.find({ 
        country: req.params.country 
      }).sort({ name: 1 })
      res.send(cities)
    } catch (error) {
      res.status(500).send({ ok: false, message: 'Error fetching cities' })
    }
  }

  async addNewCity(req, res) {
    const { name, country, countryCode, continent, lat, lng } = req.body
    try {
      const city = await City.findOneAndUpdate(
        { name, countryCode },
        { name, country, countryCode, continent, lat, lng },
        { upsert: true, returnDocument: 'after', runValidators: true }
      )
      res.send({ city })
    } catch (error) {
      res.status(500).send({ ok: false, message: 'Error adding city' })
    }
  }

  async updateCity(req, res) {
    const _id = req.params.id
    const { name, country, countryCode, continent, lat, lng } = req.body
    try {
      const updated = await City.findByIdAndUpdate(
        _id,
        { name, country, countryCode, continent, lat, lng },
        { returnDocument: 'after', runValidators: true }
      )
      res.send({ updated })
    } catch (error) {
      res.status(500).send({ ok: false, message: 'Error updating city' })
    }
  }

  async deleteCity(req, res) {
    try {
      const inUse = await Experience.findOne({ city: req.params.id })
      if (inUse) {
        return res.status(400).send({ 
          ok: false, message: 'City cannot be deleted because it has associated experiences' 
        })
      }
      const removed = await City.deleteOne({ _id: req.params.id })
      res.send({ removed })
    } catch (error) {
      res.status(500).send({ ok: false, message: 'Error deleting city' })
    }
  }
}

module.exports = new citiesController()
