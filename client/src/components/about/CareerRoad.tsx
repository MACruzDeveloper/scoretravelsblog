import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Language } from '@/i18n'
import { startYear, type Milestone } from '@/data/career'
import { TYPE_ICONS } from './milestoneTypes'

type PropsCareerRoad = {
  milestones: Milestone[]
  active: number
  onChange: (index: number) => void
}

// Ctrl/⌘ + wheel moves one milestone per notch; trackpads send many events per gesture
const WHEEL_THROTTLE_MS = 300
// The car counts as moving until the scroll has been still for this long
const MOVING_MS = 180
const HINT_MS = 1500
// A mouse press that moves less than this is a click, not a drag
const DRAG_THRESHOLD = 4

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent)
const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The career as a road with its own horizontal scroll. The car stays in the middle and the
 * road moves under it; the milestone under the car is the active one. Scroll snapping
 * leaves one milestone centered. Page scroll never moves the road.
 */
const CareerRoad = ({ milestones, active, onChange }: PropsCareerRoad) => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as Language
  const viewportRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(active)
  const lastScroll = useRef(0)
  const timers = useRef({ moving: 0, hint: 0 })
  const lastWheel = useRef(0)
  const drag = useRef<{ x: number; scrollLeft: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const [moving, setMoving] = useState(false)
  const [backwards, setBackwards] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const last = milestones.length - 1

  useEffect(() => {
    activeRef.current = active
  }, [active])

  // Every milestone takes the same width, so the scroll position gives the index
  const stopWidth = () => viewportRef.current?.querySelector<HTMLElement>('.road_stop')?.offsetWidth || 1

  const goTo = useCallback(
    (index: number) => {
      const target = Math.min(Math.max(index, 0), last)
      onChange(target)
      viewportRef.current?.scrollTo?.({
        left: target * stopWidth(),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      })
    },
    [last, onChange]
  )

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const { scrollLeft, clientWidth } = viewport
    // Where the car is, in road coordinates: the lit part of the road ends there
    viewport.style.setProperty('--car-position', `${scrollLeft + clientWidth / 2}px`)

    if (scrollLeft !== lastScroll.current) {
      setBackwards(scrollLeft < lastScroll.current)
      lastScroll.current = scrollLeft
      setMoving(true)
      window.clearTimeout(timers.current.moving)
      timers.current.moving = window.setTimeout(() => setMoving(false), MOVING_MS)
    }

    const index = Math.min(Math.max(Math.round(scrollLeft / stopWidth()), 0), last)
    if (index !== activeRef.current && !drag.current) {
      activeRef.current = index
      onChange(index)
    }
  }, [last, onChange])

  // Initial road position and after resizing (the stop width changes with the breakpoint)
  useLayoutEffect(() => {
    handleScroll()
    const onResize = () => {
      viewportRef.current?.scrollTo?.({ left: activeRef.current * stopWidth() })
      handleScroll()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [handleScroll])

  // Wheel: only with Ctrl/⌘, like the map; otherwise the page scrolls and a hint shows up.
  // Native listener because React's wheel listener is passive and cannot preventDefault
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const timerIds = timers.current

    const onWheel = (event: WheelEvent) => {
      const vertical = Math.abs(event.deltaY) > Math.abs(event.deltaX)
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        const now = Date.now()
        if (now - lastWheel.current < WHEEL_THROTTLE_MS) return
        lastWheel.current = now
        const delta = vertical ? event.deltaY : event.deltaX
        if (delta) goTo(activeRef.current + Math.sign(delta))
        return
      }
      // Horizontal gestures (trackpad, shift + wheel) scroll the road natively
      if (vertical) {
        setShowHint(true)
        window.clearTimeout(timerIds.hint)
        timerIds.hint = window.setTimeout(() => setShowHint(false), HINT_MS)
      }
    }

    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      viewport.removeEventListener('wheel', onWheel)
      window.clearTimeout(timerIds.hint)
      window.clearTimeout(timerIds.moving)
    }
  }, [goTo])

  // Keys only while the road has the focus, so the rest of the page keeps its keyboard (B-1)
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: last }
    if (!(event.key in moves)) return
    event.preventDefault()
    goTo(moves[event.key])
  }

  // Drag with the mouse; touch screens already scroll natively
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !viewportRef.current) return
    drag.current = { x: event.clientX, scrollLeft: viewportRef.current.scrollLeft, moved: false }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current
    if (!drag.current || !viewport) return
    const distance = event.clientX - drag.current.x
    if (!drag.current.moved && Math.abs(distance) > DRAG_THRESHOLD) {
      drag.current.moved = true
      viewport.classList.add('dragging')
    }
    if (drag.current.moved) viewport.scrollLeft = drag.current.scrollLeft - distance
  }

  const endDrag = () => {
    const viewport = viewportRef.current
    if (!drag.current || !viewport) return
    const { moved } = drag.current
    drag.current = null
    if (!moved) return
    viewport.classList.remove('dragging')
    // The click that ends a drag must not open the milestone under the pointer
    suppressClick.current = true
    window.setTimeout(() => (suppressClick.current = false), 0)
    goTo(Math.round(viewport.scrollLeft / stopWidth()))
  }

  const onClickCapture = (event: MouseEvent) => {
    if (!suppressClick.current) return
    event.preventDefault()
    event.stopPropagation()
  }

  const year = startYear(milestones[active])

  return (
    <section className="career_road" aria-label={t('about.road')}>
      <span className="road_year" aria-hidden>{year}</span>

      <div
        ref={viewportRef}
        className="road_viewport"
        tabIndex={0}
        aria-label={t('about.milestones')}
        onScroll={handleScroll}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
      >
        <div className="road_track">
          <div className="road_asphalt" aria-hidden>
            <span className="road_progress" />
          </div>
          <ol className="road_stops">
            {milestones.map((milestone, index) => {
              const Icon = TYPE_ICONS[milestone.type]
              const state = index === active ? 'active' : index < active ? 'passed' : ''
              return (
                <li key={milestone.id} className={`road_stop type_${milestone.type} ${state}`}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-current={index === active ? 'step' : undefined}
                    aria-label={t('about.goTo', { year: startYear(milestone), title: milestone.title[lang] })}
                  >
                    <span className="road_stop_dot" />
                    <span className="road_stop_year">{startYear(milestone)}</span>
                    <span className="road_stop_name">
                      <Icon aria-hidden /> {milestone.organization}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <div className="road_car" data-moving={moving} data-backwards={backwards} aria-hidden>
        <div className="carContainer">
          <div className="car">
            <div className="car_window" />
            <div className="wheel front" />
            <div className="wheel back" />
          </div>
        </div>
      </div>

      <div className="road_controls">
        <button type="button" className="road_control" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label={t('about.previous')}>
          ‹
        </button>
        <div className="road_minimap">
          {milestones.map((milestone, index) => (
            <button
              key={milestone.id}
              type="button"
              className={`road_minimap_dot type_${milestone.type} ${index === active ? 'active' : ''}`}
              onClick={() => goTo(index)}
              aria-label={t('about.goTo', { year: startYear(milestone), title: milestone.title[lang] })}
              tabIndex={-1}
            />
          ))}
        </div>
        <button type="button" className="road_control" onClick={() => goTo(active + 1)} disabled={active === last} aria-label={t('about.next')}>
          ›
        </button>
      </div>
      <p className="road_count">{t('about.count', { current: active + 1, total: milestones.length })}</p>
      <p className={`road_hint ${showHint ? 'visible' : ''}`}>{t(isTouch ? 'about.hintTouch' : isMac ? 'about.hintMac' : 'about.hint')}</p>
    </section>
  )
}

export default CareerRoad
