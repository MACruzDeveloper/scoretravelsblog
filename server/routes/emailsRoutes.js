const router     = require('express').Router();
const controller = require('../controllers/emailsController.js')
const { validate } = require('../middleware/validate')
const { emailLimiter } = require('../middleware/rateLimit')
const schemas = require('../utils/schemas')

router.post('/send_email', emailLimiter, validate(schemas.sendEmail), controller.send_email)

module.exports = router
