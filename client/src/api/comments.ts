import { deleteData, getData, postData } from '@/utils/utils'
import { API } from '@/config'
import type { Comment } from './types'

// Every comment, for moderation (admin)
export const listComments = async () => (await getData<Comment[]>(`${API}/comments`)).data

// The author comes from the session
export const addComment = async (experience: string, content: string) =>
  (await postData<Comment>(`${API}/comments`, { experience, content })).data

export const deleteComment = async (id: string) => {
  await deleteData(`${API}/comments/${id}`)
}
