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

describe('passwords', () => {
  const NEW = 'a-brand-new-password'
  const signIn = (email, password) => request.post('/api/auth/login').send({ email, password })
  const change = (auth, currentPassword, password = NEW, password2 = password) =>
    request.post('/api/auth/change-password').set(auth).send({ currentPassword, password, password2 })

  // Waits for a new second: session tokens carry their date in whole seconds
  const nextSecond = () => new Promise((resolve) => setTimeout(resolve, 1100))

  // Records the emails instead of sending them, and returns the emailed token
  const captureEmails = (t) => {
    const mailer = require('../services/mailer')
    return t.mock.method(mailer, 'sendPasswordResetEmail', async () => {})
  }
  const tokenFrom = (call) => call.arguments[1].split('#token=')[1]
  // The email goes out after the response
  const until = async (done) => {
    for (let i = 0; i < 100 && !done(); i++) await new Promise((resolve) => setTimeout(resolve, 10))
    assert.ok(done(), 'the recovery email was not sent in time')
  }
  const settle = () => new Promise((resolve) => setTimeout(resolve, 100))
  const forgot = (email) => request.post('/api/auth/forgot-password').send({ email })
  const reset = (token, password = NEW) =>
    request.post('/api/auth/reset-password').send({ token, password, password2: password })

  it('changes it with the current one, and rejects a wrong one', async () => {
    const { user, auth } = await createUser({ username: 'ana' })
    await change(auth, 'wrong-password').expect(400)
    await change(auth, 'supersecret1', NEW, 'different-password').expect(400)
    await change(auth, 'supersecret1', 'short').expect(400)
    await signIn(user.email, 'supersecret1').expect(200)

    await change(auth, 'supersecret1').expect(200)
    await signIn(user.email, 'supersecret1').expect(401)
    await signIn(user.email, NEW).expect(200)
  })

  it('needs a session to change it', async () => {
    await request
      .post('/api/auth/change-password')
      .send({ currentPassword: 'x', password: NEW, password2: NEW })
      .expect(401)
  })

  it('closes the older sessions, but keeps the one it returns', async () => {
    const { auth } = await createUser({ username: 'ana' })
    await nextSecond()
    const { body } = await change(auth, 'supersecret1').expect(200)

    await request.get('/api/auth/me').set(auth).expect(401)
    await request.get('/api/auth/me').set('Authorization', `Bearer ${body.token}`).expect(200)
  })

  it('never returns the recovery fields', async () => {
    const { auth } = await createUser({ username: 'boss', role: 'admin' })
    const { body } = await request.get('/api/users').set(auth).expect(200)
    assert.ok(body.every((u) => !('passwordChangedAt' in u) && !('resetTokenHash' in u) && !('resetTokenExpires' in u)))
  })

  it('answers the same for a known and an unknown email, and only emails the known one', async (t) => {
    const emails = captureEmails(t)
    const { user } = await createUser({ username: 'ana' })

    const known = await forgot(user.email).expect(200)
    const unknown = await forgot('nobody@test.dev').expect(200)
    assert.equal(known.body.message, unknown.body.message)
    await until(() => emails.mock.callCount() === 1)
    await settle()
    assert.equal(emails.mock.callCount(), 1)
    assert.equal(emails.mock.calls[0].arguments[0].email, user.email)
    assert.match(emails.mock.calls[0].arguments[1], /^http:\/\/localhost:5173\/reset-password#token=[a-f0-9]{64}$/)
  })

  it('answers before doing the work, so the time does not reveal the email', async (t) => {
    const mailer = require('../services/mailer')
    let finishEmail
    const emails = t.mock.method(
      mailer,
      'sendPasswordResetEmail',
      () => new Promise((resolve) => (finishEmail = resolve))
    )
    const { user } = await createUser({ username: 'ana' })

    // The email is still being sent when the answer arrives
    await forgot(user.email).expect(200)
    await until(() => emails.mock.callCount() === 1)
    finishEmail()
  })

  it('stores only a hash of the token and ignores a forged Host', async (t) => {
    const emails = captureEmails(t)
    const User = require('../models/usersModels')
    const { user } = await createUser({ username: 'ana' })

    await request.post('/api/auth/forgot-password').set('Host', 'evil.example').send({ email: user.email }).expect(200)
    await until(() => emails.mock.callCount() === 1)
    const url = emails.mock.calls[0].arguments[1]
    assert.ok(!url.includes('evil.example'))
    const stored = await User.findById(user._id).select('resetTokenHash')
    assert.notEqual(stored.resetTokenHash, tokenFrom(emails.mock.calls[0]))
  })

  it('resets it with the emailed token, once, closing the old sessions', async (t) => {
    const emails = captureEmails(t)
    const { user, auth } = await createUser({ username: 'ana' })
    await nextSecond()
    await forgot(user.email).expect(200)
    await until(() => emails.mock.callCount() === 1)
    const token = tokenFrom(emails.mock.calls[0])

    await reset(token, 'short').expect(400)
    await reset(token).expect(200)
    await signIn(user.email, NEW).expect(200)
    await signIn(user.email, 'supersecret1').expect(401)
    await request.get('/api/auth/me').set(auth).expect(401)
    // Used once
    await reset(token, 'another-new-password').expect(400)
  })

  it('rejects expired and made up tokens', async (t) => {
    const emails = captureEmails(t)
    const User = require('../models/usersModels')
    const { user } = await createUser({ username: 'ana' })
    await forgot(user.email).expect(200)
    await until(() => emails.mock.callCount() === 1)
    await User.updateOne({ _id: user._id }, { resetTokenExpires: new Date(Date.now() - 1000) })

    await reset(tokenFrom(emails.mock.calls[0])).expect(400)
    await reset('f'.repeat(64)).expect(400)
    await reset({ $ne: null }).expect(400)
  })

  it('does not email the fictional users of the sample content', async (t) => {
    const emails = captureEmails(t)
    const User = require('../models/usersModels')
    await User.create({ username: 'fiction', email: 'fiction@example.com', password: 'x', seed: true })

    await forgot('fiction@example.com').expect(200)
    await settle()
    assert.equal(emails.mock.callCount(), 0)
  })
})

describe('sessions follow the database', () => {
  it('applies a role change at once', async () => {
    const User = require('../models/usersModels')
    const { user, auth } = await createUser({ username: 'boss', role: 'admin' })
    await request.get('/api/users').set(auth).expect(200)

    await User.updateOne({ _id: user._id }, { role: 'user' })
    await request.get('/api/users').set(auth).expect(403)
    const { body } = await request.get('/api/auth/me').set(auth).expect(200)
    assert.equal(body.user.role, 'user')
  })

  it('closes the session of a deleted user', async () => {
    const User = require('../models/usersModels')
    const { user, auth } = await createUser({ username: 'ana' })

    await User.deleteOne({ _id: user._id })
    await request.get('/api/auth/me').set(auth).expect(401)
  })
})

describe('shared rate limit counters', () => {
  const { MongoRateLimitStore } = require('../middleware/mongoRateLimitStore')
  const RateLimit = require('../models/rateLimitModel')
  const IP = '203.0.113.7'
  const storeOf = (prefix = 'test', windowMs = 60_000) => {
    const store = new MongoRateLimitStore(prefix)
    store.init({ windowMs })
    return store
  }

  it('counts together across instances', async () => {
    assert.equal((await storeOf().increment(IP)).totalHits, 1)
    // Another instance of the function sees the same counter
    assert.equal((await storeOf().increment(IP)).totalHits, 2)
  })

  it('counts every concurrent request', async () => {
    await RateLimit.init()
    const results = await Promise.all(Array.from({ length: 20 }, () => storeOf().increment(IP)))
    assert.deepEqual(
      results.map((r) => r.totalHits).sort((a, b) => a - b),
      Array.from({ length: 20 }, (_, i) => i + 1)
    )
  })

  it('keeps limits and IPs apart, and starts again when the window ends', async () => {
    await storeOf('login').increment(IP)
    assert.equal((await storeOf('email').increment(IP)).totalHits, 1)
    assert.equal((await storeOf('login').increment('203.0.113.8')).totalHits, 1)

    const short = storeOf('short', 20)
    await short.increment(IP)
    await new Promise((resolve) => setTimeout(resolve, 40))
    assert.equal((await short.increment(IP)).totalHits, 1)
  })

  it('does not store the IP, and expires on its own', async () => {
    await storeOf().increment(IP)
    const [counter] = await RateLimit.find().lean()
    assert.ok(!JSON.stringify(counter).includes(IP))

    await RateLimit.init()
    const indexes = await RateLimit.collection.indexes()
    assert.ok(indexes.some((index) => index.key.resetAt === 1 && index.expireAfterSeconds === 0))
  })

  it('decrements and resets', async () => {
    const store = storeOf()
    await store.increment(IP)
    await store.increment(IP)
    await store.decrement(IP)
    assert.equal((await store.increment(IP)).totalHits, 2)
    await store.resetKey(IP)
    assert.equal((await store.increment(IP)).totalHits, 1)
  })
})
