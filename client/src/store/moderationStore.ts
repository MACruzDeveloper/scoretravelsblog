import { create } from 'zustand'
import { listExperiences } from '@/api/experiences'

interface ModerationState {
  // Experiences waiting for review (admin)
  pendingCount: number
  refreshPendingCount: () => Promise<void>
}

export const useModerationStore = create<ModerationState>((set) => ({
  pendingCount: 0,
  refreshPendingCount: async () => {
    try {
      const { total } = await listExperiences({ scope: 'all', status: 'pending', limit: 1 })
      set({ pendingCount: total })
    } catch (error) {
      console.log(error)
    }
  },
}))
