// HTTP helpers for the REST API and small generic utilities

export type ApiResponse<T> = { data: T; status: number; ok: true }
type RequestOptions = Omit<RequestInit, 'headers'> & { headers?: Record<string, string> }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email.trim())

// Keep in sync with the server multer limit
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export const checkFileSize = (file: Pick<File, 'size'>): boolean => file.size <= MAX_UPLOAD_BYTES

export const getToken = (): string | null => {
  const raw = localStorage.getItem('token')
  if (!raw) return null
  try {
    const token: unknown = JSON.parse(raw)
    return typeof token === 'string' ? token : null
  } catch {
    return null
  }
}

// Attach the auth token to every request. Server ignores it on public routes.
const withAuthHeaders = (options: RequestOptions = {}): RequestOptions => {
  const token = getToken()
  if (!token) return options
  const headers = { ...(options.headers || {}) }
  if (!headers.Authorization) headers.Authorization = `Bearer ${token}`
  return { ...options, headers }
}

// Errors carry the server's message ({ ok: false, message }) so the UI can show it
const errorMessage = (body: unknown, fallback: string): string => {
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') return body.message
  if (typeof body === 'string' && body) return body
  return fallback
}

const parseResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type') || ''
    const body: unknown = contentType.includes('application/json') ? await response.json() : await response.text()
    throw new Error(errorMessage(body, response.statusText))
  }
  return { data: (await response.json()) as T, status: response.status, ok: true }
}

export const fetchData = async <T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  const response = await fetch(url, withAuthHeaders(options))
  return parseResponse<T>(response)
}

export const getData = <T>(url: string, options: RequestOptions = {}) =>
  fetchData<T>(url, { method: 'GET', ...options })

const sendJson = <T>(method: string, url: string, body: unknown, options: RequestOptions = {}) =>
  fetchData<T>(url, {
    method,
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(body),
  })

export const postData = <T>(url: string, body: unknown, options: RequestOptions = {}) =>
  sendJson<T>('POST', url, body, options)

export const patchData = <T>(url: string, body: unknown, options: RequestOptions = {}) =>
  sendJson<T>('PATCH', url, body, options)

export const deleteData = <T>(url: string, options: RequestOptions = {}) =>
  fetchData<T>(url, { method: 'DELETE', ...options })

// Multipart upload: the browser sets the Content-Type with the boundary
export const postForm = <T>(url: string, form: FormData) => fetchData<T>(url, { method: 'POST', body: form })

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
