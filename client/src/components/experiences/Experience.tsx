import { useState, useEffect, useContext, ChangeEvent, FormEvent } from 'react'
import { getData, postData } from '../../utils/utils'
import { useScoresStore } from '../../store/scoresStore'
import { URL } from '../../config'
import { useParams } from 'react-router-dom'
import Moment from 'react-moment'
import CommentsByExp from '../CommentsByExp'
import Score from '../Score'
import Stars from '../Stars'
import Msgbox from '../common/Msgbox'
import Spinner from '../common/Spinner'
import { MyGlobalContext } from '../../App'

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
  content?: string
  score?: number
}

const Experience = ({ user }: PropsExperience) => {
  const { exp } = useParams()
  const [experience, setExperience] = useState<SingleExperience>()

  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState({ body: '', classname: '' })

  // get experience from id param
  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const res = await getData(`${URL}/admin/experiences/${exp}`)
        setExperience(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    fetchExperience()
  }, [])

  // To read html code from data api
  const getDataParsed = (data: string) => {
    const theObj = {__html: data}
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
  const { scores, loading, error, fetchScores } = useScoresStore()

  useEffect(() => {
    fetchScores()
  }, [fetchScores])


  // comments
  useEffect(() => {
    getCommentsByExp()
  }, [])

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
          {!loading && experience ?
            <>
              <div className="content_top">
                <h3 className="content_title">{experience.title}</h3>
                <Score exp={exp} scores={scores} />
              </div>

              { experience.image &&
                <span className="content_image ima f16x9">
                  <img src={`${URL}/static/images/${experience.image}`} alt={experience.title} />
                </span>
              }

              <p className="content_info">
                <span className="cat">{experience.category}</span>
                <span className="date">
                  <Moment format="YYYY/MM/DD">{experience.date}</Moment>
                </span>
              </p>

              <p className="content_desc">{getDataParsed(experience.content)}</p>
            </>
            : <Spinner />
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