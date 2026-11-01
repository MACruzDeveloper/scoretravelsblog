import type { Localized } from './career'

export type Project = {
  id: string
  name: string
  // Company the project was made with; missing for personal projects
  company?: string
  role: Localized
  description: Localized
  stack: string[]
  link?: string
  // Source code, for the personal ones
  code?: string
  // Still being built: a badge in the corner
  inProgress?: boolean
}

// From the CV (October 2026). Company projects only link to their public sites
export const projects: Project[] = [
  {
    id: 'mylifemirror',
    name: 'MyLifeMirror',
    role: { es: 'Proyecto final del máster', en: 'Master’s final project' },
    inProgress: true,
    description: {
      es: 'App para evaluar cómo va tu vida por áreas y recibir ideas para mejorar, sin juicios. Clean Architecture, TDD e IA acotada con Claude.',
      en: 'App to rate how your life is going by area and get ideas to improve, without judgement. Clean Architecture, TDD and bounded AI with Claude.',
    },
    stack: ['React', 'TypeScript', 'Supabase', 'Claude', 'Playwright'],
    link: 'https://my-life-mirror.vercel.app/',
    code: 'https://github.com/MACruzDeveloper/my-life-mirror',
  },
  {
    id: 'scoretravelsblog',
    name: 'ScoreTravelsBlog',
    role: { es: 'Proyecto personal full-stack', en: 'Full-stack personal project' },
    description: {
      es: 'Esta web: blog de viajes donde la gente comparte y puntúa sus experiencias, con moderación, mapa y panel de administración.',
      en: 'This website: a travel blog where people share and score their trips, with moderation, a map and an admin panel.',
    },
    stack: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Vitest'],
    code: 'https://github.com/MACruzDeveloper/scoretravelsblog',
  },
  {
    id: 'msc',
    name: 'MSC',
    company: 'Dentsu Creative / Merkle',
    role: { es: 'Maquetación y desarrollo frontend', en: 'Front-end development' },
    description: {
      es: 'Nuevo portal web internacional de la naviera MSC.',
      en: 'New international website of the MSC shipping line.',
    },
    stack: ['Sass', 'Webpack', 'Alpine.js', 'Node.js', 'Sitecore'],
    link: 'https://www.msc.com/',
  },
  {
    id: 'santander-gaming',
    name: 'Santander Gaming',
    company: 'Dentsu Creative',
    role: { es: 'Desarrollo frontend', en: 'Front-end development' },
    description: {
      es: 'Plataforma de gaming de Banco Santander.',
      en: 'Banco Santander’s gaming platform.',
    },
    stack: ['React', 'Redux', 'Sass'],
    link: 'https://www.santandergaming.com/',
  },
  {
    id: 'clan-tv',
    name: 'Clan TV / RTVE',
    company: 'Nextret',
    role: { es: 'Responsable de maquetación', en: 'Lead front-end developer' },
    description: {
      es: 'Portal infantil de RTVE, con especial atención a la accesibilidad.',
      en: 'RTVE’s children’s website, with a focus on accessibility.',
    },
    stack: ['jQuery', 'Bootstrap', 'Accessibility'],
  },
  {
    id: 'cope',
    name: 'Cope.es',
    company: 'Agile Content / Nextret',
    role: { es: 'Maquetación', en: 'Front-end development' },
    description: {
      es: 'Portal web de la cadena COPE.',
      en: 'Website of the COPE radio network.',
    },
    stack: ['Sass', 'jQuery'],
  },
  {
    id: 'villas-luxury',
    name: 'Villas Luxury Mallorca',
    company: 'The Positive Space',
    role: { es: 'Desarrollo frontend', en: 'Front-end development' },
    description: {
      es: 'Portal de villas de lujo en Mallorca.',
      en: 'Luxury villa rentals in Mallorca.',
    },
    stack: ['React', 'Node.js'],
    link: 'https://www.villaluxurymallorca.com/',
  },
  {
    id: 'raimundo-burger',
    name: 'Raimundo Burger',
    company: 'The Positive Space',
    role: { es: 'Maquetación', en: 'Front-end development' },
    description: {
      es: 'Web del restaurante Raimundo Burger.',
      en: 'Website of the Raimundo Burger restaurant.',
    },
    stack: ['Sass', 'jQuery'],
  },
]
