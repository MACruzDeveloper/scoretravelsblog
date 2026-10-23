import { useMemo, useState, useEffect, ReactNode } from 'react'
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md'
import Pagination from './Pagination'
import type { SortDirection } from '@/hooks/useSortedData'

export type Column = {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'center' | 'right'
}

// What useSortedData returns: the table shows the state and calls handleSort
type SortState = {
  sortColumn: string | null
  sortDirection: SortDirection
  handleSort: (key: string) => void
}

type TableProps<T> = {
  // Accessible name of the table, read by screen readers
  label: string
  columns: Column[]
  data: T[]
  renderRow: (item: T, index: number) => ReactNode
  className?: string
  sort?: SortState
  hasPagination?: boolean
  itemsPerPage?: number
}

// aria-sort value of a header cell
const ariaSort = (column: Column, sort?: SortState) => {
  if (!column.sortable || !sort) return undefined
  if (sort.sortColumn !== column.key) return 'none'
  return sort.sortDirection === 'asc' ? 'ascending' : 'descending'
}

/**
 * Data table built with divs, so it carries ARIA table roles: rows rendered by
 * renderRow must use role="row" (wrappers role="rowgroup") and cells role="cell".
 */
const Table = <T,>({
  label,
  columns,
  data,
  renderRow,
  className = 'table_scroll',
  sort,
  hasPagination = false,
  itemsPerPage = 10,
}: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = useMemo(() => Math.ceil(data.length / itemsPerPage), [data.length, itemsPerPage])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1)
  }, [currentPage, totalPages])

  const currentData = useMemo(() => {
    if (!hasPagination) return data
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return data.slice(indexOfFirstItem, indexOfLastItem)
  }, [currentPage, data, hasPagination, itemsPerPage])

  return (
    <div className={className}>
      <div className="table" role="table" aria-label={label}>
        <div className="tRow tHead" role="row">
          {columns.map(col => (
            <div key={col.key} className={`tCol ${col.width || ''} ${col.align || ''}`} role="columnheader" aria-sort={ariaSort(col, sort)}>
              <span className="table_header">
                <strong>{col.label}</strong>

                {col.sortable && sort && (
                  <button
                    type="button"
                    className="btn_icon btn_table-sort"
                    onClick={() => sort.handleSort(col.key)}
                    title={`Sort by ${col.label}`}
                    aria-label={`Sort by ${col.label}`}
                  >
                    {sort.sortColumn === col.key && sort.sortDirection === 'asc' ? <MdArrowDropUp /> : <MdArrowDropDown />}
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
        {currentData.map((item, index) => renderRow(item, index))}
      </div>

      {hasPagination && data.length > itemsPerPage && (
        <Pagination
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalItems={data.length}
          paginate={setCurrentPage}
        />
      )}
    </div>
  )
}

export default Table
