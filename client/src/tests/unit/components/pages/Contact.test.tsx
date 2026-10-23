import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Contact from '@/components/Contact'

describe('Contact', () => {
  it('enables sending after accepting the privacy policy', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    )

    const sendButton = screen.getByRole('button', { name: 'Send' })
    expect(sendButton).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: /accept the privacy policy/i }))

    expect(sendButton).toBeEnabled()
  })
})
