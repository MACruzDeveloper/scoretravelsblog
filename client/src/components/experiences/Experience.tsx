import { useState, useEffect, useContext, ChangeEvent, FormEvent } from 'react'
import { getErrorMessage } from '@/utils/errors'
import DOMPurify from 'dompurify'
import { postData } from '@utils/utils'
import { API } from '../../config'
import { getExperience, getExperienceComments } from '@/api/experiences'
import type { Comment } from '@/store/commentsStore'
import type { Experience as ExperienceType } from '@/store/experienceStore'
import { useParams } from 'react-router-dom'
import FormattedDate from '@/components/common/FormattedDate'
import CommentsByExp from '../CommentsByExp'
import Score from '../Score'
import Stars from '../Stars'
import Msgbox from '../common/Msgbox'
import Spinner from '../common/Spinner'
import Carousel from '../Carousel'
import thumb from '@images/thumb.png'
import { MyGlobalContext } from '@/components/context/useGlobalContext'

type PropsExperience = {
  user: string
}

const Experience = ({ user }: PropsExperience) => {
  const { exp } = useParams()
  const [experience, setExperience] = useState<ExperienceType>()
  const [expLoading, setExpLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState({ body: '', classname: '' })

  // get experience from id param
  useEffect(() => {
    const fetchExperience = async () => {
      setExpLoading(true)
      try {
        setExperience(await getExperience(exp))
      } catch (err) {
        console.log(err)
        setExperience(undefined)
      } finally {
        setExpLoading(false)
      }
    }
    fetchExperience()
  }, [exp])

  // To read html code from data api
  const getDataParsed = (data: string) => {
    const theObj = { __html: DOMPurify.sanitize(data) }
    return <span dangerouslySetInnerHTML={theObj} />
  }

  // save experience title for Breadcrumbs
  const { setTitleExperience } = useContext(MyGlobalContext) as { setTitleExperience: (title: string) => void }

  useEffect(() => {
    if (experience?.title) {
      setTitleExperience(experience.title)
    }
  }, [experience?.title, setTitleExperience])

  const validExperienceImages = experience?.images?.filter((src): src is string => typeof src === 'string' && src && src !== 'null') || []
  const fallbackImage = experience?.image && experience.image !== 'null' ? experience.image : undefined
  const experienceImages = validExperienceImages.length > 0
    ? validExperienceImages
    : fallbackImage
      ? [fallbackImage]
      : []

  // Only the comments of this experience, newest first
  const loadComments = async () => {
    try {
      setComments(await getExperienceComments(exp))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exp])

  // The server answers a vote with the new average and vote count
  const handleScored = (score: number | null, votes: number) => {
    setExperience((prev) => prev && { ...prev, score, votes })
  }

  const handleChangeComment = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    if (target) setComment(e.target.value)
  }

  const handleSubmitComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) {
      setMessage({ body: 'You must be logged in to comment', classname: 'msg_error' })
      return
    }
    try {
      const url = `${API}/comments`
      if (comment.trim()) {
        await postData(url, { experience: exp, content: comment.trim() })
        await loadComments()
        setComment('')
        setMessage({ body: `Comment added!`, classname: 'msg_ok' })
      } else {
        setMessage({ body: 'Write a comment', classname: 'msg_error' })
      }
    } catch (error) {
      console.log(error)
      setMessage({ body: getErrorMessage(error, 'Could not add your comment'), classname: 'msg_error' })
    }
  }

  return <div className="page experience">
    <div className="container">
      <div className="wrapper flex">
        <div className="content_page">
          {expLoading ? <Spinner />
            : experience ?
              <>
                {/* Only the author and admins can open an unpublished experience */}
                {experience.status && experience.status !== 'published' &&
                  <p className={`status status_${experience.status} status_banner`}>
                    {experience.status === 'pending'
                      ? 'Pending review: only you and the administrators can see it'
                      : `Rejected${experience.rejectionReason ? `: ${experience.rejectionReason}` : ''}. Edit it to send it for review again`}
                  </p>
                }
                <div className="content_top">
                  <h3 className="content_title">{experience.title}</h3>
                  <Score score={experience.score} votes={experience.votes} />
                </div>

                {experienceImages.length > 0
                  ? <Carousel
                    images={experienceImages}
                    showTitle={false}
                    title={experience.title}
                    subtitle={experience.category || ''}
                    autoplay={false}
                    interval={4000}
                  />
                  // Same default image as the cards when there are no photos
                  : <img className="content_image" src={thumb} alt={experience.title} />
                }

                <p className="content_info">
                  <span>
                    <span className="cat">{experience.city && typeof experience.city === 'object' ? experience.city.name : ''} </span>
                    <span className="cat">({experience.city && typeof experience.city === 'object' ? experience.city.country : ''})</span>
                    <span> · </span>
                    {/* <span className="cat">{experience.category}</span> */}
                  </span>
                  <span className="date">
                    <FormattedDate date={experience.date} />
                  </span>
                </p>

                <p className="content_desc">{getDataParsed(experience.content)}</p>
              </>
              : <p className="msg error">Experience not found</p>
          }
        </div>

        {/* Comments and votes are only possible once the experience is published */}
        {(!experience?.status || experience.status === 'published') && <div className="sidebar">
          <div className="sidebar_comments">
            <h3 className="sidebar_title">Write a comment</h3>

            <form className="form form_comments" onSubmit={handleSubmitComment}>
              <textarea className="form_control" placeholder="Write your comment" value={comment} maxLength={1000} onChange={handleChangeComment} />
              <button className="btn">Add comment</button>
            </form>
          </div>

          <div className="sidebar_scores">
            <h3 className="sidebar_title">Score the experience <span>(1/5)</span></h3>

            <Stars exp={exp} onScored={handleScored} />
          </div>

          <Msgbox body={message.body} classname={message.classname} />
        </div>}
      </div>

      <CommentsByExp comments={comments} />
    </div>
  </div>
}

export default Experience