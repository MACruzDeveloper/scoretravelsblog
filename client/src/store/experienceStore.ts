import { create } from 'zustand'
import { getErrorMessage } from '@/utils/errors'
import { listAllExperiences, ExperienceScope } from '@/api/experiences'

// Types live in api/types; re-exported here for the components that import them from the store
export type { City, Experience } from '@/api/types'
import type { Experience } from '@/api/types'

interface ExperienceState {
  experiences: Experience[]
  loading: boolean
  error: string | undefined
  hasFetched: boolean
  // 'mine' for a user's own experiences, 'all' for the admin
  fetchExperiences: (force?: boolean, scope?: ExperienceScope) => Promise<void>
}

export const useExperienceStore = create<ExperienceState>((set, get) => ({
  experiences: [],
  loading: false,
  error: undefined,
  hasFetched: false,
  fetchExperiences: async (force = false, scope: ExperienceScope = 'all') => {
    const { hasFetched } = get()
    if (hasFetched && !force) return // Avoid duplicate fetches unless forced

    set({ loading: true })
    try {
      // Used by the admin table, which sorts and paginates on the client
      const experiences = await listAllExperiences({ scope })
      set({ experiences, loading: false, error: undefined, hasFetched: true })
    } catch (error) {
      set({ error: getErrorMessage(error, 'Could not load experiences'), loading: false })
    }
  }
}))