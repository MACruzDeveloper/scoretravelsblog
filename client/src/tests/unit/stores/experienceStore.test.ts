import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { paginated } from '@/mocks/handlers'
import { API } from '@/config'
import { useExperienceStore } from '@store/experienceStore'

describe('useExperienceStore', () => {
  it('loads every page of the requested scope for the admin table', async () => {
    const requests: Array<{ page: string | null; scope: string | null }> = []
    server.use(
      http.get(`${API}/experiences`, ({ request }) => {
        const query = new URL(request.url).searchParams
        const page = Number(query.get('page'))
        requests.push({ page: query.get('page'), scope: query.get('scope') })
        const items = page === 1 ? [{ _id: 'a', title: 'A' }] : [{ _id: 'b', title: 'B' }]
        return HttpResponse.json(paginated(items, { page, limit: 1, total: 2 }))
      })
    )

    await useExperienceStore.getState().fetch({ force: true, params: 'mine' })

    expect(requests).toEqual([{ page: '1', scope: 'mine' }, { page: '2', scope: 'mine' }])
    expect(useExperienceStore.getState().items.map(({ _id }) => _id)).toEqual(['a', 'b'])
  })
})
