import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Table, { Column } from '@/components/common/Table'
import { useSortedData } from '@/hooks/useSortedData'

type Row = { _id: string; name: string; score: number }
const rows: Row[] = [
  { _id: '1', name: 'Beta', score: 2 },
  { _id: '2', name: 'Alpha', score: 5 },
]
const columns: Column[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'score', label: 'Score', sortable: true },
]

const SortableTable = () => {
  const sort = useSortedData(rows, { initialKey: 'name' })
  return <Table label="Results" columns={columns} data={sort.sorted} sort={sort} renderRow={(row) => (
    <div className="tRow" role="row" key={row._id}>
      <div className="tCol" role="cell">{row.name}</div>
      <div className="tCol" role="cell">{row.score}</div>
    </div>
  )} />
}

describe('Table', () => {
  it('exposes a named table with headers, rows and cells', () => {
    render(<SortableTable />)

    const table = screen.getByRole('table', { name: 'Results' })
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Name', 'Score'])
    // Header row + 2 data rows, sorted by name
    const dataRows = within(table).getAllByRole('row').slice(1)
    expect(dataRows.map((r) => within(r).getAllByRole('cell')[0].textContent)).toEqual(['Alpha', 'Beta'])
  })

  it('announces the sort order of each column', async () => {
    const user = userEvent.setup()
    render(<SortableTable />)

    const [nameHeader, scoreHeader] = screen.getAllByRole('columnheader')
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')
    expect(scoreHeader).toHaveAttribute('aria-sort', 'none')

    await user.click(screen.getByRole('button', { name: 'Sort by Name' }))
    expect(nameHeader).toHaveAttribute('aria-sort', 'descending')
  })
})
