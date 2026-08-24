import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Home from '@/components/Home'

describe('Home', () => {
  it('renders the home page and its loading state', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    expect(document.querySelector('.page.home')).toBeInTheDocument()
    expect(document.querySelector('.spinner')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
