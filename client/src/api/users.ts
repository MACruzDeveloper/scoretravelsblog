import { deleteData, getData, patchData } from '@/utils/utils'
import { API } from '@/config'
import type { Role, User } from './types'

export const listUsers = async () => (await getData<User[]>(`${API}/users`)).data

export const updateUser = async (id: string, data: { username?: string; role?: Role }) => {
  await patchData(`${API}/users/${id}`, data)
}

export const deleteUser = async (id: string) => {
  await deleteData(`${API}/users/${id}`)
}
