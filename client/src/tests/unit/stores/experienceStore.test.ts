import { afterEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { paginated } from '@/mocks/handlers'
import { API } from '@/config'
import { useExperienceStore } from '@store/experienceStore'

const initialState: Partial<ReturnType<typeof useExperienceStore.getState>> = {
  experiences: [],
  loading: false,
  error: undefined,
  hasFetched: false,
}

afterEach(() => {
  useExperienceStore.setState(initialState)
})

describe('useExperienceStore', () => {
  it('loads experiences from the API', async () => {
    await useExperienceStore.getState().fetchExperiences()

    const state = useExperienceStore.getState()
    expect(state.experiences).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.hasFetched).toBe(true)
    expect(state.error).toBeUndefined()
  })

  it('loads every page for the admin table', async () => {
    const pagesRequested: string[] = []
    server.use(
      http.get(`${API}/experiences`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page'))
        pagesRequested.push(String(page))
        const items = page === 1 ? [{ _id: 'a', title: 'A' }] : [{ _id: 'b', title: 'B' }]
        return HttpResponse.json(paginated(items, { page, limit: 1, total: 2 }))
      })
    )

    await useExperienceStore.getState().fetchExperiences()

    expect(pagesRequested).toEqual(['1', '2'])
    expect(useExperienceStore.getState().experiences.map(({ _id }) => _id)).toEqual(['a', 'b'])
  })

  it('does not fetch again when data has already been loaded', async () => {
    useExperienceStore.setState({ ...initialState, hasFetched: true })

    await useExperienceStore.getState().fetchExperiences()

    expect(useExperienceStore.getState().experiences).toEqual([])
  })
})
