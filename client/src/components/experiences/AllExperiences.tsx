import { useState, useEffect, useMemo } from 'react'
import { sortBy } from "lodash"
import { useExperienceStore } from '@store/experienceStore'
import Card, { PropsCard } from '@common/Card'
import Pagination from '@common/Pagination'
import Filters from '@common/Filters'
import { useExperienceFilters } from '@/hooks/useExperienceFilters'

const AllExperiences = () => {
  const { experiences, loading, error, fetchExperiences } = useExperienceStore()

  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  const { filters, setFilter, resetFilters, hasActiveFilters, filtered } =
    useExperienceFilters(experiences)

  // Derivados para los selects de Filters
  const categories = useMemo(() =>
    [...new Set(experiences.map(e => e.category).filter(Boolean))].sort()
  , [experiences])

  const cities = useMemo(() => {
    const seen = new Set()
    return experiences
      .map(e => typeof e.city === 'object' ? e.city : null)
      .filter((c): c is { _id: string; name: string } => !!c && !seen.has(c._id) && !!seen.add(c._id))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [experiences])

  const availableYears = useMemo(() =>
    [...new Set(experiences.map(e => new Date(e.date).getFullYear().toString()))].sort().reverse()
  , [experiences])

  // Paginación sobre el array ya filtrado
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // Reset a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const sortedFiltered = useMemo(() =>
    sortBy(filtered, ['date']).reverse()
  , [filtered])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentExps = sortedFiltered.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <div className="page experiences">
      <div className="container">
        <div className="wrapper">
          <div className="top">
            <h2 className="title">All Experiences</h2>
          </div>

          <div className="content">
            <Filters
              filters={filters}
              setFilter={setFilter}
              resetFilters={resetFilters}
              hasActiveFilters={hasActiveFilters}
              categories={categories}
              cities={cities}
              availableYears={availableYears}
            />

            <div className="flex">
              {!loading && currentExps.map((ele: PropsCard) => (
                <Card
                  key={`exp-${ele._id}`}
                  category={ele.category}
                  city={ele.city}
                  content={ele.content}
                  score={ele.score}
                  date={ele.date}
                  image={ele.image}
                  title={ele.title}
                  _id={ele._id}
                />
              ))}
            </div>
          </div>

          <div className="msg_error" role="alert">{error}</div>

          {sortedFiltered.length > itemsPerPage && (
            <Pagination
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              totalItems={sortedFiltered.length}  // total del filtrado, no del original
              paginate={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AllExperiences