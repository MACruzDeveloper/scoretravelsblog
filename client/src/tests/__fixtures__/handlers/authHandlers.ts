/**
 * MSW handlers para autenticación
 * Mock de endpoints: POST /login, POST /register, POST /logout
 */

import { http, HttpResponse } from 'msw'
import { mockUsers, mockTokens } from '../data/users.fixture'
import { URL } from '@/config'

export const authHandlers = [
  // POST /login
  http.post(`${URL}/login`, async ({ request }) => {
    const body = await request.json()
    const { email, password } = body as { email: string; password: string }

    // Mock validation
    if (email === mockUsers.regularUser.email && password === 'password123') {
      return HttpResponse.json(
        {
          success: true,
          data: {
            token: mockTokens.validToken,
            user: mockUsers.regularUser,
          },
        },
        { status: 200 }
      )
    }

    if (email === mockUsers.adminUser.email && password === 'admin123') {
      return HttpResponse.json(
        {
          success: true,
          data: {
            token: mockTokens.adminToken,
            user: mockUsers.adminUser,
          },
        },
        { status: 200 }
      )
    }

    return HttpResponse.json(
      {
        success: false,
        message: 'Invalid credentials',
      },
      { status: 401 }
    )
  }),

  // POST /register
  http.post(`${URL}/register`, async ({ request }) => {
    const body = await request.json()
    const { email, name, password } = body as {
      email: string
      name: string
      password: string
    }

    if (!email || !name || !password) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    const newUser = {
      id: '999',
      email,
      name,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          token: mockTokens.validToken,
          user: newUser,
        },
      },
      { status: 201 }
    )
  }),

  // POST /logout
  http.post(`${URL}/logout`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    )
  }),
]
