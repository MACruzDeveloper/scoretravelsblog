import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { URL } from '../config'
import { useTimelineExperiences } from '@/hooks/useExperienceHooks'
import useScrollPosition from '@/hooks/useScrollPosition'

import thumb from '@images/thumb.png'

const Timeline = () => {
  const { timelineExperiences, loading, error } = useTimelineExperiences()
  
  const getItemClass = (index: number) => {
    return index % 2 && 'reverse'
  }
  
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
        !loading && timelineExperiences?.map((ele, idx) => {
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