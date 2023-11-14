import { useState, useEffect } from 'react'
import axios from 'axios'
import { URL } from '../config'

const Score = ({ scores, exp }) => {
  const [score, setScore] = useState(null)
  const [hasScore, setHasScore] = useState(false)

  useEffect(() => {
    getScore()
  }, [scores, score])

  const getScore = () => {
    let tempSc = []
    for (let ele of scores) {
      if (exp === ele.experience) {
        if (ele.score !== '') {
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

  const uploadScore = async (sc) => {
    let idExp = exp._id
    try {
      let url = `${URL}/admin/experiences/update`
      await axios.post(url, { _id: idExp, score: sc })
    } catch (error) {
      console.log(error)
    }
  }

  return <p className="score">
    {hasScore && <>{score}<span>/5</span></>}
  </p>
}

export default Score