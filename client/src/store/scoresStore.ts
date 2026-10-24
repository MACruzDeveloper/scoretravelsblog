import { createListStore } from './createListStore'
import { listScores } from '@/api/scores'
import type { Score } from '@/api/types'

// Every vote, for the admin
export const useScoresStore = createListStore<Score>(listScores, 'scores')
