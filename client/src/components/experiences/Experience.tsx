import { useState, useEffect, useContext, ChangeEvent, FormEvent } from 'react'
import DOMPurify from 'dompurify'
import { getData, postData } from '@utils/utils'
import { useScoresStore } from '../../store/scoresStore'
import { URL } from '../../config'
import { useParams } from 'react-router-dom'
import Moment from 'react-moment'
import CommentsByExp from '../CommentsByExp'
import Score from '../Score'
import Stars from '../Stars'
import Msgbox from '../common/Msgbox'
import Spinner from '../common/Spinner'
import Carousel from '../Carousel'
import { MyGlobalContext } from '@/components/context/useGlobalContext'

type PropsExperience = {
  user: string
}

type SingleExperience = {
  _id: string
  user?: string
  title: string
  category?: string
  date: Date
  image?: string
  images?: string[]
  content?: string
  score?: number
}

const Experience = ({ user }: PropsExperience) => {
  const { exp } = useParams()
  const [experience, setExperience] = useState<SingleExperience>()
  const [expLoading, setExpLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState({ body: '', classname: '' })

  // get experience from id param
  useEffect(() => {
    const fetchExperience = async () => {
      setExpLoading(true)
      try {
        const res = await getData(`${URL}/admin/experiences/${exp}`)
        setExperience(res.data)
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
  const { setTitleExperience }: any = useContext(MyGlobalContext)

  useEffect(() => {
    if (experience?.title) {
      setTitleExperience(experience.title)
    }
  }, [experience])

  // fetch scores
  const { scores, error, fetchScores } = useScoresStore()

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  const validExperienceImages = experience?.images?.filter((src): src is string => typeof src === 'string' && src && src !== 'null') || []
  const fallbackImage = experience?.image && experience.image !== 'null' ? experience.image : undefined
  const experienceImages = validExperienceImages.length > 0
    ? validExperienceImages
    : fallbackImage
      ? [fallbackImage]
      : []

  // comments
  useEffect(() => {
    getCommentsByExp()
  }, [exp])

  const getCommentsByExp = async () => {
    let url = `${URL}/admin/comments`
    try {
      const res = await getData(url)
      let data = res.data
      let tempComm = []
      for (let ele of data) {
        if (exp === ele.experience) {
          tempComm.push({ _id: ele._id, experience: ele.experience, user: ele.user, date: ele.date, content: ele.content })
        }
      }
      setComments(tempComm)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChangeComment = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    if (target) setComment(e.target.value)
  }

  const handleSubmitComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      let url = `${URL}/admin/comments/add`
      if (comment) {
        await postData(url, { user: user, experience: exp, content: comment })
        getCommentsByExp()
        setMessage({ body: `Comment added!`, classname: 'msg_ok' })
      } else {
        setMessage({ body: 'Write a comment', classname: 'msg_error' })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return <div className="page experience">
    <div className="container">
      <div className="wrapper flex">
        <div className="content_page">
          {expLoading ? <Spinner />
            : experience ?
              <>
                <div className="content_top">
                  <h3 className="content_title">{experience.title}</h3>
                  <Score exp={exp} scores={scores} />
                </div>

                {experienceImages.length > 0 &&
                  <Carousel
                    images={experienceImages}
                    showTitle={false}
                    title={experience.title}
                    subtitle={experience.category || ''}
                    autoplay={false}
                    interval={4000}
                  />
                }

                <p className="content_info">
                  <span className="cat">{experience.category}</span>
                  <span className="date">
                    <Moment format="YYYY/MM/DD">{experience.date}</Moment>
                  </span>
                </p>

                <p className="content_desc">{getDataParsed(experience.content)}</p>
              </>
              : <p className="msg error">Experience not found</p>
          }
          {error}
        </div>

        <div className="sidebar">
          <div className="sidebar_comments">
            <h3 className="sidebar_title">Write a comment</h3>

            <form className="form form_comments" onSubmit={handleSubmitComment}>
              <textarea className="form_control" placeholder="Write your comment" onChange={handleChangeComment} />
              <button className="btn">Add comment</button>
            </form>
          </div>

          <div className="sidebar_scores">
            <h3 className="sidebar_title">Score the experience <span>(1/5)</span></h3>

            <Stars exp={exp} />
          </div>

          <Msgbox body={message.body} classname={message.classname} />
        </div>
      </div>

      <CommentsByExp comments={comments} />
    </div>
  </div>
}

export default Experience