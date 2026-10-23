import { http, HttpResponse } from 'msw'
import { URL } from '../config'

export const handlers = [
  http.get(`${URL}/admin/categories`, async () => {
    return HttpResponse.json([])
  }),

  http.get(`${URL}/admin/experiences`, async () => {
    return HttpResponse.json([])
  }),

  http.get(`${URL}/admin/experiences/:id`, async ({ params }) => {
    return HttpResponse.json({
        _id: params.id,
        title: 'Test experience',
        date: new Date().toISOString(),
        content: 'Test content',
    })
  }),

  http.get(`${URL}/admin/scores`, async () => {
    return HttpResponse.json([])
  }),

  http.get(`${URL}/admin/comments`, async () => {
    return HttpResponse.json([])
  })
]
