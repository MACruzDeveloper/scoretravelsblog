import { render, fireEvent, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MapContainer, useMap } from 'react-leaflet'
import type { Map } from 'leaflet'
import MapScrollGuard from '@/components/MapScrollGuard'

// Renders a real Leaflet map and hands back its instance
const renderMap = () => {
  let map: Map | undefined
  const Capture = () => { map = useMap(); return null }
  const view = render(
    <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false} style={{ height: 200 }}>
      <MapScrollGuard />
      <Capture />
    </MapContainer>
  )
  const container = view.container.querySelector('.leaflet-container') as HTMLElement
  return { map: map as Map, container, hint: () => view.container.querySelector('.map_scroll_hint') as HTMLElement }
}

describe('MapScrollGuard', () => {
  it('lets the page scroll and shows the hint without Ctrl', () => {
    const { map, container, hint } = renderMap()

    const event = new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true })
    act(() => { container.dispatchEvent(event) })

    expect(event.defaultPrevented).toBe(false)
    expect(map.scrollWheelZoom.enabled()).toBe(false)
    expect(hint()).toHaveClass('visible')
  })

  it('enables map zoom with Ctrl and stops the browser page zoom', async () => {
    const { map, container, hint } = renderMap()

    const event = new WheelEvent('wheel', { deltaY: -100, ctrlKey: true, bubbles: true, cancelable: true })
    act(() => { container.dispatchEvent(event) })

    expect(event.defaultPrevented).toBe(true)
    expect(map.scrollWheelZoom.enabled()).toBe(true)
    expect(hint()).not.toHaveClass('visible')

    // Leaflet debounces the wheel zoom (40ms); let it run before the map unmounts
    await act(() => new Promise((resolve) => setTimeout(resolve, 100)))
  })

  it('follows the Ctrl key and disables zoom when released', () => {
    const { map } = renderMap()

    fireEvent.keyDown(window, { key: 'Control', ctrlKey: true })
    expect(map.scrollWheelZoom.enabled()).toBe(true)
    fireEvent.keyUp(window, { key: 'Control', ctrlKey: false })
    expect(map.scrollWheelZoom.enabled()).toBe(false)
  })
})
