import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSortedData } from '@/hooks/useSortedData'

const rows = [
  { name: 'beta', score: 2, date: '2024-01-02' },
  { name: 'Álvaro', score: null, date: '2023-05-01' },
  { name: 'alpha 10', score: 5, date: '2025-01-01' },
  { name: 'alpha 9', score: 3, date: undefined },
]

describe('useSortedData', () => {
  it('keeps the original order without a column', () => {
    const { result } = renderHook(() => useSortedData(rows))
    expect(result.current.sorted).toBe(rows)
  })

  it('sorts text ignoring case and accents, with numbers in natural order', () => {
    const { result } = renderHook(() => useSortedData(rows, { initialKey: 'name' }))
    expect(result.current.sorted.map((r) => r.name)).toEqual(['alpha 9', 'alpha 10', 'Álvaro', 'beta'])
  })

  it('reverses on a second click and keeps empty values last', () => {
    const { result } = renderHook(() => useSortedData(rows, { initialKey: 'score' }))
    expect(result.current.sorted.map((r) => r.score)).toEqual([2, 3, 5, null])

    act(() => result.current.handleSort('score'))
    expect(result.current.sortDirection).toBe('desc')
    expect(result.current.sorted.map((r) => r.score)).toEqual([5, 3, 2, null])
  })

  it('sorts by a derived value', () => {
    const { result } = renderHook(() =>
      useSortedData(rows, { initialKey: 'length', getValue: (row) => row.name.length })
    )
    expect(result.current.sorted[0].name).toBe('beta')
  })
})
