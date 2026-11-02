// Where uploaded images live: a folder on disk (local, a server of your own) or Vercel Blob
// (serverless hosting has no writable disk). Blob is used when BLOB_STORE_URL is set.
// The rest of the server only knows filenames; the public URL is always /static/images/<filename>
const fs = require('fs')
const path = require('path')
const express = require('express')
const { uploadsDir, blobStoreUrl } = require('../config')

const CONTENT_TYPE = 'image/avif'
// Filenames are unique and never reused, so an image can be cached for good
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60

// A stored filename, refusing anything that could escape the storage (null when invalid)
const safeName = (filename) => {
  const name = path.basename(String(filename))
  return name === filename && name !== '.' && name !== '..' ? name : null
}

// The filename in a request path; null when its encoding is broken
const decodeName = (encoded) => {
  try {
    return safeName(decodeURIComponent(encoded))
  } catch {
    return null
  }
}

const setAvifHeader = (res, filePath) => {
  if (filePath.endsWith('.avif')) res.setHeader('Content-Type', CONTENT_TYPE)
}

const createDiskStorage = (folder) => ({
  save: async (filename, buffer) => {
    await fs.promises.mkdir(folder, { recursive: true })
    await fs.promises.writeFile(path.join(folder, filename), buffer)
  },
  // A missing file is not an error: the goal is that it no longer exists
  remove: async (filename) => {
    await fs.promises.rm(path.join(folder, filename), { force: true })
  },
  serve: () => express.static(folder, { setHeaders: setAvifHeader }),
})

// `blob` is the @vercel/blob module, which takes its credentials from the environment
const createBlobStorage = (blob, storeUrl) => {
  const pathnameOf = (filename) => `images/${filename}`
  const urlOf = (filename) => `${storeUrl}/${pathnameOf(encodeURIComponent(filename))}`

  return {
    save: async (filename, buffer) => {
      await blob.put(pathnameOf(filename), buffer, {
        access: 'public',
        contentType: CONTENT_TYPE,
        cacheControlMaxAge: ONE_YEAR_SECONDS,
      })
    },
    remove: async (filename) => {
      await blob.del(urlOf(filename))
    },
    // Filenames in the database and URLs in the client stay the same: the old path redirects
    serve: () => (req, res, next) => {
      const name = decodeName(req.path.slice(1))
      if (!name) return next()
      res.set('Cache-Control', `public, max-age=${ONE_YEAR_SECONDS}, immutable`)
      return res.redirect(301, urlOf(name))
    },
  }
}

const storage = blobStoreUrl ? createBlobStorage(require('@vercel/blob'), blobStoreUrl) : createDiskStorage(uploadsDir)

module.exports = {
  saveImage: (filename, buffer) => storage.save(filename, buffer),
  // False when the filename is not valid, so nothing outside the storage can be touched
  removeImage: async (filename) => {
    const name = safeName(filename)
    if (!name) return false
    await storage.remove(name)
    return true
  },
  serveImages: () => storage.serve(),
  createBlobStorage,
  createDiskStorage,
}
