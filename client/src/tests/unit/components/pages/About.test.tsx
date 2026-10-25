import { render, screen, fireEvent, act } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import About from '@/components/About'
import { changeLanguage } from '@/i18n'
import { milestones } from '@/data/career'
import { formatPeriod } from '@/components/about/period'

const cardTitle = () => screen.getByRole('heading', { level: 2 }).textContent
const road = () => screen.getByLabelText('Hitos de mi carrera')
const first = milestones[0]
const second = milestones[1]
const last = milestones[milestones.length - 1]

describe('About', () => {
  // i18next changes language asynchronously and re-renders the page
  afterEach(async () => {
    await act(() => changeLanguage('es'))
  })

  it('starts the trip at the first milestone, in Spanish', () => {
    render(<About />)

    expect(screen.getByRole('region', { name: 'Carretera interactiva con hitos de mi carrera' })).toBeInTheDocument()
    expect(cardTitle()).toBe(first.title.es)
    expect(screen.getByText(`1 de ${milestones.length}`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hito anterior' })).toBeDisabled()
  })

  it('moves with the buttons and the milestones on the road', () => {
    render(<About />)

    fireEvent.click(screen.getByRole('button', { name: 'Hito siguiente' }))
    expect(cardTitle()).toBe(second.title.es)

    const lastStop = screen.getAllByRole('button', { name: `Ir al hito de ${last.start.slice(0, 4)}: ${last.title.es}` })[0]
    fireEvent.click(lastStop)
    expect(cardTitle()).toBe(last.title.es)
    expect(lastStop).toHaveAttribute('aria-current', 'step')
    expect(screen.getByRole('button', { name: 'Hito siguiente' })).toBeDisabled()
  })

  it('uses the arrow keys only while the road has the focus (B-1)', () => {
    render(<About />)

    // Anywhere else on the page the keys keep their normal behavior
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(document.body, { key: 'ArrowRight' })
    expect(cardTitle()).toBe(first.title.es)

    fireEvent.keyDown(road(), { key: 'ArrowRight' })
    expect(cardTitle()).toBe(second.title.es)
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
    expect(cardTitle()).toBe(first.title.es)
    expect(screen.getByText(/rueda para avanzar/)).toHaveClass('visible')

    const withCtrl = new WheelEvent('wheel', { deltaY: 100, ctrlKey: true, bubbles: true, cancelable: true })
    act(() => { road().dispatchEvent(withCtrl) })
    expect(withCtrl.defaultPrevented).toBe(true)
    expect(cardTitle()).toBe(second.title.es)
  })

  it('switches to English and remembers the choice', async () => {
    const { container } = render(<About />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'English' }))
    })

    expect(cardTitle()).toBe(first.title.en)
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('.page.about')).toHaveAttribute('lang', 'en')
    expect(localStorage.getItem('lang')).toBe('en')
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
