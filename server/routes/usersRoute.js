const router = require('express').Router()
const controller = require('../controllers/usersController')
const { requireAdmin } = require('../middleware/auth')

router.get('/', requireAdmin, controller.findAllUsers)
router.post('/register', controller.register)
router.post('/login', controller.login)
router.post('/verify_token', controller.verify_token)
router.post('/add', requireAdmin, controller.addNewUser)
router.post('/delete', requireAdmin, controller.deleteUser)
router.post('/update', requireAdmin, controller.updateUser)

module.exports = router