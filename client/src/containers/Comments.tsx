import { useState, useEffect } from 'react'
import axios from 'axios'
import { sortBy } from "lodash"
import Moment from 'react-moment'
import { MdDelete } from 'react-icons/md'
import { useCommentsStore } from '../store/commentsStore'
import { URL } from '../config'
import Pagination from '../components/common/Pagination'
import Msgbox from '../components/common/Msgbox'

const Comments = () => {
  // fetch Comments
  const { comments, loading, error, fetchComments } = useCommentsStore()
  const [message, setMessage] = useState({ body: '', classname: '' })

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const onClickDelete = async (id: string) => {
    try {
      let url = `${URL}/admin/comments/delete`
      await axios.post(url, { _id: id })
      fetchComments()
      setMessage({ body: `Comment deleted!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const sortedComments = sortBy(comments, ['date']).reverse()
  const currentComments = sortedComments.slice(indexOfFirstItem, indexOfLastItem)
  const paginate = (i: number) => setCurrentPage(i)

  return <div className="content comments">
    <div className="content_top">
      <h2 className="content_top_title">Comments</h2>
    </div>

    <div className="table_scroll">
      <div className="table">
        <div className="tRow tHead">
          <div className="tCol w15"><span><strong>User</strong></span></div>
          <div className="tCol w10"><span><strong>Date</strong></span></div>
          <div className="tCol w25"><span><strong>Experience</strong></span></div>
          <div className="tCol w30"><span><strong>Content</strong></span></div>
          <div className="tCol w10 center"><span><strong>Action</strong></span></div>
        </div>
        {
          !loading && currentComments.map((ele) => {
            return <div className="tGroup" key={ele._id}>
              <div className="tRow">
                <div className="tCol">
                  <span>{ele.user || 'Not registered'}</span>
                </div>
                <div className="tCol">
                  <span><Moment format="YYYY/MM/DD">{ele.date}</Moment></span>
                </div>
                <div className="tCol">
                  <span>{ele.experience}</span>
                </div>
                <div className="tCol">
                  <span>{ele.content}</span>
                </div>
                <div className="tCol center">
                  <div className="icons">
                    <button className="btn_action" onClick={() => onClickDelete(ele._id)}>
                      <MdDelete />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          })
        }
        {error}
      </div>
    </div>

    {
      comments.length > 0 && comments.length > itemsPerPage &&

      <Pagination
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={comments.length}
        paginate={paginate}
      />
    }
    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Comments
