import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Footer from '@common/Footer'

describe('Footer', () => {
  it('renders the site footer', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText(/© ScoreTravelsBlog/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy')
  })
})
