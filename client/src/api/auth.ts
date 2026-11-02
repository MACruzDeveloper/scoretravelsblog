import { getData, postData } from '@/utils/utils'
import { API } from '@/config'
import type { Session, User } from './types'

export type RegisterData = { username: string; email: string; password: string; password2: string }

export const login = async (email: string, password: string) =>
  (await postData<Session>(`${API}/auth/login`, { email, password })).data

// Registering also signs the user in
export const register = async (data: RegisterData) => (await postData<Session>(`${API}/auth/register`, data)).data

export type ChangePasswordData = { currentPassword: string; password: string; password2: string }

// Closes the other sessions and returns a new one for this device
export const changePassword = async (data: ChangePasswordData) =>
  (await postData<Session>(`${API}/auth/change-password`, data)).data

// Both return the message to show
export const forgotPassword = async (email: string) =>
  (await postData<{ message: string }>(`${API}/auth/forgot-password`, { email })).data.message

export const resetPassword = async (data: { token: string; password: string; password2: string }) =>
  (await postData<{ message: string }>(`${API}/auth/reset-password`, data)).data.message

export const getCurrentUser = async () => (await getData<{ user: User }>(`${API}/auth/me`)).data.user
