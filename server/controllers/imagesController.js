const crypto = require('crypto')
const sharp = require('sharp')
const Images = require('../models/imagesModel')
const Experiences = require('../models/experiencesModel')
const { countExperiencesUsing, getExperienceImages } = require('../services/imageService')
const { saveImage, removeImage } = require('../services/imageStorage')
const { badRequest, notFound, conflict } = require('../utils/httpErrors')

const upload_image = async (req, res) => {
  if (!req.file || !req.file.buffer) throw badRequest('No file uploaded')

  // Generated name: never trust the client's original filename
  const filename = `${Date.now()}-${crypto.randomUUID()}.avif`
  const image = sharp(req.file.buffer)
  const metadata = await image.metadata()
  await saveImage(filename, await image.rotate().avif({ quality: 70, effort: 6 }).toBuffer())

  const title = req.body.title || ''
  await Images.create({
    filename,
    title,
    userId: req.user._id,
    width: metadata.width || null,
    height: metadata.height || null,
  })
  res.json({ filename, title })
}

const fetch_images = async (req, res) => {
  // `?featured=true`: only the home carousel images. Newest first (ObjectIds grow with creation time)
  const filter = req.query.featured ? { featured: true } : {}
  const images = await Images.find(filter).select('-pathname').sort({ _id: -1 })
  res.json({ images })
}

// Admin library: every image with the experience that uses it, if any
const fetch_library = async (req, res) => {
  const [images, experiences] = await Promise.all([
    Images.find({}).select('-pathname').sort({ _id: -1 }).lean(),
    Experiences.find({}).select('title image images').lean(),
  ])
  const usedBy = new Map()
  for (const experience of experiences) {
    for (const filename of getExperienceImages(experience)) {
      if (!usedBy.has(filename)) usedBy.set(filename, { _id: experience._id, title: experience.title })
    }
  }
  res.json({ images: images.map((image) => ({ ...image, experience: usedBy.get(image.filename) ?? null })) })
}

// The filename comes from the database record, never from the URL
const delete_image = async (req, res) => {
  const image = await Images.findById(req.params.id)
  if (!image) throw notFound('Image not found')
  const usedBy = await countExperiencesUsing(image.filename)
  if (usedBy) throw conflict(`Image is used by ${usedBy} experience(s). Remove it from them first`)

  if (!(await removeImage(image.filename))) throw badRequest('Invalid filename')
  const deleted = await Images.deleteOne({ _id: image._id })
  res.send({ deleted })
}

const update_image = async (req, res) => {
  const updated = await Images.updateOne({ _id: req.params.id }, { featured: req.body.featured })
  if (!updated.matchedCount) throw notFound('Image not found')
  res.send({ updated })
}

module.exports = { upload_image, fetch_images, fetch_library, delete_image, update_image }
