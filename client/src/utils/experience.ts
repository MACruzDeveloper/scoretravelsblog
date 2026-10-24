import type { City, Experience } from '@/api/types'

// The API populates `city`; while editing it can be a bare id. Returns the city only when populated
export const cityOf = (experience: Pick<Experience, 'city'>): City | undefined =>
  experience.city && typeof experience.city === 'object' ? experience.city : undefined

// Cover image: first of the gallery, or the single legacy `image`
export const coverOf = (experience: Pick<Experience, 'image' | 'images'>): string | undefined =>
  experience.images?.find(Boolean) || experience.image || undefined
