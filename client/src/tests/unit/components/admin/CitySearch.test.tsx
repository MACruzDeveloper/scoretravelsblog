import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse, delay } from 'msw'
import { server } from '@/mocks/server'
import { CitySearch } from '@/components/admin/experiences/CitySearch'

const feature = (name: string, osm_value: string, countrycode: string, country: string, coordinates: [number, number]) => ({
  geometry: { coordinates },
  properties: { name, osm_value, countrycode, country },
})

const naples = feature('Naples', 'city', 'it', 'Italy', [14.25, 40.84])
const italy = feature('Italy', 'country', 'IT', 'Italy', [12.6, 42.6])

describe('CitySearch', () => {
  it('finds cities and countries while typing and returns the picked place', async () => {
    let query: URLSearchParams | undefined
    server.use(http.get('https://photon.komoot.io/api/', ({ request }) => {
      query = new URL(request.url).searchParams
      return HttpResponse.json({ features: [naples, naples, italy] })
    }))
    const onSelect = vi.fn()
    render(<CitySearch onSelect={onSelect} />)

    await userEvent.type(screen.getByPlaceholderText('Search city, island, region or country...'), 'Napol')

    // The duplicated Naples shows once
    expect(await screen.findAllByText('Naples')).toHaveLength(1)
    expect(query?.getAll('osm_tag')).toEqual(expect.arrayContaining(['place:city', 'place:island', 'place:country']))
    expect(screen.getByText('IT · Italy')).toBeInTheDocument()
    expect(screen.getByText('Country')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Country'))
    expect(onSelect).toHaveBeenCalledWith({
      name: 'Italy', type: 'country', country: 'Italy', countryCode: 'IT', continent: 'europe', lat: 42.6, lng: 12.6,
    })
    expect(screen.getByDisplayValue('Italy')).toBeInTheDocument()
  })

  it('ignores the answer of an older search', async () => {
    server.use(
      http.get('https://photon.komoot.io/api/', async ({ request }) => {
        const q = new URL(request.url).searchParams.get('q')
        if (q === 'Rom') {
          await delay(600)
          return HttpResponse.json({ features: [feature('Romford', 'city', 'gb', 'United Kingdom', [0.18, 51.57])] })
        }
        return HttpResponse.json({ features: [feature('Rome', 'city', 'it', 'Italy', [12.48, 41.89])] })
      })
    )
    render(<CitySearch onSelect={vi.fn()} />)
    const input = screen.getByPlaceholderText('Search city, island, region or country...')

    await userEvent.type(input, 'Rom')
    await new Promise((resolve) => setTimeout(resolve, 450))
    await userEvent.type(input, 'e')

    expect(await screen.findByText('Rome')).toBeInTheDocument()
    await new Promise((resolve) => setTimeout(resolve, 300))
    expect(screen.queryByText('Romford')).not.toBeInTheDocument()
  })
})
