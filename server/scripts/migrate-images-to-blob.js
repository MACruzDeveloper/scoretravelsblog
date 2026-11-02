/**
 * Copies the images of UPLOADS_DIR to the Vercel Blob store, keeping their filenames, so the database
 * and the URLs stay valid. Nothing is deleted, and images already in the store are skipped,
 * so it can be run again. Needs the store credentials: BLOB_READ_WRITE_TOKEN in server/.env, or the
 * BLOB_STORE_ID and VERCEL_OIDC_TOKEN that `vercel env pull` writes (never over server/.env). From the
 * root of the repository:
 *
 *   npx vercel link
 *   npx vercel env pull server/.env.vercel --environment=development
 *
 * Usage:
 *   npm run images:to-blob              # only counts what would be uploaded
 *   npm run images:to-blob -- --yes     # uploads it
 */
const fs = require('fs')
const path = require('path')
// Optional: the credentials pulled from Vercel. dotenv does not overwrite what is already set
require('dotenv').config({ path: path.join(__dirname, '..', '.env.vercel'), quiet: true })
const { uploadsDir } = require('../config')
const { list, put } = require('@vercel/blob')

const PREFIX = 'images/'
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60

async function storedNames() {
  const names = new Set()
  let cursor
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 })
    page.blobs.forEach((blob) => names.add(blob.pathname.slice(PREFIX.length)))
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  return names
}

async function main() {
  const { BLOB_READ_WRITE_TOKEN, BLOB_STORE_ID, VERCEL_OIDC_TOKEN } = process.env
  if (!BLOB_READ_WRITE_TOKEN && !(BLOB_STORE_ID && VERCEL_OIDC_TOKEN)) {
    throw new Error('Missing the Blob credentials: see the top of scripts/migrate-images-to-blob.js')
  }

  const local = fs.readdirSync(uploadsDir).filter((name) => !name.startsWith('.'))
  const stored = await storedNames()
  const pending = local.filter((name) => !stored.has(name))
  console.log(`${local.length} local images, ${stored.size} in the store, ${pending.length} to upload`)

  if (!process.argv.includes('--yes')) {
    console.log('Nothing uploaded. Run again with --yes to upload them.')
    return
  }

  let done = 0
  let storeUrl
  for (const name of pending) {
    // The content type comes from the extension: there are old JPEGs and PNGs besides the AVIFs
    const blob = await put(`${PREFIX}${name}`, fs.readFileSync(path.join(uploadsDir, name)), {
      access: 'public',
      cacheControlMaxAge: ONE_YEAR_SECONDS,
    })
    storeUrl = new URL(blob.url).origin
    done++
    if (done % 25 === 0 || done === pending.length) console.log(`  ${done}/${pending.length}`)
  }
  console.log('Done.')
  if (storeUrl) console.log(`Value for BLOB_STORE_URL: ${storeUrl}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
