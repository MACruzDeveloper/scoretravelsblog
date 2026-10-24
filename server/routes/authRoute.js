const router = require('express').Router()
const controller = require('../controllers/usersController')
const { requireAuth } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { loginLimiter, registerLimiter } = require('../middleware/rateLimit')
const schemas = require('../utils/schemas')

router.post('/register', registerLimiter, validate(schemas.register), controller.register)
router.post('/login', loginLimiter, validate(schemas.login), controller.login)
router.get('/me', requireAuth, controller.me)

module.exports = router
