import { describe, expect, it } from 'vitest'
import { chunk, sortBy } from '@/utils/collections'
import { formatDate } from '@/utils/format'

describe('sortBy', () => {
  it('sorts by key without mutating and keeps ties stable', () => {
    const items = [{ id: 1, n: 2 }, { id: 2, n: 1 }, { id: 3, n: 2 }]
    expect(sortBy(items, 'n').map((i) => i.id)).toEqual([2, 1, 3])
    expect(items.map((i) => i.id)).toEqual([1, 2, 3])
  })

  it('sorts ISO dates and puts missing values last', () => {
    const items = [{ d: '2024-05-01' }, { d: undefined }, { d: '2023-01-01' }]
    expect(sortBy(items, 'd').map((i) => i.d)).toEqual(['2023-01-01', '2024-05-01', undefined])
  })

  it('accepts a function as key', () => {
    expect(sortBy(['b', 'A', 'c'], (s) => s.toLowerCase())).toEqual(['A', 'b', 'c'])
  })
})

describe('chunk', () => {
  it('splits into groups of the given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([], 3)).toEqual([])
  })
})

describe('formatDate', () => {
  it('formats as YYYY/MM/DD and ignores invalid dates', () => {
    expect(formatDate(new Date(2024, 0, 5))).toBe('2024/01/05')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('not a date')).toBe('')
  })
})
