
type ParamsPagination = {
  itemsPerPage: number
  currentPage: number
  totalItems: number
  paginate: (i: number) => void
}

const Pagination = ({ itemsPerPage, currentPage, totalItems, paginate }: ParamsPagination) => {
  const pageNums = []
  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNums.push(i)
  }

  return <div className="pagination">
    <ul className="pagination_list">
      {
        pageNums.map(i => (
          <li key={i}>
            <span className={currentPage === i ? 'active' : ''} onClick={() => paginate(i)}>{i}</span>
          </li>
        ))
      }
    </ul>

    <p className="pagination_results">{totalItems} Results</p>
  </div>
}

export default Pagination