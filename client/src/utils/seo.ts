export const SITE_NAME = 'ScoreTravelsBlog'
export const DEFAULT_TITLE = `${SITE_NAME} - Score people's trips`
export const DEFAULT_DESCRIPTION = 'A travel blog where people share and score their trips. Help others discover the best destinations!'
const DESCRIPTION_LENGTH = 160

// Plain text summary of HTML content, cut at a word boundary
export const summarize = (html = '', length = DESCRIPTION_LENGTH) => {
  const text = (new DOMParser().parseFromString(html, 'text/html').body.textContent || '').replace(/\s+/g, ' ').trim()
  if (text.length <= length) return text
  const cut = text.slice(0, length - 1)
  // Keep the last word when the cut falls right before a space
  const lastSpace = text[cut.length] === ' ' ? cut.length : cut.lastIndexOf(' ')
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`
}

// Creates, updates or (with no content) removes a <meta> or <link> tag in <head>
export const setHeadTag = (tag: 'meta' | 'link', key: 'name' | 'property' | 'rel', id: string, content?: string) => {
  const attribute = tag === 'link' ? 'href' : 'content'
  let element = document.head.querySelector<HTMLElement>(`${tag}[${key}="${id}"]`)
  if (!content) {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement(tag)
    element.setAttribute(key, id)
    document.head.appendChild(element)
  }
  element.setAttribute(attribute, content)
}
