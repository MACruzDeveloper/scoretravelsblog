import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { API } from '@/config'
import Login from '@/components/admin/login/Login'

describe('Login', () => {
  it('asks for the missing fields', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Login login={vi.fn()} /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'login' }))

    expect(await screen.findByText('Write your email')).toBeInTheDocument()
    expect(screen.getByText('Write your password')).toBeInTheDocument()
  })

  it('shows the server message for wrong credentials', async () => {
    const user = userEvent.setup()
    server.use(http.post(`${API}/auth/login`, () => HttpResponse.json({ ok: false, message: 'Invalid email or password' }, { status: 401 })))
    render(<MemoryRouter><Login login={vi.fn()} /></MemoryRouter>)

    await user.type(screen.getByLabelText('Email'), 'ana@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'login' }))

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
  })
})
