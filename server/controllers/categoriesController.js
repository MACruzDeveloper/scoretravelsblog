const categories = require('../models/categoriesModel')

class categoriesController {
  async findAllCategories(req, res) {
    try {
      const cats = await categories.find()
      res.send(cats)
    }
    catch (error) {
      //console.log(error)
      res.send({ error })
    }
  }

  async addNewCategory(req, res) {
    let params = req.body
    try {
      const done = await categories.create({name: params.name, description: params.description})
      res.send(done)
    }
    catch (error) {
      //console.log(e)
      res.send({ error })
    }
  }

  async deleteCategory(req, res) {
    let { name } = req.body  

    try {
      const removed = await categories.deleteOne({ name: name })
      res.send({ removed })
    }
    catch (error) {
      console.log(error)
      res.send({ error })
    }
  }

  async updateCategory(req, res) {
    let params = req.body 
    
    try {
      const updated = await categories.updateOne(
        { _id: params._id }, { name: params.name, description: params.description }
      )
      res.send({ updated })
    }
    catch (error) {
      console.log(error)
      res.send({ error })
    }
  }

  async findOneCategory(req, res) {

  }
}

module.exports = new categoriesController()