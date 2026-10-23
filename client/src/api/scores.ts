import { deleteData, getData, postData } from '@/utils/utils'
import { API } from '@/config'
import type { Score } from './types'

export type VoteResult = { score: number; experienceScore: number | null; votes: number }

// Every vote (admin)
export const listScores = async () => (await getData<Score[]>(`${API}/scores`)).data

// One vote per user: voting again replaces the previous vote
export const vote = async (experience: string, score: number) =>
  (await postData<VoteResult>(`${API}/scores`, { experience, score })).data

export const deleteScore = async (id: string) => {
  await deleteData(`${API}/scores/${id}`)
}
