const express     = require('express'), 
    router        = express.Router(),
    controller    = require('../controllers/commentsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { writeLimiter } = require('../middleware/rateLimit');
const schemas = require('../utils/schemas');

router.get('/', controller.findAllComments);
router.post('/add', requireAuth, writeLimiter, validate(schemas.addComment), controller.addNewComment);
router.post('/delete', requireAdmin, validate(schemas.byId), controller.deleteComment);
router.post('/update', requireAdmin, validate(schemas.updateComment), controller.updateComment);

module.exports = router;
