const express     = require('express'), 
    router        = express.Router(),
    controller    = require('../controllers/categoriesController');
const { requireAuth } = require('../middleware/auth');

router.get('/', controller.findAllCategories);
router.post('/add', requireAuth, controller.addNewCategory);
router.post('/delete', requireAuth, controller.deleteCategory);
router.post('/update', requireAuth, controller.updateCategory);
router.get('/:category', controller.findOneCategory);

module.exports = router;