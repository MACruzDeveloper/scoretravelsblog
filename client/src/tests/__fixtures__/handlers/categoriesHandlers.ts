/**
 * MSW handlers para categorías
 * Mock de endpoints: GET /categories
 */

import { http, HttpResponse } from 'msw'
import { mockCategories } from '../data/categories.fixture'
import { URL } from '@/config'

export const categoriesHandlers = [
  // GET /categories
  http.get(`${URL}/categories`, () => {
    return HttpResponse.json(
      {
        success: true,
        data: mockCategories,
      },
      { status: 200 }
    )
  }),

  // GET /categories/:id
  http.get(`${URL}/categories/:id`, ({ params }) => {
    const { id } = params
    const category = mockCategories.find((cat) => cat.id === id)

    if (!category) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Category not found',
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 200 }
    )
  }),
]
