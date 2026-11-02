/**
 * Copies the images of the live site to a local folder, to cover what `npm run backup` cannot reach
 * when they live in Vercel Blob. The list comes from the database and each image is downloaded from its
 * public URL, so no store credentials are needed. Only new images are downloaded, and nothing is deleted.
 *
 * Usage: npm run backup:images -- <site URL> [folder]      (default folder: ~/backups/scoretravelsblog/images)
 *   npm run backup:images -- https://scoretravelsblog.vercel.app
 */
require('dotenv').config({ quiet: true })

const fs = require('fs')
const os = require('os')
const path = require('path')
const mongoose = require('mongoose')
const Images = require('../models/imagesModel')
const Experiences = require('../models/experiencesModel')
const { getExperienceImages } = require('../services/imageService')

const CONCURRENT_DOWNLOADS = 5

async function imageNames() {
  const [images, experiences] = await Promise.all([
    Images.find().select('filename').lean(),
    Experiences.find().select('image images').lean(),
  ])
  const names = [...images.map((image) => image.filename), ...experiences.flatMap(getExperienceImages)]
  // A stored name must stay inside the folder
  return [...new Set(names)].filter((name) => name && path.basename(name) === name)
}

async function download(site, name, folder) {
  const res = await fetch(`${site}/static/images/${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error(String(res.status))
  const target = path.join(folder, name)
  // Written apart first: a cut download never looks like a finished image on the next run
  await fs.promises.writeFile(`${target}.part`, Buffer.from(await res.arrayBuffer()))
  await fs.promises.rename(`${target}.part`, target)
}

async function main() {
  const [site, folderArg] = process.argv.slice(2)
  if (!site) throw new Error('Usage: npm run backup:images -- <site URL> [folder]')
  const folder = folderArg || path.join(os.homedir(), 'backups', 'scoretravelsblog', 'images')
  fs.mkdirSync(folder, { recursive: true })

  // Production when there is a separate development database
  await mongoose.connect(process.env.ATLAS_URL_PROD || process.env.ATLAS_URL)
  const names = await imageNames()
  await mongoose.disconnect()

  const pending = names.filter((name) => !fs.existsSync(path.join(folder, name)))
  console.log(`${names.length} images in the database, ${pending.length} to download to ${folder}`)

  const failed = []
  let next = 0
  const worker = async () => {
    while (next < pending.length) {
      const name = pending[next++]
      await download(site.replace(/\/+$/, ''), name, folder).catch((error) => failed.push(`${name} (${error.message})`))
    }
  }
  await Promise.all(Array.from({ length: CONCURRENT_DOWNLOADS }, worker))

  console.log(`Downloaded ${pending.length - failed.length}.`)
  if (failed.length) {
    console.error(`Failed ${failed.length}:\n  ${failed.join('\n  ')}`)
    process.exitCode = 1
  }
}

main().catch(async (error) => {
  console.error(error.message)
  await mongoose.disconnect()
  process.exit(1)
})
