import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import About from '@/components/About'

describe('About', () => {
  it('renders the interactive road with milestones', () => {
    render(<About />)

    expect(screen.getByLabelText('Carretera interactiva con hitos de mi carrera')).toBeInTheDocument()
    expect(screen.getByText('Primer proyecto profesional')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ir al hito de 2013: Primer proyecto profesional' })).toBeInTheDocument()
  })
})
