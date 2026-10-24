const { describe, it, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const { setup, teardown, clearDatabase, createUser, sampleImage } = require('./helpers')

let request
let uploadsDir
let admin
let ana
let photo

before(async () => {
  ;({ request, uploadsDir } = await setup())
  photo = await sampleImage()
})
after(teardown)
beforeEach(async () => {
  await clearDatabase()
  admin = await createUser({ username: 'admin', role: 'admin' })
  ana = await createUser({ username: 'ana' })
})

const upload = (user, title = '') =>
  request
    .post('/api/images')
    .set(user.auth)
    .attach('file', photo, { filename: 'holiday photo (1).jpg', contentType: 'image/jpeg' })
    .field('title', title)

const imageId = async (filename) =>
  (await request.get('/api/images')).body.images.find((i) => i.filename === filename)._id

describe('upload', () => {
  it('converts to AVIF with a generated name and serves it', async () => {
    const res = await upload(ana, 'Beach')
    assert.equal(res.status, 200)
    assert.match(res.body.filename, /^\d+-[0-9a-f-]{36}\.avif$/)
    assert.ok(fs.existsSync(`${uploadsDir}/${res.body.filename}`))

    const served = await request.get(`/static/images/${res.body.filename}`)
    assert.equal(served.status, 200)
    assert.equal(served.headers['content-type'], 'image/avif')
    assert.equal((await request.get('/static/images/missing.avif')).status, 404)
  })

  it('needs a session and refuses files that are not images', async () => {
    assert.equal((await request.post('/api/images').attach('file', photo, 'p.jpg')).status, 401)
    const notImage = await request
      .post('/api/images')
      .set(admin.auth)
      .attach('file', Buffer.from('{}'), { filename: 'package.json', contentType: 'application/json' })
    assert.equal(notImage.status, 400)
  })
})

describe('library', () => {
  it('is managed by admins only', async () => {
    const { filename } = (await upload(ana)).body
    const id = await imageId(filename)
    assert.equal((await request.delete(`/api/images/${id}`).set(ana.auth)).status, 403)
    assert.equal((await request.patch(`/api/images/${id}`).set(ana.auth).send({ featured: true })).status, 403)
    assert.equal((await request.patch(`/api/images/${id}`).set(admin.auth).send({ featured: true })).status, 200)
  })

  it('refuses to delete an image used by an experience', async () => {
    const { filename } = (await upload(admin)).body
    await request
      .post('/api/experiences')
      .set(admin.auth)
      .send({ title: 'Trip', images: [filename] })
    assert.equal((await request.delete(`/api/images/${await imageId(filename)}`).set(admin.auth)).status, 409)
  })
})

describe('cleanup', () => {
  it('removes images nothing else uses when an experience is edited or deleted, but keeps featured ones', async () => {
    const [a, b, c, d] = await Promise.all([upload(admin), upload(admin), upload(admin), upload(admin)]).then((r) =>
      r.map((x) => x.body.filename)
    )
    await request
      .patch(`/api/images/${await imageId(d)}`)
      .set(admin.auth)
      .send({ featured: true })
    const e1 = (
      await request
        .post('/api/experiences')
        .set(admin.auth)
        .send({ title: 'E1', images: [a, b, d] })
    ).body
    const e2 = (
      await request
        .post('/api/experiences')
        .set(admin.auth)
        .send({ title: 'E2', images: [b, c] })
    ).body

    const edited = await request
      .patch(`/api/experiences/${e2._id}`)
      .set(admin.auth)
      .send({ images: [b] })
    assert.deepEqual(edited.body.removedImages, [c])

    const deleted = await request.delete(`/api/experiences/${e1._id}`).set(admin.auth)
    assert.deepEqual(deleted.body.removedImages, [a], 'b is used by E2 and d is featured')
    const onDisk = (file) => fs.existsSync(`${uploadsDir}/${file}`)
    assert.deepEqual([a, b, c, d].map(onDisk), [false, true, false, true])
  })
})
