const Images = require('../models/imagesModel')
const Experiences = require('../models/experiencesModel')
const { removeImage } = require('./imageStorage')
const logger = require('../logger')

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
      if (!(await removeImage(filename))) continue
      if (record) await Images.deleteOne({ _id: record._id })
      removed.push(filename)
    } catch (error) {
      logger.warn({ err: error, filename }, 'Image cleanup failed')
    }
  }
  return removed
}

module.exports = { countExperiencesUsing, getExperienceImages, removeUnusedImages }
