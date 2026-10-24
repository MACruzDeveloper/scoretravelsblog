const router = require('express').Router()
const controller = require('../controllers/commentsController')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { writeLimiter } = require('../middleware/rateLimit')
const schemas = require('../utils/schemas')

const byId = validate(schemas.idParam, 'params')

// Full list for moderation; the public page uses /api/experiences/:id/comments
router.get('/', requireAdmin, controller.findAllComments)
router.post('/', requireAuth, writeLimiter, validate(schemas.addComment), controller.addNewComment)
router.patch('/:id', requireAdmin, byId, validate(schemas.updateComment), controller.updateComment)
router.delete('/:id', requireAdmin, byId, controller.deleteComment)

module.exports = router
