import { useState, useContext } from 'react'
import { useMessage } from '@/hooks/useMessage'
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
  const { message, showOk, showError, showWarning } = useMessage()
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
      showWarning('You must be logged in to score')
      return
    }

    setIsSending(true)
    try {
      const result = await vote(exp, i + 1)
      onScored?.(result.experienceScore, result.votes)
      showOk('Score added!')
    } catch (error) {
      showError(error, 'Could not add your score')
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
          aria-label={`Score ${i + 1} out of 5`}
        >{starHover === i ? <MdStar /> : <MdStarBorder />}</button>
      })
    }

    <Msgbox {...message} />
  </div>
}

export default Stars