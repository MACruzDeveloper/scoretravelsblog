const express     = require('express'), 
    router        = express.Router(),
    controller    = require('../controllers/commentsController');
const { requireAuth } = require('../middleware/auth');

router.get('/', controller.findAllComments);
router.post('/add', controller.addNewComment);
router.post('/delete', requireAuth, controller.deleteComment);
router.post('/update', requireAuth, controller.updateComment);

module.exports = router;