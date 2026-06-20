import { createContext, useContext } from 'react'

export type GlobalContent = {
  token: string
  isLoggedInValue: any
  user: string
  username: string
  role: string
  setRole: (c: string) => void
  titleExperience: string
  setTitleExperience: (c: string) => void
}

export const MyGlobalContext = createContext<GlobalContent>({
  token: '',
  isLoggedInValue: null,
  user: '',
  username: '',
  role: '',
  setRole: () => {},
  titleExperience: '',
  setTitleExperience: () => {}
})

export const useGlobalContext = () => useContext(MyGlobalContext)
