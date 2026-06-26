import { NavLink } from 'react-router-dom'
import Moment from 'react-moment'
import { URL } from '../../config'
import thumb from '@images/thumb.png'
import { City } from '../../store/experienceStore'
import { MdArrowRightAlt } from "react-icons/md"

export type PropsCard = {
  _id: string
  title: string
  category?: string
  city?: City | string
  content?: string
  date?: Date
  image?: string
  images?: string[]
  score?: number,
  lazy?: boolean
}

const Card = ({ _id, title, city, content, date, image, images, score, lazy }: PropsCard) => {
  const countryName = city && typeof city === 'object' ? city.country : null
  const validImages = images?.filter((src): src is string => typeof src === 'string' && src && src !== 'null')
  const cardImage = validImages && validImages.length ? validImages[0] : (image && image !== 'null' ? image : undefined)

  return <div className="card">
    <NavLink className="card_link" to={`/experience/${_id}`}>
      <span className="ima f16x9">
        <span className="card_category">{countryName}</span>
        { score && score > 0 ? <span className="card_score">{score}</span> : null }
        <img 
          loading={lazy ? "lazy" : "eager"} 
          src={cardImage ? `${URL}/static/images/${cardImage}` : thumb} 
          alt={title} 
        />
      </span>
      <p className="card_title">{title}</p>

      { date && 
      <p className="card_date">
        <Moment format="YYYY/MM/DD">{date}</Moment>
      </p> 
      }
      <p className="card_content">{content}</p>

      <span className="card_more">
        <span>Read more</span>
        <span className="icon"><MdArrowRightAlt /></span>
      </span>
    </NavLink>
  </div>
}

export default Card