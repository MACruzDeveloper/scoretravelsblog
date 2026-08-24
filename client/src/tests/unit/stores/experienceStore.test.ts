import { afterEach, describe, expect, it } from 'vitest'
import { useExperienceStore } from '@store/experienceStore'

const initialState: Partial<ReturnType<typeof useExperienceStore.getState>> = {
  experiences: [],
  loading: false,
  error: undefined,
  hasFetched: false,
}

afterEach(() => {
  useExperienceStore.setState(initialState)
})

describe('useExperienceStore', () => {
  it('loads experiences from the API', async () => {
    await useExperienceStore.getState().fetchExperiences()

    const state = useExperienceStore.getState()
    expect(state.experiences).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.hasFetched).toBe(true)
    expect(state.error).toBeUndefined()
  })

  it('does not fetch again when data has already been loaded', async () => {
    useExperienceStore.setState({ ...initialState, hasFetched: true })

    await useExperienceStore.getState().fetchExperiences()

    expect(useExperienceStore.getState().experiences).toEqual([])
  })
})
