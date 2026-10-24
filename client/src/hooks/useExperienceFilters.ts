// hooks/useExperienceFilters.ts
import { useEffect, useMemo, useState } from 'react'
import type { ExperienceListParams } from '@/api/experiences'

export type Filters = {
  search: string
  score: string
  category: string
  city: string
  year: string
  month: string
}

const INITIAL_FILTERS: Filters = {
  search: '',
  score: '',
  category: '',
  city: '',
  year: '',
  month: '',
}

const SEARCH_DELAY_MS = 300

// Turns the form values into API query params (filtering happens on the server)
export const filtersToParams = (filters: Filters): ExperienceListParams => ({
  search: filters.search.trim() || undefined,
  minScore: filters.score ? Number(filters.score) : undefined,
  category: filters.category || undefined,
  city: filters.city || undefined,
  year: filters.year ? Number(filters.year) : undefined,
  // Month only makes sense together with a year
  month: filters.year && filters.month ? Number(filters.month) : undefined,
})

export const useExperienceFilters = () => {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  // Search waits until the user stops typing; the other filters apply at once
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [filters.search])

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS)
    setDebouncedSearch('')
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  const params = useMemo(
    () => filtersToParams({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  )

  return { filters, setFilter, resetFilters, hasActiveFilters, params }
}
