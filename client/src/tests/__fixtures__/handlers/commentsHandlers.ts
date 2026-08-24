/**
 * MSW handlers para comentarios
 * Mock de endpoints: GET /comments, GET /comments/:experienceId, POST /comments
 */

import { http, HttpResponse } from 'msw'
import { mockComments } from '../data/comments.fixture'
import { URL } from '@/config'

export const commentsHandlers = [
  // GET /comments (todos)
  http.get(`${URL}/comments`, () => {
    return HttpResponse.json(
      {
        success: true,
        data: mockComments,
      },
      { status: 200 }
    )
  }),

  // GET /comments/:experienceId
  http.get(`${URL}/comments/:experienceId`, ({ params }) => {
    const { experienceId } = params
    const comments = mockComments.filter((c) => c.experienceId === experienceId)

    return HttpResponse.json(
      {
        success: true,
        data: comments,
      },
      { status: 200 }
    )
  }),

  // POST /comments (crear nuevo)
  http.post(`${URL}/comments`, async ({ request }) => {
    const body = await request.json()
    const { experienceId, userId, text, rating } = body as {
      experienceId: string
      userId: string
      text: string
      rating: number
    }

    if (!experienceId || !text || rating === undefined) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const newComment = {
      id: String(mockComments.length + 1),
      experienceId,
      userId: userId || '1',
      text,
      rating,
      createdAt: new Date().toISOString(),
    }

    return HttpResponse.json(
      {
        success: true,
        data: newComment,
      },
      { status: 201 }
    )
  }),
]
