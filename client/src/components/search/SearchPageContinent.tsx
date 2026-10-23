import { useParams } from 'react-router-dom'
import SearchResults from './SearchResults'

const SearchPageContinent = () => {
  const { search } = useParams()
  const continent = search?.toLowerCase() || ''

  return <SearchResults
    label={continent}
    filters={continent ? { continent } : null}
    emptyMessage="No Results"
  />
}

export default SearchPageContinent
