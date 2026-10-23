const experiences = require('../models/experiencesModel');
const { getExperienceImages, removeUnusedImages } = require('../services/imageService');

const normalizeExperienceImages = (params) => {
  const hasImagesPayload = Object.prototype.hasOwnProperty.call(params, 'images')
  const hasImagePayload = Object.prototype.hasOwnProperty.call(params, 'image')

  const rawImages = hasImagesPayload
    ? Array.isArray(params.images)
      ? params.images
      : params.images
        ? [params.images]
        : []
    : []

  const images = rawImages
    .filter((item) => typeof item === 'string' && item && item !== 'null')
    .slice(0, 5)

  const image = images.length
    ? images[0]
    : hasImagePayload && typeof params.image === 'string' && params.image && params.image !== 'null'
      ? params.image
      : ''

  return { images, image, hasImagesPayload, hasImagePayload }
}

class experiencesController {
  async findAllExperiences(req, res) {
    try {
      const exps = await experiences.find().select('-userId').populate('city')
      res.send(exps)
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Error fetching experiences' })
    }
  }

  async findExperience(req, res) {
    let expId = req.params.id
    try {
      const exp = await experiences.findById(expId).select('-userId').populate('city')
      if (!exp) return res.status(404).json({ ok: false, message: 'Experience not found' })
      res.send(exp)
    } catch (error) {
      console.error('Fetch experience failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error fetching experience' })
    }
  }

  async addNewExperience(req, res) {
    let params = req.body
    const { images, image } = normalizeExperienceImages(params)

    try {
      const done = await experiences.create({
        // Author always comes from the token
        user: req.user.username,
        userId: req.user._id,
        title: params.title,
        image,
        images,
        category: params.category,
        city: params.city,
        content: params.content,
        date: params.date || Date.now()
      })
      const populated = await done.populate('city')
      res.send(populated)
    } catch (error) {
      console.error('Create experience failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error creating experience' })
    }
  }

  async deleteExperience(req, res) {
    const _id = req.params.id
    try {
      const existing = await experiences.findById(_id)
      if (!existing) return res.status(404).json({ ok: false, message: 'Experience not found' })
      const removed = await experiences.deleteOne({ _id })
      // Images no other experience uses and that are not featured go away too
      const removedImages = await removeUnusedImages(getExperienceImages(existing))
      res.send({ removed, removedImages })
    } catch (error) {
      console.error('Delete experience failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error deleting experience' })
    }
  }

  async updateExperience(req, res) {
    let params = req.body
    let currentExp
    try {
      currentExp = await experiences.findById(req.params.id)
    } catch (error) {
      console.error('Fetch experience failed:', error.message)
      return res.status(500).json({ ok: false, message: 'Error updating experience' })
    }
    if (!currentExp) {
      return res.status(404).json({ ok: false, message: 'Experience not found' })
    }

    const {
      images: normalizedImages,
      image: normalizedImage,
      hasImagesPayload,
      hasImagePayload
    } = normalizeExperienceImages(params)

    const existingImages = Array.isArray(currentExp.images)
      ? currentExp.images.filter((item) => typeof item === 'string' && item)
      : []

    const images = hasImagesPayload
      ? normalizedImages
      : existingImages.length > 0
        ? existingImages
        : currentExp.image
          ? [currentExp.image]
          : []

    const image = hasImagesPayload
      ? normalizedImage
      : hasImagePayload
        ? normalizedImage
        : currentExp.image || (images.length ? images[0] : '')

    try {
      await experiences.updateOne(
        { _id: req.params.id },
        {
          image,
          images,
          title: params.title,
          category: params.category,
          city: params.city,
          content: params.content,
        }
      )
      const updated = await experiences.findById(req.params.id).select('-userId').populate('city')
      // Images dropped in this edit are cleaned up if nothing else uses them
      const kept = new Set(getExperienceImages({ image, images }))
      const removedImages = await removeUnusedImages(getExperienceImages(currentExp).filter((name) => !kept.has(name)))
      res.send({ updated, removedImages })
    } catch (error) {
      console.error('Update experience failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error updating experience' })
    }
  }
}


module.exports = new experiencesController();
