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
  const [dragging, setDragging] = useState(false)
  const [interpolatedYear, setInterpolatedYear] = useState(milestones[0].year)
  const roadRef = useRef<HTMLDivElement | null>(null)
  const activeMilestone = milestones[currentIndex]
  const pointOffset = 2.5
  const step = milestones.length > 1 ? 100 / (milestones.length - 1) : 0
  const getPointLeft = (index: number) => `${Math.min(index * step + pointOffset, 97.5)}%`
  const getRoadPercent = (p: number) => Math.round(p * (100 - pointOffset * 2) + pointOffset)

  const minYear = Math.min(...milestones.map(m => m.year))
  const maxYear = Math.max(...milestones.map(m => m.year))

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(milestones.length - 1, prev + 1))
  }

  const getProgressFromPointer = (clientX: number) => {
    const bounds = roadRef.current?.getBoundingClientRect()
    if (!bounds) return 0
    const x = Math.min(Math.max(clientX - bounds.left, 0), bounds.width)
    const ratio = x / bounds.width
    return Math.min(Math.max(ratio, 0), 1)
  }

  useEffect(() => {
    let mounted = true
    import('trig-js')
      .then((mod) => {
        if (!mounted) return
        const trig = (mod && (mod.default || mod.trig || mod)) as any
        if (trig && typeof trig.trigInit === 'function') {
          try {
            trig.trigInit()
          } catch (e) {
            // ignore
          }
        }
      })
      .catch(() => {
        // ignore
      })

    return () => {
      mounted = false
    }
  }, [])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    roadRef.current?.setPointerCapture(event.pointerId)
    setDragging(true)
    const p = getProgressFromPointer(event.clientX)
    const percent = getRoadPercent(p)
    if (roadRef.current) {
      roadRef.current.style.setProperty('--trig', `${percent}%`)
    }
    setCurrentIndex(Math.round(p * (milestones.length - 1)))
    setInterpolatedYear(Math.round(minYear + p * (maxYear - minYear)))
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    const p = getProgressFromPointer(event.clientX)
    const percent = getRoadPercent(p)
    if (roadRef.current) {
      roadRef.current.style.setProperty('--trig', `${percent}%`)
    }
    setCurrentIndex(Math.round(p * (milestones.length - 1)))
    setInterpolatedYear(Math.round(minYear + p * (maxYear - minYear)))
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    roadRef.current?.releasePointerCapture(event.pointerId)
    setDragging(false)
    const p = getProgressFromPointer(event.clientX)
    const percent = getRoadPercent(p)
    if (roadRef.current) {
      roadRef.current.style.setProperty('--trig', `${percent}%`)
    }
    setCurrentIndex(Math.round(p * (milestones.length - 1)))
    setInterpolatedYear(Math.round(minYear + p * (maxYear - minYear)))
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === 'ArrowRight' || event.code === 'ArrowDown' || event.code === 'KeyD') {
          event.preventDefault()
          const next = Math.min(milestones.length - 1, currentIndex + 1)
          setCurrentIndex(next)
        }

        if (event.code === 'ArrowLeft' || event.code === 'ArrowUp' || event.code === 'KeyA') {
          event.preventDefault()
          const prev = Math.max(0, currentIndex - 1)
          setCurrentIndex(prev)
        }
      }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  // Trig.js will handle scroll-driven CSS variables; we keep keyboard/pointer writes to --trig

  // sync CSS var and derived state when currentIndex changes (keyboard, click)
  useEffect(() => {
    const p = milestones.length > 1 ? currentIndex / (milestones.length - 1) : 0
    const percent = getRoadPercent(p)
    if (roadRef.current) {
      roadRef.current.style.setProperty('--trig', `${percent}%`)
    }
    setInterpolatedYear(Math.round(minYear + p * (maxYear - minYear)))
  }, [currentIndex])

  return (
    <div className="page about">
      <div className="container">
        <div className="wrapper">
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

            <div className="about_journey">
              <div
              ref={roadRef}
              className={`about_road road ${dragging ? 'dragging' : ''}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={handlePointerUp}>
              <div className="road_line" />

              {milestones.map((milestone, index) => {
                const left = getPointLeft(index)
                return (
                  <button
                    key={milestone.year}
                    type="button"
                    className={`road_point ${currentIndex === index ? 'active' : ''}`}
                    style={{ left }}
                    onClick={() => {
                      const p = index / (milestones.length - 1)
                      const percent = getRoadPercent(p)
                      if (roadRef.current) {
                        roadRef.current.style.setProperty('--trig', `${percent}%`)
                      }
                      setCurrentIndex(index)
                      setInterpolatedYear(Math.round(minYear + p * (maxYear - minYear)))
                    }}>
                    <span className="road_point_label">{milestone.year}</span>
                  </button>
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
            </div>
            <p className="road_hint">Arrastra el coche o usa las flechas del teclado para avanzar y retroceder.</p>

              <div className="about_stage">
                <article className="stage_card">
                  <div className="stage_meta">
                    <span className="stage_year">{activeMilestone.year}</span>
                    <span className="stage_label">Hito</span>
                  </div>
                  <h3>{activeMilestone.title}</h3>
                  <p className="stage_text">{activeMilestone.description}</p>
                </article>

                <div className="stage_list">
                  {milestones.map((milestone, index) => (
                    <button
                      key={milestone.year}
                      type="button"
                      className={`stage_item ${currentIndex === index ? 'active' : ''}`}
                      onClick={() => setCurrentIndex(index)}>
                      <span className="stage_item_year">{milestone.year}</span>
                      <span className="stage_item_title">{milestone.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="about_controls">
                <button type="button" onClick={handlePrev} disabled={currentIndex === 0}>
                  Paso anterior
                </button>
                <button type="button" onClick={handleNext} disabled={currentIndex === milestones.length - 1}>
                  Siguiente paso
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
