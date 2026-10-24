import type { Language } from '@/i18n'

// Text in every language of the About page
export type Localized = Record<Language, string>

export type MilestoneType = 'education' | 'work' | 'freelance'

export type Milestone = {
  id: string
  // 'YYYY' or 'YYYY-MM'. The road is ordered by start date
  start: string
  // Missing: a single date; 'present': still going on
  end?: string | 'present'
  type: MilestoneType
  title: Localized
  // Company, school or client
  organization: string
  place?: Localized
  description?: Localized
  // Technologies or skills, shown as tags
  tags?: string[]
  link?: string
}

export const profile = {
  name: 'Miguel Ángel Cruz',
  headline: { es: 'Frontend developer y diseñador', en: 'Frontend developer and designer' } as Localized,
  place: { es: 'Palma, Islas Baleares', en: 'Palma, Balearic Islands' } as Localized,
  links: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/miguel-%C3%A1ngel-cruz-48253455/' },
    { label: 'GitHub', url: 'https://github.com/MACruzDeveloper' },
  ],
}

const PALMA: Localized = { es: 'Palma de Mallorca', en: 'Palma, Mallorca' }
const MADRID: Localized = { es: 'Madrid', en: 'Madrid' }

// From the LinkedIn profile (October 2026)
const entries: Milestone[] = [
  {
    id: 'high-school',
    start: '2001',
    end: '2003',
    type: 'education',
    title: { es: 'Bachillerato y Selectividad', en: 'High school and university entrance exam' },
    organization: 'IES Guillem Sagrera',
    place: PALMA,
    description: { es: 'Ciencias y tecnología.', en: 'Science and technology.' },
  },
  {
    id: 'edib-hnd',
    start: '2006',
    end: '2010',
    type: 'education',
    title: { es: 'BTEC HND in Computing and Systems Development', en: 'BTEC HND in Computing and Systems Development' },
    organization: 'Edib',
    place: PALMA,
    description: { es: 'Título Edexcel de informática y desarrollo de sistemas.', en: 'Edexcel diploma in computing and systems development.' },
  },
  {
    id: 'microsort',
    start: '2006',
    end: '2006',
    type: 'work',
    title: { es: 'Auxiliar técnico de informática', en: 'IT support technician' },
    organization: 'Microsort',
    description: {
      es: 'Instalación de software, soporte, eliminación de virus y mantenimiento de hardware.',
      en: 'Software installation, user support, virus removal and hardware maintenance.',
    },
  },
  {
    id: 'faqtoria',
    start: '2008-10',
    end: '2012-08',
    type: 'work',
    title: { es: 'Diseñador y desarrollador junior', en: 'Junior designer and developer' },
    organization: 'faqtoria',
    place: PALMA,
    description: {
      es: 'Diseño y desarrollo web con WordPress, SEO y newsletters, además de diseño y maquetación editorial.',
      en: 'Web design and development with WordPress, SEO and newsletters, plus editorial design and layout.',
    },
    tags: ['HTML', 'CSS3', 'JavaScript', 'WordPress', 'PHP', 'SEO', 'SVN', 'Photoshop', 'InDesign'],
  },
  {
    id: 'grupo-infinity',
    start: '2010',
    end: '2012-12',
    type: 'work',
    title: { es: 'Webmaster y community manager', en: 'Webmaster and community manager' },
    organization: 'Grupo Infinity',
    description: {
      es: 'Diseño, maquetación y mantenimiento de la web, y gestión de redes sociales (Facebook, Twitter, YouTube).',
      en: 'Design, front-end and maintenance of the website, and social media management (Facebook, Twitter, YouTube).',
    },
  },
  {
    id: 'edib-indesign',
    start: '2010',
    end: '2011',
    type: 'education',
    title: { es: 'Curso avanzado de InDesign CS5', en: 'Advanced InDesign CS5 course' },
    organization: 'Edib',
    place: PALMA,
  },
  {
    id: 'juniper',
    start: '2012-08',
    end: '2013-09',
    type: 'work',
    title: { es: 'Diseñador web', en: 'Web designer' },
    organization: 'Juniper',
    place: PALMA,
    description: { es: 'Diseño y maquetación web y emails HTML.', en: 'Web design, front-end and HTML emails.' },
    tags: ['Fireworks', 'Photoshop', 'Dreamweaver', 'SVN'],
  },
  {
    id: 'clicktotravel',
    start: '2013-11',
    end: '2014-02',
    type: 'work',
    title: { es: 'Maquetador web', en: 'Front-end developer' },
    organization: 'ClickToTravel',
    description: { es: 'Responsable de maquetación y diseño responsive.', en: 'In charge of the front-end and responsive design.' },
    tags: ['HTML', 'CSS3', 'jQuery', 'JavaScript', 'Photoshop'],
  },
  {
    id: 'animartec',
    start: '2014',
    end: '2014',
    type: 'education',
    title: { es: 'Maquetación web profesional', en: 'Professional front-end development' },
    organization: 'Animartec',
    tags: ['Bootstrap 3', 'jQuery'],
  },
  {
    id: 'freelance-2014',
    start: '2014-06',
    end: '2014-11',
    type: 'freelance',
    title: { es: 'Desarrollador front-end', en: 'Front-end developer' },
    organization: 'Freelance',
  },
  {
    id: 'nextret',
    start: '2014-10',
    end: '2016-07',
    type: 'work',
    title: { es: 'Diseñador y maquetador web', en: 'Web designer and front-end developer' },
    organization: 'NexTReT',
    place: MADRID,
    description: {
      es: 'Responsable de diseño y maquetación: responsive, accesibilidad, cross-browser, SharePoint 2013 y .NET, con metodología Scrum.',
      en: 'In charge of design and front-end: responsive, accessibility, cross-browser, SharePoint 2013 and .NET, working with Scrum.',
    },
    tags: ['HTML5', 'CSS3', 'Sass', 'jQuery', 'Bootstrap', 'Gulp', 'Grunt', 'Git', 'Photoshop'],
  },
  {
    id: 'beeva',
    start: '2016-07',
    end: '2016-10',
    type: 'work',
    title: { es: 'Maquetador UX', en: 'UX front-end developer' },
    organization: 'BEEVA',
    place: MADRID,
    description: {
      es: 'Maquetación de la app móvil de BBVA: mantenimiento, incidencias y nuevas páginas.',
      en: 'Front-end for the BBVA mobile app: maintenance, bug fixing and new pages.',
    },
    tags: ['HTML5', 'CSS3', 'Sass', 'Jade', 'Gulp', 'jQuery', 'Git'],
  },
  {
    id: 'freelance-2016',
    start: '2016-10',
    end: '2020-03',
    type: 'freelance',
    title: { es: 'Maquetador y desarrollador web', en: 'Front-end and web developer' },
    organization: 'Freelance',
    place: PALMA,
    description: {
      es: 'Proyectos destacados: web de Villas Camp de Mar (React y Node, 2020), web de Raimundo Burger (2019) y portal de COPE para Agile Content (2016-2017).',
      en: 'Highlights: Villas Camp de Mar website (React and Node, 2020), Raimundo Burger website (2019) and the COPE portal for Agile Content (2016-2017).',
    },
    tags: ['React', 'Node'],
    link: 'https://www.villaluxurymallorca.com/',
  },
  {
    id: 'diwoh',
    start: '2017-04',
    end: '2017-06',
    type: 'work',
    title: { es: 'Maquetador web', en: 'Front-end developer' },
    organization: 'Diwoh Travel',
    place: MADRID,
    description: { es: 'Maquetación del portal, diseño responsive y cross-browser.', en: 'Portal front-end, responsive and cross-browser design.' },
    link: 'https://www.diwoh.com/',
  },
  {
    id: 'barcelo',
    start: '2017-07',
    end: '2019-12',
    type: 'work',
    title: { es: 'Maquetador web', en: 'Front-end developer' },
    organization: 'Barceló Hotel Group',
    place: PALMA,
    tags: ['HTML5', 'CSS3', 'Sass', 'jQuery', 'Bootstrap', 'Gulp', 'Tridion'],
  },
  {
    id: 'bootcamp',
    start: '2020',
    end: '2020',
    type: 'education',
    title: { es: 'Bootcamp JavaScript Full-Stack', en: 'JavaScript Full-Stack bootcamp' },
    organization: 'Barcelona Code School',
    description: { es: 'Bootcamp online con mentor.', en: 'Online mentored bootcamp.' },
    tags: ['JavaScript', 'React', 'Node'],
  },
  {
    id: 'dentsu',
    start: '2020-09',
    end: 'present',
    type: 'work',
    title: { es: 'Frontend developer y diseñador', en: 'Frontend developer and designer' },
    organization: 'Dentsu Creative Spain',
    place: MADRID,
    description: {
      es: 'Desarrollo front y maquetación para clientes como MSC, El Corte Inglés, Santander F1, Vodafone, Google, Netflix, Bosch o Ikea, además de proyectos internos relacionados con IA.',
      en: 'Front-end development for clients such as MSC, El Corte Inglés, Santander F1, Vodafone, Google, Netflix, Bosch and Ikea, plus internal AI projects.',
    },
    tags: ['React', 'Vue', 'TypeScript', 'Alpine.js', 'Zustand', 'Vite', 'Jest', 'Node', 'Sass', 'SEO', 'GitHub Copilot'],
  },
]

// The road goes in date order
export const milestones = [...entries].sort((a, b) => a.start.localeCompare(b.start))

export const startYear = (milestone: Milestone) => Number(milestone.start.slice(0, 4))
