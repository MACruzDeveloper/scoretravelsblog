import { deleteData, getData, patchData, postForm } from '@/utils/utils'
import { API } from '@/config'
import type { Image } from './types'

// Newest first
export const listImages = async () => (await getData<{ images: Image[] }>(`${API}/images`)).data.images

// Any signed in user can upload; the server converts the image to AVIF and names it
export const uploadImage = async (file: File, title = '') => {
  const form = new FormData()
  form.append('file', file)
  form.append('title', title)
  return (await postForm<{ filename: string; title: string }>(`${API}/images`, form)).data
}

// Featured images appear in the home carousel
export const setImageFeatured = async (id: string, featured: boolean) => {
  await patchData(`${API}/images/${id}`, { featured })
}

// Fails (409) while an experience uses it
export const deleteImage = async (id: string) => {
  await deleteData(`${API}/images/${id}`)
}
