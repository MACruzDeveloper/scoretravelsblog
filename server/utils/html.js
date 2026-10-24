// Escapes text placed inside HTML or XML (element content and quoted attributes)
const escapeHtml = (value) =>
  typeof value === 'string'
    ? value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
    : ''

const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'" }

// Plain text of HTML content: no tags, common entities decoded, whitespace collapsed
const htmlToText = (html = '') =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|quot|#39|apos);/g, (_, name) => ENTITIES[name])
    .replace(/\s+/g, ' ')
    .trim()

// Summary of at most `length` characters, cut at a word boundary
const summarize = (html, length = 160) => {
  const text = htmlToText(html)
  if (text.length <= length) return text
  const cut = text.slice(0, length - 1)
  const lastSpace = text[cut.length] === ' ' ? cut.length : cut.lastIndexOf(' ')
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`
}

module.exports = { escapeHtml, htmlToText, summarize }
