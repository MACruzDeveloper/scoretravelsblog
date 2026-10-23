const path = require('path')
const crypto = require('crypto')
const fs = require('fs')
const sharp = require('sharp')
const Images = require('../models/imagesModel')
const { uploadsDir } = require('../config')
const { resolveUpload, unlinkUpload, countExperiencesUsing } = require('../services/imageService')
const { badRequest, notFound, conflict } = require('../utils/httpErrors')

const upload_image = async (req, res) => {
  if (!req.file || !req.file.buffer) throw badRequest('No file uploaded')

  fs.mkdirSync(uploadsDir, { recursive: true })
  // Generated name: never trust the client's original filename
  const filename = `${Date.now()}-${crypto.randomUUID()}.avif`
  const image = sharp(req.file.buffer)
  const metadata = await image.metadata()
  await image.rotate().avif({ quality: 70, effort: 6 }).toFile(path.join(uploadsDir, filename))

  const title = req.body.title || ''
  await Images.create({ filename, title, width: metadata.width || null, height: metadata.height || null })
  res.json({ filename, title })
}

const fetch_images = async (req, res) => {
  // Newest first (ObjectIds grow with creation time)
  const images = await Images.find({}).select('-pathname').sort({ _id: -1 })
  res.json({ images })
}

// The filename comes from the database record, never from the URL
const delete_image = async (req, res) => {
  const image = await Images.findById(req.params.id)
  if (!image) throw notFound('Image not found')
  const filePath = resolveUpload(image.filename)
  if (!filePath) throw badRequest('Invalid filename')

  const usedBy = await countExperiencesUsing(image.filename)
  if (usedBy) throw conflict(`Image is used by ${usedBy} experience(s). Remove it from them first`)

  await unlinkUpload(filePath)
  const deleted = await Images.deleteOne({ _id: image._id })
  res.send({ deleted })
}

const update_image = async (req, res) => {
  const updated = await Images.updateOne({ _id: req.params.id }, { featured: req.body.featured })
  if (!updated.matchedCount) throw notFound('Image not found')
  res.send({ updated })
}

module.exports = { upload_image, fetch_images, delete_image, update_image }
