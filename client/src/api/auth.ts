import { getData, postData } from '@/utils/utils'
import { API } from '@/config'
import type { Session, User } from './types'

export type RegisterData = { username: string; email: string; password: string; password2: string }

export const login = async (email: string, password: string) =>
  (await postData<Session>(`${API}/auth/login`, { email, password })).data

// Registering also signs the user in
export const register = async (data: RegisterData) => (await postData<Session>(`${API}/auth/register`, data)).data

export const getCurrentUser = async () => (await getData<{ user: User }>(`${API}/auth/me`)).data.user
