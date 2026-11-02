/**
 * Changes the password of a user, asking for it without showing it, so it stays out of the
 * shell history. Works on the database of ATLAS_URL, or on production with --prod (ATLAS_URL_PROD).
 *
 * Usage: npm run users:set-password -- <username or email> [--prod]
 */
require('dotenv').config({ quiet: true })

const readline = require('readline')
const { Writable } = require('stream')
const mongoose = require('mongoose')
const Users = require('../models/usersModels')
const { passwordFields } = require('../services/passwords')

const MIN_LENGTH = 12

async function main() {
  const args = process.argv.slice(2)
  const production = args.includes('--prod')
  const login = args.find((arg) => arg !== '--prod')
  if (!login) throw new Error('Usage: npm run users:set-password -- <username or email> [--prod]')
  const url = production ? process.env.ATLAS_URL_PROD : process.env.ATLAS_URL
  if (!url) throw new Error('Missing ATLAS_URL_PROD in server/.env')

  await mongoose.connect(url)
  const user = await Users.findOne({ $or: [{ username: login }, { email: login }] })
  if (!user) throw new Error(`No user with username or email "${login}"`)
  console.log(
    `New password for ${user.username} (${user.role}) in ${production ? 'PRODUCTION' : 'the database of ATLAS_URL'}`
  )

  const output = new Writable({
    write(chunk, encoding, done) {
      if (!this.muted) process.stdout.write(chunk, encoding)
      done()
    },
  })
  output.muted = true
  const rl = readline.createInterface({ input: process.stdin, output, terminal: Boolean(process.stdin.isTTY) })
  const lines = rl[Symbol.asyncIterator]()
  // Asks without echoing what is typed. Empty when the input ends
  const askHidden = async (question) => {
    process.stdout.write(question)
    const { value = '' } = await lines.next()
    process.stdout.write('\n')
    return value
  }
  const password = await askHidden('Password: ')
  const repeated = await askHidden('Repeat it: ')
  rl.close()

  if (password !== repeated) throw new Error('The passwords do not match. Nothing changed.')
  if (password.length < MIN_LENGTH) throw new Error(`Use at least ${MIN_LENGTH} characters. Nothing changed.`)

  await Users.updateOne({ _id: user._id }, await passwordFields(password))
  console.log('Password changed. The sessions of this user are closed.')
}

main()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
