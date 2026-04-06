import { create } from 'zustand'
import { getData } from '../utils/utils'

import { URL } from '../config'

export interface UserType {
  readonly _id: string
  email: string
  password: string
  role?: string
}

interface UsersState {
  users: UserType[]
  loading: boolean
  error: string | undefined
  hasFetched: boolean
  fetchUsers: () => Promise<void>
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: undefined,
  hasFetched: false,
  fetchUsers: async () => {
    const { hasFetched } = get()
    if (hasFetched) return

    set({ loading: true })
    try {
      const response = await getData(`${URL}/admin/users`)
      set({ users: response.data, loading: false, error: undefined, hasFetched: true })
    } catch (error: any) {
      set({ error: error.message, loading: false, hasFetched: true })
    }
  }
}))
