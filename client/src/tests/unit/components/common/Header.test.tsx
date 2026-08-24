import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Header from '@common/Header'

const renderHeader = (isLoggedIn = false, logout = vi.fn()) => {
  return render(
    <BrowserRouter>
      <Header isLoggedIn={isLoggedIn} logout={logout} />
    </BrowserRouter>
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

  it('shows the admin option and calls logout for an authenticated user', async () => {
    const user = userEvent.setup()
    const logout = vi.fn()
    renderHeader(true, logout)

    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin/experiences')

    await user.click(screen.getByRole('button', { name: 'login' }))
    await user.click(screen.getByRole('button', { name: 'logout' }))

    expect(logout).toHaveBeenCalledOnce()
  })
})
