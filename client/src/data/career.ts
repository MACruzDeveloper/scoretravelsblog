import type { Language } from '@/i18n'

// Text in every language of the About page
export type Localized = Record<Language, string>

// Freelance projects count as work experience
export type MilestoneType = 'education' | 'work' | 'language' | 'project'

export type Milestone = {
  id: string
  // 'YYYY' or 'YYYY-MM'. The road is ordered by start date
  start: string
  // Missing: a single date; 'present': still going on
  end?: string | 'present'
  type: MilestoneType
  title: Localized
  // Company, school or client; translated only when it is a description
  organization: string | Localized
  // Short name under the road when the organization alone does not say what it is
  roadLabel?: Localized
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

// From the LinkedIn profile and the CV (October 2026)
const entries: Milestone[] = [
  {
    id: 'edib-hnd',
    start: '2006',
    end: '2010',
    type: 'education',
    title: { es: 'BTEC HND in Computing and Systems Development', en: 'BTEC HND in Computing and Systems Development' },
    organization: 'Edib',
    roadLabel: { es: 'HND Informática · Edib', en: 'HND Computing · Edib' },
    place: PALMA,
    description: {
      es: 'Título superior británico (Edexcel BTEC) en informática y desarrollo de sistemas, cursado en la escuela EDIB de Palma: programación en C, C#, .NET y Java, bases de datos con SQL, análisis de sistemas y gestión de proyectos con la guía PMBOK.',
      en: 'British higher national diploma (Edexcel BTEC) in computing and systems development, at the EDIB school in Palma: programming in C, C#, .NET and Java, SQL databases, systems analysis and project management with the PMBOK guide.',
    },
    tags: ['C', 'C#', '.NET', 'Java', 'SQL', 'PMBOK'],
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
    id: 'juniper',
    start: '2012-08',
    end: '2013-09',
    type: 'work',
    title: { es: 'Diseñador web', en: 'Web designer' },
    organization: 'Juniper',
    place: PALMA,
    description: {
      es: 'Diseño y maquetación de webs del sector turístico, además de campañas de emailing y señalética.',
      en: 'Design and front-end of travel industry websites, plus email campaigns and signage.',
    },
    tags: ['Fireworks', 'Photoshop', 'Dreamweaver', 'SVN'],
  },
  {
    id: 'clicktotravel',
    start: '2013-11',
    end: '2014-02',
    type: 'work',
    title: { es: 'Maquetador web', en: 'Front-end developer' },
    organization: 'ClickToTravel',
    description: {
      es: 'Responsable de la maquetación y el diseño responsive de portales del sector turístico.',
      en: 'In charge of the front-end and responsive design of travel industry portals.',
    },
    tags: ['HTML', 'CSS3', 'jQuery', 'JavaScript', 'Photoshop'],
  },
  {
    id: 'animartec',
    start: '2014',
    end: '2014',
    type: 'education',
    title: { es: 'Maquetación web profesional', en: 'Professional front-end development' },
    organization: 'Animartec',
    roadLabel: { es: 'Curso de maquetación · Animartec', en: 'Front-end course · Animartec' },
    description: {
      es: 'Curso de maquetación web profesional centrado en jQuery: manipulación del DOM, eventos y efectos para dar interacción a las webs, junto con maquetación responsive con Bootstrap 3.',
      en: 'Professional front-end course focused on jQuery: DOM manipulation, events and effects to make websites interactive, along with responsive layouts with Bootstrap 3.',
    },
    tags: ['jQuery', 'JavaScript', 'HTML5', 'CSS3', 'Bootstrap 3'],
  },
  {
    id: 'freelance-2014',
    start: '2014-06',
    end: '2014-11',
    type: 'work',
    title: { es: 'Desarrollador front-end', en: 'Front-end developer' },
    organization: 'Freelance',
    description: {
      es: 'Maquetación e integración con WordPress para diversos clientes, entre la etapa en el sector turístico y el salto a Madrid.',
      en: 'Front-end and WordPress integration for several clients, between the travel industry years and the move to Madrid.',
    },
    tags: ['HTML5', 'CSS3', 'jQuery', 'WordPress'],
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
      es: 'Responsable de maquetación del portal infantil Clan TV de RTVE, en un entorno Java con Eclipse y con especial cuidado de la accesibilidad. También proyectos en SharePoint 2013 y .NET, con metodología Scrum.',
      en: 'In charge of the front-end of Clan TV, the RTVE children’s website, in a Java and Eclipse environment with a focus on accessibility. Also SharePoint 2013 and .NET projects, working with Scrum.',
    },
    tags: ['HTML5', 'CSS3', 'Sass', 'jQuery', 'Bootstrap', 'Gulp', 'Grunt', 'Git', 'Photoshop'],
  },
  {
    id: 'freelance-2016',
    start: '2016-10',
    end: '2020-03',
    type: 'work',
    title: { es: 'Maquetador y desarrollador web', en: 'Front-end and web developer' },
    organization: 'Freelance',
    place: PALMA,
    description: {
      es: 'Maquetación y desarrollo por proyecto: el portal de la cadena COPE para Agile Content (2016-2017, Sass y jQuery), trabajos para Diwoh y Beeva (BBVA), la web de Raimundo Burger (2019) y el portal de villas de lujo Villas Camp de Mar, con React y Node, para The Positive Space (2020).',
      en: 'Front-end and development by project: the COPE radio network portal for Agile Content (2016-2017, Sass and jQuery), work for Diwoh and Beeva (BBVA), the Raimundo Burger website (2019) and the Villas Camp de Mar luxury villa portal, with React and Node, for The Positive Space (2020).',
    },
    tags: ['HTML5', 'CSS3', 'Sass', 'JavaScript', 'jQuery', 'WordPress', 'React', 'Node'],
    link: 'https://www.villaluxurymallorca.com/',
  },
  {
    id: 'barcelo',
    start: '2017-07',
    end: '2019-12',
    type: 'work',
    title: { es: 'Maquetador web', en: 'Front-end developer' },
    organization: 'Barceló Hotel Group',
    place: PALMA,
    description: {
      es: 'Responsable de maquetación del portal web y de otros proyectos digitales de la cadena hotelera: refactorización, mejoras de rendimiento, responsive y cross-browser, además de newsletters para campañas de email marketing.',
      en: 'In charge of the front-end of the hotel chain’s website and other digital projects: refactoring, performance, responsive and cross-browser work, plus newsletters for email marketing campaigns.',
    },
    tags: ['HTML5', 'CSS3', 'Sass', 'jQuery', 'Bootstrap', 'Gulp', '.NET', 'Tridion', 'Git'],
  },
  {
    id: 'bootcamp',
    start: '2020',
    end: '2020',
    type: 'education',
    title: { es: 'Bootcamp JavaScript Full-Stack', en: 'JavaScript Full-Stack bootcamp' },
    organization: 'Barcelona Code School',
    roadLabel: { es: 'Bootcamp Full-Stack · Barcelona Code School', en: 'Full-Stack bootcamp · Barcelona Code School' },
    description: {
      es: 'Bootcamp online con mentor (abril–mayo de 2020): aplicaciones completas con React y React Native en el cliente, y Node, Express y MongoDB en el servidor, más Git y nociones de UX.',
      en: 'Online mentored bootcamp (April–May 2020): full applications with React and React Native on the client, and Node, Express and MongoDB on the server, plus Git and UX basics.',
    },
    tags: ['JavaScript', 'React', 'React Native', 'Node', 'Express', 'MongoDB', 'Git'],
  },
  {
    id: 'typescript',
    start: '2023-02',
    type: 'education',
    title: { es: 'TypeScript Avanzado', en: 'Advanced TypeScript' },
    organization: 'The Refactor Project',
    roadLabel: { es: 'Curso de TypeScript', en: 'TypeScript course' },
    description: {
      es: 'Curso online de 15 horas con clases en directo y pair programming: tipos genéricos, utility types, conditional y mapped types, keyof, type predicates, discriminated unions con exhaustive checking y sobrecarga de funciones, para trabajar con codebases y librerías reales.',
      en: '15-hour online course with live classes and pair programming: generics, utility types, conditional and mapped types, keyof, type predicates, discriminated unions with exhaustive checking and function overloads, to work with real codebases and libraries.',
    },
    tags: ['TypeScript', 'Generics', 'Utility types', 'Mapped types', 'Type narrowing'],
    link: 'https://the-refactor-project.com',
  },
  {
    id: 'first-certificate',
    start: '2019-07',
    type: 'language',
    title: { es: 'First Certificate in English (B2)', en: 'First Certificate in English (B2)' },
    organization: 'Cambridge English',
    roadLabel: { es: 'First Certificate · Cambridge', en: 'First Certificate · Cambridge' },
    description: {
      es: 'Inglés de nivel medio-alto certificado por Cambridge. Castellano nativo y catalán de nivel básico.',
      en: 'Upper-intermediate English certified by Cambridge. Native Spanish and basic Catalan.',
    },
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
      es: 'Desarrollo frontend y maquetación de webs para clientes nacionales e internacionales como MSC, El Corte Inglés, Seat, Santander, Vodafone, Google, Netflix, Bosch, IKEA o IQOS, newsletters para email marketing y mejoras de SEO. También iniciativas internas relacionadas con IA.',
      en: 'Front-end development of websites for Spanish and international clients such as MSC, El Corte Inglés, Seat, Santander, Vodafone, Google, Netflix, Bosch, IKEA and IQOS, email marketing newsletters and SEO improvements. Also internal AI initiatives.',
    },
    tags: ['React', 'Vue', 'TypeScript', 'Alpine.js', 'Zustand', 'Vite', 'Jest', 'Node', 'Sass', 'SEO', 'GitHub Copilot'],
  },
  {
    id: 'big-school-ai',
    start: '2026-07',
    end: '2026-10',
    type: 'education',
    title: { es: 'Máster de Desarrollo con IA', en: 'Master in AI-Assisted Software Development' },
    organization: 'BIG school',
    roadLabel: { es: 'Máster IA · BIG school', en: 'AI master · BIG school' },
    description: {
      es: 'Online. Doble titulación con el Experto Universitario en Desarrollo con Inteligencia Artificial (Universidad Isabel I): ingeniería de software, IA generativa, RAG y agentes, testing, CI/CD, seguridad (OWASP) y despliegue, con proyecto final de principio a fin.',
      en: 'Online. Double degree with the University Expert in AI Development (Universidad Isabel I): software engineering, generative AI, RAG and agents, testing, CI/CD, security (OWASP) and deployment, with an end-to-end final project.',
    },
    tags: ['Generative AI', 'RAG', 'AI agents', 'LangChain', 'Claude', 'Cursor', 'Playwright', 'CI/CD', 'Docker', 'OWASP'],
    link: 'https://thebigschool.com/master-desarrollo-con-ia/',
  },
  {
    id: 'mylifemirror',
    start: '2026-10',
    type: 'project',
    title: { es: 'MyLifeMirror (en construcción)', en: 'MyLifeMirror (in progress)' },
    organization: { es: 'Proyecto final del máster · BIG school', en: 'Master’s final project · BIG school' },
    roadLabel: { es: 'MyLifeMirror', en: 'MyLifeMirror' },
    description: {
      es: 'App para evaluar cómo va tu vida por áreas, ver tu equilibrio y su evolución, y recibir ideas concretas para mejorar, sin juicios. Clean Architecture, TDD, IA opcional y acotada con Claude, en español e inglés.',
      en: 'App to rate how your life is going by area, see your balance and how it changes, and get concrete ideas to improve, without judgement. Clean Architecture, TDD, optional and bounded AI with Claude, in Spanish and English.',
    },
    tags: ['React', 'TypeScript', 'Clean Architecture', 'TDD', 'Supabase', 'Claude', 'Playwright', 'Vercel'],
    link: 'https://my-life-mirror.vercel.app/',
  },
]

// The road goes in date order
export const milestones = [...entries].sort((a, b) => a.start.localeCompare(b.start))

// The trip starts at the current job; the road behind and ahead can be driven both ways
export const startIndex = Math.max(milestones.findIndex((milestone) => milestone.id === 'dentsu'), 0)

export const startYear = (milestone: Milestone) => Number(milestone.start.slice(0, 4))

export const organizationOf = (milestone: Milestone, lang: Language) =>
  typeof milestone.organization === 'string' ? milestone.organization : milestone.organization[lang]

export const roadLabelOf = (milestone: Milestone, lang: Language) =>
  milestone.roadLabel?.[lang] ?? organizationOf(milestone, lang)
