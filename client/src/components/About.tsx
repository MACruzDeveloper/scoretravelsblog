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
  const [isScrolling, setIsScrolling] = useState(false)
  const roadRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const scrollLockRef = useRef(false)
  const activeMilestone = milestones[currentIndex]

  const pointOffset = 3
  const step = milestones.length > 1 ? 100 / (milestones.length - 1) : 0
  const getPointLeft = (index: number) => `${Math.min(index * step + pointOffset, 97)}%`

  const minYear = Math.min(...milestones.map(m => m.year))
  const maxYear = Math.max(...milestones.map(m => m.year))

  const updateRoadPosition = (progress: number) => {
    const p = Math.min(Math.max(progress, 0), 1)
    const percent = Math.round(p * (100 - pointOffset * 2) + pointOffset)

    roadRef.current?.style.setProperty('--trig', `${percent}%`)
    roadRef.current?.style.setProperty('--progress', `${percent}%`)
    roadRef.current?.style.setProperty('--p', `${p}`)

    const nextIndex = Math.round(p * (milestones.length - 1))
    setCurrentIndex(prev => (prev !== nextIndex ? nextIndex : prev))
    setInterpolatedYear(Math.round(minYear + p * (maxYear - minYear)))
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || scrollLockRef.current) return
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goTo = (index: number) => {
    const target = Math.min(Math.max(index, 0), milestones.length - 1)
    const p = target / (milestones.length - 1)
    scrollLockRef.current = true
    setIsScrolling(true)

    const sectionTop = sectionRef.current!.offsetTop
    const sectionHeight = sectionRef.current!.offsetHeight
    const targetScroll = sectionTop + p * (sectionHeight - window.innerHeight)

    window.scrollTo({ top: targetScroll, behavior: 'smooth' })

    // Animate the road immediately so the UI responds without waiting for smoothing
    updateRoadPosition(p)
    setCurrentIndex(target)

    setTimeout(() => {
      scrollLockRef.current = false
      setIsScrolling(false)
    }, 650)
  }

  const handlePointClick = (index: number) => {
    if (index === currentIndex) return
    goTo(index)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const isInView = rect.top < window.innerHeight && rect.bottom > 0
      if (!isInView) return

      if (['ArrowRight', 'ArrowDown', 'KeyD'].includes(event.code)) {
        event.preventDefault()
        goTo(currentIndex + 1)
      }
      if (['ArrowLeft', 'ArrowUp', 'KeyA'].includes(event.code)) {
        event.preventDefault()
        goTo(currentIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  useEffect(() => {
    updateRoadPosition(currentIndex / (milestones.length - 1))
    setInterpolatedYear(milestones[currentIndex].year)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="page about">
      <section ref={sectionRef} className="about_slide road_slide">
        <div className="road_panel">
          <div
            ref={roadRef}
            className="about_road road"
            aria-label="Carretera interactiva con hitos de mi carrera"
          >
            <div className="road_sky_glow" />
            <div className="road_ground" />

            <div className="road_track">
              <div className="road_line" />
              <div className="road_progress" />
              <div className="road_grid" />
            </div>

            {milestones.map((milestone, index) => {
              const left = getPointLeft(index)
              const passed = index <= currentIndex
              return (
                <button
                  key={milestone.year}
                  className={`road_point ${currentIndex === index ? 'active' : ''} ${passed ? 'passed' : ''}`}
                  style={{ left }}
                  onClick={() => handlePointClick(index)}
                  aria-label={`Ir al hito de ${milestone.year}: ${milestone.title}`}
                >
                  <span className="road_point_dot" />
                  <span className="road_point_label">{milestone.year}</span>
                </button>
              )
            })}

            <div className="road_vehicle">
              <div className="carBox" data-driving={isScrolling ? 'true' : 'false'}>
                <div className="carContainer">
                  <div className="car">
                    <div className="car_window" />
                    <div className="wheel front" />
                    <div className="wheel back" />
                  </div>
                </div>
              </div>
            </div>
            <div className="road_meta">
              <span className="road_meta_year">{interpolatedYear}</span>
              <span className="road_meta_count">
                {currentIndex + 1} / {milestones.length}
              </span>
            </div>

            <div className="road_tooltip">
              <div className="tooltip_card">
                <span className="tooltip_tag">{activeMilestone.year}</span>
                <h3>{activeMilestone.title}</h3>
                <p>{activeMilestone.description}</p>
              </div>
            </div>

            <div className="road_controls">
              <button
                className="road_control prev"
                onClick={() => handlePointClick(currentIndex - 1)}
                disabled={currentIndex === 0}
                aria-label="Hito anterior"
              >
                ‹
              </button>
              <div className="road_dots">
                {milestones.map((m, i) => (
                  <button
                    key={m.year}
                    className={`road_dot ${currentIndex === i ? 'active' : ''}`}
                    onClick={() => handlePointClick(i)}
                    aria-label={`Ir al año ${m.year}`}
                  />
                ))}
              </div>
              <button
                className="road_control next"
                onClick={() => handlePointClick(currentIndex + 1)}
                disabled={currentIndex === milestones.length - 1}
                aria-label="Hito siguiente"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
