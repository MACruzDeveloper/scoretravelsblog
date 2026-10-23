import { deleteData, getData, patchData, postData } from '@/utils/utils'
import { API } from '@/config'
import type { City, Comment, Experience, ExperienceStatus } from './types'

export type { ExperienceStatus }

export type ExperienceSort = '-date' | 'date' | '-score' | 'score' | 'title' | '-title'
// 'public': published only; 'mine': own experiences (session); 'all': every experience (admin)
export type ExperienceScope = 'public' | 'mine' | 'all'

export type ExperienceListParams = {
  page?: number
  limit?: number
  search?: string
  category?: string
  city?: string
  continent?: string
  minScore?: number
  year?: number
  month?: number
  hasImage?: boolean
  sort?: ExperienceSort
  scope?: ExperienceScope
  status?: ExperienceStatus
}

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export type ExperienceFacets = {
  categories: string[]
  cities: Pick<City, '_id' | 'name'>[]
  years: string[]
}

export type TimelineExperience = Experience & { year: number }

// Drops empty values so the URL only carries the filters in use
export const toQueryString = (params: ExperienceListParams): string => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
  })
  const text = query.toString()
  return text ? `?${text}` : ''
}

const get = async <T>(path: string, signal?: AbortSignal): Promise<T> =>
  (await getData<T>(`${API}${path}`, { signal })).data

export const listExperiences = (params: ExperienceListParams = {}, signal?: AbortSignal) =>
  get<Paginated<Experience>>(`/experiences${toQueryString(params)}`, signal)

export const getExperience = (id: string, signal?: AbortSignal) =>
  get<Experience>(`/experiences/${id}`, signal)

export const getExperienceComments = (id: string, signal?: AbortSignal) =>
  get<Comment[]>(`/experiences/${id}/comments`, signal)

export const getExperienceFacets = (signal?: AbortSignal) =>
  get<ExperienceFacets>('/experiences/facets', signal)

export const getTimeline = (signal?: AbortSignal) =>
  get<TimelineExperience[]>('/experiences/timeline', signal)

// Admin tables sort and paginate on the client, so they load every page
export const listAllExperiences = async (params: Pick<ExperienceListParams, 'scope' | 'status'> = {}): Promise<Experience[]> => {
  const all: Experience[] = []
  let page = 1
  let pages = 1
  do {
    const result = await listExperiences({ ...params, page, limit: 100 })
    all.push(...result.items)
    pages = result.pages
    page++
  } while (page <= pages)
  return all
}

// Admin decision on a pending experience; the reason is shown to the author
export const reviewExperience = async (id: string, status: Exclude<ExperienceStatus, 'pending'>, reason = '') =>
  (await patchData<{ updated: Experience }>(`${API}/experiences/${id}/review`, { status, reason: reason || undefined })).data

// Fields sent when creating or editing; the author comes from the session
export type ExperienceData = {
  title?: string
  content?: string
  category?: string
  city?: string | null
  image?: string
  images?: string[]
}

// A user's experience is created pending review; the admin's is published
export const createExperience = async (data: ExperienceData & { title: string }) =>
  (await postData<Experience>(`${API}/experiences`, data)).data

// A user's edit sends the experience back to review
export const updateExperience = async (id: string, data: ExperienceData) =>
  (await patchData<{ updated: Experience; removedImages: string[] }>(`${API}/experiences/${id}`, data)).data

export const deleteExperience = async (id: string) => {
  await deleteData(`${API}/experiences/${id}`)
}
