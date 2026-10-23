import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { API } from '@/config'
import Experience from '@/components/experiences/Experience'

const renderExperience = () => render(
  <MemoryRouter initialEntries={['/experience/experience-1']}>
    <Routes>
      <Route path="/experience/:exp" element={<Experience user="user-1" />} />
    </Routes>
  </MemoryRouter>
)

describe('Experience', () => {
  it('renders the loading state while fetching an experience', () => {
    renderExperience()

    expect(document.querySelector('.page.experience')).toBeInTheDocument()
    expect(document.querySelector('.spinner')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Write a comment' })).toBeInTheDocument()
  })

  it('shows the default image when the experience has no photos', async () => {
    server.use(
      http.get(`${API}/experiences/experience-1`, () =>
        HttpResponse.json({ _id: 'experience-1', title: 'No photos trip', date: '2024-01-01', images: [], image: '' })
      )
    )
    renderExperience()

    const image = await screen.findByRole('img', { name: 'No photos trip' })
    expect(image).toHaveClass('content_image')
    expect(document.querySelector('.carousel')).not.toBeInTheDocument()
  })
})
