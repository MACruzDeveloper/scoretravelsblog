import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CommentsByExp from '@/components/CommentsByExp'

describe('CommentsByExp', () => {
  it('renders the empty state when there are no comments', () => {
    render(<CommentsByExp comments={[]} />)

    expect(screen.getByRole('heading', { name: 'Comments' })).toBeInTheDocument()
    expect(screen.getByText('No Comments for this experience yet')).toBeInTheDocument()
  })
})
