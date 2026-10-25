import { useEffect, type RefObject } from 'react'

const useOutsideClick = (ref: RefObject<HTMLElement | null>, callback: () => void) => {
  const handleClick = (e: Event) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback()
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
    }
  })
}

export default useOutsideClick