const express     = require('express'), 
    router        = express.Router(),
    controller    = require('../controllers/scoresController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', controller.findAllScores);
router.post('/add', requireAuth, controller.addNewScore);
router.post('/delete', requireAdmin, controller.deleteScore);
router.post('/update', requireAdmin, controller.updateScore);

module.exports = router;