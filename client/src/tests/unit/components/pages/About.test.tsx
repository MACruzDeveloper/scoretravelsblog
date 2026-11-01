import { render, screen, fireEvent, act, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import About from '@/components/About'
import { changeLanguage } from '@/i18n'
import { milestones, startIndex } from '@/data/career'
import { formatPeriod } from '@/components/about/period'

// The card follows the car once it stops (a short delay), so the clock moves on first:
// in steps, as the stop schedules the card change in an effect. The last one lets the
// card animation end, while the controls wait
const cardTitle = () => {
  act(() => { vi.advanceTimersByTime(250) })
  act(() => { vi.advanceTimersByTime(250) })
  act(() => { vi.advanceTimersByTime(800) })
  const card = document.querySelector<HTMLElement>('.milestone_card_wrapper')!
  return within(card).getByRole('heading', { level: 2 }).textContent
}
const road = () => screen.getByLabelText('Hitos de mi carrera')
const first = milestones[0]
const last = milestones[milestones.length - 1]
// The trip starts at the current job
const start = milestones[startIndex]
const next = milestones[startIndex + 1]
const previous = milestones[startIndex - 1]

describe('About', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  // i18next changes language asynchronously and re-renders the page
  afterEach(async () => {
    await act(() => changeLanguage('es'))
    vi.useRealTimers()
  })

  it('starts the trip at the current job (Dentsu), in Spanish', () => {
    render(<About />)

    expect(start.id).toBe('dentsu')
    expect(screen.getByRole('region', { name: 'Carretera interactiva con hitos de mi carrera' })).toBeInTheDocument()
    expect(cardTitle()).toBe(start.title.es)
    expect(screen.getAllByRole('button', { name: new RegExp(start.title.es) })[0]).toHaveAttribute('aria-current', 'step')
    expect(screen.getByRole('button', { name: 'Hito anterior' })).toBeEnabled()
  })

  it('moves with the buttons and the milestones on the road', () => {
    render(<About />)

    fireEvent.click(screen.getByRole('button', { name: 'Hito siguiente' }))
    expect(cardTitle()).toBe(next.title.es)

    const lastStop = screen.getAllByRole('button', { name: `Ir al hito de ${last.start.slice(0, 4)}: ${last.title.es}` })[0]
    fireEvent.click(lastStop)
    expect(cardTitle()).toBe(last.title.es)
    expect(lastStop).toHaveAttribute('aria-current', 'step')
    expect(screen.getByRole('button', { name: 'Hito siguiente' })).toBeDisabled()
  })

  it('drives the car with the arrow keys from anywhere on the page, once per key', () => {
    render(<About />)

    fireEvent.keyDown(document.body, { key: 'ArrowLeft' })
    act(() => { vi.advanceTimersByTime(600) })
    fireEvent.keyDown(document.body, { key: 'ArrowLeft' })
    expect(cardTitle()).toBe(milestones[startIndex - 2].title.es)
    // The road handles its own keys: one step forward, not two
    fireEvent.keyDown(road(), { key: 'ArrowRight' })
    expect(cardTitle()).toBe(previous.title.es)

    // Not while typing in a field, nor with a modifier (browser shortcuts)
    const field = document.body.appendChild(document.createElement('input'))
    fireEvent.keyDown(field, { key: 'ArrowRight' })
    fireEvent.keyDown(document.body, { key: 'ArrowRight', altKey: true })
    expect(cardTitle()).toBe(previous.title.es)
    field.remove()
  })

  it('changes the card only once the car stops, not at every milestone on the way', () => {
    render(<About />)
    const heading = () => within(document.querySelector<HTMLElement>('.milestone_card_wrapper')!).getByRole('heading', { level: 2 }).textContent

    // Driving: the scroll moves the car to the next milestone (stops are 1px wide in jsdom).
    // jsdom keeps scrollLeft at 0, so the position is set by hand
    Object.defineProperty(road(), 'scrollLeft', { configurable: true, value: startIndex + 1 })
    act(() => { fireEvent.scroll(road()) })
    act(() => { vi.advanceTimersByTime(100) })
    expect(heading()).toBe(start.title.es)

    // Stopped
    expect(cardTitle()).toBe(next.title.es)
  })

  it('ignores the controls while the card is changing, so quick presses do not pile up', () => {
    render(<About />)

    fireEvent.click(screen.getByRole('button', { name: 'Hito anterior' }))
    // The card is still sliding in
    act(() => { vi.advanceTimersByTime(250) })
    fireEvent.click(screen.getByRole('button', { name: 'Hito anterior' }))
    fireEvent.keyDown(document.body, { key: 'ArrowLeft' })
    expect(cardTitle()).toBe(previous.title.es)

    // Once it has changed, the controls work again
    fireEvent.click(screen.getByRole('button', { name: 'Hito anterior' }))
    expect(cardTitle()).toBe(milestones[startIndex - 2].title.es)
  })

  it('slides the card in the way the car drives, as the car sets off', () => {
    render(<About />)
    const card = () => document.querySelector('.milestone_card')

    fireEvent.click(screen.getByRole('button', { name: 'Hito siguiente' }))
    // No waiting for the car to stop: both move together
    expect(card()).toHaveTextContent(next.title.es)
    expect(card()).toHaveAttribute('data-direction', 'forward')

    act(() => { vi.advanceTimersByTime(600) })
    fireEvent.click(screen.getByRole('button', { name: 'Hito anterior' }))
    expect(card()).toHaveTextContent(start.title.es)
    expect(card()).toHaveAttribute('data-direction', 'backward')
  })

  it('uses Home and End only while the road has the focus (B-1)', () => {
    render(<About />)

    // Anywhere else on the page they keep scrolling the page
    fireEvent.keyDown(document.body, { key: 'End' })
    expect(cardTitle()).toBe(start.title.es)

    fireEvent.keyDown(road(), { key: 'End' })
    expect(cardTitle()).toBe(last.title.es)
    fireEvent.keyDown(road(), { key: 'Home' })
    expect(cardTitle()).toBe(first.title.es)
  })

  it('moves with Ctrl + wheel and leaves the plain wheel to the page', () => {
    render(<About />)

    const plain = new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true })
    act(() => { road().dispatchEvent(plain) })
    expect(plain.defaultPrevented).toBe(false)
    expect(cardTitle()).toBe(start.title.es)
    expect(screen.getByText(/rueda para avanzar/)).toHaveClass('visible')

    const withCtrl = new WheelEvent('wheel', { deltaY: 100, ctrlKey: true, bubbles: true, cancelable: true })
    act(() => { road().dispatchEvent(withCtrl) })
    expect(withCtrl.defaultPrevented).toBe(true)
    expect(cardTitle()).toBe(next.title.es)
  })

  it('switches to English and remembers the choice', async () => {
    const { container } = render(<About />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'English' }))
    })

    expect(cardTitle()).toBe(start.title.en)
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('.page.about')).toHaveAttribute('lang', 'en')
    expect(localStorage.getItem('lang')).toBe('en')
  })
})

describe('About projects', () => {
  it('lists personal and company projects, crediting the company', () => {
    render(<About />)

    const section = screen.getByRole('region', { name: 'Proyectos destacados' })
    expect(within(section).getByRole('heading', { name: 'MSC' })).toBeInTheDocument()
    expect(within(section).getByText('Dentsu Creative / Merkle')).toBeInTheDocument()
    expect(within(section).getAllByText('Proyecto personal').length).toBeGreaterThan(0)
    expect(within(section).getAllByRole('link', { name: /Código/ })[0]).toHaveAttribute('href', expect.stringContaining('github.com'))
    // MyLifeMirror is still being built
    expect(within(section).getByRole('img', { name: 'En construcción' })).toBeInTheDocument()
  })
})

describe('formatPeriod', () => {
  it('formats single dates, ranges and ongoing milestones', () => {
    expect(formatPeriod({ start: '2014', end: '2014' }, 'es', 'actualidad')).toBe('2014')
    expect(formatPeriod({ start: '2001', end: '2003' }, 'es', 'actualidad')).toBe('2001 – 2003')
    expect(formatPeriod({ start: '2008-10', end: '2012-08' }, 'en', 'present')).toBe('Oct 2008 – Aug 2012')
    expect(formatPeriod({ start: '2020-09', end: 'present' }, 'en', 'present')).toBe('Sep 2020 – present')
  })
})
