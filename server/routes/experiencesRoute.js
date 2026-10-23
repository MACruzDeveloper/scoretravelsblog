const express     = require('express'), 
    router        = express.Router(),
    controller    = require('../controllers/experiencesController');
const { requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const schemas = require('../utils/schemas');

router.get('/', controller.findAllExperiences);
router.get('/:id', validate(schemas.idParam, 'params'), controller.findExperience);
router.post('/add', requireAdmin, validate(schemas.addExperience), controller.addNewExperience);
router.post('/delete', requireAdmin, validate(schemas.byId), controller.deleteExperience);
router.post('/update', requireAdmin, validate(schemas.updateExperience), controller.updateExperience);

module.exports = router;
