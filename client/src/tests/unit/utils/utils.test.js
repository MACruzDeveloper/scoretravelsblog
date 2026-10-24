import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  checkFileSize,
  deleteData,
  fetchData,
  getToken,
  postData,
  validateEmail,
} from '@utils/utils'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('utils', () => {
  it('validates emails', () => {
    expect(validateEmail('valid@example.com')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
  })

  it('reads tokens and validates file size limits', () => {
    expect(getToken()).toBeNull()
    localStorage.setItem('token', JSON.stringify('token-value'))
    expect(getToken()).toBe('token-value')
    expect(checkFileSize({ size: 10 * 1024 * 1024 })).toBe(true)
    expect(checkFileSize({ size: 10 * 1024 * 1024 + 1 })).toBe(false)
  })

  it('uses the expected HTTP methods and parses successful responses', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)

    await fetchData('/resource')
    await postData('/resource', { name: 'test' })
    await deleteData('/resource')

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/resource', {})
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/resource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test' }),
    })
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/resource', { method: 'DELETE' })
  })
})
