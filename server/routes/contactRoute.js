const router = require('express').Router()
const controller = require('../controllers/emailsController')
const { validate } = require('../middleware/validate')
const { emailLimiter } = require('../middleware/rateLimit')
const schemas = require('../utils/schemas')

router.post('/', emailLimiter, validate(schemas.sendEmail), controller.send_email)

module.exports = router
