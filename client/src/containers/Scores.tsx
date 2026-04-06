import { useState, useEffect } from 'react'
import { postData } from '../utils/utils'
import { sortBy } from 'lodash'
import { MdDelete } from 'react-icons/md'
import { useScoresStore } from '../store/scoresStore'
import { URL } from '../config'
import Pagination from '../components/common/Pagination'
import Msgbox from '../components/common/Msgbox'

const Scores = () => {
  // fetch scores
  const { scores, loading, error, fetchScores } = useScoresStore()
  const [message, setMessage] = useState({ body: '', classname: '' })

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  const onClickDelete = async (id: string) => {
    try {
      let url = `${URL}/admin/scores/delete`
      await postData(url, { _id: id })
      fetchScores()
      setMessage({ body: `Score deleted!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const sortedScores = sortBy(scores, ['date']).reverse()
  const currentScores = sortedScores.slice(indexOfFirstItem, indexOfLastItem)
  const paginate = (i: number) => setCurrentPage(i)

  return <div className="content scores">
    <div className="content_top">
      <h2 className="content_top_title">Scores</h2>
    </div>

    <div className="table_scroll">
      <div className="table">
        <div className="tGroup tHead">
          <div className="tRow">
            <div className="tCol w40"><span><strong>Experience</strong></span></div>
            <div className="tCol w30"><span><strong>User</strong></span></div>
            <div className="tCol w20 center"><span><strong>Score</strong></span></div>
            <div className="tCol w10 right"><span><strong>Action</strong></span></div>
          </div>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}

        {
          currentScores.map((ele) => {
            return <div className="tGroup" key={ele._id}>
              <div className="tRow">
                <div className="tCol">
                  <span>{ele.experience}</span>
                </div>
                <div className="tCol">
                  <span>{ele.user}</span>
                </div>
                <div className="tCol center">
                  <span>{ele.score}</span>
                </div>
                <div className="tCol center">
                  <div className="icons">
                    <button type="button" className="btn_action" onClick={() => onClickDelete(ele._id)}>
                      <MdDelete />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          })
        }
      </div>
    </div>

    {
      scores.length > 0 && scores.length > itemsPerPage &&

      <Pagination
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={scores.length}
        paginate={paginate}
      />
    }

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Scores
