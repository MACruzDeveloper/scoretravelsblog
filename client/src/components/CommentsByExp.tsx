import Moment from 'react-moment'
import type { Comment } from '@/store/commentsStore'

type PropsComments = {
  comments: Array<Comment>
}

const CommentsByExp = ({ comments }: PropsComments) => {

  return <aside className="comments_module">
    <div className="top">
      <h3 className="title">Comments</h3>
    </div>

    {comments.length > 0 ?
      <ul className="list">
        {
          comments.map((ele) => {
            return <li key={`${ele._id}`}>
              <p className="comment">"{ele.content}"</p>
              <p className="info">
                <span className="user">{ele.user}</span>
                <span className="date">
                  <Moment format="YYYY/MM/DD">{ele.date}</Moment>
                </span>
              </p>
            </li>
          })
        }
      </ul> : <p className="no_results">No Comments for this experience yet</p>}
  </aside>
}

export default CommentsByExp