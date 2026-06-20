import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { MyGlobalContext } from '@/components/context/useGlobalContext'

export type ParamsBreadcrumbs = {
  page: string
}

const PAGE_LABELS: Record<string, string> = {
  experiences: 'Experiences',
  experience: 'Experiences',
  gallery: 'Gallery',
}

const Breadcrumbs = ({ page }: ParamsBreadcrumbs) => {
  const { titleExperience }: any = useContext(MyGlobalContext)
  const pageLabel = PAGE_LABELS[page] ?? page

  return <div className="breadcrumbs">
    <div className="container">
      <nav>
        <ul>
          <li>
            <NavLink className="breadcrumbs_link" to="/">Home</NavLink>
          </li>
          {page === 'experience' ? (
            <>
              <li>
                <NavLink className="breadcrumbs_link" to="/experiences">Experiences</NavLink>
              </li>
              <li>
                <span>{titleExperience}</span>
              </li>
            </>
          ) : (
            <li>
              <span>{pageLabel}</span>
            </li>
          )}
        </ul>
      </nav>
    </div>
  </div>
}

export default Breadcrumbs