import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Pagination from '@/components/common/Pagination'
import { pageRange } from '@/utils/pagination'

describe('pageRange', () => {
  it('shows every page when there are few', () => {
    expect(pageRange(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('keeps first, last and the neighbours of the current page', () => {
    expect(pageRange(1, 17)).toEqual([1, 2, null, 17])
    expect(pageRange(9, 17)).toEqual([1, null, 8, 9, 10, null, 17])
    expect(pageRange(17, 17)).toEqual([1, null, 16, 17])
  })

  it('shows a single hidden page instead of a gap', () => {
    expect(pageRange(4, 17)).toEqual([1, 2, 3, 4, 5, null, 17])
  })
})

describe('Pagination', () => {
  it('moves with the arrows and marks the current page', async () => {
    const paginate = vi.fn()
    render(<Pagination itemsPerPage={20} currentPage={1} totalItems={335} paginate={paginate} />)

    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '17' })).toBeInTheDocument()
    expect(screen.getByText('335 Results')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(paginate).toHaveBeenCalledWith(2)
  })
})
