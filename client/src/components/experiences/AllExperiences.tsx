import { useState, useEffect, useMemo } from 'react'
import { sortBy } from "lodash"
import { useExperienceStore } from '../../store/experienceStore'
import Card, { PropsCard } from '../common/Card'
import Pagination from '../common/Pagination'

const AllExperiences = () => {
  const { experiences, loading, error, fetchExperiences } = useExperienceStore()

  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const sortedExps = useMemo(() => sortBy(experiences, ['date']).reverse(), [experiences])
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentExps = sortedExps.slice(indexOfFirstItem, indexOfLastItem)
  const paginate = (i: number) => setCurrentPage(i)

  return <div className="page experiences">
    <div className="container">
      <div className="wrapper">
        <div className="top">
          <h2 className="title">All Experiences</h2>
        </div>

        <div className="content flex">
          {
            !loading && currentExps.map((ele: PropsCard) => {

              return <Card
                key={`exp-${ele._id}`}
                category={ele.category}
                content={ele.content}
                score={ele.score}
                date={ele.date}
                image={ele.image}
                title={ele.title}
                _id={ele._id}
              />
            })
          }
        </div>

        <div className="msg_error" role="alert">{error}</div>

        {
          experiences.length > 0 && experiences.length > itemsPerPage &&

          <Pagination
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalItems={experiences.length}
            paginate={paginate}
          />
        }
      </div>
    </div>
  </div>
}

export default AllExperiences