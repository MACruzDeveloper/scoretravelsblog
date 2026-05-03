import { create } from 'zustand'
import { getData } from '@utils/utils'
import { URL } from '../config'
import { City } from './experienceStore'

interface CitiesState {
  cities: City[]
  citiesByContinent: Record<string, City[]>
  citiesByCountry: Record<string, City[]>
  continents: string[]
  countries: string[]
  loading: boolean
  error: string | undefined
  hasFetched: boolean
  fetchCities: () => Promise<void>
  fetchCitiesByContinent: (continent: string) => Promise<City[]>
  fetchCitiesByCountry: (country: string) => Promise<City[]>
  getCountriesByContinent: (continent: string) => string[]
  getCitiesByCountry: (country: string) => City[]
}

export const useCitiesStore = create<CitiesState>((set, get) => ({
  cities: [],
  citiesByContinent: {},
  citiesByCountry: {},
  continents: [],
  countries: [],
  loading: false,
  error: undefined,
  hasFetched: false,

  fetchCities: async () => {
    const { hasFetched } = get()
    if (hasFetched) return

    set({ loading: true })
    try {
      const response = await getData(`${URL}/admin/cities`)
      const cities = response.data

      // Extract unique continents and countries
      const continents = [...new Set(cities.map((city: City) => city.continent))].sort()
      const countries = [...new Set(cities.map((city: City) => city.country))].sort()

      // Group cities by continent
      const citiesByContinent = cities.reduce((acc: Record<string, City[]>, city: City) => {
        if (!acc[city.continent]) acc[city.continent] = []
        acc[city.continent].push(city)
        return acc
      }, {})

      // Group cities by country
      const citiesByCountry = cities.reduce((acc: Record<string, City[]>, city: City) => {
        if (!acc[city.country]) acc[city.country] = []
        acc[city.country].push(city)
        return acc
      }, {})

      set({
        cities,
        citiesByContinent,
        citiesByCountry,
        continents,
        countries,
        loading: false,
        error: undefined,
        hasFetched: true
      })
    } catch (error: any) {
      set({ error: error.message, loading: false, hasFetched: true })
    }
  },

  fetchCitiesByContinent: async (continent: string) => {
    try {
      const response = await getData(`${URL}/admin/cities/by-continent/${continent}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching cities by continent:', error)
      return []
    }
  },

  fetchCitiesByCountry: async (country: string) => {
    try {
      const response = await getData(`${URL}/admin/cities/by-country/${country}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching cities by country:', error)
      return []
    }
  },

  getCountriesByContinent: (continent: string) => {
    const { citiesByContinent } = get()
    const cities = citiesByContinent[continent] || []
    return [...new Set(cities.map(city => city.country))].sort()
  },

  getCitiesByCountry: (country: string) => {
    const { citiesByCountry } = get()
    return citiesByCountry[country] || []
  }
}))
