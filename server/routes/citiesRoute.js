const express = require('express'), 
    router = express.Router(),
    controller = require('../controllers/citiesController')
const { requireAuth } = require('../middleware/auth')

router.get('/', controller.findAllCities)
router.get('/by-continent/:continent', controller.findCitiesByContinent)
router.get('/by-country/:country', controller.findCitiesByCountry)
router.post('/add', requireAuth, controller.addNewCity)

module.exports = router
