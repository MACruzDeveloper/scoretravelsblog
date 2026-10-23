import { http, HttpResponse } from 'msw'
import { API } from '../config'

export const handlers = [
  http.get(`${API}/categories`, async () => {
    return HttpResponse.json([])
  }),

  http.get(`${API}/experiences`, async () => {
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

  http.get(`${API}/scores`, async () => {
    return HttpResponse.json([])
  }),

  http.get(`${API}/comments`, async () => {
    return HttpResponse.json([])
  })
]
