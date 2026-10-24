import { describe, expect, it, vi } from 'vitest'
import { createListStore } from '@/store/createListStore'

// A promise the test resolves when it wants
const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => { resolve = res })
  return { promise, resolve }
}

describe('createListStore', () => {
  it('loads the list once and keeps it', async () => {
    const loader = vi.fn(async () => ['a', 'b'])
    const useStore = createListStore<string>(loader, 'letters')

    await useStore.getState().fetch()
    await useStore.getState().fetch()

    expect(useStore.getState()).toMatchObject({ items: ['a', 'b'], loading: false, hasFetched: true, error: undefined })
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('shares a request already in flight instead of duplicating it', async () => {
    const pending = deferred<string[]>()
    const loader = vi.fn(() => pending.promise)
    const useStore = createListStore<string>(loader, 'letters')

    const first = useStore.getState().fetch()
    const second = useStore.getState().fetch()
    pending.resolve(['a'])
    await Promise.all([first, second])

    expect(loader).toHaveBeenCalledTimes(1)
    expect(useStore.getState().items).toEqual(['a'])
  })

  it('keeps only the latest answer when reloads overlap', async () => {
    const slow = deferred<string[]>()
    const fast = deferred<string[]>()
    const loader = vi.fn().mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise)
    const useStore = createListStore<string>(loader, 'letters')

    const old = useStore.getState().fetch({ force: true })
    const latest = useStore.getState().fetch({ force: true })
    fast.resolve(['new'])
    await latest
    slow.resolve(['old'])
    await old

    expect(useStore.getState().items).toEqual(['new'])
  })

  it('reloads when forced or when the params change', async () => {
    const loader = vi.fn(async (scope: string) => [scope])
    const useStore = createListStore<string, string>(loader, 'letters')

    await useStore.getState().fetch({ params: 'mine' })
    await useStore.getState().fetch({ params: 'all' })
    await useStore.getState().fetch({ params: 'all', force: true })

    expect(loader.mock.calls).toEqual([['mine'], ['all'], ['all']])
    expect(useStore.getState().items).toEqual(['all'])
  })

  it('stores the error message', async () => {
    const useStore = createListStore<string>(async () => { throw new Error('Server down') }, 'letters')

    await useStore.getState().fetch()

    expect(useStore.getState()).toMatchObject({ error: 'Server down', loading: false, hasFetched: false })
  })
})
