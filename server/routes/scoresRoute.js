const express     = require('express'), 
    router        = express.Router(),
    controller    = require('../controllers/scoresController');
const { requireAuth } = require('../middleware/auth');

router.get('/', controller.findAllScores);
router.post('/add', controller.addNewScore);
router.post('/delete', requireAuth, controller.deleteScore);
router.post('/update', requireAuth, controller.updateScore);

module.exports = router;