import { create } from 'zustand'
import { getData } from '../utils/utils'

import { URL } from '../config'

export interface Cat {
  readonly _id: string
  name: string
  continent?: string
}

interface CategoriesState {
  cats: Cat[]
  loading: boolean
  error: string | undefined
  hasFetched: boolean
  fetchCats: () => Promise<void>
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  cats: [],
  loading: false,
  error: undefined,
  hasFetched: false,
  fetchCats: async () => {
    const { hasFetched } = get()
    if (hasFetched) return

    set({ loading: true })
    try {
      const response = await getData(`${URL}/admin/categories`)
      set({ cats: response.data, loading: false, error: undefined, hasFetched: true })
    } catch (error: any) {
      set({ error: error.message, loading: false, hasFetched: true })
    }
  }
}))
