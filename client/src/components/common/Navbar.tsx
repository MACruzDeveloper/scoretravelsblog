import { useState, useEffect, useRef, useContext, MouseEvent } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { MdMenu, MdOutlineLogout, MdOutlinePermIdentity } from 'react-icons/md'
import { MyGlobalContext } from '../../App'
import SearchForm from '../search/SearchForm.js'
import { useResizer } from '@/hooks/useResizer'
import useOutsideClick from '@/hooks/useOutsideClick'
import Msgbox from './Msgbox'

type PropsNavbar = {
  isLoggedIn: boolean
  logout: () => void
}

const Navbar = ({ isLoggedIn, logout }: PropsNavbar) => {
  const refNav = useRef()
  const refNavAdmin = useRef()
  const { user } = useContext(MyGlobalContext)
  const [isOpenNav, setIsOpenNav] = useState(false)
  const [isOpenNavAdmin, setIsOpenNavAdmin] = useState(false)
  const [message, setMessage] = useState({ body: '', classname: '' })
  const isMobile = useResizer()
  const navigate = useNavigate()

  useEffect(() => {
    setIsOpenNav(false)
    setIsOpenNavAdmin(false)
  }, [])

  const openNavMain = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isOpenNav === false) {
      setIsOpenNav(true)
      setIsOpenNavAdmin(false)
    } else {
      setIsOpenNav(false)
    }
  }

  const openNavAdmin = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isOpenNavAdmin === false) {
      setIsOpenNavAdmin(true)
      setIsOpenNav(false)
    } else {
      setIsOpenNavAdmin(false)
    }
  }

  const onClickLogout = () => {
    logout()
    navigate('/')
    setMessage({ body: 'Logout completed', classname: 'msg_ok' })
  }

  useOutsideClick(refNav, () => {
    isOpenNav && setIsOpenNav(false)
  })

  useOutsideClick(refNavAdmin, () => {
    isOpenNavAdmin && setIsOpenNavAdmin(false)
  })

  return <nav className="navbar">
    <div className="navbar_center">
      <ul className={`navbar_list main ${isOpenNav ? 'open' : ''}`} onClick={() => setIsOpenNav(false)}>
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/experiences">Experiences</NavLink></li>
        <li><NavLink to="/gallery">Gallery</NavLink></li>
        <li><NavLink to="/contact">Contact</NavLink></li>
        {
          isLoggedIn && <li><NavLink to="/admin/experiences">Admin</NavLink></li>
        }
      </ul>
    </div>

    <div className="navbar_right">
      <SearchForm />

      <div ref={refNavAdmin} className="navbar_login">
        <button className={`btn_icon btn_login ${isLoggedIn && 'flex'}`} onClick={openNavAdmin}>
          {
            !isLoggedIn && !isMobile && 'Sign In'
          }
          {
            !isLoggedIn && isMobile && <MdOutlinePermIdentity />
          }
          {
            isLoggedIn && <>
              {user && <span className="user">{user}</span>}
              <MdOutlineLogout />
            </>
          }
        </button>

        <ul className={`navbar_list ${isOpenNavAdmin ? 'open' : ''}`} onClick={() => setIsOpenNavAdmin(false)}>
          {
            !isLoggedIn && <li><NavLink to="/login">Login</NavLink></li>
          }
          <li><NavLink to="/register">Register</NavLink></li>
          {
            isLoggedIn && <li className="navbar_list_logout">
              <button onClick={() => onClickLogout()}>logout</button>
            </li>
          }
        </ul>
      </div>

      <div ref={refNav}>
        <button className="btn_icon btn_menu" onClick={openNavMain}>
          <MdMenu />
        </button>
      </div>
    </div>

    <Msgbox body={message.body} classname={message.classname} />
  </nav>
}

export default Navbar
