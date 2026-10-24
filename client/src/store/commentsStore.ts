import { createListStore } from './createListStore'
import { listComments } from '@/api/comments'
import type { Comment } from '@/api/types'

// Every comment, for the admin
export const useCommentsStore = createListStore<Comment>(listComments, 'comments')
