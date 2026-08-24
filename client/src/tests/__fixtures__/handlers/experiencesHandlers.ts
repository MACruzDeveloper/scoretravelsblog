/**
 * MSW handlers para experiencias
 * Mock de endpoints: GET /experiences, GET /experiences/:id, POST, PUT, DELETE
 */

import { http, HttpResponse } from 'msw'
import { mockExperiences } from '../data/experiences.fixture'
import { URL } from '@/config'

export const experiencesHandlers = [
  // GET /experiences
  http.get(`${URL}/experiences`, ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const city = url.searchParams.get('city')
    const search = url.searchParams.get('search')

    let filtered = mockExperiences

    if (category) {
      filtered = filtered.filter((exp) => exp.category === category)
    }
    if (city) {
      filtered = filtered.filter((exp) => exp.city === city)
    }
    if (search) {
      filtered = filtered.filter((exp) =>
        exp.title.toLowerCase().includes(search.toLowerCase())
      )
    }

    return HttpResponse.json(
      {
        success: true,
        data: filtered,
      },
      { status: 200 }
    )
  }),

  // GET /experiences/:id
  http.get(`${URL}/experiences/:id`, ({ params }) => {
    const { id } = params
    const experience = mockExperiences.find((exp) => exp.id === id)

    if (!experience) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Experience not found',
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(
      {
        success: true,
        data: experience,
      },
      { status: 200 }
    )
  }),

  // POST /experiences (crear nueva)
  http.post(`${URL}/experiences`, async ({ request }) => {
    const body = await request.json()
    const { title, description, category, city, score } = body as {
      title: string
      description: string
      category: string
      city: string
      score: number
    }

    if (!title || !category || !city) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const newExp = {
      id: String(mockExperiences.length + 1),
      title,
      description: description || '',
      category,
      city,
      score: score || 0,
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json(
      {
        success: true,
        data: newExp,
      },
      { status: 201 }
    )
  }),

  // PUT /experiences/:id (editar)
  http.put(`${URL}/experiences/:id`, async ({ params, request }) => {
    const { id } = params
    const body = await request.json()
    const experience = mockExperiences.find((exp) => exp.id === id)

    if (!experience) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Experience not found',
        },
        { status: 404 }
      )
    }

    const updated = { ...experience, ...body, updatedAt: new Date().toISOString() }

    return HttpResponse.json(
      {
        success: true,
        data: updated,
      },
      { status: 200 }
    )
  }),

  // DELETE /experiences/:id
  http.delete(`${URL}/experiences/:id`, ({ params }) => {
    const { id } = params
    const experience = mockExperiences.find((exp) => exp.id === id)

    if (!experience) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Experience not found',
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(
      {
        success: true,
        message: 'Experience deleted',
      },
      { status: 200 }
    )
  }),
]
