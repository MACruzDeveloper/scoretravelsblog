const express     = require('express'), 
    router        = express.Router(),
    controller    = require('../controllers/experiencesController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', controller.findAllExperiences);
router.get('/:id', controller.findExperience);
router.post('/add', requireAdmin, controller.addNewExperience);
router.post('/delete', requireAdmin, controller.deleteExperience);
router.post('/update', requireAdmin, controller.updateExperience);
router.post('/update_score', requireAuth, controller.updateScoreExperience);

module.exports = router;