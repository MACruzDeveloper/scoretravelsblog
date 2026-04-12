import { useState, useEffect } from 'react'
import { postData } from '@/utils/utils'
import { URL } from '../config'
import type { ScoreType } from '@/store/scoresStore'

type PropsScore = {
  scores: Array<ScoreType>
  exp: string
}

const Score = ({ scores, exp }: PropsScore) => {
  const [score, setScore] = useState(null)
  const [hasScore, setHasScore] = useState(false)

  const getScore = () => {
    let tempSc = []
    for (let ele of scores) {
      if (exp === ele.experience) {
        if (ele.score) {
          tempSc.push(ele.score)
          setHasScore(true)
        }
      }
    }
    let result = 0
    tempSc.forEach(i => {
      result += i
    })
    result = (result / tempSc.length)
    result = Math.round(result * 10) / 10
    uploadScore(result)
    setScore(result)
  }

  const uploadScore = async (scoreNum: number) => {
    try {
      let url = `${URL}/admin/experiences/update_score`
      await postData(url, {
        _id: exp,
        score: scoreNum 
      })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getScore()
  }, [score])

  return <p className="score">
    {hasScore && <>{score}<span>/5</span></>}
  </p>
}

export default Score