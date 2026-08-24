const experiences = require('../models/experiencesModel');
const { isValidId } = require('../utils/validators');

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
      const exps = await experiences.find().populate('city')
      res.send(exps)
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Error fetching experiences' })
    }
  }

  async findExperience(req, res) {
    let expId = req.params.id
    try {
      const exp = await experiences.findById(expId).populate('city')
      res.send(exp)
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Error fetching experience' })
    }
  }

  async addNewExperience(req, res) {
    let params = req.body
    const { images, image } = normalizeExperienceImages(params)

    try {
      const done = await experiences.create({
        user: params.user,
        title: params.title,
        image,
        images,
        category: params.category,
        city: params.city,
        content: params.content,
        score: params.score,
        date: params.date || Date.now()
      })
      const populated = await done.populate('city')
      res.send(populated)
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Error creating experience' })
    }
  }

  async deleteExperience(req, res) {
    let { _id } = req.body
    if (!isValidId(_id)) return res.status(400).json({ ok: false, message: 'Invalid id' })
    try {
      const removed = await experiences.deleteOne({ _id })
      res.send({ removed })
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Error deleting experience' })
    }
  }

  async updateExperience(req, res) {
    let params = req.body
    if (!isValidId(params._id)) return res.status(400).json({ ok: false, message: 'Invalid id' })
    const currentExp = await experiences.findById(params._id)
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
        { _id: params._id },
        {
          user: params.user,
          image,
          images,
          title: params.title,
          category: params.category,
          city: params.city,
          content: params.content,
          score: params.score,
        }
      )
      const updated = await experiences.findById(params._id).populate('city')
      res.send({ updated })
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Error updating experience' })
    }
  }

  async updateScoreExperience(req, res) {
    let params = req.body
    if (!isValidId(params._id)) return res.status(400).json({ ok: false, message: 'Invalid id' })
    try {
      const updated = await experiences.updateOne(
        { _id: params._id },
        { score: params.score }
      )
      res.send({ updated })
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Error updating score' })
    }
  }
}

module.exports = new experiencesController();
