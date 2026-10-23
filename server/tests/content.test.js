const { describe, it, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { setup, teardown, clearDatabase, createUser } = require('./helpers')

let request
let admin
let ana
let luis

before(async () => {
  ;({ request } = await setup())
})
after(teardown)
beforeEach(async () => {
  await clearDatabase()
  admin = await createUser({ username: 'admin', role: 'admin' })
  ana = await createUser({ username: 'ana' })
  luis = await createUser({ username: 'luis' })
})

const createExperience = async (data = {}) =>
  (
    await request
      .post('/api/experiences')
      .set(admin.auth)
      .send({ title: 'Trip', ...data })
  ).body

describe('categories', () => {
  it('only admins manage them; names are unique ignoring case', async () => {
    assert.equal((await request.post('/api/categories').set(ana.auth).send({ name: 'Ocio' })).status, 403)
    assert.equal((await request.post('/api/categories').set(admin.auth).send({ name: 'Ocio' })).status, 200)
    assert.equal((await request.post('/api/categories').set(admin.auth).send({ name: 'OCIO' })).status, 409)
  })

  it('stores the official spelling in experiences and rejects unknown ones', async () => {
    await request.post('/api/categories').set(admin.auth).send({ name: 'Ocio' })
    assert.equal((await createExperience({ category: 'ocio' })).category, 'Ocio')
    const unknown = await request.post('/api/experiences').set(admin.auth).send({ title: 'X', category: 'Spain' })
    assert.equal(unknown.status, 400)
  })

  it('renames in experiences and cannot be deleted while in use', async () => {
    const category = (await request.post('/api/categories').set(admin.auth).send({ name: 'Ocio' })).body
    const experience = await createExperience({ category: 'Ocio' })

    assert.equal((await request.delete(`/api/categories/${category._id}`).set(admin.auth)).status, 409)
    const renamed = await request.patch(`/api/categories/${category._id}`).set(admin.auth).send({ name: 'Leisure' })
    assert.equal(renamed.body.renamedInExperiences, 1)
    assert.equal((await request.get(`/api/experiences/${experience._id}`)).body.category, 'Leisure')

    await request.delete(`/api/experiences/${experience._id}`).set(admin.auth)
    assert.equal((await request.delete(`/api/categories/${category._id}`).set(admin.auth)).status, 200)
  })
})

describe('cities', () => {
  const lisbon = { name: 'Lisbon', country: 'Portugal', countryCode: 'pt', continent: 'europe', lat: 38.7, lng: -9.1 }

  it('upserts by name and country code; any user can add one', async () => {
    const first = await request.post('/api/cities').set(ana.auth).send(lisbon)
    assert.equal(first.body.city.countryCode, 'PT')
    const again = await request.post('/api/cities').set(admin.auth).send(lisbon)
    assert.equal(again.body.city._id, first.body.city._id)
  })

  it('validates the payload and refuses to delete a city in use', async () => {
    const injected = await request
      .post('/api/cities')
      .set(admin.auth)
      .send({ ...lisbon, name: { $ne: null } })
    assert.equal(injected.status, 400)

    const city = (await request.post('/api/cities').set(admin.auth).send(lisbon)).body.city
    await createExperience({ city: city._id })
    assert.equal((await request.delete(`/api/cities/${city._id}`).set(admin.auth)).status, 409)
  })
})

describe('comments and votes', () => {
  it('take the author from the session, not from the body', async () => {
    const experience = await createExperience()
    const comment = await request
      .post('/api/comments')
      .set(luis.auth)
      .send({ experience: experience._id, content: 'Great!', user: 'ana' })
    assert.equal(comment.body.user, 'luis')
    assert.ok(!('userId' in (await request.get(`/api/experiences/${experience._id}/comments`)).body[0]))
  })

  it('allow one vote per user and keep the average on the experience', async () => {
    const experience = await createExperience()
    const vote = (user, score) => request.post('/api/scores').set(user.auth).send({ experience: experience._id, score })

    assert.equal((await vote(luis, 5)).body.experienceScore, 5)
    const changed = await vote(luis, 4)
    assert.equal(changed.body.votes, 1, 'voting again replaces the vote')
    const second = await vote(ana, 2)
    assert.equal(second.body.experienceScore, 3)
    assert.equal(second.body.votes, 2)
    assert.equal((await vote(ana, 9)).status, 400)

    const stored = (await request.get(`/api/experiences/${experience._id}`)).body
    assert.equal(stored.score, 3)
    assert.equal(stored.votes, 2)
  })

  it('lists, recalculates and deletes votes for admins only', async () => {
    const experience = await createExperience()
    await request.post('/api/scores').set(luis.auth).send({ experience: experience._id, score: 4 })
    assert.equal((await request.get('/api/scores')).status, 401)
    assert.equal((await request.get('/api/comments').set(ana.auth)).status, 403)

    const [score] = (await request.get('/api/scores').set(admin.auth)).body
    await request.patch(`/api/scores/${score._id}`).set(admin.auth).send({ score: 2 })
    assert.equal((await request.get(`/api/experiences/${experience._id}`)).body.score, 2)
    await request.delete(`/api/scores/${score._id}`).set(admin.auth)
    assert.equal((await request.get(`/api/experiences/${experience._id}`)).body.score, null)
  })

  it('are deleted with their experience', async () => {
    const Comment = require('../models/commentsModel')
    const Score = require('../models/scoresModel')
    const experience = await createExperience()
    await request.post('/api/comments').set(luis.auth).send({ experience: experience._id, content: 'hi' })
    await request.post('/api/scores').set(luis.auth).send({ experience: experience._id, score: 4 })

    await request.delete(`/api/experiences/${experience._id}`).set(admin.auth)
    assert.equal(await Comment.countDocuments(), 0)
    assert.equal(await Score.countDocuments(), 0)
  })
})
