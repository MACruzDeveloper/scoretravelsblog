import { useState, useEffect, Fragment } from 'react'
import { useExperienceStore, Experience } from '../../store/experienceStore'
import { useCategoriesStore } from '../../store/categoriesStore'
import { useLocation } from 'react-router-dom'
import Card from '../common/Card'
import Spinner from '../common/Spinner'

const SearchPageContinent = () => {
  const location = useLocation()
  const [param, setParam] = useState('')

  // fetch Experiences
  const { experiences, loading, error, fetchExperiences } = useExperienceStore()
  const [expsFiltered, setExpsFiltered] = useState<Array<Experience>>([])

  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  // fetch Categories
  const { cats, fetchCats } = useCategoriesStore()

  useEffect(() => {
    fetchCats()
  }, [fetchCats])

  // Get param continent
  const getPathSearch = () => {
    let currentPath = location.pathname
    let newParam = currentPath.split('/')[2].toLowerCase()
    setParam(newParam)
  }

  useEffect(() => {
    getPathSearch()
  }, [location.pathname])

  // format continents multiple words
  const formatContinent = (str: string) => {
    if (str) {
      let result = str.split(/\W/).length > 1 ? str.split(' ').join('').toLowerCase() : str.toLowerCase()
      return result === param.toLowerCase()
    }
  }

  // Filter experiences that match with Countries result
  useEffect(() => {
    const catsFiltered = cats.filter(item => formatContinent(item.continent))

    let temp:Experience[] = []
    Object.values(catsFiltered).forEach((elem) => {
      experiences.forEach((item) => {
        if (item.category?.toLowerCase() === elem.name.toLowerCase()) {
          temp.push(item)
        }
      })
    })
    setExpsFiltered(temp)
  }, [param, cats])


  return <div className="page search">
    <div className="container">
      <div className="wrapper">

        {!loading && expsFiltered ?
          <>
            <div className="top">
              <h2 className="title">Results search for <span>{param}</span></h2>
            </div>

            <div className="content">
              {
                expsFiltered.map((ele) => {

                  return <Fragment key={`continentExp-${ele._id}`}>
                    <Card
                      _id={ele._id}
                      title={ele.title}
                      category={ele.category}
                      content={ele.content}
                      date={ele.date}
                      score={ele.score}
                      image={ele.image}
                    />
                  </Fragment>
                })
              }
            </div>
          </>
          : <Spinner />
        }
        {error}
        {
          !loading && expsFiltered.length === 0 &&
          <p className="msg error">No Results</p>
        }
      </div>
    </div>
  </div>
}

export default SearchPageContinent