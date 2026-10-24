import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Seo from '@/components/common/Seo'
import { DEFAULT_TITLE, summarize } from '@/utils/seo'

const meta = (selector: string) => document.head.querySelector(`meta[${selector}]`)?.getAttribute('content')

describe('Seo', () => {
  it('writes the title, description and Open Graph tags', () => {
    render(<Seo title="Carnival in Rio" description="Samba all night" image="https://site.test/static/images/rio.avif" type="article" />)

    expect(document.title).toBe('Carnival in Rio | ScoreTravelsBlog')
    expect(meta('name="description"')).toBe('Samba all night')
    expect(meta('property="og:title"')).toBe('Carnival in Rio | ScoreTravelsBlog')
    expect(meta('property="og:type"')).toBe('article')
    expect(meta('property="og:image"')).toBe('https://site.test/static/images/rio.avif')
    expect(meta('name="twitter:card"')).toBe('summary_large_image')
    expect(document.head.querySelector('link[rel="canonical"]')).not.toBeNull()
  })

  it('marks private pages as noindex and cleans up tags of the previous page', () => {
    render(<Seo title="Admin" noindex />)

    expect(meta('name="robots"')).toBe('noindex, nofollow')
    expect(meta('property="og:image"')).toBeUndefined()
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
  })

  it('uses the site title by default', () => {
    render(<Seo />)

    expect(document.title).toBe(DEFAULT_TITLE)
    expect(meta('name="robots"')).toBeUndefined()
  })
})

describe('summarize', () => {
  it('strips HTML and collapses whitespace', () => {
    expect(summarize('<p>Hello <b>world</b></p>\n<p>again</p>')).toBe('Hello world again')
  })

  it('cuts long text at a word boundary', () => {
    const summary = summarize('word '.repeat(100), 20)
    expect(summary).toBe('word word word word…')
    expect(summary.length).toBeLessThanOrEqual(20)
  })
})
