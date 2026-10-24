const categories = require('../models/categoriesModel')
const experiences = require('../models/experiencesModel')
const { notFound, conflict } = require('../utils/httpErrors')

const findAllCategories = async (req, res) => {
  res.send(await categories.find().sort({ name: 1 }).collation({ locale: 'en', strength: 2 }))
}

const findOneCategory = async (req, res) => {
  const category = await categories.findById(req.params.id)
  if (!category) throw notFound('Category not found')
  res.send(category)
}

// Names are unique ignoring case (index on the model): a repeated one answers 409
const addNewCategory = async (req, res) => {
  const { name, description } = req.body
  res.send(await categories.create({ name, description }))
}

// Renaming also renames the category in every experience that uses it
const updateCategory = async (req, res) => {
  const { name, description } = req.body
  const category = await categories.findById(req.params.id)
  if (!category) throw notFound('Category not found')
  const oldName = category.name
  category.name = name
  category.description = description
  await category.save()
  const renamed =
    oldName !== name ? (await experiences.updateMany({ category: oldName }, { category: name })).modifiedCount : 0
  res.send({ updated: category, renamedInExperiences: renamed })
}

// A category in use cannot be deleted: experiences store its name
const deleteCategory = async (req, res) => {
  const category = await categories.findById(req.params.id)
  if (!category) throw notFound('Category not found')
  const inUse = await experiences.countDocuments({ category: category.name })
  if (inUse) throw conflict(`Category is used by ${inUse} experience(s). Change them first`)
  const removed = await categories.deleteOne({ _id: category._id })
  res.send({ removed })
}

module.exports = { findAllCategories, findOneCategory, addNewCategory, updateCategory, deleteCategory }
