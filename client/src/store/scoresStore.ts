import { create } from 'zustand'
import { listScores } from '@/api/scores'
import { getErrorMessage } from '@/utils/errors'

import type { Score } from '@/api/types'

// Type defined in api/types
export type ScoreType = Score

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
      set({ scores: await listScores(), loading: false, error: undefined, hasFetched: true })
    } catch (error) {
      set({ error: getErrorMessage(error, 'Could not load scores'), loading: false })
    }
  }
}))
