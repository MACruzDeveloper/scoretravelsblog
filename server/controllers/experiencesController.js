const experiences = require('../models/experiencesModel');

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
    try {
      const done = await experiences.create({
        user: params.user,
        title: params.title,
        image: params.image,
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
    try {
      await experiences.updateOne(
        { _id: params._id },
        {
          user: params.user,
          image: params.image,
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