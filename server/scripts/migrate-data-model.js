/**
 * Brings existing data in line with the current models:
 *   1. Users without username get one derived from their email
 *   2. Experience categories use the spelling of the defined category ('ocio' -> 'Ocio')
 *   3. Comments and scores: orphans are deleted, experience references become ObjectIds
 *   4. Indexes are synced with the models (drops legacy ones such as cities.name_1)
 *   5. Experiences created before moderation existed are marked as published
 *
 * Usage:
 *   node scripts/migrate-data-model.js          # dry run, only prints what would change
 *   node scripts/migrate-data-model.js --apply  # writes the changes
 */
require('dotenv').config({ quiet: true })

const mongoose = require('mongoose')
const Users = require('../models/usersModels')
const Categories = require('../models/categoriesModel')
const Experiences = require('../models/experiencesModel')
const Comments = require('../models/commentsModel')
const Scores = require('../models/scoresModel')
const Cities = require('../models/citiesModel')
const Images = require('../models/imagesModel')

const apply = process.argv.includes('--apply')
const OBJECT_ID = /^[0-9a-fA-F]{24}$/

// "Ana.Lopez+blog@mail.com" -> "ana.lopez"; unique among the given names
const usernameFromEmail = (email, taken) => {
  let base = String(email || 'user')
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, 24)
  if (base.length < 3) base = `${base}user`
  let candidate = base
  for (let n = 2; taken.has(candidate); n++) candidate = `${base}${n}`
  taken.add(candidate)
  return candidate
}

const maskEmail = (email = '') => email.replace(/^(.).*(@.*)$/, '$1***$2')

async function usersWithoutUsername() {
  const users = await Users.collection.find({}, { projection: { username: 1, email: 1 } }).toArray()
  const taken = new Set(users.filter((u) => u.username).map((u) => u.username.toLowerCase()))
  const missing = users.filter((u) => !u.username)
  for (const user of missing) {
    const username = usernameFromEmail(user.email, taken)
    console.log(`  user ${maskEmail(user.email)} -> username "${username}"`)
    if (apply) await Users.collection.updateOne({ _id: user._id }, { $set: { username } })
  }
  console.log(`1. Users without username: ${missing.length}`)
}

async function normalizeCategories() {
  const defined = (await Categories.find().lean()).map((c) => c.name)
  const byLower = new Map(defined.map((name) => [name.toLowerCase(), name]))
  const used = await Experiences.distinct('category')
  let changed = 0
  for (const name of used) {
    const canonical = name && byLower.get(name.toLowerCase())
    if (!canonical || canonical === name) continue
    const count = await Experiences.countDocuments({ category: name })
    console.log(`  category "${name}" -> "${canonical}" (${count} experiences)`)
    if (apply) await Experiences.updateMany({ category: name }, { category: canonical })
    changed += count
  }
  console.log(`2. Experiences with a differently spelled category: ${changed}`)
}

// Works on the raw collection: the model already declares ObjectId and would cast
async function fixExperienceRefs(Model, label) {
  const docs = await Model.collection.find({}, { projection: { experience: 1 } }).toArray()
  const validIds = [...new Set(docs.map((d) => String(d.experience)).filter((id) => OBJECT_ID.test(id)))]
  const existing = new Set(
    (
      await Experiences.find({ _id: { $in: validIds } })
        .select('_id')
        .lean()
    ).map((e) => String(e._id))
  )
  const orphans = docs.filter((d) => !existing.has(String(d.experience)))
  const asString = docs.filter((d) => typeof d.experience === 'string' && existing.has(d.experience))

  if (apply) {
    if (orphans.length) await Model.collection.deleteMany({ _id: { $in: orphans.map((d) => d._id) } })
    for (const doc of asString) {
      await Model.collection.updateOne(
        { _id: doc._id },
        { $set: { experience: new mongoose.Types.ObjectId(doc.experience) } }
      )
    }
  }
  const orphanRefs = [...new Set(orphans.map((d) => String(d.experience)))]
  console.log(
    `3. ${label}: ${orphans.length} orphans to delete (experience ${orphanRefs.join(', ') || '-'}), ${asString.length} references to convert`
  )
}

// Experiences from before moderation existed were already public
async function publishExisting() {
  const filter = { status: { $exists: false } }
  const count = await Experiences.collection.countDocuments(filter)
  if (apply && count) await Experiences.collection.updateMany(filter, { $set: { status: 'published' } })
  console.log(`5. Experiences without moderation status, marked as published: ${count}`)
}

async function syncIndexes() {
  console.log('4. Indexes')
  for (const Model of [Users, Categories, Experiences, Comments, Scores, Cities, Images]) {
    const { toDrop, toCreate } = await Model.diffIndexes()
    const describe = (list) => list.map((i) => (typeof i === 'string' ? i : JSON.stringify(i.key || i))).join(', ')
    if (toDrop.length || toCreate.length) {
      console.log(`  ${Model.collection.name}: drop [${describe(toDrop)}] create [${describe(toCreate)}]`)
    }
    if (apply) await Model.syncIndexes()
  }
}

async function main() {
  if (!process.env.ATLAS_URL) {
    console.error('ERROR: Missing ATLAS_URL in server/.env')
    process.exit(1)
  }
  // Indexes are created explicitly in step 4, after the data is fixed
  mongoose.set('autoIndex', false)
  await mongoose.connect(process.env.ATLAS_URL)
  console.log(apply ? 'APPLYING changes\n' : 'DRY RUN (use --apply to write changes)\n')

  await usersWithoutUsername()
  await normalizeCategories()
  await fixExperienceRefs(Comments, 'Comments')
  await fixExperienceRefs(Scores, 'Scores')
  await syncIndexes()
  await publishExisting()

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect()
  process.exit(1)
})
