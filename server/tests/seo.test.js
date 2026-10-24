const { describe, it, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { setup, teardown, clearDatabase } = require('./helpers')

const INDEX = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>ScoreTravelsBlog - Score people's trips</title>
    <meta name="description" content="Default description" />
  </head>
  <body><div id="root"></div></body>
</html>`

let request
let Experiences
let distDir

before(async () => {
  // A fake client build: config.js reads CLIENT_DIST_DIR when the app loads
  distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stb-dist-'))
  fs.writeFileSync(path.join(distDir, 'index.html'), INDEX)
  process.env.CLIENT_DIST_DIR = distDir
  ;({ request } = await setup())
  Experiences = require('../models/experiencesModel')
})
after(async () => {
  await teardown()
  fs.rmSync(distDir, { recursive: true, force: true })
})
beforeEach(clearDatabase)

const createExperience = (fields) =>
  Experiences.create({
    title: 'Carnival in Rio',
    content: '<p>Samba &amp; <b>sun</b></p>',
    status: 'published',
    ...fields,
  })

describe('experience pages', () => {
  it('serve the SPA with the tags of a published experience', async () => {
    const experience = await createExperience({ images: ['rio.avif'] })

    const res = await request.get(`/experience/${experience._id}`)
    assert.equal(res.status, 200)
    assert.match(res.headers['content-type'], /html/)
    assert.match(res.text, /<div id="root">/)
    assert.match(res.text, /<title>Carnival in Rio \| ScoreTravelsBlog<\/title>/)
    assert.match(res.text, /<meta name="description" content="Samba &amp; sun" \/>/)
    assert.match(
      res.text,
      /<meta property="og:image" content="http:\/\/127\.0\.0\.1:\d+\/static\/images\/rio\.avif" \/>/
    )
    assert.doesNotMatch(res.text, /Default description/)
  })

  it('escape the experience fields', async () => {
    const experience = await createExperience({ title: '"><script>alert(1)</script>' })

    const res = await request.get(`/experience/${experience._id}`)
    assert.doesNotMatch(res.text, /<script>alert/)
    assert.match(res.text, /&quot;&gt;&lt;script&gt;/)
  })

  it('keep the default tags for pending, missing or invalid experiences', async () => {
    const pending = await createExperience({ status: 'pending' })

    for (const id of [pending._id, '64b000000000000000000000', 'not-an-id']) {
      const res = await request.get(`/experience/${id}`)
      assert.equal(res.status, 200)
      assert.match(res.text, /Default description/)
      assert.doesNotMatch(res.text, /og:title/)
    }
  })

  it('serve the SPA for any other client route', async () => {
    for (const route of ['/', '/experiences', '/admin/users']) {
      const res = await request.get(route)
      assert.equal(res.status, 200)
      assert.match(res.text, /Default description/)
    }
  })
})

describe('robots.txt and sitemap.xml', () => {
  it('keep private pages out and point to the sitemap', async () => {
    const res = await request.get('/robots.txt')
    assert.equal(res.status, 200)
    assert.match(res.headers['content-type'], /text\/plain/)
    assert.match(res.text, /^Disallow: \/admin$/m)
    assert.match(res.text, /^Sitemap: http:\/\/127\.0\.0\.1:\d+\/sitemap\.xml$/m)
  })

  it('list the public pages and only published experiences', async () => {
    const published = await createExperience()
    const pending = await createExperience({ status: 'pending' })

    const res = await request.get('/sitemap.xml')
    assert.equal(res.status, 200)
    assert.match(res.headers['content-type'], /xml/)
    assert.match(res.text, /<loc>http:\/\/127\.0\.0\.1:\d+\/experiences<\/loc>/)
    assert.match(res.text, new RegExp(`/experience/${published._id}</loc><lastmod>\\d{4}-\\d{2}-\\d{2}</lastmod>`))
    assert.doesNotMatch(res.text, new RegExp(String(pending._id)))
  })
})
