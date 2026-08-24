import { useEffect, Fragment } from 'react'
import { useExperienceStore } from '../../store/experienceStore'
import { useLocation } from 'react-router-dom'
import Card from '../common/Card'
import Spinner from '../common/Spinner'

const SearchPage = () => {
  const { experiences, loading, error, fetchExperiences } = useExperienceStore()

  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  // get search param
  const location = useLocation()
  const param = new URLSearchParams(location.search).get('search') || ''

  // get results filtered by title, category, city name or content
  const searchResults = experiences.filter(item => {
    const term = param.toLowerCase()
    const cityName = item.city && typeof item.city === 'object' ? item.city.name?.toLowerCase() : ''
    return (
      item.title?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      cityName.includes(term) ||
      item.content?.toLowerCase().includes(term)
    )
  })

  return <div className="page search">
    <div className="container">
      <div className="wrapper">

        {loading && <Spinner />}

        {!loading && searchResults.length > 0 &&
          <>
            <div className="top">
              <h2 className="title">Results for <span>{param}</span></h2>
            </div>

            <div className="content">
              {
                searchResults.map((ele) => {

                  return <Fragment key={`searchExp-${ele._id}`}>
                    <Card
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
                  </Fragment>
                })
              }
            </div>
          </>
        }

        {
          !loading && searchResults.length === 0 &&
          <p className="msg error">{param ? `No Results for ${param}` : 'Type a term to search'}</p>
        }
        {error}
      </div>
    </div>
  </div>
}

export default SearchPage
