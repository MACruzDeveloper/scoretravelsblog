import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Experience from '@/components/experiences/Experience'

describe('Experience', () => {
  it('renders the loading state while fetching an experience', () => {
    render(
      <MemoryRouter initialEntries={['/experience/experience-1']}>
        <Routes>
          <Route path="/experience/:exp" element={<Experience user="user-1" />} />
        </Routes>
      </MemoryRouter>
    )

    expect(document.querySelector('.page.experience')).toBeInTheDocument()
    expect(document.querySelector('.spinner')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Write a comment' })).toBeInTheDocument()
  })
})
