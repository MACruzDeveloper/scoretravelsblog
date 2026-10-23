const fs = require('fs')
const path = require('path')
const Images = require('../models/imagesModel')
const Experiences = require('../models/experiencesModel')
const { uploadsDir: UPLOADS_DIR } = require('../config')

// Resolve a stored filename inside the uploads folder, refusing anything that escapes it
const resolveUpload = (filename) => {
  const filePath = path.resolve(UPLOADS_DIR, path.basename(filename))
  return filePath.startsWith(path.resolve(UPLOADS_DIR) + path.sep) ? filePath : null
}

// A missing file on disk is not an error: the goal is that it no longer exists
const unlinkUpload = async (filePath) => {
  await fs.promises.unlink(filePath).catch((err) => {
    if (err.code !== 'ENOENT') throw err
  })
}

// Experiences reference images by filename in `image` (cover) and `images` (carousel)
const countExperiencesUsing = (filename) =>
  Experiences.countDocuments({ $or: [{ image: filename }, { images: filename }] })

const getExperienceImages = (experience) =>
  [experience.image, ...(Array.isArray(experience.images) ? experience.images : [])].filter(Boolean)

/**
 * Deletes the given images unless another experience still uses them or they are
 * featured on the home carousel. Call it after the experience was deleted or updated.
 * Never throws: a failed cleanup must not fail the request that triggered it.
 */
const removeUnusedImages = async (filenames) => {
  const removed = []
  for (const filename of new Set(filenames.filter(Boolean))) {
    try {
      if (await countExperiencesUsing(filename)) continue
      const record = await Images.findOne({ filename })
      if (record && record.featured) continue
      const filePath = resolveUpload(filename)
      if (!filePath) continue
      await unlinkUpload(filePath)
      if (record) await Images.deleteOne({ _id: record._id })
      removed.push(filename)
    } catch (error) {
      console.error(`Image cleanup failed for ${filename}:`, error.message)
    }
  }
  return removed
}

module.exports = { resolveUpload, unlinkUpload, countExperiencesUsing, getExperienceImages, removeUnusedImages }
