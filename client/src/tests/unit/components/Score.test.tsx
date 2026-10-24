import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Score from '@/components/Score'

describe('Score', () => {
  it('renders the rounded score with the vote count as title', () => {
    render(<Score score={4.46} votes={2} />)

    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('/5')).toBeInTheDocument()
    expect(screen.getByTitle('2 votes')).toBeInTheDocument()
  })

  it('renders nothing without a score', () => {
    const { container } = render(<Score score={null} />)

    expect(container).toBeEmptyDOMElement()
  })
})
