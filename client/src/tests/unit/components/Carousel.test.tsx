import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Carousel from '@/components/Carousel'

describe('Carousel', () => {
  it('renders the first provided image and title', () => {
    render(
      <Carousel
        images={['eagle-beach.jpg', 'second-image.jpg']}
        title="Travel highlights"
        subtitle="Aruba"
      />
    )

    expect(screen.getByRole('heading', { name: 'Travel highlights' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Travel highlights' })).toHaveAttribute(
      'src',
      'http://localhost:3040/static/images/eagle-beach.jpg'
    )
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })
})
