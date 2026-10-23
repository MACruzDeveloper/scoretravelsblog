const categories = require('../models/categoriesModel')

const isDuplicateKey = (error) => error && error.code === 11000

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
      if (isDuplicateKey(error)) return res.status(409).json({ ok: false, message: 'The category already exists' })
      console.error('Create category failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error creating category' })
    }
  }

  async deleteCategory(req, res) {
    const _id = req.params.id

    try {
      const removed = await categories.deleteOne({ _id })
      if (!removed.deletedCount) return res.status(404).json({ ok: false, message: 'Category not found' })
      res.send({ removed })
    }
    catch (error) {
      res.status(500).json({ ok: false, message: 'Error deleting category' })
    }
  }

  async updateCategory(req, res) {
    let params = req.body
    try {
      const updated = await categories.updateOne(
        { _id: req.params.id }, { name: params.name, description: params.description }
      )
      res.send({ updated })
    }
    catch (error) {
      if (isDuplicateKey(error)) return res.status(409).json({ ok: false, message: 'The category already exists' })
      console.error('Update category failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error updating category' })
    }
  }

  async findOneCategory(req, res) {
    try {
      const cat = await categories.findById(req.params.id)
      if (!cat) return res.status(404).json({ ok: false, message: 'Category not found' })
      res.send(cat)
    }
    catch (error) {
      res.status(500).json({ ok: false, message: 'Error fetching category' })
    }
  }
}

module.exports = new categoriesController()
