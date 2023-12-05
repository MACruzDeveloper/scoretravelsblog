import { useState, useEffect, Fragment } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/useDispatchSelector'
import { Experience, fetchExperiences, experiencesSelector } from '../../store/slice-experiences'
import { useLocation } from 'react-router-dom'
import Card from '../common/Card'

const SearchPage = () => {
  // fetch Experiences
  const [experiences, setExperiences] = useState<Array<Experience>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const selectedExperiences = useAppSelector(experiencesSelector)
  const dispatch = useAppDispatch()

  useEffect(() => {
    setLoading(selectedExperiences.loading)
    setError(selectedExperiences.error)
    setExperiences(selectedExperiences.experiences)
  }, [selectedExperiences])

  function handleFetchExperiences() {
    dispatch(fetchExperiences())
  }

  useEffect(() => {
    handleFetchExperiences()
  }, [])

  // get search param
  const location = useLocation()
  const [param, setParam] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchResults, setSearchResults] = useState([])

  const getPathSearch = () => {
    const queryString = location.search
    const urlParams = new URLSearchParams(queryString)
    const searchParamValue = urlParams.get('search')

    if (searchParamValue) {
      setParam(searchParamValue)
    }
  }

  // get results filtered by title or category
  const loadResults = () => {
    let expsResult = experiences.filter(item => item.title.toLowerCase().includes(param.toLowerCase()) || item.category.toLowerCase().includes(param.toLowerCase()))
    setSearchResults(expsResult)
    setIsLoading(false)
  }

  useEffect(() => {
    getPathSearch()
  }, [location.pathname])

  useEffect(() => {
    loadResults()
  }, [experiences, param])

  return <div className="page search">
    <div className="container">
      <div className="wrapper">

        {!loading && !isLoading && searchResults.length > 0 &&
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
        }

        {
          !loading && !isLoading && searchResults.length === 0 &&
          <p className="msg error">No Results for {param}</p>
        }
        {error}
      </div>
    </div>
  </div>
}

export default SearchPage