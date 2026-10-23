const router = require('express').Router()
const controller = require('../controllers/experiencesController')
const { requireAdmin } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const schemas = require('../utils/schemas')

const byId = validate(schemas.idParam, 'params')

router.get('/', controller.findAllExperiences)
router.get('/:id', byId, controller.findExperience)
router.post('/', requireAdmin, validate(schemas.addExperience), controller.addNewExperience)
router.patch('/:id', requireAdmin, byId, validate(schemas.updateExperience), controller.updateExperience)
router.delete('/:id', requireAdmin, byId, controller.deleteExperience)

module.exports = router
