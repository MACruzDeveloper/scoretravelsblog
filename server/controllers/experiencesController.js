const experiences = require('../models/experiencesModel')
const comments = require('../models/commentsModel')
const scores = require('../models/scoresModel')
const categories = require('../models/categoriesModel')
const { getExperienceImages, removeUnusedImages } = require('../services/imageService')
const { listExperiences, getFacets, getTimeline } = require('../services/experienceQuery')
const { badRequest, notFound } = require('../utils/httpErrors')

// Stored spelling of a category ('ocio' -> 'Ocio'); '' for none. Unknown categories are rejected
const resolveCategory = async (name) => {
  if (!name) return ''
  const category = await categories.findByName(name)
  if (!category) throw badRequest(`Unknown category: ${name}`)
  return category.name
}

// The cover image is the first of the gallery; `image` alone is still accepted
const coverOf = (images, image) => images[0] || image || ''

// Paginated and filtered list: { items, total, page, limit, pages }
const findAllExperiences = async (req, res) => {
  res.send(await listExperiences(req.query))
}

const findFacets = async (req, res) => {
  res.send(await getFacets())
}

const findTimeline = async (req, res) => {
  res.send(await getTimeline())
}

const findExperience = async (req, res) => {
  const exp = await experiences.findById(req.params.id).select('-userId').populate('city')
  if (!exp) throw notFound('Experience not found')
  res.send(exp)
}

const findExperienceComments = async (req, res) => {
  res.send(await comments.find({ experience: req.params.id }).select('-userId').sort({ date: -1 }))
}

const addNewExperience = async (req, res) => {
  const { title, content, city, date } = req.body
  const images = req.body.images || []
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
  })
  res.send(await done.populate('city'))
}

const updateExperience = async (req, res) => {
  const current = await experiences.findById(req.params.id)
  if (!current) throw notFound('Experience not found')

  const { title, content, city } = req.body
  const update = { title, content, city }
  if (req.body.category !== undefined) update.category = await resolveCategory(req.body.category)
  if (req.body.images !== undefined) {
    update.images = req.body.images
    update.image = coverOf(req.body.images, req.body.image)
  } else if (req.body.image !== undefined) {
    update.image = req.body.image
  }

  await experiences.updateOne({ _id: current._id }, update)
  const updated = await experiences.findById(current._id).select('-userId').populate('city')

  // Images dropped in this edit are cleaned up if nothing else uses them
  const kept = new Set(getExperienceImages(updated))
  const removedImages = await removeUnusedImages(getExperienceImages(current).filter((name) => !kept.has(name)))
  res.send({ updated, removedImages })
}

const deleteExperience = async (req, res) => {
  const existing = await experiences.findById(req.params.id)
  if (!existing) throw notFound('Experience not found')
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

module.exports = {
  findAllExperiences,
  findFacets,
  findTimeline,
  findExperience,
  findExperienceComments,
  addNewExperience,
  updateExperience,
  deleteExperience,
}
