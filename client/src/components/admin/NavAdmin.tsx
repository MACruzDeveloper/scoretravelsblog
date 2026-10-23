import { useContext, useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MyGlobalContext } from '@/components/context/useGlobalContext'
import { useModerationStore } from '@/store/moderationStore'

const NavbarAdmin = () => {
  const { role } = useContext(MyGlobalContext)
  const navRef = useRef<HTMLElement | null>(null)
  const placeholderRef = useRef<HTMLDivElement | null>(null)
  const navTopRef = useRef<number>(0)
  const [isSticky, setIsSticky] = useState(false)

  // Experiences waiting for review, shown next to "Moderation"
  const { pendingCount, refreshPendingCount } = useModerationStore()
  useEffect(() => {
    if (role === 'admin') refreshPendingCount()
  }, [role, refreshPendingCount])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const header = document.querySelector('.header') as HTMLElement | null

    const updateMetrics = () => {
      const rect = nav.getBoundingClientRect()
      navTopRef.current = rect.top + window.scrollY
      if (placeholderRef.current) placeholderRef.current.style.height = `${rect.height}px`
    }

    const handleScroll = () => {
      const headerHeight = header?.getBoundingClientRect().height ?? 0
      setIsSticky(window.scrollY >= navTopRef.current - headerHeight)
    }

    updateMetrics()
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateMetrics)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateMetrics)
    }
  }, [])

  return <>

    <nav
      ref={navRef}
      className={`admin_nav ${isSticky ? 'sticky' : ''}`}
    >
      <ul>
        <li><NavLink to={'/admin/experiences'}>{role === 'admin' ? 'Experiences' : 'My experiences'}</NavLink></li>
        { role === 'admin' &&
        <>
          <li>
            <NavLink to={'/admin/moderation'}>
              Moderation{pendingCount > 0 && <span className="badge" aria-label={`${pendingCount} pending`}>{pendingCount}</span>}
            </NavLink>
          </li>
          <li><NavLink to={'/admin/categories'}>Categories</NavLink></li>
          <li><NavLink to={'/admin/comments'}>Comments</NavLink></li>
          <li><NavLink to={'/admin/scores'}>Scores</NavLink></li>
          <li><NavLink to={'/admin/images'}>Images</NavLink></li>
          <li><NavLink to={'/admin/users'}>Users</NavLink></li>
        </>
        }
      </ul>
    </nav>

        <div ref={placeholderRef} className={`admin_nav_placeholder ${isSticky ? 'visible' : ''}`} />
  </>
}

export default NavbarAdmin
