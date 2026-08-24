const categories = require('../models/categoriesModel')
const { isValidId, isNonEmptyString } = require('../utils/validators')

class categoriesController {
  async findAllCategories(req, res) {
    try {
      const cats = await categories.find()
      res.send(cats)
    }
    catch (error) {
      res.status(500).json({ ok: false, message: 'Error fetching categories' })
    }
  }

  async addNewCategory(req, res) {
    let params = req.body
    try {
      const done = await categories.create({name: params.name, description: params.description})
      res.send(done)
    }
    catch (error) {
      res.status(500).json({ ok: false, message: 'Error creating category' })
    }
  }

  async deleteCategory(req, res) {
    let { name } = req.body
    if (!isNonEmptyString(name)) return res.status(400).json({ ok: false, message: 'Invalid category name' })

    try {
      const removed = await categories.deleteOne({ name: name })
      res.send({ removed })
    }
    catch (error) {
      res.status(500).json({ ok: false, message: 'Error deleting category' })
    }
  }

  async updateCategory(req, res) {
    let params = req.body
    if (!isValidId(params._id)) return res.status(400).json({ ok: false, message: 'Invalid id' })

    try {
      const updated = await categories.updateOne(
        { _id: params._id }, { name: params.name, description: params.description }
      )
      res.send({ updated })
    }
    catch (error) {
      res.status(500).json({ ok: false, message: 'Error updating category' })
    }
  }

  async findOneCategory(req, res) {
    try {
      const cat = await categories.findOne({ name: req.params.category })
      if (!cat) return res.status(404).json({ ok: false, message: 'Category not found' })
      res.send(cat)
    }
    catch (error) {
      res.status(500).json({ ok: false, message: 'Error fetching category' })
    }
  }
}

module.exports = new categoriesController()
