import { Filters as FiltersType } from '@hooks/useExperienceFilters'
import type { FacetCountry } from '@/api/experiences'
import { CONTINENT_LABELS } from '@utils/constants'

type Props = {
  filters: FiltersType
  setFilter: (key: keyof FiltersType, value: string) => void
  resetFilters: () => void
  hasActiveFilters: boolean
  categories: string[]
  continents: string[]
  countries: FacetCountry[]
  availableYears: string[]
  showScore?: boolean
}

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' },
  { value: '3', label: 'March' },   { value: '4', label: 'April' },
  { value: '5', label: 'May' },     { value: '6', label: 'June' },
  { value: '7', label: 'July' },    { value: '8', label: 'August' },
  { value: '9', label: 'September' },{ value: '10', label: 'October' },
  { value: '11', label: 'November' },{ value: '12', label: 'December' },
]

const Filters = ({
  filters, setFilter, resetFilters, hasActiveFilters, categories, continents, countries, availableYears, showScore = true
}: Props) => {
  // With a continent chosen, only its countries
  const visibleCountries = filters.continent ? countries.filter(c => c.continent === filters.continent) : countries

  return (
    <div className="filters">

      {/* Buscador */}
      <div className="filter_group filter_group--search">
        <label htmlFor="filter-search">Search</label>
        <input id="filter-search"
          type="text"
          placeholder="Search by title, category, place or content..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
          className="form_control"
        />
      </div>

      {/* Score */}
      {showScore && (
        <div className="filter_group">
          <label htmlFor="filter-score">Min. score</label>
          <select id="filter-score" className="form_control" value={filters.score} onChange={e => setFilter('score', e.target.value)}>
            <option value="">All</option>
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </div>
      )}

      {/* Category */}
      {categories.length > 0 && (
        <div className="filter_group">
          <label htmlFor="filter-category">Category</label>
          <select id="filter-category" className="form_control" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
            <option value="">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {/* Continent */}
      {continents.length > 0 && (
        <div className="filter_group">
          <label htmlFor="filter-continent">Continent</label>
          <select id="filter-continent" className="form_control" value={filters.continent} onChange={e => {
            const continent = e.target.value
            setFilter('continent', continent)
            // Keep the country only if it belongs to the new continent
            const country = countries.find(c => c.code === filters.country)
            if (continent && country && country.continent !== continent) setFilter('country', '')
          }}>
            <option value="">All</option>
            {continents.map(c => (
              <option key={c} value={c}>{CONTINENT_LABELS[c] ?? c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Country */}
      {visibleCountries.length > 0 && (
        <div className="filter_group">
          <label htmlFor="filter-country">Country</label>
          <select id="filter-country" className="form_control" value={filters.country} onChange={e => setFilter('country', e.target.value)}>
            <option value="">All</option>
            {visibleCountries.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Year */}
      {availableYears.length > 0 && (
        <div className="filter_group">
          <label htmlFor="filter-year">Year</label>
          <select id="filter-year" className="form_control" value={filters.year} onChange={e => {
            setFilter('year', e.target.value)
            setFilter('month', '') // reset month when year changes
          }}>
            <option value="">All</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      )}

      {/* Month — solo visible si hay año seleccionado */}
      {filters.year && (
        <div className="filter_group">
          <label htmlFor="filter-month">Month</label>
          <select id="filter-month" className="form_control" value={filters.month} onChange={e => setFilter('month', e.target.value)}>
            <option value="">All</option>
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Reset */}
      {hasActiveFilters && (
        <button type="button" className="btn btn_admin btn_reset" onClick={resetFilters}>
          Clear filters
        </button>
      )}
    </div>
  )
}

export default Filters