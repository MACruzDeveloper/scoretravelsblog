import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import About from '@/components/About'

describe('About', () => {
  it('renders the introduction and interactive road', () => {
    render(<About />)

    expect(screen.getByRole('heading', { name: 'About me' })).toBeInTheDocument()
    expect(screen.getByLabelText('Carretera interactiva con hitos')).toBeInTheDocument()
    expect(screen.getByText('Primer proyecto profesional')).toBeInTheDocument()
  })
})
