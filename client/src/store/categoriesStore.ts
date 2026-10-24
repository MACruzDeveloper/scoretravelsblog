import { createListStore } from './createListStore'
import { listCategories } from '@/api/categories'
import type { Category } from '@/api/types'

export const useCategoriesStore = createListStore<Category>(listCategories, 'categories')
