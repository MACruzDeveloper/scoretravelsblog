const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const express = require('express')
const supertest = require('supertest')

// The module reads the configuration when loaded, which needs these two
process.env.ATLAS_URL ||= 'mongodb://localhost/test'
process.env.JWT_SECRET ||= 'x'.repeat(32)
const { createBlobStorage } = require('../services/imageStorage')

const STORE = 'https://store.public.blob.vercel-storage.com'

// Records the calls instead of talking to Vercel
const fakeBlob = () => {
  const calls = { put: [], del: [] }
  return {
    calls,
    put: async (...args) => calls.put.push(args),
    del: async (url) => calls.del.push(url),
  }
}

describe('Blob image storage', () => {
  it('uploads public images under images/, cached for good', async () => {
    const blob = fakeBlob()
    const buffer = Buffer.from('avif')
    await createBlobStorage(blob, STORE).save('a.avif', buffer)

    const [[pathname, body, options]] = blob.calls.put
    assert.equal(pathname, 'images/a.avif')
    assert.equal(body, buffer)
    assert.equal(options.access, 'public')
    assert.equal(options.contentType, 'image/avif')
    assert.ok(options.cacheControlMaxAge >= 30 * 24 * 60 * 60)
  })

  it('deletes by the public URL', async () => {
    const blob = fakeBlob()
    await createBlobStorage(blob, STORE).remove('a.avif')
    assert.deepEqual(blob.calls.del, [`${STORE}/images/a.avif`])
  })

  it('redirects the usual image path to the store, without leaving it', async () => {
    const app = express()
    app.use('/static/images', createBlobStorage(fakeBlob(), STORE).serve())
    app.use((req, res) => res.status(404).end())
    const request = supertest(app)

    const res = await request.get('/static/images/a%20b.avif').expect(301)
    assert.equal(res.headers.location, `${STORE}/images/a%20b.avif`)
    assert.match(res.headers['cache-control'], /immutable/)
    // Encoded slashes must not reach other paths of the store
    await request.get('/static/images/..%2Fsecret').expect(404)
    // A broken encoding is a 404 too, not a server error
    await request.get('/static/images/%E0%A4%A').expect(404)
  })
})
