import L from 'leaflet'

// Color palette for each continent
export const CONTINENT_COLORS: Record<string, string> = {
  africa: '#FF6B6B',        // Red
  asia: '#4ECDC4',          // Teal
  europe: '#45B7D1',        // Blue
  'north-america': '#96CEB4', // Green
  'south-america': '#FFEAA7',  // Yellow
  oceania: '#DDA15E',       // Orange
  unknown: '#95959595',     // Gray (fallback)
}

// Get continent abbreviation for marker label
const getContinentCode = (continent: string): string => {
  const codes: Record<string, string> = {
    africa: 'AF',
    asia: 'AS',
    europe: 'EU',
    'north-america': 'NA',
    'south-america': 'SA',
    oceania: 'OC',
    unknown: '?',
  }
  return codes[continent] || codes.unknown
}

// Create custom SVG icon for a continent
export const getIconForContinent = (continent: string) => {
  const color = CONTINENT_COLORS[continent] || CONTINENT_COLORS.unknown
  const code = getContinentCode(continent)

  // SVG icon as HTML
  const svgMarkup = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer circle with shadow effect -->
      <circle cx="20" cy="20" r="18" fill="${color}" opacity="0.95" />
      <circle cx="20" cy="20" r="18" fill="none" stroke="white" stroke-width="2" />
      
      <!-- Inner dot -->
      <circle cx="20" cy="20" r="4" fill="white" />
      
      <!-- Text label -->
      <text x="20" y="26" font-size="10" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">
        ${code}
      </text>
    </svg>
  `

  return L.divIcon({
    html: svgMarkup,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'continent-marker',
  })
}

// CartoDB Positron Light tile layer configuration
export const MAP_TILE_LAYER = {
  url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20,
}
