const fs = require('fs/promises')
const path = require('path')
const config = require('../config')
const Experiences = require('../models/experiencesModel')
const { isValidId } = require('../utils/validators')
const { escapeHtml, summarize } = require('../utils/html')
const { notFound } = require('../utils/httpErrors')

const SITE_NAME = 'ScoreTravelsBlog'
// Public pages listed in the sitemap besides the experiences
const STATIC_PAGES = ['/', '/experiences', '/gallery', '/contact', '/about', '/privacy']
// Private pages and endless search combinations stay out of search engines
const DISALLOW = ['/admin', '/login', '/register', '/search', '/search-by-continent', '/api/']

const siteUrl = (req) => config.siteUrl || `${req.protocol}://${req.get('host')}`

// index.html only changes on a new build, which restarts the server in production
let cachedIndex
const readIndex = async () => {
  if (cachedIndex) return cachedIndex
  const html = await fs.readFile(path.join(config.clientDistDir, 'index.html'), 'utf8').catch((error) => {
    // No client build (e.g. the API running alone in development)
    if (error.code === 'ENOENT') throw notFound('Client build not found')
    throw error
  })
  if (config.isProduction) cachedIndex = html
  return html
}

/**
 * Writes the page title, description and Open Graph tags into index.html.
 * Social networks read them from the HTML because their crawlers do not run JavaScript.
 */
const withMeta = (html, { title, description, url, image }) => {
  const tags = [
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    image && `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
  ].filter(Boolean)

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace('</head>', `  ${tags.join('\n    ')}\n  </head>`)
}

// Any client route: the SPA with the default tags of index.html
const indexPage = async (req, res) => {
  res.type('html').send(await readIndex())
}

// An experience: the SPA with its own tags, when it is published
const experiencePage = async (req, res) => {
  const html = await readIndex()
  const { id } = req.params
  const experience = isValidId(id)
    ? await Experiences.findOne({ _id: id, status: 'published' }).select('title content image images').lean()
    : null

  if (!experience) return res.type('html').send(html)

  const site = siteUrl(req)
  const cover = experience.images?.find(Boolean) || experience.image
  res.type('html').send(
    withMeta(html, {
      title: `${experience.title} | ${SITE_NAME}`,
      description: summarize(experience.content) || experience.title,
      url: `${site}/experience/${id}`,
      image: cover && `${site}/static/images/${encodeURIComponent(cover)}`,
    })
  )
}

const robots = (req, res) => {
  const lines = [
    'User-agent: *',
    ...DISALLOW.map((rule) => `Disallow: ${rule}`),
    '',
    `Sitemap: ${siteUrl(req)}/sitemap.xml`,
  ]
  res.type('text/plain').send(`${lines.join('\n')}\n`)
}

const sitemap = async (req, res) => {
  const site = siteUrl(req)
  const experiences = await Experiences.find({ status: 'published' })
    .select('_id updatedAt')
    .sort({ date: -1 })
    .limit(50000)
    .lean()

  const urls = [
    ...STATIC_PAGES.map((page) => ({ loc: `${site}${page}` })),
    ...experiences.map((experience) => ({
      loc: `${site}/experience/${experience._id}`,
      lastmod: experience.updatedAt?.toISOString().slice(0, 10),
    })),
  ]
  const entries = urls.map(
    ({ loc, lastmod }) => `  <url><loc>${escapeHtml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
  )

  res
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
    )
}

module.exports = { indexPage, experiencePage, robots, sitemap }
