import { afterEach, describe, expect, it } from 'vitest'
import { useCommentsStore } from '@store/commentsStore'

afterEach(() => {
  useCommentsStore.setState({
    comments: [],
    loading: false,
    error: undefined,
    hasFetched: false,
  })
})

describe('useCommentsStore', () => {
  it('loads comments from the API', async () => {
    await useCommentsStore.getState().fetchComments()

    const state = useCommentsStore.getState()
    expect(state.comments).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.hasFetched).toBe(true)
  })
})
