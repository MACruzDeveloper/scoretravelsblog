import type { ScoreType } from '@/store/scoresStore'

type PropsScore = {
  scores: Array<ScoreType>
  exp: string
}

// Display only: the server keeps the experience score in sync with its votes
const Score = ({ scores, exp }: PropsScore) => {
  const expScores = scores.filter(ele => exp === ele.experience && typeof ele.score === 'number' && ele.score > 0)

  if (expScores.length === 0) return null

  const avg = expScores.reduce((acc, ele) => acc + ele.score, 0) / expScores.length
  const display = Math.round(avg * 10) / 10

  return <p className="score">
    {display}<span>/5</span>
  </p>
}

export default Score
