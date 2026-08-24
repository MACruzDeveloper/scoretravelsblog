import { afterEach, describe, expect, it } from 'vitest'
import { useScoresStore } from '@store/scoresStore'

afterEach(() => {
  useScoresStore.setState({
    scores: [],
    loading: false,
    error: undefined,
    hasFetched: false,
  })
})

describe('useScoresStore', () => {
  it('loads scores from the API', async () => {
    await useScoresStore.getState().fetchScores()

    const state = useScoresStore.getState()
    expect(state.scores).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.hasFetched).toBe(true)
  })
})
