import { afterEach, describe, expect, it } from 'vitest'
import { useCategoriesStore } from '@store/categoriesStore'

afterEach(() => {
  useCategoriesStore.setState({
    cats: [],
    loading: false,
    error: undefined,
    hasFetched: false,
  })
})

describe('useCategoriesStore', () => {
  it('loads categories from the API', async () => {
    await useCategoriesStore.getState().fetchCats()

    const state = useCategoriesStore.getState()
    expect(state.cats).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.hasFetched).toBe(true)
    expect(state.error).toBeUndefined()
  })

  it('supports a forced refetch', async () => {
    useCategoriesStore.setState({
      cats: [],
      loading: false,
      error: undefined,
      hasFetched: true,
    })

    await useCategoriesStore.getState().fetchCats(true)

    expect(useCategoriesStore.getState().hasFetched).toBe(true)
  })
})
