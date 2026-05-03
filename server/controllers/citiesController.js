const City = require('../models/citiesModel')

class citiesController {

  async findAllCities(req, res) {
    try {
      const cities = await City.find().sort({ name: 1 })
      res.send(cities)
    } catch (error) {
      res.send({ error })
    }
  }

  async findCitiesByContinent(req, res) {
    try {
      const cities = await City.find({ 
        continent: req.params.continent 
      }).sort({ country: 1, name: 1 })
      res.send(cities)
    } catch (error) {
      res.send({ error })
    }
  }

  async findCitiesByCountry(req, res) {
    try {
      const cities = await City.find({ 
        country: req.params.country 
      }).sort({ name: 1 })
      res.send(cities)
    } catch (error) {
      res.send({ error })
    }
  }

  async addNewCity(req, res) {
    const { name, country, countryCode, continent, lat, lng } = req.body
    console.log('addNewCity body:', req.body)  // ← añade esto
    try {
      const city = await City.findOneAndUpdate(
        { name, countryCode },
        { name, country, countryCode, continent, lat, lng },
        { upsert: true, new: true, runValidators: true }
      )
      console.log('city result:', city)        // ← y esto
      res.send({ city })
    } catch (error) {
      console.log('addNewCity error:', error)  // ← y esto
      res.send({ error })
    }
  }

  async updateCity(req, res) {
    const { _id, name, country, countryCode, continent, lat, lng } = req.body
    try {
      const updated = await City.findByIdAndUpdate(
        _id,
        { name, country, countryCode, continent, lat, lng },
        { new: true, runValidators: true }
      )
      res.send({ updated })
    } catch (error) {
      res.send({ error })
    }
  }

  async deleteCity(req, res) {
    try {
      // Comprueba que no haya experiencias usando esta ciudad antes de borrar
      const inUse = await Experience.findOne({ city: req.params.id })
      if (inUse) {
        return res.status(400).send({ 
          error: 'City cannot be deleted because it has associated experiences' 
        })
      }
      const removed = await City.deleteOne({ _id: req.params.id })
      res.send({ removed })
    } catch (error) {
      res.send({ error })
    }
  }
}

module.exports = new citiesController()
