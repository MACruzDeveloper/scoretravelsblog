const express     = require('express'), 
    router        = express.Router(),
    controller    = require('../controllers/commentsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', controller.findAllComments);
router.post('/add', requireAuth, controller.addNewComment);
router.post('/delete', requireAdmin, controller.deleteComment);
router.post('/update', requireAdmin, controller.updateComment);

module.exports = router;