// components/CitySearch.tsx
import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { COUNTRY_TO_CONTINENT } from '@utils/constants'
import type { NewCity } from '@/api/types'
import { placeLabel } from '@/utils/experience'

// A city picked from the search, not saved yet
export type City = NewCity

// Photon (OpenStreetMap data) is built for search as you type, unlike Nominatim
const PHOTON_URL = 'https://photon.komoot.io/api/'

// OpenStreetMap place kinds offered. Photon's own layers miss some cities (Mombasa is a
// "district") and all islands and regions; villages are left out because they bury the cities
const PLACE_TAGS = ['city', 'town', 'country', 'state', 'region', 'island', 'archipelago']

// Subset of a Photon GeoJSON feature used here. `osm_value` is the OpenStreetMap place kind
type PhotonFeature = {
  geometry: { coordinates: [number, number] }
  properties: { name?: string; osm_value?: string; country?: string; countrycode?: string }
}

// Anything inside a country (city, island, region) is stored as a city
const toPlace = ({ geometry, properties }: PhotonFeature): City | null => {
  const type = properties.osm_value === 'country' ? 'country' : 'city'
  const countryCode = properties.countrycode?.toUpperCase() ?? ''
  const country = properties.country || (type === 'country' ? properties.name : '') || ''
  if (!properties.name || !countryCode || !country) return null
  const [lng, lat] = geometry.coordinates
  return {
    name: properties.name,
    type,
    country,
    countryCode,
    continent: COUNTRY_TO_CONTINENT[countryCode] || 'unknown',
    lat,
    lng,
  }
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
  const abortRef = useRef<AbortController | null>(null)
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
    // A newer search replaces the one in flight, so stale results never show up
    abortRef.current?.abort()
    if (q.length < 2) { setResults([]); return }
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, limit: '8', lang: 'en' })
      PLACE_TAGS.forEach((tag) => params.append('osm_tag', `place:${tag}`))
      const res = await fetch(`${PHOTON_URL}?${params}`, { signal: controller.signal })
      const data: { features: PhotonFeature[] } = await res.json()

      const seen = new Set<string>()
      const places = data.features
        .map(toPlace)
        .filter((place): place is City => {
          if (!place) return false
          const key = `${place.type}-${place.name}-${place.countryCode}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })

      setResults(places)
      setIsOpen(true)
      setLoading(false)
    } catch (error) {
      if (controller.signal.aborted) return
      console.error('Place search error:', error)
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
    setQuery(placeLabel(city))
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
          placeholder="Search city, island, region or country..."
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
              <span className="city_search_country">
                {city.type === 'country' ? 'Country' : `${city.countryCode} · ${city.country}`}
              </span>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !loading && query.length >= 2 && results.length === 0 && (
        <div className="city_search_empty">No places found for "{query}"</div>
      )}
    </div>
  )
}