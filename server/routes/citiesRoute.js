const router = require('express').Router()
const controller = require('../controllers/citiesController')
const { requireAdmin } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const schemas = require('../utils/schemas')

const byId = validate(schemas.idParam, 'params')

router.get('/', controller.findAllCities)
router.get('/by-continent/:continent', validate(schemas.continentParam, 'params'), controller.findCitiesByContinent)
router.get('/by-country/:country', validate(schemas.countryParam, 'params'), controller.findCitiesByCountry)
// Upsert: returns the existing city when name + country code already exist
router.post('/', requireAdmin, validate(schemas.addCity), controller.addNewCity)
router.patch('/:id', requireAdmin, byId, validate(schemas.updateCity), controller.updateCity)
router.delete('/:id', requireAdmin, byId, controller.deleteCity)

module.exports = router
