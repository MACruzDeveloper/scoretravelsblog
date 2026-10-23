import { deleteData, getData, patchData, postData } from '@/utils/utils'
import { API } from '@/config'
import type { Category } from './types'

export type CategoryData = { name: string; description?: string }

export const listCategories = async () => (await getData<Category[]>(`${API}/categories`)).data

export const createCategory = async (data: CategoryData) => (await postData<Category>(`${API}/categories`, data)).data

// Renaming also renames the category in its experiences
export const updateCategory = async (id: string, data: CategoryData) =>
  (await patchData<{ updated: Category; renamedInExperiences: number }>(`${API}/categories/${id}`, data)).data

// Fails (409) while experiences use it
export const deleteCategory = async (id: string) => {
  await deleteData(`${API}/categories/${id}`)
}
