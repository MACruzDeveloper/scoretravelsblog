import { deleteData, getData, patchData, postForm } from '@/utils/utils'
import { API } from '@/config'
import { shrinkImage } from '@/utils/shrinkImage'
import type { Image, LibraryImage } from './types'

// Newest first; `featured` only returns the home carousel images
export const listImages = async ({ featured = false } = {}) =>
  (await getData<{ images: Image[] }>(`${API}/images${featured ? '?featured=true' : ''}`)).data.images

// Admin: every image with the experience that uses it (null when none does)
export const listImageLibrary = async () =>
  (await getData<{ images: LibraryImage[] }>(`${API}/images/library`)).data.images

// Any signed in user can upload; the server converts the image to AVIF and names it
export const uploadImage = async (file: File, title = '') => {
  const form = new FormData()
  form.append('file', await shrinkImage(file))
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
