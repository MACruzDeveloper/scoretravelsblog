const express = require('express'), 
    router = express.Router(),
    controller = require('../controllers/citiesController')

router.get('/', controller.findAllCities)
router.get('/by-continent/:continent', controller.findCitiesByContinent)
router.get('/by-country/:country', controller.findCitiesByCountry)
router.post('/add', controller.addNewCity)

module.exports = router
