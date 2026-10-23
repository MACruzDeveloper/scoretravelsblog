import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Header from '@common/Header'
import { MyGlobalContext, GlobalContent } from '@/components/context/useGlobalContext'

const renderHeader = (isLoggedIn = false, logout = vi.fn(), role = '') => {
  const context: GlobalContent = {
    isLoggedIn, authChecked: true, user: '', username: 'ana', role,
    setRole: vi.fn(), titleExperience: '', setTitleExperience: vi.fn(),
  }
  return render(
    <MyGlobalContext.Provider value={context}>
      <BrowserRouter>
        <Header isLoggedIn={isLoggedIn} logout={logout} />
      </BrowserRouter>
    </MyGlobalContext.Provider>
  )
}

describe('Header', () => {
  it('renders the brand and public navigation links', () => {
    renderHeader()

    expect(screen.getByRole('heading', { name: 'ScoreTravelsBlog' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Experiences' })).toHaveAttribute('href', '/experiences')
    expect(screen.getByRole('link', { name: 'Gallery' })).toHaveAttribute('href', '/gallery')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
  })

  it('shows the admin option to admins and calls logout', async () => {
    const user = userEvent.setup()
    const logout = vi.fn()
    renderHeader(true, logout, 'admin')

    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin')

    await user.click(screen.getByRole('button', { name: 'login' }))
    await user.click(screen.getByRole('button', { name: 'logout' }))

    expect(logout).toHaveBeenCalledOnce()
  })

  it('hides the admin option from regular users', () => {
    renderHeader(true, vi.fn(), 'user')

    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument()
  })
})
