import { createContext, useContext } from 'react'

export type GlobalContent = {
  isLoggedIn: boolean
  // False until the stored session has been checked with the server
  authChecked: boolean
  user: string
  username: string
  role: string
  setRole: (c: string) => void
  titleExperience: string
  setTitleExperience: (c: string) => void
}

export const MyGlobalContext = createContext<GlobalContent>({
  isLoggedIn: false,
  authChecked: false,
  user: '',
  username: '',
  role: '',
  setRole: () => {},
  titleExperience: '',
  setTitleExperience: () => {}
})

export const useGlobalContext = () => useContext(MyGlobalContext)
