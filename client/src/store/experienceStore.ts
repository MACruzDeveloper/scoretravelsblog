import { create } from 'zustand'

import { listAllExperiences, ExperienceScope } from '@/api/experiences'

export interface City {
  _id: string
  name: string
  country: string
  countryCode: string
  continent: string
  lat: number
  lng: number
}

export interface Experience {
  _id: string
  user?: string,
  title: string,
  category?: string,
  city?: City | string,
  date?: Date,
  year?: number,
  image?: string,
  images?: string[],
  content?: string,
  score?: number | null,
  votes?: number,
  status?: 'pending' | 'published' | 'rejected',
  rejectionReason?: string,
  lat?: number,
  lng?: number
}

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
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  }
}))