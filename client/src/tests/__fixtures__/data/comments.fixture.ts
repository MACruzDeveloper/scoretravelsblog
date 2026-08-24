/**
 * Mock data fixtures para comentarios
 */

export interface Comment {
  id: string
  experienceId: string
  userId: string
  text: string
  rating: number
  createdAt: string
}

export const createComment = (overrides?: Partial<Comment>): Comment => ({
  id: '1',
  experienceId: '1',
  userId: '1',
  text: 'Amazing experience!',
  rating: 5,
  createdAt: '2024-01-15T10:00:00Z',
  ...overrides,
})

export const mockComments: Comment[] = [
  createComment({
    id: '1',
    experienceId: '1',
    text: 'Beautiful beach, highly recommend!',
    rating: 5,
  }),
  createComment({
    id: '2',
    experienceId: '1',
    text: 'Good spot, but crowded on weekends',
    rating: 4,
  }),
  createComment({
    id: '3',
    experienceId: '2',
    text: 'Unforgettable safari experience',
    rating: 5,
  }),
]
