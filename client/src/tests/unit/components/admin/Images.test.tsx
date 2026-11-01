import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { API } from '@/config'
import Images from '@/components/admin/Images'

const library = [
  { _id: 'i1', filename: 'carousel.avif', title: 'Home', featured: true, experience: null },
  { _id: 'i2', filename: 'kyoto.avif', featured: false, experience: { _id: 'e1', title: 'Kyoto trip' } },
  { _id: 'i3', filename: 'lima.avif', featured: false, experience: { _id: 'e2', title: 'Lima food' } },
  { _id: 'i4', filename: 'old.avif', featured: false, experience: null },
]

const renderImages = () => {
  server.use(http.get(`${API}/images/library`, () => HttpResponse.json({ images: library })))
  return render(<MemoryRouter><Images /></MemoryRouter>)
}

describe('Admin images', () => {
  it('starts with the carousel images and counts every tab', async () => {
    renderImages()

    expect(await screen.findByRole('tab', { name: 'Carousel 1' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Unused 1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'In experiences 2' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'All 4' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('links each photo to its experience and only offers to remove unused ones', async () => {
    renderImages()

    await userEvent.click(await screen.findByRole('tab', { name: 'In experiences 2' }))
    const grid = screen.getByRole('tabpanel')
    expect(within(grid).getByRole('link', { name: 'Kyoto trip' })).toHaveAttribute('href', '/experience/e1')
    expect(within(grid).queryByRole('button', { name: 'Remove image' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Unused 1' }))
    expect(screen.getByText('Not used by any experience')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove image' })).toBeInTheDocument()
  })
})
