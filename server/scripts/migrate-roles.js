/**
 * Renames the legacy 'author' role to 'user'.
 *
 * Usage:
 *   node scripts/migrate-roles.js          # dry run, only prints what would change
 *   node scripts/migrate-roles.js --apply  # writes the changes
 */
require('dotenv').config()

const mongoose = require('mongoose')
const Users = require('../models/usersModels')

const apply = process.argv.includes('--apply')

async function main() {
  if (!process.env.ATLAS_URL) {
    console.error('ERROR: Missing ATLAS_URL in server/.env')
    process.exit(1)
  }
  await mongoose.connect(process.env.ATLAS_URL, { useUnifiedTopology: true, useNewUrlParser: true })
  console.log(apply ? 'APPLYING changes' : 'DRY RUN (use --apply to write changes)')

  // Anything that is not admin becomes a regular user
  const filter = { role: { $ne: 'admin' } }
  const users = await Users.find(filter).select('username role').lean()
  users.forEach((u) => console.log(`  ${u.username}: "${u.role}" -> "user"`))
  if (apply && users.length) await Users.updateMany(filter, { role: 'user' })
  console.log(`${users.length} users ${apply ? 'updated' : 'would be updated'}`)

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect()
  process.exit(1)
})
