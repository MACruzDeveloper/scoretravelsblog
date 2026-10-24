import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { paginated } from '@/mocks/handlers'
import { API } from '@/config'
import {
  useBestExperiences,
  useLastExperiences,
  useTimelineExperiences,
} from '@hooks/useExperienceHooks'

// Answers the list endpoint and records the query string it received
const mockList = (items: object[]) => {
  const requests: URLSearchParams[] = []
  server.use(
    http.get(`${API}/experiences`, ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return HttpResponse.json(paginated(items))
    })
  )
  return requests
}

describe('useExperienceHooks', () => {
  it('asks the server for the three most recent experiences', async () => {
    const requests = mockList([{ _id: 'recent', title: 'Recent' }])
    const { result } = renderHook(() => useLastExperiences())

    await waitFor(() => expect(result.current.lastExperiences).toHaveLength(1))
    expect(requests[0].get('sort')).toBe('-date')
    expect(requests[0].get('limit')).toBe('3')
  })

  it('asks the server for the three highest scored experiences', async () => {
    const requests = mockList([{ _id: 'best', title: 'Best', score: 5 }])
    const { result } = renderHook(() => useBestExperiences())

    await waitFor(() => expect(result.current.bestExperiences.map(({ _id }) => _id)).toEqual(['best']))
    expect(requests[0].get('sort')).toBe('-score')
    expect(requests[0].get('minScore')).toBe('1')
    expect(requests[0].get('limit')).toBe('3')
  })

  it('returns the timeline computed by the server', async () => {
    server.use(
      http.get(`${API}/experiences/timeline`, () =>
        HttpResponse.json([{ _id: 'a', title: 'A', year: 2023 }, { _id: 'b', title: 'B', year: 2024 }])
      )
    )
    const { result } = renderHook(() => useTimelineExperiences())

    await waitFor(() => expect(result.current.timelineExperiences.map(({ year }) => year)).toEqual([2023, 2024]))
  })
})
