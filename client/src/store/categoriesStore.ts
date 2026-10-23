import { create } from 'zustand'
import { listCategories } from '@/api/categories'
import { getErrorMessage } from '@/utils/errors'

import type { Category } from '@/api/types'

// Type defined in api/types
export type Cat = Category

interface CategoriesState {
  cats: Cat[]
  loading: boolean
  error: string | undefined
  hasFetched: boolean
  fetchCats: (force?: boolean) => Promise<void>
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  cats: [],
  loading: false,
  error: undefined,
  hasFetched: false,
  fetchCats: async (force = false) => {
    const { hasFetched } = get()
    if (hasFetched && !force) return

    set({ loading: true })
    try {
      set({ cats: await listCategories(), loading: false, error: undefined, hasFetched: true })
    } catch (error) {
      set({ error: getErrorMessage(error, 'Could not load categories'), loading: false })
    }
  }
}))
