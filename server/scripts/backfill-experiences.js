/**
 * Cleans up experience categories and fills in missing cities, in two steps:
 *
 *   1. node scripts/backfill-experiences.js propose
 *      Reads the database (no writes) and writes scripts/backfill-proposal.json:
 *      - categories matching a defined one with different case are normalized ('ocio' -> 'Ocio')
 *      - aliases are mapped (see CATEGORY_ALIASES)
 *      - anything else (old country categories) gets a category suggested by Gemini
 *      - experiences without city get one from Gemini + OpenStreetMap coordinates
 *
 *   2. Review and edit the JSON file. Set "skip": true on entries you don't want.
 *
 *   3. node scripts/backfill-experiences.js apply
 *      Creates missing cities, updates the experiences and removes REMOVED_CATEGORIES.
 */
require('dotenv').config({ quiet: true })

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const Experiences = require('../models/experiencesModel')
const Categories = require('../models/categoriesModel')
const Cities = require('../models/citiesModel')

const PROPOSAL_FILE = path.join(__dirname, 'backfill-proposal.json')
const CATEGORY_ALIASES = { party: 'Ocio' }
const REMOVED_CATEGORIES = ['test']
// Nominatim usage policy: max 1 request per second and an identifying User-Agent
const NOMINATIM_DELAY_MS = 1100
const USER_AGENT = 'ScoreTravelsBlog backfill script (https://github.com/TxikiCruz/scoretravelsblog)'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

// Free tier: few requests per day and per minute, so several experiences go in each request
const BATCH_SIZE = 10
const BATCH_DELAY_MS = 15000

// Daily quota cannot be waited for; per-minute quota can
const isDailyQuotaError = (error) => /PerDay/i.test(error.message || '')

const withRetry = async (fn, label, attempts = 3) => {
  for (let i = 1; ; i++) {
    try {
      return await fn()
    } catch (error) {
      if (isDailyQuotaError(error) || i >= attempts) throw error
      const wait = 30000 * i
      console.warn(`  ${label}: ${error.message.slice(0, 80)} (retry in ${wait / 1000}s)`)
      await sleep(wait)
    }
  }
}

// Free-form search also finds islands and regions (Boracay, Tuscany...)
const geocode = async ({ city, country, countryCode }) => {
  const query = encodeURIComponent(`${city}, ${country || ''}`)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&countrycodes=${countryCode.toLowerCase()}&format=json&limit=1&accept-language=en`
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  await sleep(NOMINATIM_DELAY_MS)
  if (!response.ok) throw new Error(`Nominatim ${response.status}`)
  const [place] = await response.json()
  return place ? { lat: Number(Number(place.lat).toFixed(5)), lng: Number(Number(place.lon).toFixed(5)) } : null
}

const saveProposal = (entries) => {
  fs.writeFileSync(PROPOSAL_FILE, JSON.stringify({ removeCategories: REMOVED_CATEGORIES, entries }, null, 2))
}

// Entries already answered by Gemini in a previous run are kept (the run can resume)
const loadPreviousEntries = () => {
  if (!fs.existsSync(PROPOSAL_FILE)) return new Map()
  const { entries = [] } = JSON.parse(fs.readFileSync(PROPOSAL_FILE, 'utf8'))
  return new Map(entries.filter((e) => e.status !== 'pending').map((e) => [e._id, e]))
}

async function propose() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: Missing GEMINI_API_KEY in server/.env')
    process.exit(1)
  }
  const { classifyExperiencesFlow } = require('../genkit')

  const categoryNames = (await Categories.find().lean())
    .map((c) => c.name)
    .filter((name) => !REMOVED_CATEGORIES.includes(name))
  const byLowerName = new Map(categoryNames.map((name) => [name.toLowerCase(), name]))
  const existingCities = await Cities.find().lean()
  const findCity = (name, countryCode) => existingCities.find((c) =>
    c.name.toLowerCase() === name.toLowerCase() && c.countryCode === countryCode)

  const previous = loadPreviousEntries()
  const experiences = await Experiences.find().select('title content category city').lean()
  console.log(`Categories: ${categoryNames.join(', ')}`)

  // 1. Everything that can be decided without Gemini
  const entries = experiences.map((exp) => {
    const id = String(exp._id)
    if (previous.has(id)) return previous.get(id)
    const current = exp.category || ''
    const alias = CATEGORY_ALIASES[current.toLowerCase()]
    const canonical = byLowerName.get(current.toLowerCase()) || alias
    const needsGemini = !canonical || !exp.city
    return {
      _id: id,
      title: exp.title,
      currentCategory: current,
      category: canonical || null,
      categorySource: !canonical ? 'gemini' : alias ? 'alias' : canonical === current ? 'unchanged' : 'normalized',
      city: null,
      needsCity: !exp.city,
      status: needsGemini ? 'pending' : 'ready',
      skip: false,
    }
  })
  saveProposal(entries)

  // 2. The rest, in batches
  const pending = entries.filter((e) => e.status === 'pending')
  const byId = new Map(experiences.map((exp) => [String(exp._id), exp]))
  console.log(`${entries.length - pending.length} experiences resolved without Gemini, ${pending.length} pending (${Math.ceil(pending.length / BATCH_SIZE)} requests)\n`)

  for (let start = 0; start < pending.length; start += BATCH_SIZE) {
    const batch = pending.slice(start, start + BATCH_SIZE)
    const batchNumber = start / BATCH_SIZE + 1
    let results
    try {
      const output = await withRetry(() => classifyExperiencesFlow({
        categories: categoryNames,
        experiences: batch.map((entry) => ({
          id: entry._id,
          title: entry.title,
          content: stripHtml(byId.get(entry._id).content).slice(0, 700),
          hint: entry.category ? '' : entry.currentCategory,
        })),
      }), `batch ${batchNumber}`)
      results = new Map(output.results.map((r) => [r.id, r]))
    } catch (error) {
      saveProposal(entries)
      if (isDailyQuotaError(error)) {
        console.error(`\nGemini daily quota reached. Progress saved: run "propose" again tomorrow to continue.`)
      } else {
        console.error(`\nBatch ${batchNumber} failed: ${error.message.slice(0, 150)}\nProgress saved: run "propose" again to continue.`)
      }
      return
    }

    for (const entry of batch) {
      const result = results.get(entry._id)
      if (!result) {
        entry.note = 'Gemini returned no answer for this experience: run propose again or fill it by hand'
        continue
      }
      if (entry.categorySource === 'gemini') entry.category = byLowerName.get((result.category || '').toLowerCase()) || null
      if (entry.needsCity && result.city && result.countryCode) {
        const countryCode = result.countryCode.toUpperCase()
        const known = findCity(result.city, countryCode)
        if (known) {
          entry.city = { existingId: String(known._id), name: known.name, country: known.country }
        } else {
          const coords = await withRetry(() => geocode({ city: result.city, country: result.country, countryCode }), `geocode ${result.city}`)
          entry.city = { name: result.city, country: result.country, countryCode, continent: result.continent, lat: coords?.lat ?? null, lng: coords?.lng ?? null }
          if (!coords) entry.note = 'Place not found in OpenStreetMap: fill lat/lng or set skip'
        }
      }
      entry.status = entry.note ? 'review' : 'ready'
      const cityText = entry.city ? `${entry.city.name}, ${entry.city.country}` : entry.needsCity ? '(no city)' : '(keeps city)'
      console.log(`- ${entry.title}\n    category: ${entry.currentCategory || '-'} -> ${entry.category || '?'}   city: ${cityText}${entry.note ? `\n    NOTE: ${entry.note}` : ''}`)
    }
    saveProposal(entries)
    if (start + BATCH_SIZE < pending.length) await sleep(BATCH_DELAY_MS)
  }

  const toReview = entries.filter((e) => e.status !== 'ready').length
  console.log(`\nProposal written to ${path.relative(process.cwd(), PROPOSAL_FILE)} (${toReview} entries need review). Then run: node scripts/backfill-experiences.js apply`)
}

async function apply() {
  if (!fs.existsSync(PROPOSAL_FILE)) {
    console.error('ERROR: Run "propose" first')
    process.exit(1)
  }
  const { removeCategories = [], entries } = JSON.parse(fs.readFileSync(PROPOSAL_FILE, 'utf8'))
  const categoryNames = new Set((await Categories.find().lean()).map((c) => c.name))
  let updated = 0
  let created = 0

  const pending = entries.filter((e) => e.status === 'pending').length
  if (pending) console.warn(`  ${pending} entries are still pending (run "propose" again); only their safe changes are applied`)

  for (const entry of entries) {
    if (entry.skip) continue
    const update = {}

    if (entry.category && entry.category !== entry.currentCategory) {
      if (!categoryNames.has(entry.category)) {
        console.warn(`  skip category for "${entry.title}": "${entry.category}" is not a defined category`)
      } else {
        update.category = entry.category
      }
    }

    if (entry.city) {
      if (entry.city.existingId) {
        update.city = entry.city.existingId
      } else if (entry.city.lat == null || entry.city.lng == null) {
        console.warn(`  skip city for "${entry.title}": missing coordinates`)
      } else {
        const { name, country, countryCode, continent, lat, lng } = entry.city
        const before = await Cities.exists({ name, countryCode })
        const city = await Cities.findOneAndUpdate(
          { name, countryCode },
          { name, country, countryCode, continent, lat, lng },
          { upsert: true, returnDocument: 'after', runValidators: true }
        )
        if (!before) created++
        update.city = city._id
      }
    }

    if (Object.keys(update).length) {
      await Experiences.updateOne({ _id: entry._id }, update)
      updated++
    }
  }

  const removed = await Categories.deleteMany({ name: { $in: removeCategories } })
  console.log(`Updated ${updated} experiences, created ${created} cities, removed ${removed.deletedCount} categories (${removeCategories.join(', ')})`)
}

async function main() {
  const mode = process.argv[2]
  if (!['propose', 'apply'].includes(mode)) {
    console.error('Usage: node scripts/backfill-experiences.js <propose|apply>')
    process.exit(1)
  }
  if (!process.env.ATLAS_URL) {
    console.error('ERROR: Missing ATLAS_URL in server/.env')
    process.exit(1)
  }
  await mongoose.connect(process.env.ATLAS_URL)
  await (mode === 'propose' ? propose() : apply())
  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await mongoose.disconnect()
  process.exit(1)
})
