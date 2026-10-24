// Every API endpoint lives under /api so it never collides with client routes
const router = require('express').Router()
const mongoose = require('mongoose')
const { apiLimiter } = require('../middleware/rateLimit')

router.use(apiLimiter)

router.get('/health', (req, res) => {
  const db = mongoose.connection.readyState === 1 ? 'up' : 'down'
  res.status(db === 'up' ? 200 : 503).json({ ok: db === 'up', db })
})

router.use('/auth', require('./authRoute'))
router.use('/users', require('./usersRoute'))
router.use('/categories', require('./categoriesRoute'))
router.use('/cities', require('./citiesRoute'))
router.use('/experiences', require('./experiencesRoute'))
router.use('/comments', require('./commentsRoute'))
router.use('/scores', require('./scoresRoute'))
router.use('/images', require('./imagesRoute'))
router.use('/contact', require('./contactRoute'))

// Unknown API routes answer JSON, not the SPA index.html
router.use((req, res) => res.status(404).json({ ok: false, message: 'Not found' }))

module.exports = router
