/**
 * Seeds the database with N mock travel experiences using Genkit + Gemini.
 *
 * Usage:
 *   node scripts/seed-experiences.js [count] [--user=<name>]
 *
 * Examples:
 *   node scripts/seed-experiences.js            # generates 5 mock experiences
 *   node scripts/seed-experiences.js 10         # generates 10
 *   node scripts/seed-experiences.js 10 --user=admin
 */
require('dotenv').config()

const mongoose = require('mongoose')
const Experiences = require('../models/experiencesModel')
const Categories = require('../models/categoriesModel')
const Cities = require('../models/citiesModel')
const { generateMockExperienceFlow } = require('../genkit')

const DEFAULT_COUNT = 5

function parseArgs() {
  const argv = process.argv.slice(2)
  let count = DEFAULT_COUNT
  let user = 'ai-seed'
  for (const arg of argv) {
    if (/^\d+$/.test(arg)) {
      count = parseInt(arg, 10)
    } else if (arg.startsWith('--user=')) {
      user = arg.split('=')[1]
    }
  }
  return { count, user }
}

async function main() {
  const { count, user } = parseArgs()

  if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: Missing GEMINI_API_KEY. Add it to server/.env (https://aistudio.google.com/apikey)')
    process.exit(1)
  }

  if (!process.env.ATLAS_URL) {
    console.error('ERROR: Missing ATLAS_URL in server/.env')
    process.exit(1)
  }

  console.log('Connecting to the database...')
  await mongoose.connect(process.env.ATLAS_URL, { useUnifiedTopology: true, useNewUrlParser: true })

  const categories = await Categories.find({}).lean()
  const cities = await Cities.find({}).select('name').lean()

  if (categories.length === 0) {
    console.error('ERROR: No categories found. Create categories first (admin panel).')
    process.exit(1)
  }
  if (cities.length === 0) {
    console.error('ERROR: No cities found. Create cities first.')
    process.exit(1)
  }

  const categoryNames = categories.map((c) => c.name)
  const cityNames = cities.map((c) => c.name)
  const cityByName = new Map(cities.map((c) => [c.name, c._id]))

  if (count > cityNames.length) {
    console.warn(`NOTE: You asked for ${count} experiences but there are only ${cityNames.length} cities. The model will start repeating cities.`)
  }

  console.log(`Generating ${count} mock experiences from ${categoryNames.length} categories and ${cityNames.length} cities...`)

  const generated = []
  const usedCities = []
  let remainingCities = [...cityNames]
  for (let i = 0; i < count; i++) {
    try {
      // Only offer cities not yet used in this batch, forcing variety.
      // If we run out (batch larger than city count), fall back to all cities.
      const availableCities = remainingCities.length
        ? remainingCities
        : cityNames

      const result = await generateMockExperienceFlow({
        categories: categoryNames,
        cityNames: availableCities,
      })

      // Remember the chosen city and remove it from the pool for next iterations
      const chosenCity = result.city
      if (chosenCity && remainingCities.includes(chosenCity)) {
        remainingCities = remainingCities.filter((c) => c !== chosenCity)
      }
      usedCities.push(chosenCity)

      // Map the chosen city name back to its ObjectId; fall back to a random city
      // if the model returned something off-list.
      const cityId = (cityByName.get(result.city) || cities[Math.floor(Math.random() * cities.length)]._id)

      const experience = {
        user,
        title: result.title,
        content: result.content,
        category: result.category,
        city: cityId,
        score: result.score,
      }

      generated.push(experience)
      console.log(`  [${i + 1}/${count}] "${result.title}" (${result.city}, ${result.category}) [left: ${remainingCities.length}]`)
    } catch (err) {
      console.warn(`  [${i + 1}/${count}] failed: ${err.message}`)
    }
  }

  if (generated.length > 0) {
    const inserted = await Experiences.insertMany(generated, { ordered: false })
    console.log(`Inserted ${inserted.length} experiences into the DB.`)
  }

  await mongoose.disconnect()
  console.log('Done.')
}

main().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect()
  process.exit(1)
})
