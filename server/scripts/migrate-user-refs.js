/**
 * Replaces emails stored as author in comments and scores with the username,
 * and fills in userId so they work with the one-vote-per-user rule.
 *
 * Usage:
 *   node scripts/migrate-user-refs.js          # dry run, only prints what would change
 *   node scripts/migrate-user-refs.js --apply  # writes the changes
 */
require('dotenv').config({ quiet: true })

const mongoose = require('mongoose')
const Users = require('../models/usersModels')
const Comments = require('../models/commentsModel')
const Scores = require('../models/scoresModel')

const apply = process.argv.includes('--apply')

async function migrate(Model, label, usersByEmail, usersByName) {
  const docs = await Model.find({ userId: { $exists: false } }).lean()
  let updated = 0
  let orphans = 0

  for (const doc of docs) {
    const user = usersByEmail.get(doc.user) || usersByName.get(doc.user)
    if (!user) {
      orphans++
      // Unknown author: at least never expose an email
      if (doc.user && doc.user.includes('@')) {
        console.log(`  [${label}] ${doc._id}: unknown author "${doc.user}" -> "anonymous"`)
        if (apply) await Model.updateOne({ _id: doc._id }, { user: 'anonymous' })
      }
      continue
    }
    console.log(`  [${label}] ${doc._id}: "${doc.user}" -> "${user.username}"`)
    if (apply) {
      try {
        await Model.updateOne({ _id: doc._id }, { user: user.username, userId: user._id })
      } catch (error) {
        if (error.code !== 11000) throw error
        // The user already has a vote with userId on this experience: keep only the name
        await Model.updateOne({ _id: doc._id }, { user: user.username })
        console.log(`  [${label}] ${doc._id}: duplicate vote, userId not set`)
      }
    }
    updated++
  }

  console.log(`${label}: ${docs.length} without userId, ${updated} matched to a user, ${orphans} without a matching user`)
}

async function main() {
  if (!process.env.ATLAS_URL) {
    console.error('ERROR: Missing ATLAS_URL in server/.env')
    process.exit(1)
  }
  await mongoose.connect(process.env.ATLAS_URL)
  console.log(apply ? 'APPLYING changes' : 'DRY RUN (use --apply to write changes)')

  const users = await Users.find().select('_id username email').lean()
  const usersByEmail = new Map(users.map((u) => [u.email, u]))
  const usersByName = new Map(users.map((u) => [u.username, u]))

  await migrate(Comments, 'comments', usersByEmail, usersByName)
  await migrate(Scores, 'scores', usersByEmail, usersByName)

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect()
  process.exit(1)
})
