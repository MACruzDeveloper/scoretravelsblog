import { useState, useEffect, useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getExps, getExpsStatus, getExpsError, fetchExps } from '../store/slice-experiences'
import { useAppDispatch, useAppSelector } from '../hooks/useDispatchSelector'
import { ScoreType, fetchScores, scoresSelector } from '../store/slice-scores'
import axios from 'axios'
import { URL } from '../config'
import { useParams } from 'react-router-dom'
import Moment from 'react-moment'
import CommentsByExp from './CommentsByExp'
import Score from './Score'
import Stars from './Stars'
import Msgbox from './common/Msgbox'
import Spinner from './common/Spinner'
import { Contexts } from '../App'

const Experience = ({ user }) => {
  const { exp } = useParams()
  const [experience, setExperience] = useState()

  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState({ body: '', classname: '' })

  // get experience from id param
  useEffect(() => {
    axios
      .get(`${URL}/admin/experiences/${exp}`)
      .then((res) => {
        setExperience(res.data)
      })
      .catch((err) => console.log(err))
  }, [])

  // To read html code from data api
  const getDataParsed = (data) => {
    const theObj = {__html: data}
    return <span dangerouslySetInnerHTML={theObj} />
  }

  // save experience title for Breadcrumbs
  const { setTitleExperience } = useContext(Contexts)

  useEffect(() => {
    if (experience?.title) {
      setTitleExperience(experience.title)
    }
  }, [experience])

  // fetch scores
  const [scores, setScores] = useState<Array<ScoreType>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const selectedScores = useAppSelector(scoresSelector)
  const dispatch = useAppDispatch()

  useEffect(() => {
    setLoading(selectedScores.loading)
    setError(selectedScores.error)
    setScores(selectedScores.scores)
  }, [selectedScores])

  function handleFetchScores() {
    dispatch(fetchScores())
  }

  useEffect(() => {
    handleFetchScores()
  }, [])


  // comments
  useEffect(() => {
    getCommentsByExp()
  }, [])

  const getCommentsByExp = async () => {
    let url = `${URL}/admin/comments`
    try {
      const res = await axios.get(url)
      let data = res.data
      let tempComm = []
      for (let ele of data) {
        if (exp === ele.experience) {
          tempComm.push({ experience: ele.experience, user: ele.user, date: ele.date, content: ele.content })
        }
      }
      setComments(tempComm)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChangeComment = e => {
    setComment(e.target.value)
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    try {
      let url = `${URL}/admin/comments/add`
      if (comment) {
        await axios.post(url, { user: user, experience: exp, content: comment })
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
          {experience ?
            <>
              <div className="content_top">
                <h3 className="content_title">{experience.title}</h3>
                {/* { experience.score && <p className="score">{experience.score}<span>/5</span></p> } */}
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
            <h3 className="sidebar_title">Score the experience</h3>

            <Stars exp={exp} user={user} />
          </div>

          <Msgbox message={message.body} classname={message.classname} />
        </div>
      </div>

      <CommentsByExp comments={comments} />
    </div>
  </div>
}

export default Experience