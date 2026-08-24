import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Score from '@/components/Score'

describe('Score', () => {
  it('renders the average score for an experience', async () => {
    render(
      <Score
        exp="experience-1"
        scores={[
          { _id: 'score-1', experience: 'experience-1', user: 'user-1', score: 4 },
          { _id: 'score-2', experience: 'experience-1', user: 'user-2', score: 5 },
        ]}
      />
    )

    expect(await screen.findByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('/5')).toBeInTheDocument()
  })
})
