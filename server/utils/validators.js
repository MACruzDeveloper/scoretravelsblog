const mongoose = require('mongoose')

const isValidId = (value) =>
  typeof value === 'string' && value.trim() !== '' && mongoose.isValidObjectId(value)

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim() !== ''

module.exports = { isValidId, isNonEmptyString }
