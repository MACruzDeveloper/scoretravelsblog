import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MapScrollGuard from './MapScrollGuard'
import { useBestExperiences } from '../hooks/useExperienceHooks'
import { getIconForContinent, MAP_TILE_LAYER } from '@utils/mapThemes'
import type { Experience } from '@/api/types'
import { cityOf } from '@/utils/experience'

const MapExperiences = () => {
  const { bestExperiences } = useBestExperiences()

  // Coordinates come from the experience's city
  const getCoordinates = (exp: Experience): [number, number] | null => {
    const city = cityOf(exp)
    return city && city.lat != null && city.lng != null ? [city.lat, city.lng] : null
  }

  const hasValidCoordinates = (exp: Experience): boolean => getCoordinates(exp) !== null

  // Continent of the city, for the marker icon
  const getContinent = (exp: Experience): string => cityOf(exp)?.continent ?? 'unknown'

  return (
    <div className="map">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={9}
        // Wheel zoom only with Ctrl/⌘ held (MapScrollGuard)
        scrollWheelZoom={false}
        maxBounds={[[-89, -180], [89, 180]]}
        maxBoundsViscosity={0.9}
        worldCopyJump={true}
      >
        <TileLayer
          attribution={MAP_TILE_LAYER.attribution}
          url={MAP_TILE_LAYER.url}
          subdomains={MAP_TILE_LAYER.subdomains}
          maxZoom={MAP_TILE_LAYER.maxZoom}
          errorTileUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapScrollGuard />
        {bestExperiences
          .filter(exp => hasValidCoordinates(exp))
          .map(exp => {
            const coordinates = getCoordinates(exp)
            const continent = getContinent(exp)
            
            if (!coordinates) return null

            return (
              <Marker
                key={exp._id}
                position={coordinates}
                icon={getIconForContinent(continent)}
              >
                <Popup>
                  <strong>{exp.title}</strong>
                </Popup>
              </Marker>
            )
          })}
      </MapContainer>
    </div>
  )
}

export default MapExperiences