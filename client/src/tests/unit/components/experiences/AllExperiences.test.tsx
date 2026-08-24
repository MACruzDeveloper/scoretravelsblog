import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AllExperiences from '@/components/experiences/AllExperiences'

describe('AllExperiences', () => {
  it('renders the page title and filters', () => {
    render(<AllExperiences />)

    expect(screen.getByRole('heading', { name: 'All Experiences' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search by title, category, city or content...')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
  })
})
