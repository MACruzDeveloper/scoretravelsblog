import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Stars from '@/components/Stars'

describe('Stars', () => {
  it('shows an authentication message when an anonymous user scores', async () => {
    const user = userEvent.setup()
    render(<Stars exp="experience-1" />)

    await user.click(screen.getAllByRole('button')[0])

    expect(screen.getByText('You must be logged in to score')).toBeInTheDocument()
  })
})
