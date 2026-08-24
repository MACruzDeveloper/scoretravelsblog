import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import Gallery from '@/components/Gallery'
import { useExperienceStore } from '@store/experienceStore'

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

afterEach(() => {
  useExperienceStore.setState({
    experiences: [],
    loading: false,
    error: undefined,
    hasFetched: false,
  })
})

describe('Gallery', () => {
  it('renders the gallery heading and filters', () => {
    renderGallery()

    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search by title, category, city or content...')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders images from loaded experiences', () => {
    useExperienceStore.setState({
      experiences: [
        {
          _id: 'experience-1',
          title: 'Eagle Beach',
          city,
          date: new Date('2024-01-15'),
          image: 'eagle-beach.jpg',
        },
      ],
      loading: false,
      error: undefined,
      hasFetched: true,
    })

    renderGallery()

    expect(screen.getByRole('img', { name: 'Eagle Beach' })).toHaveAttribute(
      'alt',
      'Eagle Beach'
    )
    expect(screen.getAllByText('Aruba').length).toBeGreaterThan(0)
  })
})
