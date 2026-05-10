import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useBestExperiences } from '../hooks/useExperienceHooks'
import { getIconForContinent, MAP_TILE_LAYER } from '@utils/mapThemes'

const MapExperiences = () => {
  const { bestExperiences } = useBestExperiences()

  // Helper to check if experience has valid geolocation
  const hasValidCoordinates = (exp: any): boolean => {
    if (exp.city && typeof exp.city === 'object' && exp.city.lat && exp.city.lng) {
      return true
    }
    if (exp.lat && exp.lng) {
      return true
    }
    return false
  }

  // Get coordinates from experience
  const getCoordinates = (exp: any): [number, number] | null => {
    if (exp.city && typeof exp.city === 'object' && exp.city.lat && exp.city.lng) {
      return [exp.city.lat, exp.city.lng]
    }
    if (exp.lat && exp.lng) {
      return [exp.lat, exp.lng]
    }
    return null
  }

  // Get continent from experience for icon customization
  const getContinent = (exp: any): string => {
    return (exp.city && typeof exp.city === 'object' && exp.city.continent) 
      ? exp.city.continent 
      : 'unknown'
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