import { NavLink } from 'react-router-dom'
import SearchByContinent from '../search/SearchByContinent'

const Footer = () => {
  return <>
    <aside className="sub_footer">
      <SearchByContinent />
    </aside>

    <footer className="footer">
      <div className="container">
        <div className="flex">
          <p>© ScoreTravelsBlog · <NavLink to="/privacy">Privacy policy</NavLink></p>
        </div>
      </div>
    </footer>
  </>
}

export default Footer