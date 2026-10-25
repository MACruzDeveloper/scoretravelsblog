import { useEffect, type Ref, type SelectHTMLAttributes } from 'react'
import { sortBy } from '@/utils/collections'
import { useCategoriesStore } from '@/store/categoriesStore'

type PropsSelectCategories = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  ref?: Ref<HTMLSelectElement>
}

/**
 * Category select. Works controlled (value + onChange) and with react-hook-form (register).
 * The empty option means "no category".
 */
const SelectCategories = ({ className = 'form_control', ref, ...props }: PropsSelectCategories) => {
  const { items: cats, loading, error, fetch } = useCategoriesStore()
  const sortedCats = sortBy(cats, (cat) => cat.name.toLowerCase())

  useEffect(() => {
    fetch()
  }, [fetch])

  return <>
    <select name="category" aria-label="Category" {...props} ref={ref} className={className}>
      <option value="">{loading ? 'Loading categories…' : '*Category'}</option>
      {sortedCats.map((category) => (
        <option key={category._id} value={category.name}>{category.name}</option>
      ))}
    </select>
    {error && <p className="form_error">{error}</p>}
  </>
}

export default SelectCategories
