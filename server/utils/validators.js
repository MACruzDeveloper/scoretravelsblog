// 24 hex characters, the string form of a MongoDB ObjectId
const OBJECT_ID = /^[0-9a-fA-F]{24}$/

const isValidId = (value) => typeof value === 'string' && OBJECT_ID.test(value)

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim() !== ''

module.exports = { isValidId, isNonEmptyString }
