const router = require('express').Router()
const controller = require('../controllers/scoresController')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { writeLimiter } = require('../middleware/rateLimit')
const schemas = require('../utils/schemas')

const byId = validate(schemas.idParam, 'params')

// Full list for the admin; public pages read score and votes from the experience
router.get('/', requireAdmin, controller.findAllScores)
// One vote per user: posting again updates the previous vote
router.post('/', requireAuth, writeLimiter, validate(schemas.addScore), controller.addNewScore)
router.patch('/:id', requireAdmin, byId, validate(schemas.updateScore), controller.updateScore)
router.delete('/:id', requireAdmin, byId, controller.deleteScore)

module.exports = router
