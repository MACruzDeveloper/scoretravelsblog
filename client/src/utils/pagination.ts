// Pages shown on each side of the current one
const SIBLINGS = 1

// First, last and the pages around the current one; null marks a gap ("…")
export const pageRange = (currentPage: number, totalPages: number): (number | null)[] => {
  // Up to 7 pages fit without gaps
  const all = totalPages <= 2 * SIBLINGS + 5
  const shown = (page: number) =>
    all || page === 1 || page === totalPages || Math.abs(page - currentPage) <= SIBLINGS
  const pages: (number | null)[] = []
  for (let page = 1; page <= totalPages; page++) {
    // A gap of a single page shows that page instead of "…"
    if (shown(page) || (shown(page - 1) && shown(page + 1))) pages.push(page)
    else if (pages[pages.length - 1] !== null) pages.push(null)
  }
  return pages
}
