/**
 * Copies the images of UPLOADS_DIR to the Vercel Blob store, keeping their filenames, so the database
 * and the URLs stay valid. Nothing is deleted, and images already in the store are skipped,
 * so it can be run again. Needs BLOB_READ_WRITE_TOKEN in server/.env.
 *
 * Usage:
 *   npm run images:to-blob              # only counts what would be uploaded
 *   npm run images:to-blob -- --yes     # uploads it
 */
const fs = require('fs')
const path = require('path')
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
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Missing BLOB_READ_WRITE_TOKEN in server/.env')

  const local = fs.readdirSync(uploadsDir).filter((name) => !name.startsWith('.'))
  const stored = await storedNames()
  const pending = local.filter((name) => !stored.has(name))
  console.log(`${local.length} local images, ${stored.size} in the store, ${pending.length} to upload`)

  if (!process.argv.includes('--yes')) {
    console.log('Nothing uploaded. Run again with --yes to upload them.')
    return
  }

  let done = 0
  for (const name of pending) {
    // The content type comes from the extension: there are old JPEGs and PNGs besides the AVIFs
    await put(`${PREFIX}${name}`, fs.readFileSync(path.join(uploadsDir, name)), {
      access: 'public',
      cacheControlMaxAge: ONE_YEAR_SECONDS,
    })
    done++
    if (done % 25 === 0 || done === pending.length) console.log(`  ${done}/${pending.length}`)
  }
  console.log('Done.')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
