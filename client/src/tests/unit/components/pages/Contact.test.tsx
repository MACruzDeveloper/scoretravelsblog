import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Contact from '@/components/Contact'

describe('Contact', () => {
  it('enables sending after accepting the terms', async () => {
    const user = userEvent.setup()
    render(<Contact />)

    const sendButton = screen.getByRole('button', { name: 'Send' })
    expect(sendButton).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: /accept terms/i }))

    expect(sendButton).toBeEnabled()
  })
})
