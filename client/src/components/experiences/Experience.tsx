import { useState, useEffect, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMessage } from '@/hooks/useMessage'
import { commentSchema, CommentForm } from '@/schemas'
import FieldError from '@/components/common/FieldError'
import DOMPurify from 'dompurify'
import { getExperience, getExperienceComments } from '@/api/experiences'
import { addComment } from '@/api/comments'
import { cityOf } from '@/utils/experience'
import type { Comment, Experience as ExperienceType } from '@/api/types'
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
  // The route always provides it; '' keeps the types simple
  const { exp = '' } = useParams()
  const [experience, setExperience] = useState<ExperienceType>()
  const [expLoading, setExpLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const { message, showOk, showError, showWarning } = useMessage()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  })

  // get experience from id param
  useEffect(() => {
    const fetchExperience = async () => {
      setExpLoading(true)
      try {
        setExperience(await getExperience(exp))
      } catch (err) {
        console.error(err)
        setExperience(undefined)
      } finally {
        setExpLoading(false)
      }
    }
    fetchExperience()
  }, [exp])

  // To read html code from data api
  // Content may contain HTML: sanitized before rendering
  const getDataParsed = (data = '') => {
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

  // Gallery images, or the single legacy `image`
  const galleryImages = experience?.images?.filter(Boolean) ?? []
  const experienceImages = galleryImages.length > 0 ? galleryImages : experience?.image ? [experience.image] : []

  // Only the comments of this experience, newest first
  const loadComments = async () => {
    try {
      setComments(await getExperienceComments(exp))
    } catch (error) {
      console.error(error)
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

  const onSubmitComment = async ({ content }: CommentForm) => {
    if (!user) return showWarning('You must be logged in to comment')
    try {
      await addComment(exp, content)
      await loadComments()
      reset({ content: '' })
      showOk('Comment added!')
    } catch (error) {
      showError(error, 'Could not add your comment')
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
                    <span className="cat">{cityOf(experience)?.name} </span>
                    <span className="cat">({cityOf(experience)?.country})</span>
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

            <form className="form form_comments" onSubmit={handleSubmit(onSubmitComment)} noValidate>
              <textarea className="form_control" placeholder="Write your comment" aria-label="Comment" maxLength={1000}
                aria-invalid={Boolean(errors.content)} {...register('content')} />
              <FieldError error={errors.content} />
              <button className="btn" disabled={isSubmitting}>Add comment</button>
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