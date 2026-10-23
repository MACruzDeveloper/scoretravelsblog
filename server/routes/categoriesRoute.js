const express     = require('express'), 
    router        = express.Router(),
    controller    = require('../controllers/categoriesController');
const { requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const schemas = require('../utils/schemas');

router.get('/', controller.findAllCategories);
router.post('/add', requireAdmin, validate(schemas.addCategory), controller.addNewCategory);
router.post('/delete', requireAdmin, validate(schemas.deleteCategory), controller.deleteCategory);
router.post('/update', requireAdmin, validate(schemas.updateCategory), controller.updateCategory);
router.get('/:category', validate(schemas.categoryParam, 'params'), controller.findOneCategory);

module.exports = router;
