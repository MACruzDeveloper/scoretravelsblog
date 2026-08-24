import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useScrollPosition from '@hooks/useScrollPosition'

describe('useScrollPosition', () => {
  it('returns the current vertical scroll position', () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 120,
    })

    const { result } = renderHook(() => useScrollPosition())
    expect(result.current).toBe(120)

    act(() => {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 280 })
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current).toBe(280)
  })
})
