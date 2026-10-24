import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { API } from '@/config'
import Contact from '@/components/Contact'

const renderContact = () => render(<BrowserRouter><Contact /></BrowserRouter>)

describe('Contact', () => {
  it('explains what is missing instead of sending', async () => {
    const user = userEvent.setup()
    renderContact()

    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('Write your name')).toBeInTheDocument()
    expect(screen.getByText('Write your email')).toBeInTheDocument()
    expect(screen.getByText('Write a message')).toBeInTheDocument()
    expect(screen.getByText('Accept the privacy policy to continue')).toBeInTheDocument()
  })

  it('sends the message once the form is valid', async () => {
    const user = userEvent.setup()
    let sent: unknown
    server.use(
      http.post(`${API}/contact`, async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ ok: true, message: 'email sent' })
      })
    )
    renderContact()

    await user.type(screen.getByLabelText('Name'), 'Ana')
    await user.type(screen.getByLabelText('Email'), 'ana@example.com')
    await user.type(screen.getByLabelText('Message'), 'Hello!')
    await user.click(screen.getByRole('checkbox', { name: /accept the privacy policy/i }))
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('Your message has been sent, thanks!')).toBeInTheDocument()
    expect(sent).toMatchObject({ name: 'Ana', email: 'ana@example.com', message: 'Hello!', website: '' })
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue(''))
  })
})
