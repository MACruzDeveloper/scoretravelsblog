import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import useOutsideClick from '@/hooks/useOutsideClick'
import { MdSearch, MdClose } from 'react-icons/md'

const SearchForm = () => {
  const ref = useRef()
  const [value, setValue] = useState('')
  const [isSearchFormOpen, setIsSearchFormOpen] = useState(false)
  const [focusInput, setFocusInput] = useState(false)
  const navigate = useNavigate()

  const openSearchForm = () => {
    if (!isSearchFormOpen) {
      setIsSearchFormOpen(true)
    } else {
      setIsSearchFormOpen(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (target) setValue(target.value)
  }

  const clearInput = () => {
    setValue('')
  }

  const handleSubmit = () => {
    navigate(`/search`)
  }
  
  const watchInput = () => {
    if (value.length > 0) {
      setFocusInput(true)
    } else {
      setFocusInput(false)
    }
  }

  useEffect(() => {
    watchInput()
  })

  useOutsideClick(ref, () => {
    isSearchFormOpen && setIsSearchFormOpen(false)
  })

  return <div ref={ref} className="search_form">
    <button type="button" className="btn_icon btn_open_form" onClick={openSearchForm}>
      <MdSearch />
    </button>

    <form className="form" onSubmit={handleSubmit}>
      <div className={`search_form_wrapper ${isSearchFormOpen ? 'open' : ''}`}>
        <input 
          type="text" 
          name="search" 
          value={value} 
          onChange={handleChange} 
          autoComplete="off"
        />

        <button 
          type="button" 
          className={`btn_icon btn_clear ${!focusInput ? 'hidden' : ''}`} 
          onClick={clearInput}
        >
          <MdClose />
        </button>

        <button className="btn_icon btn_search" disabled={!focusInput}>
          <MdSearch />
        </button>
      </div>
    </form>
  </div>
}

export default SearchForm