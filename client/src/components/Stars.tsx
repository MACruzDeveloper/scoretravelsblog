import { useState, useContext } from 'react'
import { getErrorMessage } from '@/utils/errors'
import { vote } from '@/api/scores'
import { MdStar, MdStarBorder } from 'react-icons/md'
import { MyGlobalContext } from '@/components/context/useGlobalContext'
import Msgbox from './common/Msgbox'

type PropsStars = {
  exp: string
  // Receives the new average and vote count returned by the server
  onScored?: (score: number | null, votes: number) => void
}

const Stars = ({ exp, onScored }: PropsStars) => {
  const { user } = useContext(MyGlobalContext)
  const [message, setMessage] = useState({ body: '', classname: '' })
  const [starHover, setStarHover] = useState(-1)
  const [isSending, setIsSending] = useState(false)
  const stars = []
  const numStars = 5

  for (let i = 0; i < numStars; i++) {
    stars.push(`score${i}`)
  }

  const onHandleHover = (i: number) => {
    return setStarHover(i)
  }

  const onClickScore = async (i: number) => {
    if (isSending) return

    if (!user) {
      setMessage({ body: 'You must be logged in to score', classname: 'msg_error' })
      return
    }

    setIsSending(true)
    try {
      const result = await vote(exp, i + 1)
      onScored?.(result.experienceScore, result.votes)
      setMessage({ body: `Score added!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
      setMessage({ body: getErrorMessage(error, 'Could not add your score'), classname: 'msg_error' })
    } finally {
      setIsSending(false)
    }
  }

  return <div className="stars">
    {
      stars.map((ele, i) => {
        return <button
          key={ele}
          name={ele}
          className="btn_icon"
          onMouseEnter={() => onHandleHover(i)}
          onMouseLeave={() => onHandleHover(-1)}
          onClick={() => onClickScore(i)}
        >{starHover === i ? <MdStar /> : <MdStarBorder />}</button>
      })
    }

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Stars