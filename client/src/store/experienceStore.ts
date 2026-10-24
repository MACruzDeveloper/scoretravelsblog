import { createListStore } from './createListStore'
import { listAllExperiences, ExperienceScope } from '@/api/experiences'
import type { Experience } from '@/api/types'

// Admin table: the user's own experiences ('mine') or every experience ('all')
export const useExperienceStore = createListStore<Experience, ExperienceScope>(
  (scope) => listAllExperiences({ scope }),
  'experiences'
)
