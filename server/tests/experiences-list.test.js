const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const { setup, teardown } = require('./helpers')

let request

// 25 published experiences in 3 cities, 3 years, with and without image and score
before(async () => {
  ;({ request } = await setup())
  const City = require('../models/citiesModel')
  const Experience = require('../models/experiencesModel')
  const Comment = require('../models/commentsModel')
  const cities = await City.insertMany([
    { name: 'Lisbon', country: 'Portugal', countryCode: 'PT', continent: 'europe', lat: 1, lng: 1 },
    { name: 'Tokyo', country: 'Japan', countryCode: 'JP', continent: 'asia', lat: 1, lng: 1 },
    { name: 'Lima', country: 'Peru', countryCode: 'PE', continent: 'south-america', lat: 1, lng: 1 },
  ])
  const experiences = await Experience.insertMany(
    Array.from({ length: 25 }, (_, i) => ({
      title: `Trip ${String(i).padStart(2, '0')}${i === 7 ? ' (a+b) special' : ''}`,
      content: i === 3 ? 'amazing sushi' : 'text',
      category: i % 2 ? 'Food' : 'Culture',
      city: cities[i % 3]._id,
      image: i % 4 ? `img${i}.avif` : '',
      score: i % 5 ? (i % 5) + 0.5 : null,
      date: new Date(Date.UTC(2022 + (i % 3), i % 12, 15)),
      status: 'published',
    }))
  )
  // One pending experience that must never appear in public lists
  await Experience.create({ title: 'Hidden', category: 'Food', city: cities[0]._id, status: 'pending', score: 5 })
  await Comment.insertMany([
    { experience: experiences[0]._id, user: 'a', content: 'old', date: new Date('2024-01-01') },
    { experience: experiences[0]._id, user: 'b', content: 'new', date: new Date('2025-01-01') },
    { experience: experiences[1]._id, user: 'c', content: 'other', date: new Date() },
  ])
})
after(teardown)

const list = (query = '') => request.get(`/api/experiences${query}`)

describe('GET /api/experiences', () => {
  it('paginates published experiences, newest first', async () => {
    const { body } = await list()
    assert.equal(body.items.length, 12)
    assert.equal(body.total, 25)
    assert.equal(body.pages, 3)
    assert.ok(new Date(body.items[0].date) >= new Date(body.items[11].date))
    assert.ok(body.items.every((e) => e.status === 'published' && !('userId' in e)))
    assert.equal(typeof body.items[0].city.name, 'string')
  })

  it('returns the last page and accepts up to 100 per page', async () => {
    assert.equal((await list('?page=3')).body.items.length, 1)
    assert.equal((await list('?limit=100')).body.items.length, 25)
    assert.equal((await list('?limit=101')).status, 400)
  })

  it('searches title, content, category and city name, case insensitive', async () => {
    const byCity = await list('?search=TOKYO&limit=100')
    assert.ok(byCity.body.total > 0 && byCity.body.items.every((e) => e.city.name === 'Tokyo'))
    assert.equal((await list('?search=sushi')).body.total, 1)
    // Regex characters are matched literally
    assert.equal((await list(`?search=${encodeURIComponent('(a+b)')}`)).body.total, 1)
  })

  it('filters by category, continent, score, year, month and image', async () => {
    const food = await list('?category=Food&limit=100')
    assert.equal(food.body.total, 12)
    const peru = await list('?continent=south-america&limit=100')
    assert.ok(peru.body.items.every((e) => e.city.name === 'Lima'))
    const good = await list('?minScore=4&limit=100')
    assert.ok(good.body.total > 0 && good.body.items.every((e) => e.score >= 4))
    const year = await list('?year=2023&limit=100')
    assert.ok(year.body.items.every((e) => new Date(e.date).getUTCFullYear() === 2023))
    const month = await list('?year=2022&month=4&limit=100')
    assert.ok(month.body.items.every((e) => new Date(e.date).getUTCMonth() === 3))
    const withImage = await list('?hasImage=true&limit=100')
    assert.ok(withImage.body.total > 0 && withImage.body.items.every((e) => e.image))
  })

  it('sorts by score', async () => {
    const { body } = await list('?sort=-score&limit=3')
    assert.equal(body.items[0].score, 4.5)
  })

  it('rejects unknown sorts and ignores operators in the query string', async () => {
    assert.equal((await list('?sort=$where')).status, 400)
    const injected = await list('?category[$ne]=x&limit=100')
    assert.equal(injected.status, 200)
    assert.equal(injected.body.total, 25)
  })
})

describe('facets, timeline and comments', () => {
  it('returns filter options from published experiences only', async () => {
    const { body } = await request.get('/api/experiences/facets')
    assert.deepEqual(body.categories, ['Culture', 'Food'])
    assert.equal(body.cities.length, 3)
    assert.deepEqual(body.years, ['2024', '2023', '2022'])
  })

  it('returns the best experience of each year, oldest year first', async () => {
    const { body } = await request.get('/api/experiences/timeline')
    assert.deepEqual(
      body.map((e) => e.year),
      [2022, 2023, 2024]
    )
    assert.ok(body.every((e) => e.score === 4.5 && e.city.name && e.title !== 'Hidden'))
  })

  it('returns only the comments of one experience, newest first', async () => {
    const first = (await list('?sort=date&limit=100')).body.items.find((e) => e.title === 'Trip 00')
    const { body } = await request.get(`/api/experiences/${first._id}/comments`)
    assert.deepEqual(
      body.map((c) => c.content),
      ['new', 'old']
    )
  })
})
