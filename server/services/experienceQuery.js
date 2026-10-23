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
const buildFilter = async ({ search, category, city, continent, minScore, year, month, hasImage }) => {
  const filter = {}
  const and = []

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i')
    const matchingCities = await Cities.find({ name: regex }).distinct('_id')
    and.push({ $or: [{ title: regex }, { content: regex }, { category: regex }, { city: { $in: matchingCities } }] })
  }
  if (category) filter.category = category
  if (city) filter.city = city
  if (continent) {
    const continentCities = await Cities.find({ continent }).distinct('_id')
    and.push({ city: { $in: continentCities } })
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

const listExperiences = async (query) => {
  const { page, limit, sort } = query
  const filter = await buildFilter(query)
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
    Experiences.distinct('category', { category: { $nin: ['', null] } }),
    Experiences.distinct('city', { city: { $ne: null } }),
    Experiences.aggregate([
      { $match: { date: { $ne: null } } },
      { $group: { _id: { $year: '$date' } } },
      { $sort: { _id: -1 } },
    ]),
  ])
  const cities = await Cities.find({ _id: { $in: cityIds } })
    .select('name')
    .sort({ name: 1 })
  return {
    categories: categories.sort((a, b) => a.localeCompare(b)),
    cities,
    years: years.map((y) => String(y._id)),
  }
}

// Best scored experience of each year, oldest year first
const getTimeline = async () => {
  const rows = await Experiences.aggregate([
    { $match: { score: { $gt: 0 }, date: { $ne: null } } },
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

module.exports = { listExperiences, getFacets, getTimeline, SORTS }
