const router = require('express').Router()
const controller = require('../controllers/usersController')
const { requireAdmin } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { loginLimiter, registerLimiter } = require('../middleware/rateLimit')
const schemas = require('../utils/schemas')

router.get('/', requireAdmin, controller.findAllUsers)
router.post('/register', registerLimiter, validate(schemas.register), controller.register)
router.post('/login', loginLimiter, validate(schemas.login), controller.login)
router.post('/verify_token', controller.verify_token)
router.post('/add', requireAdmin, validate(schemas.addUser), controller.addNewUser)
router.post('/delete', requireAdmin, validate(schemas.byId), controller.deleteUser)
router.post('/update', requireAdmin, validate(schemas.updateUser), controller.updateUser)

module.exports = router
