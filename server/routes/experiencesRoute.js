const express     = require('express'), 
    router        = express.Router(),
    controller    = require('../controllers/experiencesController');
const { requireAuth } = require('../middleware/auth');

router.get('/', controller.findAllExperiences);
router.get('/:id', controller.findExperience);
router.post('/add', requireAuth, controller.addNewExperience);
router.post('/delete', requireAuth, controller.deleteExperience);
router.post('/update', requireAuth, controller.updateExperience);
router.post('/update_score', controller.updateScoreExperience);

module.exports = router;