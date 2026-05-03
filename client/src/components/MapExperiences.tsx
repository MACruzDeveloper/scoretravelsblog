import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useBestExperiences } from '../hooks/useExperienceHooks'

const MapExperiences = () => {
  const { bestExperiences } = useBestExperiences()

  // Fix default markers
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })

  // Demo positions as fallback
  const demoPositions: [number, number][] = [
    [40.7128, -74.0060], // New York
    [48.8566, 2.3522],   // Paris
    [35.6762, 139.6503]  // Tokyo
  ]

  const getMarkerPosition = (exp: any, index: number): [number, number] => {
    // Priority 1: City with coords
    if (exp.city && typeof exp.city === 'object' && exp.city.lat && exp.city.lng) {
      return [exp.city.lat, exp.city.lng]
    }
    // Priority 2: Direct lat/lng on experience (backward compatibility)
    if (exp.lat && exp.lng) {
      return [exp.lat, exp.lng]
    }
    // Fallback: Demo positions
    return demoPositions[index] || [0, 0]
  }

  return <div className="map">
    <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bestExperiences.map((exp, index) => {
        const position = getMarkerPosition(exp, index)
        const cityName = exp.city && typeof exp.city === 'object' ? exp.city.name : 'Unknown'
        return (
          <Marker key={exp._id} position={position}>
            <Popup>
              <strong>{exp.title}</strong><br />
              City: {cityName}<br />
              Score: {exp.score}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  </div>
}

export default MapExperiences