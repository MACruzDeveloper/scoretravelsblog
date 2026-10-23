import { useEffect, forwardRef, SelectHTMLAttributes } from 'react'
import { sortBy } from '@/utils/collections'
import { useCategoriesStore } from '@/store/categoriesStore'

type PropsSelectCategories = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'>

/**
 * Category select. Works controlled (value + onChange) and with react-hook-form (register).
 * The empty option means "no category".
 */
const SelectCategories = forwardRef<HTMLSelectElement, PropsSelectCategories>(
  ({ className = 'form_control', ...props }, ref) => {
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
)

SelectCategories.displayName = 'SelectCategories'

export default SelectCategories
