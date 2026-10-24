import { http, HttpResponse } from 'msw'
import { API } from '../config'

/**
 * Paginated list as returned by GET /api/experiences
 * @param {object[]} items
 * @param {{ page?: number, limit?: number, total?: number }} [options]
 */
export const paginated = (items = [], { page = 1, limit = 12, total = items.length } = {}) => ({
  items,
  total,
  page,
  limit,
  pages: Math.max(1, Math.ceil(total / limit)),
})

export const handlers = [
  http.get(`${API}/categories`, async () => {
    return HttpResponse.json([])
  }),

  http.get(`${API}/experiences`, async () => {
    return HttpResponse.json(paginated())
  }),

  http.get(`${API}/experiences/facets`, async () => {
    return HttpResponse.json({ categories: [], cities: [], years: [] })
  }),

  http.get(`${API}/experiences/timeline`, async () => {
    return HttpResponse.json([])
  }),

  http.get(`${API}/experiences/:id`, async ({ params }) => {
    return HttpResponse.json({
        _id: params.id,
        title: 'Test experience',
        date: new Date().toISOString(),
        content: 'Test content',
    })
  }),

  http.get(`${API}/experiences/:id/comments`, async () => {
    return HttpResponse.json([])
  }),

  http.get(`${API}/scores`, async () => {
    return HttpResponse.json([])
  }),

  http.get(`${API}/comments`, async () => {
    return HttpResponse.json([])
  })
]
