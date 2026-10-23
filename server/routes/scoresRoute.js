const express     = require('express'), 
    router        = express.Router(),
    controller    = require('../controllers/scoresController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { writeLimiter } = require('../middleware/rateLimit');
const schemas = require('../utils/schemas');

router.get('/', controller.findAllScores);
router.post('/add', requireAuth, writeLimiter, validate(schemas.addScore), controller.addNewScore);
router.post('/delete', requireAdmin, validate(schemas.byId), controller.deleteScore);
router.post('/update', requireAdmin, validate(schemas.updateScore), controller.updateScore);

module.exports = router;
