import { useState, useEffect, lazy, Suspense } from 'react'
import { getToken } from './utils/utils'
import { getCurrentUser } from './api/auth'
import type { Session } from './api/types'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import RequireAdmin from './layouts/RequireAdmin'
import Header from '@/components/common/Header'
import Breadcrumbs from '@/components/common/Breadcrumbs'
import Footer from '@/components/common/Footer'
import Spinner from '@/components/common/Spinner'
import Seo from '@/components/common/Seo'
import Home from '@/components/Home'
import ScrollToTop from '@/components/common/ScrollToTop'
import { PAGES_WITH_BREADCRUMBS } from '@/utils/constants'
import { MyGlobalContext } from './components/context/useGlobalContext'
import './assets/sass/main.scss'

// Every page except the home is loaded on demand, so the first visit downloads less
const Login = lazy(() => import('./components/admin/login/Login'))
const Register = lazy(() => import('./components/admin/login/Register'))
const SearchPage = lazy(() => import('@/components/search/SearchPage'))
const SearchPageContinent = lazy(() => import('@/components/search/SearchPageContinent'))
const Experience = lazy(() => import('@/components/experiences/Experience'))
const AllExperiences = lazy(() => import('@/components/experiences/AllExperiences'))
const About = lazy(() => import('@components/About'))
const Gallery = lazy(() => import('@/components/Gallery'))
const Contact = lazy(() => import('@/components/Contact'))
const Privacy = lazy(() => import('@/components/Privacy'))
const Experiences = lazy(() => import('./components/admin/experiences/Experiences'))
const Categories = lazy(() => import('./components/admin/Categories'))
const Comments = lazy(() => import('./components/admin/Comments'))
const Scores = lazy(() => import('./components/admin/Scores'))
const Users = lazy(() => import('./components/admin/Users'))
const Images = lazy(() => import('./components/admin/Images'))
const Moderation = lazy(() => import('./components/admin/Moderation'))

// What login and register return
export type LoginSession = Session

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('')
  // Experience title for context
  const [titleExperience, setTitleExperience] = useState('')

  const clearSession = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('adminCurtainShown')
    setIsLoggedIn(false)
    setUser('')
    setUsername('')
    setRole('')
  }

  // Check the stored token once on load
  useEffect(() => {
    const verifyToken = async () => {
      if (!getToken()) return
      try {
        const me = await getCurrentUser()
        setRole(me.role)
        setUser(me.email)
        setUsername(me.username || me.email)
        setIsLoggedIn(true)
      } catch {
        // 401: stale or invalid token, expected after it expires
        clearSession()
      }
    }
    verifyToken().finally(() => setAuthChecked(true))
  }, [])

  const login = ({ token, role, username, email }: LoginSession) => {
    setRole(role)
    if (username) setUsername(username)
    if (email) setUser(email)
    localStorage.setItem('token', JSON.stringify(token))
    setIsLoggedIn(true)
  }

  const location = useLocation()
  const page = location.pathname.split('/')[1]
  const showBreadcrumb = PAGES_WITH_BREADCRUMBS.some((item) => item.page === page)

  const contextValues = {
    isLoggedIn,
    authChecked,
    user,
    username,
    role,
    setRole,
    titleExperience,
    setTitleExperience
  }

  return (
    <MyGlobalContext.Provider value={contextValues}>
      <ScrollToTop />
      <Header isLoggedIn={isLoggedIn} logout={clearSession} />

      { showBreadcrumb &&
      <Breadcrumbs page={page} />
      }

      <main>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/experiences" element={<AllExperiences />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path='/login' element={<Login login={login} />} />
            <Route path='/register' element={<Register login={login} />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/search-by-continent/:search" element={<SearchPageContinent />} />
            <Route path="/experience/:exp" element={<Experience user={user} />} />

            {/* The panel needs a session; every user manages their experiences, the rest is admin only */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="experiences" replace />} />
              <Route path="experiences" element={<Experiences />} />
              <Route path="moderation" element={<RequireAdmin><Moderation /></RequireAdmin>} />
              <Route path="categories" element={<RequireAdmin><Categories /></RequireAdmin>} />
              <Route path="comments" element={<RequireAdmin><Comments /></RequireAdmin>} />
              <Route path="scores" element={<RequireAdmin><Scores /></RequireAdmin>} />
              <Route path="users" element={<RequireAdmin><Users /></RequireAdmin>} />
              <Route path="images" element={<RequireAdmin><Images /></RequireAdmin>} />
            </Route>
            <Route path="*" element={<><Seo title="Page not found" noindex /><p>There's nothing here: 404!</p></>} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </MyGlobalContext.Provider>
  )
}

export default App
