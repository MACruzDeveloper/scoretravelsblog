import { useEffect, useState } from 'react'

type QueryState<T> = {
  data: T | undefined
  loading: boolean
  error: string | undefined
}

// Identical requests made at the same time share one network call
const inFlight = new Map<string, Promise<unknown>>()

// Tests call this between cases so a pending request never leaks into the next one
export const clearPendingQueries = () => inFlight.clear()

const dedupe = <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  const pending = inFlight.get(key)
  if (pending) return pending as Promise<T>
  const request = fetcher().finally(() => inFlight.delete(key))
  inFlight.set(key, request)
  return request
}

/**
 * Runs `fetcher` whenever `key` changes and keeps only the latest answer,
 * so a slow old response never overwrites a newer one. Pass `null` to skip.
 */
export const useApiQuery = <T>(key: string | null, fetcher: () => Promise<T>): QueryState<T> => {
  const [state, setState] = useState<QueryState<T>>({ data: undefined, loading: key !== null, error: undefined })

  useEffect(() => {
    if (key === null) return
    let active = true
    setState((prev) => ({ ...prev, loading: true, error: undefined }))
    dedupe(key, fetcher)
      .then((data) => { if (active) setState({ data, loading: false, error: undefined }) })
      .catch((error: unknown) => {
        if (active) setState({ data: undefined, loading: false, error: error instanceof Error ? error.message : 'Request failed' })
      })
    return () => { active = false }
    // The key identifies the request; the fetcher is recreated on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
