import { describe, expect, it } from 'vitest'
import { COUNTRY_TO_CONTINENT, PAGES_WITH_BREADCRUMBS } from '@utils/constants'

describe('constants', () => {
  it('maps country codes to continents', () => {
    expect(COUNTRY_TO_CONTINENT.ES).toBe('europe')
    expect(COUNTRY_TO_CONTINENT.JP).toBe('asia')
    expect(COUNTRY_TO_CONTINENT.AU).toBe('oceania')
  })

  it('defines the pages that use breadcrumbs', () => {
    expect(PAGES_WITH_BREADCRUMBS.map(({ page }) => page)).toEqual([
      'experiences',
      'experience',
      'gallery',
    ])
  })
})
