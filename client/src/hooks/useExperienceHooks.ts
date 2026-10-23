import { useApiQuery } from './useApiQuery'
import { listExperiences, getTimeline } from '@/api/experiences'

const NUM_DISPLAY = 3

export const useLastExperiences = () => {
  const { data, loading, error } = useApiQuery('experiences:last', () =>
    listExperiences({ sort: '-date', limit: NUM_DISPLAY })
  )
  return { lastExperiences: data?.items ?? [], loading, error }
}

// Also used by the map, which shares the same request
export const useBestExperiences = () => {
  const { data, loading, error } = useApiQuery('experiences:best', () =>
    listExperiences({ sort: '-score', minScore: 1, limit: NUM_DISPLAY })
  )
  return { bestExperiences: data?.items ?? [], loading, error }
}

// Best scored experience of each year, computed by the server
export const useTimelineExperiences = () => {
  const { data, loading, error } = useApiQuery('experiences:timeline', () => getTimeline())
  return { timelineExperiences: data ?? [], loading, error }
}
