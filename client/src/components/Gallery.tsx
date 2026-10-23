import { useState, useEffect, useMemo } from "react"
import { chunk } from '@/utils/collections'
import { MdArrowUpward } from 'react-icons/md'
import type { Experience } from "@/store/experienceStore"
import { useExperienceFilters } from "@/hooks/useExperienceFilters"
import { useApiQuery } from '@/hooks/useApiQuery'
import { listExperiences, getExperienceFacets, toQueryString } from '@/api/experiences'
import Filters from '@common/Filters'
import { URL } from '../config'
import { scrollToTop } from '@/utils/utils'

// Each "Show more" loads two rows of three images
const CHUNK_SIZE = 3
const PAGE_SIZE = CHUNK_SIZE * 2

const Gallery = () => {
  const { filters, setFilter, resetFilters, hasActiveFilters, params } = useExperienceFilters()
  const [page, setPage] = useState(1)
  const [loaded, setLoaded] = useState<Experience[]>([])

  // New filters start again from the first page
  useEffect(() => {
    setPage(1)
  }, [params])

  const query = { ...params, hasImage: true, sort: '-date' as const, page, limit: PAGE_SIZE }
  const { data, loading, error } = useApiQuery(`experiences:gallery${toQueryString(query)}`, () => listExperiences(query))
  const { data: facets } = useApiQuery('experiences:facets', () => getExperienceFacets())

  // Page 1 replaces the list, next pages are appended
  useEffect(() => {
    if (!data) return
    setLoaded((prev) => (data.page === 1 ? data.items : [...prev, ...data.items]))
  }, [data])

  const experiencesByGroup = useMemo(() => chunk(loaded, CHUNK_SIZE), [loaded])
  const hasMore = data ? data.page < data.pages : false

  const getImageClass = (index: number) => {
    return index % 2 ? 'gallery_chunk--right' : 'gallery_chunk--left'
  }

  return <div className="page gallery">
    <div className="container">
      <div className="wrapper">
        <div className="top">
          <h2 className="title">Gallery</h2>
        </div>

        <div className="content">
          <Filters
            filters={filters}
            setFilter={setFilter}
            resetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            categories={[]}
            cities={facets?.cities ?? []}
            availableYears={[]}
          />

          <div className="gallery_content">
            {
              experiencesByGroup.map((item, idx) => {
                return <div key={`chunk-${idx}`} className={`gallery_chunk ${getImageClass(idx)}`}>
                  {
                    item.map((ele: Experience) => {
                      return <div key={ele._id} className="gallery_item">
                        <img loading="lazy" src={`${URL}/static/images/${ele.image}`} alt={ele.title} />
                        <p className="gallery_item_info">
                          <span className="city">{typeof ele.city === 'object' ? ele.city.name : ele.city}</span>
                          <span className="country">{typeof ele.city === 'object' ? ele.city.country : ''}</span>
                        </p>
                      </div>
                    })
                  }
                </div>
              })
            }
          </div>

          {hasMore && (
            <div className="gallery_actions">
              <button className="btn btn_show_more" onClick={() => setPage(page + 1)} disabled={loading}>Show more</button>
              <button className="btn_icon btn_top" onClick={scrollToTop}>
                <MdArrowUpward />
              </button>
            </div>
          )}

          {error}
        </div>
      </div>
    </div>
  </div>
}

export default Gallery