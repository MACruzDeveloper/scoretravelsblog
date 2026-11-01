import { NavLink } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { MdStar, MdStarBorder, MdStarHalf } from 'react-icons/md'
import MapScrollGuard from './MapScrollGuard'
import { useMapExperiences } from '../hooks/useExperienceHooks'
import { getIconForContinent, MAP_TILE_LAYER } from '@utils/mapThemes'
import type { MapExperience } from '@/api/experiences'
import { coverOf, placeLabel } from '@/utils/experience'
import { URL } from '../config'
import thumb from '@images/thumb.png'

// Read-only stars, rounded to halves
const ScoreStars = ({ score }: { score: number }) => {
  const halves = Math.round(score * 2)
  return <span className="map_popup_stars" role="img" aria-label={`Score ${score} out of 5`}>
    {[1, 2, 3, 4, 5].map((star) =>
      halves >= star * 2 ? <MdStar key={star} /> : halves === star * 2 - 1 ? <MdStarHalf key={star} /> : <MdStarBorder key={star} />
    )}
  </span>
}

const ExperiencePopup = ({ experience }: { experience: MapExperience }) => {
  const cover = coverOf(experience)

  return <div className="map_popup">
    <img className="map_popup_image" src={cover ? `${URL}/static/images/${cover}` : thumb} alt="" loading="lazy" />
    <div className="map_popup_body">
      <NavLink to={`/experience/${experience._id}`} className="map_popup_title">{experience.title}</NavLink>
      <p className="map_popup_place">{placeLabel(experience.city)}</p>
      <p className="map_popup_meta">
        {experience.score != null && <ScoreStars score={experience.score} />}
        {experience.category && <span className="map_popup_category"> · {experience.category}</span>}
      </p>
    </div>
  </div>
}

const MapExperiences = () => {
  const { mapExperiences } = useMapExperiences()

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
        {mapExperiences
          .filter((exp) => exp.city.lat != null && exp.city.lng != null)
          .map((exp) => (
            <Marker
              key={exp._id}
              position={[exp.city.lat, exp.city.lng]}
              icon={getIconForContinent(exp.city.continent ?? 'unknown')}
              title={exp.title}
            >
              <Popup minWidth={190} maxWidth={200}>
                <ExperiencePopup experience={exp} />
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}

export default MapExperiences
