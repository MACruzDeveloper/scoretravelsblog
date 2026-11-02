const router = require('express').Router()
const controller = require('../controllers/usersController')
const { requireAuth } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { loginLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimit')
const schemas = require('../utils/schemas')

router.post('/register', registerLimiter, validate(schemas.register), controller.register)
router.post('/login', loginLimiter, validate(schemas.login), controller.login)
router.get('/me', requireAuth, controller.me)
router.post('/change-password', requireAuth, loginLimiter, validate(schemas.changePassword), controller.changePassword)
router.post('/forgot-password', passwordResetLimiter, validate(schemas.forgotPassword), controller.forgotPassword)
router.post('/reset-password', loginLimiter, validate(schemas.resetPassword), controller.resetPassword)

module.exports = router
