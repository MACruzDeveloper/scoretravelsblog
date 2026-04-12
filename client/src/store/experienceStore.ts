import { create } from 'zustand'
import { getData } from '@utils/utils'

import { URL } from '../config'

export interface Experience {
  _id: string
  user?: string,
  title: string,
  category?: string,
  date?: Date,
  year?: number,
  image?: string,
  content?: string,
  score?: number
}

interface ExperienceState {
  experiences: Experience[]
  loading: boolean
  error: string | undefined
  hasFetched: boolean
  fetchExperiences: () => Promise<void>
}

export const useExperienceStore = create<ExperienceState>((set, get) => ({
  experiences: [],
  loading: false,
  error: undefined,
  hasFetched: false,
  fetchExperiences: async () => {
    const { hasFetched } = get()
    if (hasFetched) return // Avoid duplicate fetches

    set({ loading: true })
    try {
      const response = await getData(`${URL}/admin/experiences`)
      set({ experiences: response.data, loading: false, error: undefined, hasFetched: true })
    } catch (error: any) {
      set({ error: error.message, loading: false, hasFetched: true })
    }
  }
}))