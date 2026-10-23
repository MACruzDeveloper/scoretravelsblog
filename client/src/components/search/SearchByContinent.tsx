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
          <img src={africa} loading="lazy" alt="african map" />
          <NavLink to={`${urlSearchPage}/africa`} className="link">Africa</NavLink>
        </li>
        <li>
          <img src={northamerica} loading="lazy" alt="north american map" className="na" />
          <NavLink to={`${urlSearchPage}/north-america`} className="link na">North America</NavLink>
          <img src={southamerica} loading="lazy" alt="south american map" className="sa" />
          <NavLink to={`${urlSearchPage}/south-america`} className="link sa">South America</NavLink>
        </li>
        <li>
          <img src={asia} loading="lazy" alt="asian map" />
          <NavLink to={`${urlSearchPage}/asia`} className="link">Asia</NavLink>
        </li>
        <li>
          <img src={europe} loading="lazy" alt="european map" />
          <NavLink to={`${urlSearchPage}/europe`} className="link">Europe</NavLink>
        </li>
        <li>
          <img src={australia} loading="lazy" alt="australian map" />
          <NavLink to={`${urlSearchPage}/oceania`} className="link">Oceania</NavLink>
        </li>
      </ul>
    </div>
}

export default SearchByContinent