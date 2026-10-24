const router = require('express').Router()
const controller = require('../controllers/experiencesController')
const { optionalAuth, requireAuth, requireAdmin } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { writeLimiter } = require('../middleware/rateLimit')
const schemas = require('../utils/schemas')

const byId = validate(schemas.idParam, 'params')

// Public reads; a signed in user can also see their own unpublished experiences
router.get('/', optionalAuth, validate(schemas.listExperiences, 'query'), controller.findAllExperiences)
// Static paths before /:id so they are not read as ids
router.get('/facets', controller.findFacets)
router.get('/timeline', controller.findTimeline)
router.get('/:id', optionalAuth, byId, controller.findExperience)
router.get('/:id/comments', byId, controller.findExperienceComments)

// Any user can submit experiences; ownership is checked in the controller
router.post('/', requireAuth, writeLimiter, validate(schemas.addExperience), controller.addNewExperience)
router.patch('/:id', requireAuth, byId, validate(schemas.updateExperience), controller.updateExperience)
router.delete('/:id', requireAuth, byId, controller.deleteExperience)

// Moderation
router.patch('/:id/review', requireAdmin, byId, validate(schemas.reviewExperience), controller.reviewExperience)

module.exports = router
