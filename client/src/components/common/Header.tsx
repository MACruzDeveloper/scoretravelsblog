import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './Navbar'

type PropsHeader = {
  isLoggedIn: boolean
  logout: () => void
}

const Header = ({ isLoggedIn, logout }: PropsHeader) => {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const headerClass = [
    'header',
    isHome ? 'is-home' : '',
    scrolled && isHome ? 'scrolled' : ''
  ].filter(Boolean).join(' ')

  return <header className={headerClass}>
    <div className="container">
      <div className="header_flex">
        <div className="header_left">
          <NavLink to={"/"} className="header_logo">
            <h1 className="header_title">ScoreTravelsBlog</h1>
          </NavLink>
        </div>

        <div className="header_right">
          <Navbar isLoggedIn={isLoggedIn} logout={logout} />
        </div>
      </div>
    </div>
  </header>
}

export default Header