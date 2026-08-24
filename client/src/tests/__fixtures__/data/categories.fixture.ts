/**
 * Mock data fixtures para categorías
 */

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon?: string
}

export const createCategory = (overrides?: Partial<Category>): Category => ({
  id: '1',
  name: 'Beaches',
  slug: 'beaches',
  description: 'Beautiful beach destinations',
  icon: '🏖️',
  ...overrides,
})

export const mockCategories: Category[] = [
  createCategory({
    id: '1',
    name: 'Beaches',
    slug: 'beaches',
  }),
  createCategory({
    id: '2',
    name: 'Mountains',
    slug: 'mountains',
  }),
  createCategory({
    id: '3',
    name: 'Cities',
    slug: 'cities',
  }),
  createCategory({
    id: '4',
    name: 'Wildlife',
    slug: 'wildlife',
  }),
  createCategory({
    id: '5',
    name: 'Adventure',
    slug: 'adventure',
  }),
]
