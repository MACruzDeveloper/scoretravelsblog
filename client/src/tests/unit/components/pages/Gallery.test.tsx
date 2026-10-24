import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { paginated } from '@/mocks/handlers'
import { API } from '@/config'
import Gallery from '@/components/Gallery'

const city = {
  _id: 'city-1',
  name: 'Aruba',
  country: 'Aruba',
  countryCode: 'AW',
  continent: 'North America',
  lat: 12.5,
  lng: -70,
}

const renderGallery = () => {
  return render(
    <BrowserRouter>
      <Gallery />
    </BrowserRouter>
  )
}

describe('Gallery', () => {
  it('renders the gallery heading and filters', () => {
    renderGallery()

    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search by title, category, city or content...')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders images returned by the server and only asks for experiences with image', async () => {
    let query: URLSearchParams | undefined
    server.use(
      http.get(`${API}/experiences`, ({ request }) => {
        query = new URL(request.url).searchParams
        return HttpResponse.json(paginated([
          { _id: 'experience-1', title: 'Eagle Beach', city, date: '2024-01-15', image: 'eagle-beach.jpg' },
        ]))
      })
    )

    renderGallery()

    expect(await screen.findByRole('img', { name: 'Eagle Beach' })).toHaveAttribute(
      'alt',
      'Eagle Beach'
    )
    expect(screen.getAllByText('Aruba').length).toBeGreaterThan(0)
    expect(query?.get('hasImage')).toBe('true')
    expect(query?.get('limit')).toBe('6')
  })
})
