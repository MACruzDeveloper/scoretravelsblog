/**
 * Mock data fixtures para usuarios y autenticación
 */

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: string
}

export const createUser = (overrides?: Partial<User>): User => ({
  id: '1',
  email: 'user@test.com',
  name: 'Test User',
  role: 'user',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createAuthToken = (userId: string = '1'): string => {
  // Mock JWT token formato: header.payload.signature
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ userId, exp: Date.now() + 3600000 }))
  const signature = 'mock_signature'
  return `${header}.${payload}.${signature}`
}

export const mockUsers = {
  regularUser: createUser({
    id: '1',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user',
  }),
  adminUser: createUser({
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  }),
}

export const mockTokens = {
  validToken: createAuthToken('1'),
  adminToken: createAuthToken('2'),
}
