const Experiences = require('../models/experiencesModel')
const Cities = require('../models/citiesModel')

const SORTS = {
  '-date': { date: -1, _id: -1 },
  date: { date: 1, _id: 1 },
  '-score': { score: -1, date: -1, _id: -1 },
  score: { score: 1, date: -1, _id: -1 },
  title: { title: 1, _id: 1 },
  '-title': { title: -1, _id: -1 },
}

// User input goes into a RegExp, so special characters must be escaped
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Builds the MongoDB filter for the experience list from validated query params.
 * Search covers title, content, category and city name.
 */
const PUBLISHED = Object.freeze({ status: 'published' })

/**
 * Who can see what:
 *   'public' (default): published experiences only
 *   'mine': the signed in user's experiences, in any status
 *   'all': every experience (admins), optionally filtered by status
 * The controller has already checked the viewer may use the scope.
 */
const scopeFilter = ({ scope, status }, viewer) => {
  if (scope === 'mine') return { userId: viewer._id, ...(status && { status }) }
  if (scope === 'all') return status ? { status } : {}
  // A copy: buildFilter adds more conditions to the returned object
  return { ...PUBLISHED }
}

const buildFilter = async (
  { search, category, city, continent, country, minScore, year, month, hasImage, scope, status },
  viewer
) => {
  const filter = scopeFilter({ scope, status }, viewer)
  const and = []

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i')
    const matchingCities = await Cities.find({ $or: [{ name: regex }, { country: regex }] }).distinct('_id')
    and.push({ $or: [{ title: regex }, { content: regex }, { category: regex }, { city: { $in: matchingCities } }] })
  }
  if (category) filter.category = category
  if (city) filter.city = city
  if (continent) {
    const continentCities = await Cities.find({ continent }).distinct('_id')
    and.push({ city: { $in: continentCities } })
  }
  if (country) {
    const countryCities = await Cities.find({ countryCode: country }).distinct('_id')
    and.push({ city: { $in: countryCities } })
  }
  if (minScore) filter.score = { $gte: minScore }
  if (year) {
    // UTC, like $year in the facets. Month is only meaningful together with a year
    const start = new Date(Date.UTC(year, month ? month - 1 : 0, 1))
    const end = month ? new Date(Date.UTC(year, month, 1)) : new Date(Date.UTC(year + 1, 0, 1))
    filter.date = { $gte: start, $lt: end }
  }
  if (hasImage) filter.image = { $nin: ['', null] }

  if (and.length) filter.$and = and
  return filter
}

const listExperiences = async (query, viewer) => {
  const { page, limit, sort } = query
  const filter = await buildFilter(query, viewer)
  const [items, total] = await Promise.all([
    Experiences.find(filter)
      .select('-userId')
      .sort(SORTS[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('city'),
    Experiences.countDocuments(filter),
  ])
  return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) }
}

// Options for the filter selects, computed from the experiences that exist
const getFacets = async () => {
  const [categories, cityIds, years] = await Promise.all([
    Experiences.distinct('category', { ...PUBLISHED, category: { $nin: ['', null] } }),
    Experiences.distinct('city', { ...PUBLISHED, city: { $ne: null } }),
    Experiences.aggregate([
      { $match: { ...PUBLISHED, date: { $ne: null } } },
      { $group: { _id: { $year: '$date' } } },
      { $sort: { _id: -1 } },
    ]),
  ])
  // One entry per country of the places in use, with its continent for the dependent select
  const countries = await Cities.aggregate([
    { $match: { _id: { $in: cityIds } } },
    { $group: { _id: '$countryCode', name: { $first: '$country' }, continent: { $first: '$continent' } } },
    { $project: { _id: 0, code: '$_id', name: 1, continent: 1 } },
    { $sort: { name: 1 } },
  ])
  return {
    categories: categories.sort((a, b) => a.localeCompare(b)),
    continents: [...new Set(countries.map((c) => c.continent))].sort(),
    countries,
    years: years.map((y) => String(y._id)),
  }
}

// Best scored experience of each year, oldest year first
const getTimeline = async () => {
  const rows = await Experiences.aggregate([
    { $match: { ...PUBLISHED, score: { $gt: 0 }, date: { $ne: null } } },
    { $sort: { score: -1, date: -1 } },
    { $group: { _id: { $year: '$date' }, experience: { $first: '$$ROOT' } } },
    { $sort: { _id: 1 } },
  ])
  const experiences = rows.map((row) => {
    const { userId, ...experience } = row.experience
    return { ...experience, year: row._id }
  })
  return Experiences.populate(experiences, { path: 'city' })
}

// Best scored experiences of each continent for the home map, with only what the popup shows
const MAP_PER_CONTINENT = 5

const getMapExperiences = () =>
  Experiences.aggregate([
    { $match: { ...PUBLISHED, score: { $gt: 0 }, city: { $ne: null } } },
    { $lookup: { from: 'cities', localField: 'city', foreignField: '_id', as: 'city' } },
    { $unwind: '$city' },
    { $sort: { score: -1, votes: -1, date: -1 } },
    { $group: { _id: '$city.continent', experiences: { $push: '$$ROOT' } } },
    { $project: { experiences: { $slice: ['$experiences', MAP_PER_CONTINENT] } } },
    { $unwind: '$experiences' },
    { $replaceRoot: { newRoot: '$experiences' } },
    {
      $project: {
        title: 1,
        category: 1,
        score: 1,
        votes: 1,
        image: 1,
        images: 1,
        'city.name': 1,
        'city.type': 1,
        'city.country': 1,
        'city.continent': 1,
        'city.lat': 1,
        'city.lng': 1,
      },
    },
    { $sort: { score: -1 } },
  ])

module.exports = { listExperiences, getFacets, getTimeline, getMapExperiences, SORTS, PUBLISHED }
