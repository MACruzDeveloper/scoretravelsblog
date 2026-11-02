/**
 * Seeds the database with sample travel experiences: text by Gemini (Genkit), places
 * geocoded with Photon and photos from Wikimedia Commons, with comments and votes from a
 * few fictional users. Everything it creates is marked `seed: true`, so
 * `npm run seed:clear` removes it.
 *
 * Usage:
 *   npm run seed                                   # 5 experiences per inhabited continent
 *   npm run seed -- --per-continent=2 --continents=europe,asia
 *   npm run seed -- --dry-run                      # only prints what Gemini writes
 */
require('dotenv').config({ quiet: true })

const crypto = require('crypto')
const mongoose = require('mongoose')
const argon2 = require('argon2')
const sharp = require('sharp')
const Experiences = require('../models/experiencesModel')
const Categories = require('../models/categoriesModel')
const Cities = require('../models/citiesModel')
const Users = require('../models/usersModels')
const Comments = require('../models/commentsModel')
const Scores = require('../models/scoresModel')
const Images = require('../models/imagesModel')
const { recalculateExperienceScore } = require('../services/scoreService')
const { saveImage } = require('../services/imageStorage')
const { generateMockExperiencesFlow } = require('../genkit')

const INHABITED = ['africa', 'asia', 'europe', 'north-america', 'oceania', 'south-america']
// Wikimedia and Photon ask for an identifying User-Agent
const USER_AGENT = 'ScoreTravelsBlog-seed/1.0 (https://github.com/TxikiCruz/scoretravelsblog)'
const PHOTOS_PER_EXPERIENCE = 3
// Experiences are spread over the last two years
const SPREAD_DAYS = 730
const DAY = 24 * 60 * 60 * 1000

// Fictional authors (not real people); `voice` guides how Gemini writes as them
const AUTHORS = [
  { username: 'lena_wanders', voice: 'German backpacker in her twenties, budget tips, hostels and night trains' },
  { username: 'marco.eats', voice: 'Italian food lover, travels for markets, street food and local wine' },
  {
    username: 'sofia_and_dan',
    voice: 'couple in their thirties, slow travel, romantic spots, honest about tourist traps',
  },
  { username: 'kenji_photo', voice: 'Japanese amateur photographer, sunrise hikes, quiet details, short sentences' },
  { username: 'aisha.travels', voice: 'British-Nigerian solo traveller, safety tips, culture and history' },
  { username: 'tom_on_business', voice: 'consultant who adds a free day to work trips, efficient, a bit ironic' },
  { username: 'carla_family', voice: 'Spanish mother travelling with two kids, logistics and kid-friendly plans' },
  { username: 'nomad_raul', voice: 'Mexican remote worker, coworkings, long stays, cost of living' },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const pick = (list) => list[Math.floor(Math.random() * list.length)]
const stripHtml = (html = '') =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function parseArgs() {
  const options = { perContinent: 5, continents: INHABITED, dryRun: false }
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--per-continent=')) options.perContinent = parseInt(arg.split('=')[1], 10)
    else if (arg.startsWith('--continents=')) options.continents = arg.split('=')[1].split(',')
    else if (arg === '--dry-run') options.dryRun = true
  }
  const unknown = options.continents.filter((c) => !INHABITED.includes(c))
  if (unknown.length) throw new Error(`Unknown continent: ${unknown.join(', ')}`)
  return options
}

// Gemini answers 503 when a model is busy: wait and try again, switching between the
// default model and its lighter version
const FALLBACK_MODEL = 'gemini-3.5-flash-lite'

async function withRetries(task, attempts = 4) {
  for (let attempt = 1; ; attempt++) {
    const model = attempt % 2 === 0 ? FALLBACK_MODEL : undefined
    try {
      return await task(model)
    } catch (err) {
      const busy = /503|UNAVAILABLE|429|RESOURCE_EXHAUSTED/.test(err.message)
      if (!busy || attempt === attempts) throw err
      const wait = 20 * attempt
      const next = attempt % 2 === 1 ? FALLBACK_MODEL : 'the default model'
      console.warn(`  Gemini is busy, retrying with ${next} in ${wait}s (${attempt}/${attempts - 1})...`)
      await sleep(wait * 1000)
    }
  }
}

const getJson = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

// ---------- Places (Photon) ----------

const PLACE_TAGS = ['city', 'town', 'country', 'state', 'region', 'island', 'archipelago']

// Finds the place in its country; returns null when Photon does not know it
async function searchPlace(query, countryCode, onlyCountries) {
  const params = new URLSearchParams({ q: query, limit: '8', lang: 'en' })
  PLACE_TAGS.forEach((tag) => params.append('osm_tag', `place:${tag}`))
  const { features = [] } = await getJson(`https://photon.komoot.io/api/?${params}`)
  // Only a place in the right country: Photon may return a namesake anywhere else
  return features.find(
    (f) =>
      f.properties.countrycode?.toUpperCase() === countryCode &&
      (!onlyCountries || f.properties.osm_value === 'country')
  )
}

// Finds the place in its country, or else the nearby town; null when neither is found
async function geocode({ name, country, countryCode, kind, nearbyTown }) {
  const code = countryCode.toUpperCase()
  const match =
    kind === 'country'
      ? await searchPlace(name, code, true)
      : (await searchPlace(`${name}, ${country}`, code)) ||
        (nearbyTown && nearbyTown !== name && (await sleep(1000), await searchPlace(`${nearbyTown}, ${country}`, code)))
  if (!match) return null
  const [lng, lat] = match.geometry.coordinates
  const isCountry = match.properties.osm_value === 'country'
  return {
    name: match.properties.name,
    type: isCountry ? 'country' : 'city',
    country: match.properties.country || match.properties.name,
    countryCode: match.properties.countrycode.toUpperCase(),
    lat,
    lng,
  }
}

// Same upsert as POST /api/cities; a place created here is marked as seed
async function savePlace(place, continent) {
  const { name, type, country, countryCode, lat, lng } = place
  return Cities.findOneAndUpdate(
    { name, countryCode },
    { $setOnInsert: { name, type, country, countryCode, continent, lat, lng, seed: true } },
    { upsert: true, returnDocument: 'after', runValidators: true }
  )
}

// ---------- Photos (Wikimedia Commons) ----------

// Licenses that allow reuse with attribution (Commons hosts no non-commercial licenses)
const FREE_LICENSE = /^(cc by|cc0|public domain|pd)/i

async function searchPhotos(query) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '10',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '1600',
    iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
  })
  const data = await getJson(`https://commons.wikimedia.org/w/api.php?${params}`)
  return (
    Object.values(data.query?.pages ?? {})
      .sort((a, b) => a.index - b.index)
      .map((page) => {
        const info = page.imageinfo?.[0]
        const meta = info?.extmetadata ?? {}
        return (
          info && {
            title: page.title,
            url: info.thumburl,
            width: info.width,
            height: info.height,
            mime: info.mime,
            source: info.descriptionurl,
            author: stripHtml(meta.Artist?.value) || 'Unknown author',
            license: stripHtml(meta.LicenseShortName?.value),
            licenseUrl: meta.LicenseUrl?.value || '',
          }
        )
      })
      // Landscape photos big enough for the carousel, with a reusable license
      .filter(
        (p) =>
          p &&
          p.url &&
          p.mime === 'image/jpeg' &&
          p.width >= 1200 &&
          p.width > p.height * 1.2 &&
          FREE_LICENSE.test(p.license)
      )
  )
}

// Downloads the photo and stores it like an upload: AVIF in the image storage plus an images record
async function savePhoto(photo, userId) {
  const res = await fetch(photo.url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`${res.status} ${photo.url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const filename = `${Date.now()}-${crypto.randomUUID()}.avif`
  const image = sharp(buffer)
  const metadata = await image.metadata()
  await saveImage(filename, await image.rotate().avif({ quality: 70, effort: 6 }).toBuffer())
  await Images.create({ filename, title: '', userId, width: metadata.width, height: metadata.height, seed: true })
  return filename
}

async function findPhotos(searches, usedSources, userId) {
  const photos = []
  for (const query of searches) {
    if (photos.length >= PHOTOS_PER_EXPERIENCE) break
    await sleep(500)
    const found = await searchPhotos(query).catch((err) => {
      console.warn(`    photo search "${query}" failed: ${err.message}`)
      return []
    })
    // Up to two photos per search term, never the same photo twice
    for (const photo of found.filter((p) => !usedSources.has(p.source)).slice(0, 2)) {
      if (photos.length >= PHOTOS_PER_EXPERIENCE) break
      try {
        const filename = await savePhoto(photo, userId)
        usedSources.add(photo.source)
        photos.push({
          filename,
          author: photo.author,
          license: photo.license,
          licenseUrl: photo.licenseUrl,
          source: photo.source,
        })
      } catch (err) {
        console.warn(`    photo download failed: ${err.message}`)
      }
    }
  }
  return photos
}

// ---------- Users, comments and votes ----------

// Fictional users nobody can log in as (random password, reserved example.com domain)
async function ensureAuthors() {
  const users = new Map()
  for (const { username } of AUTHORS) {
    let user = await Users.findOne({ username })
    if (!user) {
      user = await Users.create({
        username,
        email: `${username.replace(/[^a-z0-9]/gi, '')}@example.com`,
        password: await argon2.hash(crypto.randomBytes(32).toString('hex')),
        role: 'user',
        seed: true,
      })
    }
    users.set(username, user)
  }
  return users
}

// A few votes around the score of the text, from authors other than the writer
function votesAround(score, voters) {
  return voters
    .slice(0, 3 + Math.floor(Math.random() * 4))
    .map((user) => ({ user, score: Math.min(5, Math.max(1, score + pick([-1, 0, 0, 0, 1]))) }))
}

// ---------- Main ----------

async function main() {
  const options = parseArgs()
  if (!process.env.GEMINI_API_KEY)
    throw new Error('Missing GEMINI_API_KEY in server/.env (https://aistudio.google.com/apikey)')
  if (!process.env.ATLAS_URL) throw new Error('Missing ATLAS_URL in server/.env')

  await mongoose.connect(process.env.ATLAS_URL)
  const categories = (await Categories.find({}).lean()).map((c) => c.name)
  if (!categories.length) throw new Error('No categories found. Create them first (admin panel)')
  const avoidPlaces = (await Cities.find({}).lean()).map((c) => c.name)

  const users = options.dryRun ? new Map() : await ensureAuthors()
  const usedSources = new Set()
  let created = 0

  for (const continent of options.continents) {
    console.log(`\n${continent}: asking Gemini for ${options.perContinent} experiences...`)
    const { experiences } = await withRetries((model) =>
      generateMockExperiencesFlow({
        continent,
        count: options.perContinent,
        categories,
        authors: AUTHORS,
        avoidPlaces,
        model,
      })
    )

    for (const item of experiences) {
      const label = `"${item.title}" (${item.place.name}, ${item.place.country})`
      if (options.dryRun) {
        console.log(
          `  ${label} by ${item.author}, ${item.category}, ${item.score}/5, photos: ${item.photoSearches.join(' | ')}`
        )
        continue
      }
      try {
        await sleep(1000)
        const place = await geocode(item.place)
        if (!place) {
          console.warn(`  skipped ${label}: place not found in ${item.place.countryCode}`)
          continue
        }
        const city = await savePlace(place, continent)
        avoidPlaces.push(city.name)

        const author = users.get(item.author) || users.get(pick(AUTHORS).username)
        const date = new Date(Date.now() - Math.floor(Math.random() * SPREAD_DAYS) * DAY)
        // The place itself as a last resort when the specific searches find nothing
        const searches = [...item.photoSearches, `${city.name} ${city.country}`, city.name]
        const photos = await findPhotos(searches, usedSources, author._id)
        const images = photos.map((p) => p.filename)

        const experience = await Experiences.create({
          user: author.username,
          userId: author._id,
          title: item.title,
          content: item.paragraphs.map(escapeHtml).join('<br><br>'),
          category: categories.includes(item.category) ? item.category : pick(categories),
          city: city._id,
          date,
          image: images[0] || '',
          images,
          imageCredits: photos.map(({ filename, author: by, license, licenseUrl, source }) => ({
            filename,
            author: by,
            license,
            licenseUrl,
            source,
          })),
          status: 'published',
          reviewedAt: date,
          seed: true,
        })

        // Comments a few days after the experience, from other authors
        const others = [...users.values()].filter((u) => !u._id.equals(author._id)).sort(() => Math.random() - 0.5)
        await Comments.insertMany(
          item.comments.map((comment, i) => {
            const by = users.get(comment.author)
            const commenter = by && !by._id.equals(author._id) ? by : others[i % others.length]
            return {
              user: commenter.username,
              userId: commenter._id,
              experience: experience._id,
              date: new Date(Math.min(Date.now(), date.getTime() + (i + 1) * (1 + Math.random() * 10) * DAY)),
              content: comment.text,
              seed: true,
            }
          })
        )
        await Scores.insertMany(
          votesAround(item.score, others).map(({ user, score }) => ({
            experience: experience._id,
            user: user.username,
            userId: user._id,
            score,
            seed: true,
          }))
        )
        const { score } = await recalculateExperienceScore(experience._id)

        created++
        console.log(
          `  + ${label} by ${author.username}: ${images.length} photos, ${item.comments.length} comments, score ${score}`
        )
      } catch (err) {
        console.warn(`  failed ${label}: ${err.message}`)
      }
    }
  }

  console.log(`\nDone: ${created} experiences created.`)
  await mongoose.disconnect()
}

if (require.main === module) {
  main().catch(async (err) => {
    console.error(err.message)
    await mongoose.disconnect()
    process.exit(1)
  })
}

module.exports = { geocode }
