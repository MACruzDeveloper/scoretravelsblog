import { useEffect } from 'react'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, setHeadTag } from '@/utils/seo'

type PropsSeo = {
  // Page title; the site name is appended
  title?: string
  description?: string
  // Absolute URL of the preview image for social networks
  image?: string
  type?: 'website' | 'article'
  // Pages that should not appear in search results (admin, login...)
  noindex?: boolean
}

/**
 * Title, description and Open Graph tags of the current page, written into <head>.
 * Social crawlers do not run JavaScript, so experience previews also come from the server.
 */
const Seo = ({ title, description = DEFAULT_DESCRIPTION, image, type = 'website', noindex = false }: PropsSeo) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE
    const url = `${window.location.origin}${window.location.pathname}`

    document.title = fullTitle
    setHeadTag('meta', 'name', 'description', description)
    setHeadTag('meta', 'name', 'robots', noindex ? 'noindex, nofollow' : undefined)
    setHeadTag('link', 'rel', 'canonical', noindex ? undefined : url)

    setHeadTag('meta', 'property', 'og:site_name', SITE_NAME)
    setHeadTag('meta', 'property', 'og:title', fullTitle)
    setHeadTag('meta', 'property', 'og:description', description)
    setHeadTag('meta', 'property', 'og:type', type)
    setHeadTag('meta', 'property', 'og:url', url)
    setHeadTag('meta', 'property', 'og:image', image)
    setHeadTag('meta', 'name', 'twitter:card', image ? 'summary_large_image' : 'summary')
  }, [title, description, image, type, noindex])

  return null
}

export default Seo
