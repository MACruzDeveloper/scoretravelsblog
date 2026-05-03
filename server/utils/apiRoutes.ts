// utils/apiRoutes.ts
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3040'

export const API = {
  experiences: `${BASE}/admin/experiences`,
  categories:  `${BASE}/admin/categories`,
  cities:      `${BASE}/admin/cities`,
  comments:    `${BASE}/admin/comments`,
  scores:      `${BASE}/admin/scores`,
  images:      `${BASE}/images`,
  users:       `${BASE}/users`,
  emails:      `${BASE}/emails`,
}