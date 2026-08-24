import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useExperienceFilters } from '@hooks/useExperienceFilters'

const experiences = [
  {
    _id: '1',
    title: 'Eagle Beach',
    category: 'beach',
    city: 'Aruba',
    content: 'A tropical destination',
    score: 5,
    date: new Date('2024-01-15'),
  },
  {
    _id: '2',
    title: 'Mountain trek',
    category: 'adventure',
    city: 'Alps',
    content: 'A challenging route',
    score: 3,
    date: new Date('2023-06-10'),
  },
]

describe('useExperienceFilters', () => {
  it('starts with all experiences and no active filters', () => {
    const { result } = renderHook(() => useExperienceFilters(experiences))

    expect(result.current.filtered).toHaveLength(2)
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('filters by search and can reset filters', () => {
    const { result } = renderHook(() => useExperienceFilters(experiences))

    act(() => result.current.setFilter('search', 'alps'))
    expect(result.current.filtered).toEqual([experiences[1]])
    expect(result.current.hasActiveFilters).toBe(true)

    act(() => result.current.resetFilters())
    expect(result.current.filtered).toHaveLength(2)
    expect(result.current.hasActiveFilters).toBe(false)
  })
})
