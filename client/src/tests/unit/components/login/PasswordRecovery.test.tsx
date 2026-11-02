import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { API } from '@/config'
import ForgotPassword from '@/components/admin/login/ForgotPassword'
import ResetPassword from '@/components/admin/login/ResetPassword'
import ChangePassword from '@/components/admin/ChangePassword'

const TOKEN = 'a'.repeat(64)

describe('ForgotPassword', () => {
  it('sends the email and shows the answer of the server instead of the form', async () => {
    const user = userEvent.setup()
    let sent: unknown
    server.use(http.post(`${API}/auth/forgot-password`, async ({ request }) => {
      sent = await request.json()
      return HttpResponse.json({ ok: true, message: 'If that email is registered, we have sent a link' })
    }))
    render(<MemoryRouter><ForgotPassword /></MemoryRouter>)

    await user.type(screen.getByLabelText('Email'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: 'Send link' }))

    expect(await screen.findByText(/If that email is registered/)).toBeInTheDocument()
    expect(sent).toEqual({ email: 'ana@example.com' })
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
  })
})

describe('ResetPassword', () => {
  const Address = () => <output data-testid="address">{useLocation().pathname + useLocation().hash}</output>
  const renderAt = (entry: string) => render(
    <MemoryRouter initialEntries={[entry]}><ResetPassword /><Address /></MemoryRouter>
  )
  const fill = async (user: ReturnType<typeof userEvent.setup>, password: string, repeated = password) => {
    await user.type(screen.getByLabelText('New password'), password)
    await user.type(screen.getByLabelText('Confirm new password'), repeated)
    await user.click(screen.getByRole('button', { name: 'Change password' }))
  }

  it('sends the token of the link, and takes it out of the address', async () => {
    const user = userEvent.setup()
    let sent: unknown
    server.use(http.post(`${API}/auth/reset-password`, async ({ request }) => {
      sent = await request.json()
      return HttpResponse.json({ ok: true, message: 'Password changed. You can sign in now' })
    }))
    renderAt(`/reset-password#token=${TOKEN}`)

    expect(screen.getByTestId('address')).toHaveTextContent(/^\/reset-password$/)
    await fill(user, 'a-new-password')

    expect(await screen.findByText(/Password changed/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to login' })).toBeInTheDocument()
    expect(sent).toEqual({ token: TOKEN, password: 'a-new-password', password2: 'a-new-password' })
  })

  it('asks for matching passwords and shows when the link has expired', async () => {
    const user = userEvent.setup()
    server.use(http.post(`${API}/auth/reset-password`, () =>
      HttpResponse.json({ ok: false, message: 'This link is not valid or has expired' }, { status: 400 })
    ))
    renderAt(`/reset-password#token=${TOKEN}`)

    await fill(user, 'a-new-password', 'something-else')
    expect(await screen.findByText('Passwords must match')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Confirm new password'))
    await user.type(screen.getByLabelText('Confirm new password'), 'a-new-password')
    await user.click(screen.getByRole('button', { name: 'Change password' }))
    expect(await screen.findByText('This link is not valid or has expired')).toBeInTheDocument()
  })

  it('offers a new link when there is no token', () => {
    renderAt('/reset-password')

    expect(screen.getByRole('alert')).toHaveTextContent('This link is not valid')
    expect(screen.getByRole('link', { name: 'Ask for a new one' })).toHaveAttribute('href', '/forgot-password')
  })
})

describe('ChangePassword', () => {
  const fill = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText('Current password'), 'old-password')
    await user.type(screen.getByLabelText('New password'), 'a-new-password')
    await user.type(screen.getByLabelText('Confirm new password'), 'a-new-password')
    await user.click(screen.getByRole('button', { name: 'Change password' }))
  }

  it('keeps this device signed in with the new session and empties the form', async () => {
    const user = userEvent.setup()
    const login = vi.fn()
    const session = { token: 'new-token', username: 'ana', email: 'ana@example.com', role: 'user' }
    server.use(http.post(`${API}/auth/change-password`, () => HttpResponse.json({ ok: true, ...session })))
    render(<ChangePassword login={login} />)

    await fill(user)

    expect(await screen.findByText(/Password changed/)).toBeInTheDocument()
    expect(login).toHaveBeenCalledWith(expect.objectContaining({ token: 'new-token' }))
    expect(screen.getByLabelText('Current password')).toHaveValue('')
  })

  it('shows the error of a wrong current password', async () => {
    const user = userEvent.setup()
    const login = vi.fn()
    server.use(http.post(`${API}/auth/change-password`, () =>
      HttpResponse.json({ ok: false, message: 'The current password is not correct' }, { status: 400 })
    ))
    render(<ChangePassword login={login} />)

    await fill(user)

    expect(await screen.findByText('The current password is not correct')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })
})
