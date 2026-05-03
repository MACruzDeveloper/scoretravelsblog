import { useMemo, useEffect, Fragment } from 'react'
import { useExperienceStore, Experience } from '@store/experienceStore'
import { useLocation } from 'react-router-dom'
import Card from '../common/Card'
import Spinner from '../common/Spinner'

const SearchPageContinent = () => {
  const location = useLocation()
  const { experiences, loading, error, fetchExperiences } = useExperienceStore()

  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  const param = location.pathname.split('/')[2]?.toLowerCase() || ''

  const expsFiltered = useMemo(() => {
    return experiences.filter(exp => {
      if (typeof exp.city !== 'object' || !exp.city?.continent) return false
      // Normaliza por si hay espacios o mayúsculas
      return exp.city.continent.toLowerCase().replace(/\s+/g, '-') === param
    })
  }, [experiences, param])

  return (
    <div className="page search">
      <div className="container">
        <div className="wrapper">
          {!loading && expsFiltered ? (
            <>
              <div className="top">
                <h2 className="title">Results for <span>{param}</span></h2>
              </div>
              <div className="content">
                {expsFiltered.map(ele => (
                  <Fragment key={`continentExp-${ele._id}`}>
                    <Card
                      _id={ele._id}
                      title={ele.title}
                      category={ele.category}
                      city={ele.city}
                      content={ele.content}
                      date={ele.date}
                      score={ele.score}
                      image={ele.image}
                    />
                  </Fragment>
                ))}
              </div>
            </>
          ) : <Spinner />}

          {error}

          {!loading && expsFiltered.length === 0 && (
            <p className="msg error">No Results</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchPageContinent