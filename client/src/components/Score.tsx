import { useState, useEffect } from 'react'
import { postData } from '@/utils/utils'
import { URL } from '../config'
import type { ScoreType } from '@/store/scoresStore'

type PropsScore = {
  scores: Array<ScoreType>
  exp: string
}

const Score = ({ scores, exp }: PropsScore) => {
  const [hasScore, setHasScore] = useState(false)

  const expScores = scores.filter(ele => exp === ele.experience && typeof ele.score === 'number' && ele.score > 0)

  useEffect(() => {
    const matching = scores.filter(ele => exp === ele.experience && typeof ele.score === 'number' && ele.score > 0)

    if (matching.length === 0) {
      setHasScore(false)
      return
    }

    const avg = matching.reduce((acc, ele) => acc + ele.score, 0) / matching.length
    const rounded = Math.round(avg * 10) / 10
    setHasScore(true)

    ;(async () => {
      try {
        await postData(`${URL}/admin/experiences/update_score`, {
          _id: exp,
          score: rounded
        })
      } catch (error) {
        console.log(error)
      }
    })()
  }, [scores, exp])

  if (!hasScore || expScores.length === 0) return null

  const avg = expScores.reduce((acc, ele) => acc + ele.score, 0) / expScores.length
  const display = Math.round(avg * 10) / 10

  return <p className="score">
    {display}<span>/5</span>
  </p>
}

export default Score
