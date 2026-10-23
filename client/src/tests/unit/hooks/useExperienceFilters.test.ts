import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useExperienceFilters, filtersToParams } from '@hooks/useExperienceFilters'

const empty = { search: '', score: '', category: '', city: '', year: '', month: '' }

describe('filtersToParams', () => {
  it('maps form values to API params and drops empty ones', () => {
    expect(filtersToParams(empty)).toEqual({
      search: undefined, minScore: undefined, category: undefined, city: undefined, year: undefined, month: undefined,
    })
    expect(filtersToParams({ ...empty, search: ' alps ', score: '4', year: '2024', month: '3', category: 'beach' })).toMatchObject({
      search: 'alps', minScore: 4, year: 2024, month: 3, category: 'beach',
    })
  })

  it('ignores the month without a year', () => {
    expect(filtersToParams({ ...empty, month: '3' }).month).toBeUndefined()
  })
})

describe('useExperienceFilters', () => {
  it('starts without active filters', () => {
    const { result } = renderHook(() => useExperienceFilters())

    expect(result.current.hasActiveFilters).toBe(false)
    expect(result.current.params.search).toBeUndefined()
  })

  it('applies the search after a short delay and can reset', async () => {
    const { result } = renderHook(() => useExperienceFilters())

    act(() => result.current.setFilter('search', 'alps'))
    expect(result.current.hasActiveFilters).toBe(true)
    expect(result.current.params.search).toBeUndefined()
    await waitFor(() => expect(result.current.params.search).toBe('alps'))

    act(() => result.current.resetFilters())
    expect(result.current.hasActiveFilters).toBe(false)
    expect(result.current.params.search).toBeUndefined()
  })

  it('applies select filters at once', () => {
    const { result } = renderHook(() => useExperienceFilters())

    act(() => result.current.setFilter('category', 'beach'))
    expect(result.current.params.category).toBe('beach')
  })
})
