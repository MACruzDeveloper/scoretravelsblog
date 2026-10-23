import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { API } from '@/config'
import Register from '@/components/admin/login/Register'

const renderRegister = (login = vi.fn()) => render(<MemoryRouter><Register login={login} /></MemoryRouter>)

const fill = async (user: ReturnType<typeof userEvent.setup>, values: Record<string, string>) => {
  for (const [label, value] of Object.entries(values)) await user.type(screen.getByLabelText(label), value)
}

describe('Register', () => {
  it('validates before sending: username, short password and mismatch', async () => {
    const user = userEvent.setup()
    let requests = 0
    server.use(http.post(`${API}/auth/register`, () => { requests++; return HttpResponse.json({}) }))
    renderRegister()

    await fill(user, { Username: 'a b', Email: 'ana@example.com', Password: 'short', 'Confirm password': 'other' })
    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(await screen.findByText('Username can only contain letters, numbers, _ . -')).toBeInTheDocument()
    expect(screen.getByText('Password must have at least 8 characters')).toBeInTheDocument()
    expect(screen.getByText('Passwords must match')).toBeInTheDocument()
    expect(requests).toBe(0)
  })

  it('signs the new user in with the session returned by the server', async () => {
    const user = userEvent.setup()
    const login = vi.fn()
    const session = { token: 't', username: 'ana', email: 'ana@example.com', role: 'user' }
    server.use(http.post(`${API}/auth/register`, () => HttpResponse.json({ ok: true, ...session }, { status: 201 })))
    renderRegister(login)

    await fill(user, { Username: 'ana', Email: 'ana@example.com', Password: 'supersecret', 'Confirm password': 'supersecret' })
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await vi.waitFor(() => expect(login).toHaveBeenCalledWith(expect.objectContaining(session)))
  })

  it('shows the server error, e.g. a taken email', async () => {
    const user = userEvent.setup()
    server.use(http.post(`${API}/auth/register`, () => HttpResponse.json({ ok: false, message: 'Email or username already in use' }, { status: 409 })))
    renderRegister()

    await fill(user, { Username: 'ana', Email: 'ana@example.com', Password: 'supersecret', 'Confirm password': 'supersecret' })
    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(await screen.findByText('Email or username already in use')).toBeInTheDocument()
  })
})
