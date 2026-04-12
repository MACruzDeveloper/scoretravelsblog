import { useMemo, useState, useEffect } from 'react'
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md'
import Pagination from './Pagination'

type Column = {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: string
}

type TableProps = {
  columns: Column[]
  data: any[]
  renderRow: (item: any, index: number) => JSX.Element
  className?: string
  onSort?: (key: string) => void
  sortColumn?: string | null
  sortDirection?: 'asc' | 'desc'
  hasPagination?: boolean
  itemsPerPage?: number
}

const Table = ({
  columns,
  data,
  renderRow,
  className = 'table_scroll',
  onSort,
  sortColumn,
  sortDirection,
  hasPagination = false,
  itemsPerPage = 10,
}: TableProps) => {
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
      <div className="table">
        <div className="tRow tHead">
          {columns.map(col => (
            <div key={col.key} className={`tCol ${col.width || ''} ${col.align || ''}`}>
              <span className="table_header">
                <strong>{col.label}</strong>

                {col.sortable && (
                  <button
                    type="button"
                    className="btn_icon btn_table-sort"
                    onClick={() => onSort?.(col.key)}
                    title={`Sort by ${col.label}`}
                  >
                    {sortColumn === col.key ? (
                      sortDirection === 'asc' ? <MdArrowDropUp /> : <MdArrowDropDown />
                    ) : (
                      <MdArrowDropDown />
                    )}
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