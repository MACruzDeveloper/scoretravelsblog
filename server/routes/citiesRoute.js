const express = require('express'), 
    router = express.Router(),
    controller = require('../controllers/citiesController')
const { requireAdmin } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const schemas = require('../utils/schemas')

router.get('/', controller.findAllCities)
router.get('/by-continent/:continent', validate(schemas.continentParam, 'params'), controller.findCitiesByContinent)
router.get('/by-country/:country', validate(schemas.countryParam, 'params'), controller.findCitiesByCountry)
router.post('/add', requireAdmin, validate(schemas.addCity), controller.addNewCity)

module.exports = router
