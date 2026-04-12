import { NavLink } from 'react-router-dom'
import Moment from 'react-moment'
import { URL } from '../../config'
import thumb from '@images/thumb.png'

export type PropsCard = {
  _id: string
  title: string
  category?: string
  content?: string
  date?: Date
  image?: string
  score?: number
}

const Card = ({ _id, title, category, content, date, image, score }: PropsCard) => {

  return <div className="card">
    <NavLink className="card_link" to={`/experience/${_id}`}>
      <span className="ima f16x9">
        <span className="backOp"></span>
        <span className="card_category">{category}</span>
        { score && score > 0 ? <span className="card_score">{score}</span> : null }
        <img src={image ? `${URL}/static/images/${image}` : thumb} alt={title} />
      </span>
      <p className="card_title">{title}</p>

      { date && 
      <p className="card_date">
        <Moment format="YYYY/MM/DD">{date}</Moment>
      </p> 
      }
      <p className="card_content">{content}</p>
      <span className="card_more">Read more</span>
    </NavLink>
  </div>
}

export default Card