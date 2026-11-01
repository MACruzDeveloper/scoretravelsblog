// Shapes of the data the REST API returns (see server/models)

export type Role = 'admin' | 'user'
export type ExperienceStatus = 'pending' | 'published' | 'rejected'

// A city or a whole country
export type PlaceType = 'city' | 'country'

export interface City {
  _id: string
  name: string
  // Missing on cities saved before countries were allowed
  type?: PlaceType
  country: string
  countryCode: string
  continent: string
  lat: number
  lng: number
}

// City picked in the search box, before it is saved (no _id yet)
export type NewCity = Omit<City, '_id'>

export interface Experience {
  _id: string
  user?: string
  title: string
  category?: string
  // Populated by the API; a plain id only while editing
  city?: City | string | null
  date?: Date | string
  image?: string
  images?: string[]
  content?: string
  score?: number | null
  votes?: number
  status?: ExperienceStatus
  rejectionReason?: string
  // Author and license of photos taken from Wikimedia Commons
  imageCredits?: ImageCredit[]
}

export interface ImageCredit {
  filename: string
  author: string
  license: string
  licenseUrl?: string
  source: string
}

export interface Comment {
  readonly _id: string
  user?: string
  experience: string
  date: Date | string
  content?: string
}

export interface Score {
  readonly _id: string
  experience: string
  user: string
  score: number
}

export interface Category {
  readonly _id: string
  name: string
  description?: string
}

export interface User {
  _id: string
  username?: string
  email: string
  role: Role
}

export interface Image {
  _id: string
  filename: string
  title?: string
  featured: boolean
  width?: number
  height?: number
}

// Returned by login and register
export interface Session {
  token: string
  username: string
  email: string
  role: Role
  message?: string
}
