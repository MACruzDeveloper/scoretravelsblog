import { create } from 'zustand'
import { getData } from '@utils/utils'

import { URL } from '../config'

export interface Comment {
  readonly _id: string
  user?: string
  experience: string
  date: Date
  content?: string
}

interface CommentsState {
  comments: Comment[]
  loading: boolean
  error: string | undefined
  hasFetched: boolean
  fetchComments: (force?: boolean) => Promise<void>
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  comments: [],
  loading: false,
  error: undefined,
  hasFetched: false,
  fetchComments: async (force = false) => {
    const { hasFetched } = get()
    if (hasFetched && !force) return

    set({ loading: true })
    try {
      const response = await getData(`${URL}/admin/comments`)
      set({ comments: response.data, loading: false, error: undefined, hasFetched: true })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  }
}))
