import { afterEach, describe, expect, it, vi } from 'vitest'
import { shrinkImage } from '@/utils/shrinkImage'

const MB = 1024 * 1024
const fileOf = (bytes: number) => new File([new Uint8Array(bytes)], 'big.png', { type: 'image/png' })

// jsdom has no image decoding or canvas drawing: stands in for them, with the JPEG sizes given
const stubBrowser = ({ width, height, jpegSizes }: { width: number; height: number; jpegSizes: number[] }) => {
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ fillRect: vi.fn(), drawImage: vi.fn() }),
    toBlob: vi.fn((done: (blob: Blob) => void) => done(new Blob([new Uint8Array(jpegSizes.shift() ?? 0)]))),
  }
  vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width, height, close: vi.fn() })))
  vi.spyOn(document, 'createElement').mockReturnValue(canvas as unknown as HTMLElement)
  return canvas
}

describe('shrinkImage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('leaves small files as they are', async () => {
    const file = fileOf(MB / 2)
    expect(await shrinkImage(file)).toBe(file)
  })

  it('scales big photos down to 2000px on the longest side, as JPEG', async () => {
    const canvas = stubBrowser({ width: 8000, height: 4000, jpegSizes: [2 * MB] })

    const result = await shrinkImage(fileOf(6 * MB))

    expect([canvas.width, canvas.height]).toEqual([2000, 1000])
    expect(result.type).toBe('image/jpeg')
    expect(result.size).toBe(2 * MB)
  })

  it('lowers the quality until it fits the upload limit', async () => {
    const canvas = stubBrowser({ width: 2000, height: 2000, jpegSizes: [5 * MB, 3 * MB] })

    const result = await shrinkImage(fileOf(9 * MB))

    expect(canvas.toBlob).toHaveBeenCalledTimes(2)
    expect(result.size).toBe(3 * MB)
  })

  it('keeps the original when the browser cannot handle it', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => { throw new Error('unsupported') }))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const file = fileOf(6 * MB)

    expect(await shrinkImage(file)).toBe(file)
  })
})
