const router = require('express').Router()
const controller = require('../controllers/experiencesController')
const { requireAdmin } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const schemas = require('../utils/schemas')

const byId = validate(schemas.idParam, 'params')

router.get('/', validate(schemas.listExperiences, 'query'), controller.findAllExperiences)
// Static paths before /:id so they are not read as ids
router.get('/facets', controller.findFacets)
router.get('/timeline', controller.findTimeline)
router.get('/:id', byId, controller.findExperience)
router.get('/:id/comments', byId, controller.findExperienceComments)
router.post('/', requireAdmin, validate(schemas.addExperience), controller.addNewExperience)
router.patch('/:id', requireAdmin, byId, validate(schemas.updateExperience), controller.updateExperience)
router.delete('/:id', requireAdmin, byId, controller.deleteExperience)

module.exports = router
