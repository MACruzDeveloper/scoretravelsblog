import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Filters from '@/components/common/Filters'
import type { Filters as FiltersType } from '@hooks/useExperienceFilters'

const empty: FiltersType = { search: '', score: '', category: '', continent: '', country: '', year: '', month: '' }
const countries = [
  { code: 'JP', name: 'Japan', continent: 'asia' },
  { code: 'PE', name: 'Peru', continent: 'south-america' },
  { code: 'TH', name: 'Thailand', continent: 'asia' },
]

const renderFilters = (filters: FiltersType, props: { showScore?: boolean } = {}) => {
  const setFilter = vi.fn()
  render(
    <Filters filters={filters} setFilter={setFilter} resetFilters={vi.fn()} hasActiveFilters={false} categories={[]}
      continents={['asia', 'south-america']} countries={countries} availableYears={[]} {...props} />
  )
  return setFilter
}

describe('Filters', () => {
  it('offers continents by name and only the countries of the chosen continent', () => {
    renderFilters({ ...empty, continent: 'asia' })

    expect(screen.getByRole('option', { name: 'South America' })).toBeInTheDocument()
    const country = screen.getByRole('combobox', { name: 'Country' })
    expect([...country.querySelectorAll('option')].map((o) => o.textContent)).toEqual(['All', 'Japan', 'Thailand'])
  })

  it('clears a country that does not belong to the new continent', async () => {
    const setFilter = renderFilters({ ...empty, country: 'PE' })

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Continent' }), 'asia')
    expect(setFilter).toHaveBeenCalledWith('continent', 'asia')
    expect(setFilter).toHaveBeenCalledWith('country', '')
  })

  it('can hide the score filter', () => {
    renderFilters(empty, { showScore: false })
    expect(screen.queryByText('Min. score')).not.toBeInTheDocument()
  })
})
