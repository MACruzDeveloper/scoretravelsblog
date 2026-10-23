import { useEffect, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'

const HINT_MS = 1500
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent)

/**
 * Wheel zoom only with Ctrl (⌘ on Mac) held, so scrolling the page over the map
 * keeps scrolling the page. Without the key, a short hint explains how to zoom.
 * Trackpad pinch also works: browsers send it as a wheel event with Ctrl.
 */
const MapScrollGuard = () => {
  const map = useMap()
  const [showHint, setShowHint] = useState(false)
  const hintTimer = useRef<number>()

  useEffect(() => {
    const container = map.getContainer()
    map.scrollWheelZoom.disable()

    const setZoomEnabled = (enabled: boolean) => {
      if (enabled && !map.scrollWheelZoom.enabled()) map.scrollWheelZoom.enable()
      if (!enabled && map.scrollWheelZoom.enabled()) map.scrollWheelZoom.disable()
    }

    // Runs before Leaflet's own wheel handler (capture phase)
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (!map.scrollWheelZoom.enabled()) {
          // Leaflet only sees the next event; stop the browser from zooming the page meanwhile
          event.preventDefault()
          setZoomEnabled(true)
        }
        setShowHint(false)
        return
      }
      setZoomEnabled(false)
      setShowHint(true)
      window.clearTimeout(hintTimer.current)
      hintTimer.current = window.setTimeout(() => setShowHint(false), HINT_MS)
    }

    const onKey = (event: KeyboardEvent) => setZoomEnabled(event.ctrlKey || event.metaKey)
    const onBlur = () => setZoomEnabled(false)

    container.addEventListener('wheel', onWheel, { capture: true, passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    window.addEventListener('blur', onBlur)
    return () => {
      container.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
      window.removeEventListener('blur', onBlur)
      window.clearTimeout(hintTimer.current)
    }
  }, [map])

  return (
    <div className={`map_scroll_hint ${showHint ? 'visible' : ''}`} aria-hidden={!showHint} role="status">
      {isMac ? 'Use ⌘ + scroll to zoom the map' : 'Use Ctrl + scroll to zoom the map'}
    </div>
  )
}

export default MapScrollGuard
