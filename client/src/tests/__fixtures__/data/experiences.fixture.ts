/**
 * Mock data fixtures para experiencias
 * Usado en tests para generar datos consistentes sin llamadas a API
 */

export interface Experience {
  id: string
  title: string
  description: string
  category: string
  city: string
  score: number
  images: string[]
  createdAt: string
  updatedAt: string
}

export const createExperience = (overrides?: Partial<Experience>): Experience => ({
  id: '1',
  title: 'Beautiful Beach in Aruba',
  description: 'An amazing tropical beach experience',
  category: 'beaches',
  city: 'Aruba',
  score: 9.5,
  images: ['image1.jpg', 'image2.jpg'],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  ...overrides,
})

export const mockExperiences: Experience[] = [
  createExperience({
    id: '1',
    title: 'Eagle Beach - Aruba',
    score: 9.5,
    city: 'Aruba',
    category: 'beaches',
  }),
  createExperience({
    id: '2',
    title: 'African Elephant Safari',
    score: 9.2,
    city: 'Kenya',
    category: 'wildlife',
    title: 'African Elephant Safari',
  }),
  createExperience({
    id: '3',
    title: 'Paris Street Walk',
    score: 8.8,
    city: 'Paris',
    category: 'culture',
  }),
  createExperience({
    id: '4',
    title: 'Tokyo Night Life',
    score: 8.5,
    city: 'Tokyo',
    category: 'city',
  }),
  createExperience({
    id: '5',
    title: 'Swiss Alps Hiking',
    score: 9.0,
    city: 'Switzerland',
    category: 'adventure',
  }),
]
