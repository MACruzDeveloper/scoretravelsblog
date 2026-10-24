const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const { setup, teardown, createUser } = require('./helpers')

let request
let admin
let ana
let luis

before(async () => {
  ;({ request } = await setup())
  admin = await createUser({ username: 'admin', role: 'admin' })
  ana = await createUser({ username: 'ana' })
  luis = await createUser({ username: 'luis' })
  await request.post('/api/categories').set(admin.auth).send({ name: 'Ocio' })
})
after(teardown)

const publicTotal = async () => (await request.get('/api/experiences')).body.total

describe('moderation flow', () => {
  let anaExperience

  it('publishes the admin experiences at once and keeps users ones pending', async () => {
    const byAdmin = await request
      .post('/api/experiences')
      .set(admin.auth)
      .send({ title: 'Admin trip', category: 'Ocio' })
    assert.equal(byAdmin.body.status, 'published')
    const byAna = await request.post('/api/experiences').set(ana.auth).send({ title: 'Ana trip', category: 'Ocio' })
    assert.equal(byAna.body.status, 'pending')
    assert.equal(byAna.body.user, 'ana')
    anaExperience = byAna.body._id
  })

  it('hides pending experiences from the public and other users', async () => {
    assert.equal(await publicTotal(), 1)
    assert.equal((await request.get(`/api/experiences/${anaExperience}`)).status, 404)
    assert.equal((await request.get(`/api/experiences/${anaExperience}`).set(luis.auth)).status, 404)
    const own = await request.get(`/api/experiences/${anaExperience}`).set(ana.auth)
    assert.equal(own.body.status, 'pending')
  })

  it('lists own experiences (mine) and the queue (admin)', async () => {
    assert.equal((await request.get('/api/experiences?scope=mine').set(ana.auth)).body.total, 1)
    assert.equal((await request.get('/api/experiences?scope=mine')).status, 401)
    assert.equal((await request.get('/api/experiences?scope=all').set(ana.auth)).status, 403)
    const queue = await request.get('/api/experiences?scope=all&status=pending').set(admin.auth)
    assert.equal(queue.body.total, 1)
  })

  it('does not allow votes or comments on unpublished experiences', async () => {
    assert.equal(
      (await request.post('/api/scores').set(luis.auth).send({ experience: anaExperience, score: 5 })).status,
      404
    )
    assert.equal(
      (await request.post('/api/comments').set(luis.auth).send({ experience: anaExperience, content: 'hi' })).status,
      404
    )
  })

  it('only lets the author or an admin change it, and only admins review', async () => {
    assert.equal(
      (await request.patch(`/api/experiences/${anaExperience}`).set(luis.auth).send({ title: 'x' })).status,
      403
    )
    assert.equal((await request.delete(`/api/experiences/${anaExperience}`).set(luis.auth)).status, 403)
    const review = await request
      .patch(`/api/experiences/${anaExperience}/review`)
      .set(ana.auth)
      .send({ status: 'published' })
    assert.equal(review.status, 403)
  })

  it('rejects with a reason, and an edit by the author sends it back to review', async () => {
    const rejected = await request
      .patch(`/api/experiences/${anaExperience}/review`)
      .set(admin.auth)
      .send({ status: 'rejected', reason: 'Add photos' })
    assert.equal(rejected.body.updated.status, 'rejected')
    assert.equal(rejected.body.updated.rejectionReason, 'Add photos')

    const edited = await request.patch(`/api/experiences/${anaExperience}`).set(ana.auth).send({ title: 'Ana trip v2' })
    assert.equal(edited.body.updated.status, 'pending')
    assert.equal(edited.body.updated.rejectionReason, '')
  })

  it('publishes on approval; editing a published one hides it again', async () => {
    await request.patch(`/api/experiences/${anaExperience}/review`).set(admin.auth).send({ status: 'published' })
    assert.equal(await publicTotal(), 2)
    assert.equal(
      (await request.post('/api/scores').set(luis.auth).send({ experience: anaExperience, score: 5 })).status,
      200
    )

    await request.patch(`/api/experiences/${anaExperience}`).set(ana.auth).send({ title: 'Ana trip v3' })
    assert.equal(await publicTotal(), 1)

    const byAdmin = await request.patch(`/api/experiences/${anaExperience}`).set(admin.auth).send({ title: 'Fixed' })
    assert.equal(byAdmin.body.updated.status, 'pending', 'an admin edit keeps the status')
  })

  it('lets the author delete their experience', async () => {
    assert.equal((await request.delete(`/api/experiences/${anaExperience}`).set(ana.auth)).status, 200)
  })
})
