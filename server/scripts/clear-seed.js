/**
 * Removes everything scripts/seed-experiences.js created (marked `seed: true`):
 * experiences with their comments, votes and photos, the fictional users and the
 * places no other experience uses.
 *
 * Usage:
 *   npm run seed:clear            # only counts what would be removed
 *   npm run seed:clear -- --yes   # removes it
 */
require('dotenv').config({ quiet: true })

const mongoose = require('mongoose')
const Experiences = require('../models/experiencesModel')
const Cities = require('../models/citiesModel')
const Users = require('../models/usersModels')
const Comments = require('../models/commentsModel')
const Scores = require('../models/scoresModel')
const Images = require('../models/imagesModel')
const { removeImage } = require('../services/imageStorage')

async function main() {
  const confirmed = process.argv.includes('--yes')
  await mongoose.connect(process.env.ATLAS_URL)

  const experienceIds = await Experiences.find({ seed: true }).distinct('_id')
  const images = await Images.find({ seed: true }).lean()
  const users = await Users.find({ seed: true }).distinct('_id')
  // A seed place stays if a real experience uses it
  const usedByOthers = await Experiences.find({ seed: { $ne: true } }).distinct('city')
  const cities = await Cities.find({ seed: true, _id: { $nin: usedByOthers } }).distinct('_id')
  const comments = await Comments.countDocuments({ $or: [{ seed: true }, { experience: { $in: experienceIds } }] })
  const scores = await Scores.countDocuments({ $or: [{ seed: true }, { experience: { $in: experienceIds } }] })

  console.log(
    `Seed content: ${experienceIds.length} experiences, ${comments} comments, ${scores} votes, ` +
      `${images.length} images, ${users.length} users, ${cities.length} places`
  )
  if (!confirmed) {
    console.log('Nothing removed. Run again with --yes to remove it.')
    return mongoose.disconnect()
  }

  await Comments.deleteMany({ $or: [{ seed: true }, { experience: { $in: experienceIds } }] })
  await Scores.deleteMany({ $or: [{ seed: true }, { experience: { $in: experienceIds } }] })
  await Experiences.deleteMany({ _id: { $in: experienceIds } })
  for (const image of images) {
    await removeImage(image.filename)
  }
  await Images.deleteMany({ seed: true })
  await Users.deleteMany({ _id: { $in: users } })
  await Cities.deleteMany({ _id: { $in: cities } })
  console.log('Removed.')
  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error(err.message)
  await mongoose.disconnect()
  process.exit(1)
})
