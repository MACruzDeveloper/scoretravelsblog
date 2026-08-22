import { create } from 'zustand'
import { getData } from '@utils/utils'

import { URL } from '../config'

export interface ScoreType {
  readonly _id: string
  experience: string
  user: string
  score: number
}

interface ScoresState {
  scores: ScoreType[]
  loading: boolean
  error: string | undefined
  hasFetched: boolean
  fetchScores: (force?: boolean) => Promise<void>
}

export const useScoresStore = create<ScoresState>((set, get) => ({
  scores: [],
  loading: false,
  error: undefined,
  hasFetched: false,
  fetchScores: async (force = false) => {
    const { hasFetched } = get()
    if (hasFetched && !force) return

    set({ loading: true })
    try {
      const response = await getData(`${URL}/admin/scores`)
      set({ scores: response.data, loading: false, error: undefined, hasFetched: true })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  }
}))
