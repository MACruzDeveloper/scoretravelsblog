import { NavLink } from 'react-router-dom'
import FormattedDate from '@/components/common/FormattedDate'
import { URL } from '../../config'
import thumb from '@images/thumb.png'
import type { Experience } from '@/api/types'
import { cityOf, coverOf } from '@/utils/experience'
import { MdArrowRightAlt } from "react-icons/md"

export type PropsCard = Pick<Experience, '_id' | 'title' | 'category' | 'city' | 'content' | 'date' | 'image' | 'images' | 'score'> & {
  lazy?: boolean
}

const Card = ({ _id, title, city, content, date, image, images, score, lazy }: PropsCard) => {
  const countryName = cityOf({ city })?.country
  const cardImage = coverOf({ image, images })

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
        <FormattedDate date={date} />
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