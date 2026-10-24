import { useLocation } from 'react-router-dom'
import SearchResults from './SearchResults'

const SearchPage = () => {
  const location = useLocation()
  const term = (new URLSearchParams(location.search).get('search') || '').trim()

  return <SearchResults
    label={term}
    filters={term ? { search: term } : null}
    emptyMessage={term ? `No Results for ${term}` : 'Type a term to search'}
  />
}

export default SearchPage
