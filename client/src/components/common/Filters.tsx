import { Filters as FiltersType, useExperienceFilters } from '@hooks/useExperienceFilters'

type Props = {
  filters: FiltersType
  setFilter: (key: keyof FiltersType, value: string) => void
  resetFilters: () => void
  hasActiveFilters: boolean
  categories: string[]
  cities: { _id: string; name: string }[]
  availableYears: string[]
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
  filters, setFilter, resetFilters, hasActiveFilters, categories, cities, availableYears
}: Props) => {
  return (
    <div className="filters">

      {/* Buscador */}
      <div className="filter_group filter_group--search">
        <label>Search</label>
        <input
          type="text"
          placeholder="Search by title, category, city or content..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
          className="form_control"
        />
      </div>

      {/* Score */}
      <div className="filter_group">
        <label>Min. score</label>
        <select className="form_control" value={filters.score} onChange={e => setFilter('score', e.target.value)}>
          <option value="">All</option>
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n}+</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="filter_group">
        <label>Category</label>
        <select className="form_control" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
          <option value="">All</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div className="filter_group">
        <label>City</label>
        <select className="form_control" value={filters.city} onChange={e => setFilter('city', e.target.value)}>
          <option value="">All</option>
          {cities.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Year */}
      <div className="filter_group">
        <label>Year</label>
        <select className="form_control" value={filters.year} onChange={e => {
          setFilter('year', e.target.value)
          setFilter('month', '') // reset month when year changes
        }}>
          <option value="">All</option>
          {availableYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Month — solo visible si hay año seleccionado */}
      {filters.year && (
        <div className="filter_group">
          <label>Month</label>
          <select className="form_control" value={filters.month} onChange={e => setFilter('month', e.target.value)}>
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