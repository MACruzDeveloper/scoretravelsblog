import { useState, useEffect, useMemo } from "react"
import { chunk } from 'lodash'
import { MdArrowUpward } from 'react-icons/md'
import { useExperienceStore, Experience } from "@/store/experienceStore"
import { useExperienceFilters } from "@/hooks/useExperienceFilters"
import Filters from '@common/Filters'
import { URL } from '../config'
import { scrollToTop } from '@/utils/utils'

const Gallery = () => {
  const { experiences, loading, error, fetchExperiences } = useExperienceStore()

  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  // Use filters hook
  const { filters, setFilter, resetFilters, hasActiveFilters, filtered } = useExperienceFilters(experiences)

  // Extract unique cities from all experiences (options shouldn't disappear when filtering)
  const cities = useMemo(() => {
    const cityMap = new Map()
    experiences.forEach(exp => {
      if (exp.city && typeof exp.city === 'object') {
        if (!cityMap.has(exp.city._id)) {
          cityMap.set(exp.city._id, { _id: exp.city._id, name: exp.city.name })
        }
      }
    })
    return Array.from(cityMap.values())
  }, [experiences])

  // Filter and Group experiences in chunks of 3 (deterministic order: newest first)
  const experiencesByGroup = useMemo(() => {
    const expsWithImage = filtered
      .filter((exp) => exp.image)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return chunk(expsWithImage, 3)
  }, [filtered])

  const getImageClass = (index: number) => {
    return index % 2 ? 'gallery_chunk--right' : 'gallery_chunk--left'
  }

  // For Show more button
  const chunksPerRow = 2
  const [next, setNext] = useState(chunksPerRow)
  const handleMoreChunks = () => {
    setNext(next + chunksPerRow)
  }

  // Reset "Show more" when the filtered results change
  useEffect(() => {
    setNext(chunksPerRow)
  }, [filtered, chunksPerRow])

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
            cities={cities}
            availableYears={[]}
          />

          <div className="gallery_content">
            {
              !loading && experiencesByGroup.slice(0, next)?.map((item, idx) => {
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

          {next < experiencesByGroup?.length && (
            <div className="gallery_actions">
              <button className="btn btn_show_more" onClick={handleMoreChunks}>Show more</button>
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