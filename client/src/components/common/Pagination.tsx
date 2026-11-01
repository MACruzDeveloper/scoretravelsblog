import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { pageRange } from '@/utils/pagination'

type ParamsPagination = {
  itemsPerPage: number
  currentPage: number
  totalItems: number
  paginate: (i: number) => void
}

const Pagination = ({ itemsPerPage, currentPage, totalItems, paginate }: ParamsPagination) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return <nav className="pagination" aria-label="Pagination">
    <ul className="pagination_list">
      <li>
        <button type="button" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">
          <MdChevronLeft />
        </button>
      </li>
      {
        pageRange(currentPage, totalPages).map((page, index) => (
          <li key={page ?? `gap-${index}`}>
            {page === null
              ? <span className="pagination_gap">…</span>
              : <button type="button" className={currentPage === page ? 'active' : ''} onClick={() => paginate(page)}
                aria-current={currentPage === page ? 'page' : undefined}>{page}</button>}
          </li>
        ))
      }
      <li>
        <button type="button" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">
          <MdChevronRight />
        </button>
      </li>
    </ul>

    <p className="pagination_results">{totalItems} Results</p>
  </nav>
}

export default Pagination
