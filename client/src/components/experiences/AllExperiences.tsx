import { useState, useEffect } from 'react'
import Card from '@common/Card'
import Pagination from '@common/Pagination'
import Filters from '@common/Filters'
import { useExperienceFilters } from '@/hooks/useExperienceFilters'
import { useApiQuery } from '@/hooks/useApiQuery'
import { listExperiences, getExperienceFacets, toQueryString } from '@/api/experiences'
import Seo from '@/components/common/Seo'

const ITEMS_PER_PAGE = 9

const AllExperiences = () => {
  const { filters, setFilter, resetFilters, hasActiveFilters, params } = useExperienceFilters()
  const [currentPage, setCurrentPage] = useState(1)

  // Back to the first page whenever the filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [params])

  const query = { ...params, page: currentPage, limit: ITEMS_PER_PAGE, sort: '-date' as const }
  const { data, loading, error } = useApiQuery(`experiences:all${toQueryString(query)}`, () => listExperiences(query))
  const { data: facets } = useApiQuery('experiences:facets', () => getExperienceFacets())

  const experiences = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="page experiences">
      <Seo title="All experiences" description="Every travel experience shared on ScoreTravelsBlog, with filters by category, continent, score and date." />
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
              categories={facets?.categories ?? []}
              cities={facets?.cities ?? []}
              availableYears={facets?.years ?? []}
            />

            <div className="flex">
              {!loading && experiences.map((ele) => (
                <Card
                  key={`exp-${ele._id}`}
                  category={ele.category}
                  city={ele.city}
                  content={ele.content}
                  score={ele.score}
                  date={ele.date}
                  image={ele.image}
                  images={ele.images}
                  title={ele.title}
                  _id={ele._id}
                />
              ))}
            </div>
          </div>

          <div className="msg_error" role="alert">{error}</div>

          {total > ITEMS_PER_PAGE && (
            <Pagination
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentPage}
              totalItems={total}
              paginate={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AllExperiences
