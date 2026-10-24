type PropsScore = {
  score?: number | null
  votes?: number
}

// Display only: the server keeps score (average) and votes (count) in sync
const Score = ({ score, votes = 0 }: PropsScore) => {
  if (score == null) return null

  const display = Math.round(score * 10) / 10
  const title = votes ? `${votes} ${votes === 1 ? 'vote' : 'votes'}` : undefined

  return <p className="score" title={title}>
    {display}<span>/5</span>
  </p>
}

export default Score
