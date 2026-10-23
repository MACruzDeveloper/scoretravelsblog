import { getData, patchData } from '@/utils/utils'
import { API } from '@/config'
import type { Experience, City } from '@/store/experienceStore'
import type { Comment } from '@/store/commentsStore'

export type ExperienceSort = '-date' | 'date' | '-score' | 'score' | 'title' | '-title'
export type ExperienceStatus = 'pending' | 'published' | 'rejected'
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
  (await getData(`${API}${path}`, { signal })).data as T

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
  (await patchData(`${API}/experiences/${id}/review`, { status, reason: reason || undefined })).data
