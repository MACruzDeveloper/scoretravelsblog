import { create } from 'zustand'
import { listComments } from '@/api/comments'
import { getErrorMessage } from '@/utils/errors'

import type { Comment } from '@/api/types'

// Type defined in api/types
export type { Comment } from '@/api/types'

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
      set({ comments: await listComments(), loading: false, error: undefined, hasFetched: true })
    } catch (error) {
      set({ error: getErrorMessage(error, 'Could not load comments'), loading: false })
    }
  }
}))
