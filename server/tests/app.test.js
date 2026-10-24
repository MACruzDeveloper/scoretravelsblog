const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert/strict')
const { setup, teardown } = require('./helpers')

let request

before(async () => {
  ;({ request } = await setup())
})
after(teardown)

describe('errors', () => {
  it('answers JSON errors for bad requests and unknown API routes', async () => {
    const malformed = await request.post('/api/auth/login').set('Content-Type', 'application/json').send('{bad')
    assert.equal(malformed.status, 400)
    assert.equal(malformed.body.message, 'Invalid request')

    assert.equal((await request.post('/api/auth/login')).status, 400)

    const unknown = await request.get('/api/nope/deep')
    assert.equal(unknown.status, 404)
    assert.match(unknown.headers['content-type'], /json/)
  })

  it('validates ids in the URL', async () => {
    const res = await request.get('/api/experiences/not-an-id')
    assert.equal(res.status, 400)
    assert.equal(res.body.errors[0].field, 'id')
  })

  it('reports the database state in the health check', async () => {
    const res = await request.get('/api/health')
    assert.equal(res.status, 200)
    assert.deepEqual(res.body, { ok: true, db: 'up' })
  })
})

describe('security headers and CORS', () => {
  it('sends a Content-Security-Policy', async () => {
    const res = await request.get('/api/health')
    assert.match(res.headers['content-security-policy'], /default-src 'self'/)
  })

  it('allows the dev client origin and nothing else', async () => {
    const allowed = await request.get('/api/health').set('Origin', 'http://localhost:5173')
    assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173')
    const other = await request.get('/api/health').set('Origin', 'https://evil.example')
    assert.equal(other.headers['access-control-allow-origin'], undefined)
  })
})

describe('contact form', () => {
  it('validates the message', async () => {
    const res = await request.post('/api/contact').send({ name: 'A', email: 'nope', message: 'hi' })
    assert.equal(res.status, 400)
  })

  it('pretends to accept messages that filled the honeypot', async () => {
    const res = await request
      .post('/api/contact')
      .send({ name: 'Bot', email: 'bot@test.dev', message: 'hi', website: 'spam.example' })
    assert.equal(res.status, 200)
  })
})

describe('request ids', () => {
  it('sends an id with every response and keeps a valid incoming one', async () => {
    const generated = await request.get('/api/health')
    assert.match(generated.headers['x-request-id'], /^[\w-]{36}$/)

    const kept = await request.get('/api/health').set('X-Request-Id', 'from-nginx-123')
    assert.equal(kept.headers['x-request-id'], 'from-nginx-123')

    const replaced = await request.get('/api/health').set('X-Request-Id', 'bad id with spaces')
    assert.notEqual(replaced.headers['x-request-id'], 'bad id with spaces')
  })

  it('hides unexpected errors but returns the id to find them in the logs', async () => {
    const Experiences = require('../models/experiencesModel')
    const find = mock.method(Experiences, 'find', () => {
      throw new Error('database exploded')
    })
    try {
      const res = await request.get('/sitemap.xml')
      assert.equal(res.status, 500)
      assert.equal(res.body.message, 'Internal server error')
      assert.equal(res.body.requestId, res.headers['x-request-id'])
      assert.doesNotMatch(res.text, /exploded/)
    } finally {
      find.mock.restore()
    }
  })
})
