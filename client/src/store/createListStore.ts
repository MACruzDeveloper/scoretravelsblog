import { create } from 'zustand'
import { getErrorMessage } from '@/utils/errors'

export interface ListState<T, P> {
  items: T[]
  loading: boolean
  error: string | undefined
  hasFetched: boolean
  // force: reload even if loaded; params: passed to the loader (e.g. the scope)
  fetch: (options?: { force?: boolean; params?: P }) => Promise<void>
}

/**
 * Store for a list loaded from the API (admin tables).
 * - Calls made while the same request is in flight share it (no duplicated requests)
 * - With several forced reloads only the latest answer is kept
 */
export const createListStore = <T, P = void>(loader: (params: P) => Promise<T[]>, label: string) => {
  let pending: { key: string; promise: Promise<void> } | null = null
  let lastKey: string | null = null
  let latestRequest = 0

  return create<ListState<T, P>>((set, get) => ({
    items: [],
    loading: false,
    error: undefined,
    hasFetched: false,
    fetch: ({ force = false, params } = {}) => {
      const key = JSON.stringify(params ?? null)
      if (!force && get().hasFetched && lastKey === key) return Promise.resolve()
      if (!force && pending?.key === key) return pending.promise

      const request = ++latestRequest
      set({ loading: true })
      const promise = loader(params as P)
        .then((items) => {
          if (request === latestRequest) set({ items, loading: false, error: undefined, hasFetched: true })
        })
        .catch((error) => {
          if (request === latestRequest) set({ error: getErrorMessage(error, `Could not load ${label}`), loading: false })
        })
        .finally(() => {
          if (pending?.promise === promise) pending = null
        })
      pending = { key, promise }
      lastKey = key
      return promise
    },
  }))
}
