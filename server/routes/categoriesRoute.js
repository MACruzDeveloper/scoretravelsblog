const express     = require('express'), 
    router        = express.Router(),
    controller    = require('../controllers/categoriesController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', controller.findAllCategories);
router.post('/add', requireAdmin, controller.addNewCategory);
router.post('/delete', requireAdmin, controller.deleteCategory);
router.post('/update', requireAdmin, controller.updateCategory);
router.get('/:category', controller.findOneCategory);

module.exports = router;