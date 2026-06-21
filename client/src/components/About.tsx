import { useEffect, useRef, useState } from 'react'

type Milestone = {
  year: number
  title: string
  description: string
}

const milestones: Milestone[] = [
  {
    year: 2013,
    title: 'Primer proyecto profesional',
    description: 'Comencé mi camino en el mundo del desarrollo con un pequeño proyecto que me enseñó la importancia de la usabilidad y el valor de lanzar algo real.'
  },
  {
    year: 2016,
    title: 'Aprendiendo nuevas tecnologías',
    description: 'Durante estos años me enfoqué en dominar nuevas herramientas, proyectos más grandes y trabajar con equipos más diversos.'
  },
  {
    year: 2019,
    title: 'Creando experiencias web',
    description: 'Mis proyectos empezaron a tener más foco en experiencia de usuario, optimización y rendimiento, además de datos más complejos.'
  },
  {
    year: 2022,
    title: 'Transformación digital',
    description: 'Lideré desarrollos donde el diseño y la tecnología se unían para aportar valor real al negocio y mejorar procesos.'
  },
  {
    year: 2024,
    title: 'Hoy',
    description: 'Sigo construyendo productos digitales con foco en viajes, datos y experiencia, siempre aprendiendo nuevas formas de mejorar lo que creo.'
  }
]

const About = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [interpolatedYear, setInterpolatedYear] = useState(milestones[0].year)
  const roadRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const activeMilestone = milestones[currentIndex]
  const pointOffset = 2.5
  const step = milestones.length > 1 ? 100 / (milestones.length - 1) : 0
  const getPointLeft = (index: number) => `${Math.min(index * step + pointOffset, 97.5)}%`
  const getTooltipLeft = (index: number) => `${Math.min(Math.max(index * step + pointOffset, 7), 93)}%`
  const getRoadPercent = (p: number) => Math.round(p * (100 - pointOffset * 2) + pointOffset)

  const minYear = Math.min(...milestones.map(m => m.year))
  const maxYear = Math.max(...milestones.map(m => m.year))

  const updateRoadPosition = (progress: number) => {
    const p = Math.min(Math.max(progress, 0), 1)
    const percent = getRoadPercent(p)

    if (roadRef.current) {
      roadRef.current.style.setProperty('--trig', `${percent}%`)
      roadRef.current.style.setProperty('--scroll', `${p}`)
    }

    const nextIndex = Math.round(p * (milestones.length - 1))
    setCurrentIndex((prev) => (prev !== nextIndex ? nextIndex : prev))
    setInterpolatedYear(Math.round(minYear + p * (maxYear - minYear)))
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const scrollY = window.scrollY || window.pageYOffset
      const sectionTop = sectionRef.current.offsetTop
      const sectionHeight = sectionRef.current.offsetHeight
      const start = sectionTop
      const end = sectionTop + sectionHeight - window.innerHeight
      const progress = end > start ? (scrollY - start) / (end - start) : 0
      updateRoadPosition(progress)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ArrowRight' || event.code === 'ArrowDown' || event.code === 'KeyD') {
        event.preventDefault()
        setCurrentIndex((prev) => Math.min(milestones.length - 1, prev + 1))
      }

      if (event.code === 'ArrowLeft' || event.code === 'ArrowUp' || event.code === 'KeyA') {
        event.preventDefault()
        setCurrentIndex((prev) => Math.max(0, prev - 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const p = milestones.length > 1 ? currentIndex / (milestones.length - 1) : 0
    const percent = getRoadPercent(p)
    if (roadRef.current) {
      roadRef.current.style.setProperty('--trig', `${percent}%`)
      roadRef.current.style.setProperty('--scroll', `${p}`)
    }
    setInterpolatedYear(Math.round(minYear + p * (maxYear - minYear)))
  }, [currentIndex])

  return (
    <div className="page about">
      <section className="about_slide intro_slide">
        <div className="slide_inner">
          <div className="top">
            <h2 className="title">About me</h2>
          </div>
          <div className="content">
            <div className="about_intro">
              <p>
                Mi historia se puede leer como un viaje en carretera: cada etapa tiene su punto de partida,
                su recorrido y un destino que aporta un nuevo aprendizaje. Aquí te muestro ese camino con un pequeño
                coche y cinco hitos importantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={sectionRef} className="about_slide road_slide">
        <div className="road_panel">
          <div
            ref={roadRef}
            className="about_road road"
            aria-label="Carretera interactiva con hitos"
          >
            <div className="road_background" />
            <div className="road_line" />

            {milestones.map((milestone, index) => {
              const left = getPointLeft(index)
              return (
                <div
                  key={milestone.year}
                  className={`road_point ${currentIndex === index ? 'active' : ''}`}
                  style={{ left }}
                >
                  <span className="road_point_label">{milestone.year}</span>
                </div>
              )
            })}

            <div className="carBox">
              <div className="carContainer">
                <div className="car">
                  <div className="car_window" />
                  <div className="wheel front" />
                  <div className="wheel back" />
                </div>
              </div>
            </div>

            <div className="road_year_overlay">
              <span>{interpolatedYear}</span>
            </div>

            <div className="road_tooltip" style={{ left: getTooltipLeft(currentIndex) }}>
              <div className="tooltip_card">
                <span className="tooltip_tag">{activeMilestone.year}</span>
                <h3>{activeMilestone.title}</h3>
                <p>{activeMilestone.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
