import { NavLink } from 'react-router-dom'
import africa from '@images/africa-bg.png'
import northamerica from '@images/northamerica-bg.png'
import southamerica from '@images/southamerica-bg.png'
import asia from '@images/asia-bg.png'
import europe from '@images/europe-bg.png'
import australia from '@images/australia-bg.png'

const SearchByContinent = () => {
  const urlSearchPage = '/search-by-continent'

  return <div className="continents">
      <ul>
        <li>
          <img src={africa} loading="lazy" alt="Africa" />
          <NavLink to={`${urlSearchPage}/africa`} className="link">Africa</NavLink>
        </li>
        <li>
          <img src={northamerica} loading="lazy" alt="North America" className="na" />
          <NavLink to={`${urlSearchPage}/northamerica`} className="link na">North America</NavLink>
          <img src={southamerica} loading="lazy" alt="South America" className="sa" />
          <NavLink to={`${urlSearchPage}/southamerica`} className="link sa">South America</NavLink>
        </li>
        <li>
          <img src={asia} loading="lazy" alt="Asia" />
          <NavLink to={`${urlSearchPage}/asia`} className="link">Asia</NavLink>
        </li>
        <li>
          <img src={europe} loading="lazy" alt="Europe" />
          <NavLink to={`${urlSearchPage}/europe`} className="link">Europe</NavLink>
        </li>
        <li>
          <img src={australia} loading="lazy" alt="Australia" />
          <NavLink to={`${urlSearchPage}/oceania`} className="link">Oceania</NavLink>
        </li>
      </ul>
    </div>
}

export default SearchByContinent