const router = require('express').Router()
const controller = require('../controllers/categoriesController')
const { requireAdmin } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const schemas = require('../utils/schemas')

const byId = validate(schemas.idParam, 'params')

router.get('/', controller.findAllCategories)
router.get('/:id', byId, controller.findOneCategory)
router.post('/', requireAdmin, validate(schemas.addCategory), controller.addNewCategory)
router.patch('/:id', requireAdmin, byId, validate(schemas.updateCategory), controller.updateCategory)
router.delete('/:id', requireAdmin, byId, controller.deleteCategory)

module.exports = router
