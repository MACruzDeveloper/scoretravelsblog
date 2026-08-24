import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Card from '@common/Card'

describe('Card', () => {
  it('renders the experience information and detail link', () => {
    render(
      <BrowserRouter>
        <Card
          _id="experience-1"
          title="Eagle Beach"
          city={{
            _id: 'city-1',
            name: 'Oranjestad',
            country: 'Aruba',
            countryCode: 'AW',
            continent: 'North America',
            lat: 12.5,
            lng: -70,
          }}
          content="A beautiful beach"
          score={5}
        />
      </BrowserRouter>
    )

    expect(screen.getByRole('img', { name: 'Eagle Beach' })).toBeInTheDocument()
    expect(screen.getByText('A beautiful beach')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/experience/experience-1')
  })
})
