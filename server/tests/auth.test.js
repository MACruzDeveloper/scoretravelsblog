const { describe, it, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { setup, teardown, clearDatabase, createUser } = require('./helpers')

let request

before(async () => {
  ;({ request } = await setup())
})
after(teardown)
beforeEach(clearDatabase)

const newAccount = { username: 'ana', email: 'ana@test.dev', password: 'supersecret1', password2: 'supersecret1' }

describe('register', () => {
  it('creates a regular user and signs them in', async () => {
    const res = await request.post('/api/auth/register').send(newAccount)
    assert.equal(res.status, 201)
    assert.equal(res.body.role, 'user')
    assert.ok(res.body.token)

    const me = await request.get('/api/auth/me').set('Authorization', `Bearer ${res.body.token}`)
    assert.equal(me.body.user.username, 'ana')
  })

  it('rejects a taken email or username', async () => {
    await request.post('/api/auth/register').send(newAccount)
    const res = await request.post('/api/auth/register').send(newAccount)
    assert.equal(res.status, 409)
  })

  it('applies the password and username rules', async () => {
    const short = await request.post('/api/auth/register').send({ ...newAccount, password: '123', password2: '123' })
    assert.equal(short.status, 400)
    const mismatch = await request.post('/api/auth/register').send({ ...newAccount, password2: 'different1' })
    assert.equal(mismatch.status, 400)
    const badName = await request.post('/api/auth/register').send({ ...newAccount, username: 'a b' })
    assert.equal(badName.status, 400)
  })

  it('ignores a role sent by the client', async () => {
    const res = await request.post('/api/auth/register').send({ ...newAccount, role: 'admin' })
    assert.equal(res.body.role, 'user')
  })
})

describe('login', () => {
  it('returns a session for valid credentials', async () => {
    await createUser({ username: 'ana' })
    const res = await request.post('/api/auth/login').send({ email: 'ana@test.dev', password: 'supersecret1' })
    assert.equal(res.status, 200)
    assert.ok(res.body.token)
  })

  it('answers the same for an unknown email and a wrong password', async () => {
    await createUser({ username: 'ana' })
    const unknown = await request.post('/api/auth/login').send({ email: 'nobody@test.dev', password: 'supersecret1' })
    const wrong = await request.post('/api/auth/login').send({ email: 'ana@test.dev', password: 'wrongpass' })
    assert.equal(unknown.status, 401)
    assert.equal(wrong.status, 401)
    assert.equal(unknown.body.message, wrong.body.message)
  })

  it('rejects objects where strings are expected (NoSQL injection)', async () => {
    const res = await request.post('/api/auth/login').send({ email: { $gt: '' }, password: 'x' })
    assert.equal(res.status, 400)
  })
})

describe('tokens', () => {
  it('rejects missing, invalid and alg=none tokens', async () => {
    assert.equal((await request.get('/api/auth/me')).status, 401)
    assert.equal((await request.get('/api/auth/me').set('Authorization', 'Bearer nonsense')).status, 401)

    const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
    const unsigned = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ _id: 'x', role: 'admin' })}.`
    assert.equal((await request.get('/api/users').set('Authorization', `Bearer ${unsigned}`)).status, 401)
  })
})

describe('users (admin)', () => {
  it('lists users without password hashes, only for admins', async () => {
    const admin = await createUser({ username: 'admin', role: 'admin' })
    const user = await createUser({ username: 'bob' })

    assert.equal((await request.get('/api/users')).status, 401)
    assert.equal((await request.get('/api/users').set(user.auth)).status, 403)

    const res = await request.get('/api/users').set(admin.auth)
    assert.equal(res.status, 200)
    assert.equal(res.body.length, 2)
    assert.ok(res.body.every((u) => !('password' in u)))
  })

  it('does not let an admin delete themselves or drop their own role', async () => {
    const admin = await createUser({ username: 'admin', role: 'admin' })
    const id = admin.user._id
    assert.equal((await request.delete(`/api/users/${id}`).set(admin.auth)).status, 400)
    assert.equal((await request.patch(`/api/users/${id}`).set(admin.auth).send({ role: 'user' })).status, 400)
  })
})

describe('rate limiting', () => {
  const { setRateLimitsEnabled } = require('../middleware/rateLimit')
  before(() => setRateLimitsEnabled(true))
  after(() => setRateLimitsEnabled(false))

  it('blocks login after 10 attempts', async () => {
    const statuses = []
    for (let i = 0; i < 12; i++) {
      statuses.push((await request.post('/api/auth/login').send({ email: 'x@test.dev', password: 'wrongpass' })).status)
    }
    assert.ok(
      statuses.slice(0, 10).every((s) => s !== 429),
      'first attempts are not limited'
    )
    assert.equal(statuses.at(-1), 429)
  })
})
