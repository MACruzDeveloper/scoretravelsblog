import { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { sortBy } from "lodash"
import { URL } from '../config'
import { useAppDispatch, useAppSelector } from '../hooks/useDispatchSelector'
import { Experience, fetchExperiences, experiencesSelector } from '../store/slice-experiences'
import useScrollPosition from '../hooks/useScrollPosition'
import { groupBy } from '../utils/utils'
import thumb from '../assets/images/thumb.png'

const Timeline = () => {
  // fetch Experiences
  const [experiences, setExperiences] = useState<Array<Experience>>([])
  const [experiencesFiltered, setExperiencesFiltered] = useState<Array<Experience>>([])
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
  
  const getItemClass = (index: number) => {
    return index % 2 && 'reverse'
  }
  
  const getYearFromDate = (ele: Experience) => {
    const date = new Date(ele.date)
    return date.getFullYear()
  }

  interface ExperienceTemp extends Experience {
    year: number
  }

  // 1) Filter experiences that are scored 
  // 2) Sort experiences filtered by date
  // 3) Create a new array where push data with date formatted to years
  // 4) Group this new array by years
  // 5) Select the experience with highest score of each year and assign to a new array
  // 6) State this new array to show finally the experiences that have best score for each year
  useEffect(() => {
    const filteredExpsWithScore = experiences?.filter((elem) => elem.score)
    const sortedExperiences = sortBy(filteredExpsWithScore, ['date'])

    let tempExps: Array<ExperienceTemp> = []
    for (let ele of sortedExperiences) {
      tempExps.push({
        _id: ele._id, 
        title: ele.title,
        date: ele.date,
        year: getYearFromDate(ele), 
        image: ele.image,
        score: ele.score
      })
    }

    const expsByDate = groupBy(tempExps, 'year')
    const tempExpsByDateAsArray: Array<Experience> = []
    Object.values(expsByDate).forEach((element: any) => {
      const filteredExpsByDate = element.reduce((prev: any, current: any) => (prev && prev.score > current.score) ? prev : current)
      tempExpsByDateAsArray.push(filteredExpsByDate)
      setExperiencesFiltered(tempExpsByDateAsArray)
    })
  }, [experiences])
  
  // When scroll page to Timeline component move its scroll once to the right
  const firstRenderRef = useRef<boolean>(true)
  const scrollPosition = useScrollPosition()

  useEffect(() => {
    if (firstRenderRef.current) {
      const element = document.getElementById('timelineScrollX')
      const posTop = element ? element.getBoundingClientRect().top : 0
      const posRight = element ? element.getBoundingClientRect().right : 0

      if (scrollPosition > posTop) {
        element?.scroll({ 
          top: 0, 
          left: posRight, 
          behavior: "smooth" 
        })

        firstRenderRef.current = false
      }
    }
  }, [scrollPosition])

  return <div className="timeline">
    <div className="timeline_top">
      <h2 className="title">Timeline Experiences</h2>
      <p className="subtitle">The best trip of every year</p>
    </div>

    <div id="timelineScrollX" className="timeline_wrapper">
      <ul className="timeline_list">
      {
        !loading && experiencesFiltered?.map((ele, idx) => {
          return (
            <li key={ele._id}>
              <span className="year">{ele.year}</span>

              <div className={`timeline_experience ${getItemClass(idx)}`}>
                <NavLink to={`/experience/${ele._id}`}>
                  <span className="line"></span>
                  <span className="thumb">
                    {ele.image ?
                      <img src={`${URL}/static/images/${ele.image}`} alt={ele.category} />
                      : <img src={thumb} alt={ele.category} />
                    }
                  </span>

                  <p className="info">
                    <span className="score">{ele.score}</span>
                    <span className="title">{ele.title}</span>
                  </p>
                </NavLink>
              </div>
            </li>
          )
        })
      }
      {error}
      </ul>
    </div>
  </div>
}

export default Timeline