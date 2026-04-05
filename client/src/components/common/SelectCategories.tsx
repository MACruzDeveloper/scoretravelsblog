import { useEffect } from 'react'
import { sortBy } from 'lodash'
import { useCategoriesStore } from '../../store/categoriesStore'

export type PropsSelectCategories = {
  handleChange: any
  selected?: string
}

const SelectCategories = ({ handleChange, selected }: PropsSelectCategories) => {
  const { cats, loading, error, fetchCats } = useCategoriesStore()
  const sortedCats = sortBy(cats, [cat => cat.name.toLowerCase()])

  useEffect(() => {
    fetchCats()
  }, [fetchCats])

  return <select name="category" className="form_control" onChange={handleChange} defaultValue={selected}>
    <option>{selected || "*Category"}</option>
    {
      !loading && sortedCats?.length > 0 && sortedCats.map((ele) => {
        return <option key={ele._id} value={ele.name}>
          {ele.name}
        </option>
      })
    }
    {error}
  </select>
}

export default SelectCategories