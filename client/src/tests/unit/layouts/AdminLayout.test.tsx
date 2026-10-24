import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import AdminLayout from '@/layouts/AdminLayout'
import RequireAdmin from '@/layouts/RequireAdmin'
import { MyGlobalContext, GlobalContent } from '@/components/context/useGlobalContext'

const renderAdmin = (session: Partial<GlobalContent>, path = '/admin/experiences') => {
  const context: GlobalContent = {
    isLoggedIn: false, authChecked: true, user: '', username: '', role: '',
    setRole: vi.fn(), titleExperience: '', setTitleExperience: vi.fn(), ...session,
  }
  return render(
    <MyGlobalContext.Provider value={context}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="experiences" element={<p>My experiences content</p>} />
            <Route path="users" element={<RequireAdmin><p>Users content</p></RequireAdmin>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </MyGlobalContext.Provider>
  )
}

describe('AdminLayout', () => {
  it('waits for the session check instead of redirecting', () => {
    renderAdmin({ authChecked: false })

    expect(document.querySelector('.spinner')).toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })

  it('redirects to login without a session', () => {
    renderAdmin({ isLoggedIn: false })

    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('lets regular users manage their experiences', async () => {
    renderAdmin({ isLoggedIn: true, role: 'user' })

    expect(await screen.findByText('My experiences content')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'My experiences' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Moderation/ })).not.toBeInTheDocument()
  })

  it('keeps admin sections away from regular users', async () => {
    renderAdmin({ isLoggedIn: true, role: 'user' }, '/admin/users')

    expect(await screen.findByText('This section is only available to administrators.')).toBeInTheDocument()
    expect(screen.queryByText('Users content')).not.toBeInTheDocument()
  })

  it('shows admin sections and the moderation link to admins', async () => {
    renderAdmin({ isLoggedIn: true, role: 'admin' }, '/admin/users')

    expect(await screen.findByText('Users content')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Moderation/ })).toBeInTheDocument()
  })
})
