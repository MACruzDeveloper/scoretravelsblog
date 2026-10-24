const router = require('express').Router()
const controller = require('../controllers/imagesController')
const multer = require('multer')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { writeLimiter } = require('../middleware/rateLimit')
const { validate } = require('../middleware/validate')
const schemas = require('../utils/schemas')

const byId = validate(schemas.idParam, 'params')

router.get('/', controller.fetch_images)
router.patch('/:id', requireAdmin, byId, validate(schemas.updateImage), controller.update_image)
router.delete('/:id', requireAdmin, byId, controller.delete_image)

// UPLOAD IMAGES ROUTE AND RELATED FUNCTIONS
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'))
  },
}).single('file')

// Turn multer errors into 400 responses instead of falling through to the 500 handler
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next()
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Max 10MB' : 'Invalid file. Allowed: JPEG, PNG, WebP, AVIF'
    return res.status(400).json({ ok: false, message })
  })
}

// Users upload images for their own experiences; the library (edit/delete) is for admins
router.post('/', requireAuth, writeLimiter, handleUpload, validate(schemas.uploadImage), controller.upload_image)

module.exports = router
