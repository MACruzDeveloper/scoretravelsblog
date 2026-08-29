import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useBestExperiences } from '../hooks/useExperienceHooks'
import { getIconForContinent, MAP_TILE_LAYER } from '@utils/mapThemes'
import { Experience } from '@/store/experienceStore'

const MapExperiences = () => {
  const { bestExperiences } = useBestExperiences()

  // Helper to check if experience has valid geolocation
  const hasValidCoordinates = (exp: Experience): boolean => {
    if (exp.city && typeof exp.city === 'object' && 'lat' in exp.city && 'lng' in exp.city) {
      return !!exp.city.lat && !!exp.city.lng
    }
    return !!(exp.lat && exp.lng)
  }

  // Get coordinates from experience
  const getCoordinates = (exp: Experience): [number, number] | null => {
    if (exp.city && typeof exp.city === 'object' && 'lat' in exp.city && 'lng' in exp.city) {
      return [exp.city.lat, exp.city.lng]
    }
    if (exp.lat && exp.lng) {
      return [exp.lat, exp.lng]
    }
    return null
  }

  // Get continent from experience for icon customization
  const getContinent = (exp: Experience): string => {
    if (exp.city && typeof exp.city === 'object' && 'continent' in exp.city) {
      return exp.city.continent
    }
    return 'unknown'
  }

  return (
    <div className="map">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={9}
        scrollWheelZoom={true}
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