const categories = require('../models/categoriesModel')
const { isValidId, isNonEmptyString } = require('../utils/validators')

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
    if (!isNonEmptyString(name)) return res.status(400).send({ error: 'Invalid category name' })

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
    if (!isValidId(params._id)) return res.status(400).send({ error: 'Invalid id' })
    
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
    try {
      const cat = await categories.findOne({ name: req.params.category })
      if (!cat) return res.status(404).send({ error: 'Category not found' })
      res.send(cat)
    }
    catch (error) {
      res.send({ error })
    }
  }
}

module.exports = new categoriesController()