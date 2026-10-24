const experiences = require('../models/experiencesModel')
const comments = require('../models/commentsModel')
const scores = require('../models/scoresModel')
const categories = require('../models/categoriesModel')
const { getExperienceImages, removeUnusedImages } = require('../services/imageService')
const { listExperiences, getFacets, getTimeline } = require('../services/experienceQuery')
const { notifyPendingReview } = require('../services/mailer')
const { isOwnerOrAdmin } = require('../middleware/auth')
const { badRequest, unauthorized, forbidden, notFound } = require('../utils/httpErrors')

// Stored spelling of a category ('ocio' -> 'Ocio'); '' for none. Unknown categories are rejected
const resolveCategory = async (name) => {
  if (!name) return ''
  const category = await categories.findByName(name)
  if (!category) throw badRequest(`Unknown category: ${name}`)
  return category.name
}

// The cover image is the first of the gallery; `image` alone is still accepted
const coverOf = (images, image) => images[0] || image || ''

const isAdmin = (user) => user?.role === 'admin'

// Loads an experience the current user may change (its author or an admin)
const findEditable = async (req) => {
  const experience = await experiences.findById(req.params.id)
  if (!experience) throw notFound('Experience not found')
  if (!isOwnerOrAdmin(req.user, experience)) throw forbidden('You can only change your own experiences')
  return experience
}

// Paginated and filtered list: { items, total, page, limit, pages }
const findAllExperiences = async (req, res) => {
  const { scope } = req.query
  if (scope === 'mine' && !req.user) throw unauthorized()
  if (scope === 'all' && !isAdmin(req.user)) throw forbidden('Admin access required')
  res.send(await listExperiences(req.query, req.user))
}

const findFacets = async (req, res) => {
  res.send(await getFacets())
}

const findTimeline = async (req, res) => {
  res.send(await getTimeline())
}

// Unpublished experiences are only visible to their author and admins
const findExperience = async (req, res) => {
  const exp = await experiences.findById(req.params.id).populate('city')
  if (!exp || (exp.status !== 'published' && !isOwnerOrAdmin(req.user, exp))) {
    throw notFound('Experience not found')
  }
  const { userId, ...publicFields } = exp.toObject()
  res.send(publicFields)
}

const findExperienceComments = async (req, res) => {
  res.send(await comments.find({ experience: req.params.id }).select('-userId').sort({ date: -1 }))
}

// Users' experiences wait for review; admins publish directly
const addNewExperience = async (req, res) => {
  const { title, content, city, date } = req.body
  const images = req.body.images || []
  const published = isAdmin(req.user)
  const done = await experiences.create({
    // Author always comes from the token
    user: req.user.username,
    userId: req.user._id,
    title,
    content,
    city,
    category: await resolveCategory(req.body.category),
    images,
    image: coverOf(images, req.body.image),
    date: date || Date.now(),
    status: published ? 'published' : 'pending',
  })
  if (!published) await notifyPendingReview(done)
  res.send(await done.populate('city'))
}

// An edit by a user sends the experience back to review
const updateExperience = async (req, res) => {
  const current = await findEditable(req)

  const { title, content, city } = req.body
  const update = { title, content, city }
  if (req.body.category !== undefined) update.category = await resolveCategory(req.body.category)
  if (req.body.images !== undefined) {
    update.images = req.body.images
    update.image = coverOf(req.body.images, req.body.image)
  } else if (req.body.image !== undefined) {
    update.image = req.body.image
  }
  const backToReview = !isAdmin(req.user)
  if (backToReview) Object.assign(update, { status: 'pending', rejectionReason: '' })

  await experiences.updateOne({ _id: current._id }, update)
  const updated = await experiences.findById(current._id).select('-userId').populate('city')
  if (backToReview) await notifyPendingReview(updated, { edited: true })

  // Images dropped in this edit are cleaned up if nothing else uses them
  const kept = new Set(getExperienceImages(updated))
  const removedImages = await removeUnusedImages(getExperienceImages(current).filter((name) => !kept.has(name)))
  res.send({ updated, removedImages })
}

const deleteExperience = async (req, res) => {
  const existing = await findEditable(req)
  const removed = await experiences.deleteOne({ _id: existing._id })
  // Its comments and votes would be orphans
  await Promise.all([
    comments.deleteMany({ experience: existing._id }),
    scores.deleteMany({ experience: existing._id }),
  ])
  // Images no other experience uses and that are not featured go away too
  const removedImages = await removeUnusedImages(getExperienceImages(existing))
  res.send({ removed, removedImages })
}

// Admin decision: publish or reject (with an optional reason shown to the author)
const reviewExperience = async (req, res) => {
  const { status, reason } = req.body
  const updated = await experiences
    .findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: status === 'rejected' ? reason || '' : '', reviewedAt: new Date() },
      { returnDocument: 'after' }
    )
    .select('-userId')
  if (!updated) throw notFound('Experience not found')
  res.send({ updated })
}

module.exports = {
  findAllExperiences,
  findFacets,
  findTimeline,
  findExperience,
  findExperienceComments,
  addNewExperience,
  updateExperience,
  deleteExperience,
  reviewExperience,
}
