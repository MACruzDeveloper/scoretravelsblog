import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useOutsideClick from '@hooks/useOutsideClick'

describe('useOutsideClick', () => {
  it('calls the callback only for clicks outside the referenced element', () => {
    const callback = vi.fn()
    const container = document.createElement('div')
    const inside = document.createElement('button')
    container.appendChild(inside)
    document.body.appendChild(container)

    const ref = { current: container }
    renderHook(() => useOutsideClick(ref, callback))

    inside.click()
    expect(callback).not.toHaveBeenCalled()

    document.body.click()
    expect(callback).toHaveBeenCalledOnce()

    container.remove()
  })
})
