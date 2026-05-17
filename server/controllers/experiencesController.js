const experiences = require('../models/experiencesModel');

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
      res.send({ error })
    }
  }

  async findExperience(req, res) {
    let expId = req.params.id
    try {
      const exp = await experiences.findById(expId).populate('city')
      res.send(exp)
    } catch (error) {
      res.send({ error })
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
        city: params.city,       // llega el ObjectId desde el frontend
        content: params.content,
        score: params.score,
        date: params.date || Date.now()
      })
      // populate para devolver el objeto city completo al frontend
      const populated = await done.populate('city')
      res.send(populated)
    } catch (error) {
      res.send({ error })
    }
  }

  async deleteExperience(req, res) {
    let { _id } = req.body
    try {
      const removed = await experiences.deleteOne({ _id })
      res.send({ removed })
    } catch (error) {
      res.send({ error })
    }
  }

  async updateExperience(req, res) {
    let params = req.body
    const currentExp = await experiences.findById(params._id)
    if (!currentExp) {
      return res.status(404).send({ error: 'Experience not found' })
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
          city: params.city,     // ObjectId
          content: params.content,
          score: params.score,
        }
      )
      // findById para devolver el doc actualizado con city populado
      const updated = await experiences.findById(params._id).populate('city')
      res.send({ updated })
    } catch (error) {
      res.send({ error })
    }
  }

  async updateScoreExperience(req, res) {
    let params = req.body
    try {
      const updated = await experiences.updateOne(
        { _id: params._id },
        { score: params.score }
      )
      res.send({ updated })
    } catch (error) {
      res.send({ error })
    }
  }
}

module.exports = new experiencesController();