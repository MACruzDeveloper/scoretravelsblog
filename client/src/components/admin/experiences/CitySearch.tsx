// components/CitySearch.tsx
import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { COUNTRY_TO_CONTINENT } from '@utils/constants'
import type { NewCity } from '@/api/types'

// A city picked from the search, not saved yet
export type City = NewCity

// Subset of the OpenStreetMap Nominatim search result used here
type NominatimPlace = {
  lat: string
  lon: string
  address?: { city?: string; town?: string; village?: string; country?: string; country_code?: string }
}

type Props = {
  onSelect: (city: City | null) => void
  value?: string
}

export const CitySearch = ({ onSelect, value }: Props) => {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchCities = async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(q)}&featuretype=city&format=json&limit=8&addressdetails=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'my-travel-app' } }
      )
      const data: NominatimPlace[] = await res.json()

      const seen = new Set<string>()
      const cities: City[] = data
        .filter((item) => item.address?.city || item.address?.town || item.address?.village)
        .map((item) => {
          const address = item.address ?? {}
          const countryCode = address.country_code?.toUpperCase() ?? ''
          const continent = COUNTRY_TO_CONTINENT[countryCode] || 'unknown'
          return {
            name: address.city || address.town || address.village || '',
            country: address.country ?? '',
            countryCode,
            continent,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }
        })
        .filter((city: City) => {
          const key = `${city.name}-${city.countryCode}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })

      setResults(cities)
      setIsOpen(true)
    } catch (error) {
      console.error('City search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchCities(q), 400)
  }

  const handleSelect = (city: City) => {
    setQuery(`${city.name}, ${city.country}`)
    setResults([])
    setIsOpen(false)
    onSelect(city)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    onSelect(null)
  }

  return (
    <div className="city_search" ref={wrapperRef}>
      <div className="city_search_input_wrapper">
        <input
          type="text"
          className="form_control"
          placeholder="Search city..."
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          autoComplete="off"
        />
        {query && (
          <button type="button" className="city_search_clear" onClick={handleClear}>✕</button>
        )}
        {loading && <span className="city_search_spinner" />}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="city_search_dropdown">
          {results.map((city, i) => (
            <li
              key={`${city.name}-${city.countryCode}-${i}`}
              className="city_search_option"
              onMouseDown={() => handleSelect(city)}
            >
              <span className="city_search_name">{city.name}</span>
              <span className="city_search_country">{city.countryCode} · {city.country}</span>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !loading && query.length >= 2 && results.length === 0 && (
        <div className="city_search_empty">No cities found for "{query}"</div>
      )}
    </div>
  )
}