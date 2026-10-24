const router = require('express').Router()
const controller = require('../controllers/usersController')
const { requireAdmin } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const schemas = require('../utils/schemas')

const byId = validate(schemas.idParam, 'params')

router.use(requireAdmin)
router.get('/', controller.findAllUsers)
router.post('/', validate(schemas.addUser), controller.addNewUser)
router.patch('/:id', byId, validate(schemas.updateUser), controller.updateUser)
router.delete('/:id', byId, controller.deleteUser)

module.exports = router
