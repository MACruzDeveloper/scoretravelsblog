import { useEffect, useState } from 'react'
import Card from '../common/Card'
import Spinner from '../common/Spinner'
import Pagination from '../common/Pagination'
import { useApiQuery } from '@/hooks/useApiQuery'
import { listExperiences, toQueryString, ExperienceListParams } from '@/api/experiences'

const ITEMS_PER_PAGE = 9

type PropsSearchResults = {
  // Text shown in "Results for ..."
  label: string
  // Server filters; null means there is nothing to search yet
  filters: ExperienceListParams | null
  emptyMessage: string
}

const SearchResults = ({ label, filters, emptyMessage }: PropsSearchResults) => {
  const [currentPage, setCurrentPage] = useState(1)
  const filtersKey = filters ? toQueryString(filters) : null

  // A new search starts on the first page
  useEffect(() => {
    setCurrentPage(1)
  }, [filtersKey])

  const query = { ...filters, page: currentPage, limit: ITEMS_PER_PAGE, sort: '-date' as const }
  const { data, loading, error } = useApiQuery(
    filters ? `experiences:search${toQueryString(query)}` : null,
    () => listExperiences(query)
  )

  const results = data?.items ?? []
  const total = data?.total ?? 0

  return <div className="page search">
    <div className="container">
      <div className="wrapper">
        {loading && <Spinner />}

        {!loading && results.length > 0 &&
          <>
            <div className="top">
              <h2 className="title">Results for <span>{label}</span></h2>
            </div>

            <div className="content">
              {results.map((ele) => (
                <Card
                  key={`search-${ele._id}`}
                  _id={ele._id}
                  title={ele.title}
                  category={ele.category}
                  city={ele.city}
                  content={ele.content}
                  date={ele.date}
                  score={ele.score}
                  image={ele.image}
                  images={ele.images}
                />
              ))}
            </div>

            {total > ITEMS_PER_PAGE && (
              <Pagination
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={currentPage}
                totalItems={total}
                paginate={setCurrentPage}
              />
            )}
          </>
        }

        {!loading && results.length === 0 && <p className="msg error">{emptyMessage}</p>}
        {error}
      </div>
    </div>
  </div>
}

export default SearchResults
