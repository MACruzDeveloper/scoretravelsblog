// hooks/useExperienceFilters.ts
import { useMemo, useState } from 'react'
import { PropsCard } from '@common/Card'

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

export const useExperienceFilters = (experiences: PropsCard[]) => {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => setFilters(INITIAL_FILTERS)

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  const filtered = useMemo(() => {
    return experiences.filter(exp => {
      // Buscador: title, category, city, content
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const cityName = typeof exp.city === 'object' ? exp.city?.name : exp.city
        const matches =
          exp.title?.toLowerCase().includes(q) ||
          exp.category?.toLowerCase().includes(q) ||
          cityName?.toLowerCase().includes(q) ||
          exp.content?.toLowerCase().includes(q)
        if (!matches) return false
      }

      // Filtro score: mayor o igual al seleccionado
      if (filters.score && exp.score < Number(filters.score)) return false

      // Filtro category
      if (filters.category && exp.category !== filters.category) return false

      // Filtro city
      if (filters.city) {
        const cityId = typeof exp.city === 'object' ? exp.city?._id : exp.city
        if (cityId !== filters.city) return false
      }

      // Filtro year
      if (filters.year) {
        const expYear = new Date(exp.date).getFullYear().toString()
        if (expYear !== filters.year) return false
      }

      // Filtro month (solo aplica si hay año también)
      if (filters.month) {
        const expMonth = (new Date(exp.date).getMonth() + 1).toString()
        if (expMonth !== filters.month) return false
      }

      return true
    })
  }, [experiences, filters])

  return { filters, setFilter, resetFilters, hasActiveFilters, filtered }
}