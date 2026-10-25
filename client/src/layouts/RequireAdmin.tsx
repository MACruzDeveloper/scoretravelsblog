import { useContext, type ReactElement } from 'react'
import { MyGlobalContext } from '@/components/context/useGlobalContext'

type PropsRequireAdmin = {
  children: ReactElement
}

// Admin-only sections inside the panel (users only manage their own experiences)
const RequireAdmin = ({ children }: PropsRequireAdmin) => {
  const { role } = useContext(MyGlobalContext)
  if (role !== 'admin') return <p className="msg error">This section is only available to administrators.</p>
  return children
}

export default RequireAdmin
