import { useState, useEffect, useMemo } from 'react'
import { postData } from './utils/utils'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { URL } from './config'
import AdminLayout from './layouts/AdminLayout'
import Header from '@/components/common/Header'
import homeVideo from './assets/videos/home.mp4'
import Breadcrumbs from '@/components/common/Breadcrumbs'
import Footer from '@/components/common/Footer'
import Home from '@/components/Home'
import Login from './components/admin/login/Login'
import Register from './components/admin/login/Register'
import SearchPage from '@/components/search/SearchPage'
import SearchPageContinent from '@/components/search/SearchPageContinent'
import Experience from '@/components/experiences/Experience'
import AllExperiences from '@/components/experiences/AllExperiences'
import About from '@components/About'
import Gallery from '@/components/Gallery'
import Contact from '@/components/Contact'
import Experiences from './components/admin/experiences/Experiences'
import Categories from './components/admin/Categories'
import Comments from './components/admin/Comments'
import Scores from './components/admin/Scores'
import Users from './components/admin/Users'
import Images from './components/admin/Images'
import ScrollToTop from '@/components/common/ScrollToTop'
import { PAGES_WITH_BREADCRUMBS } from '@/utils/constants'
import { MyGlobalContext } from './components/context/useGlobalContext'
import './assets/sass/main.scss'

function App() {
  const token = JSON.parse(localStorage.getItem('token'))
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [user, setUser] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('')
  // Experience title for context
  const [titleExperience, setTitleExperience] = useState('')

  // We use useMemo here to keep the value every render
  const isLoggedInValue = useMemo(
    () => ({ isLoggedIn, setIsLoggedIn }), 
    [isLoggedIn]
  )

  const verify_token = async () => {
    try {
      const response = await postData(`${URL}/users/verify_token`, {}, {
        headers: { Authorization: token || '' }
      })
      if (response.data.succ) {
        setRole(response.data.succ.role)
        setUser(response.data.succ.email)
        setUsername(response.data.succ.username || response.data.succ.email)
      }
      return response.data.ok ? setIsLoggedIn(true) : setIsLoggedIn(false)
    }
    catch (error) {
      console.log(error)
    }
  }

  const login = (token: string, role: string, username?: string, email?: string) => {
    setRole(role)
    if (username) setUsername(username)
    if (email) setUser(email)
    localStorage.setItem('token', JSON.stringify(token))
    setIsLoggedIn(true)
  }
  
  const logout = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('adminCurtainShown')
    setIsLoggedIn(false)
    setUser('')
    setUsername('')
    setRole('')
  }

  useEffect(() => {
    verify_token()
  }, [])

  const location = useLocation()
  const [page, setPage] = useState('')
  const [showBreadcrumb, setShowBreadcrumb] = useState(false)

  useEffect(() => {
    const pathname = location.pathname.split('/')[1]
    setPage(pathname)

    if (PAGES_WITH_BREADCRUMBS.some((item) => item.page === pathname)) {
      setShowBreadcrumb(true)
    } else {
      setShowBreadcrumb(false)
    }
  }, [location])

  const contextValues = {
    token,
    isLoggedInValue, 
    user,
    username,
    role,
    setRole,
    titleExperience, 
    setTitleExperience
  }

  return (
    <MyGlobalContext.Provider value={contextValues}>
      <HelmetProvider>
        <Helmet>
          <link rel="preload" href={homeVideo} as="video" type="video/mp4" />
        </Helmet>

        <ScrollToTop />
        <Header isLoggedIn={isLoggedIn} logout={logout} />

        { showBreadcrumb &&
        <Breadcrumbs page={page} />
        }

        <main>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/experiences" element={<AllExperiences />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path='/login' element={<Login login={login} />} />
            <Route path='/register' element={<Register login={login} logout={logout} />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/search-by-continent/:search" element={<SearchPageContinent />} />
            <Route path="/experience/:exp" element={<Experience user={user} />} />

            <Route path='/admin' element={
              <AdminLayout>
                <Experiences />
              </AdminLayout>
            } />
            <Route path='/admin/experiences' element={
              <AdminLayout>
                <Experiences />
              </AdminLayout>
            } />
            <Route path='/admin/categories' element={
              <AdminLayout>
                <Categories />
              </AdminLayout>
            } />
            <Route path='/admin/comments' element={
              <AdminLayout>
                <Comments />
              </AdminLayout>
            } />
            <Route path='/admin/scores' element={
              <AdminLayout>
                <Scores />
              </AdminLayout>
            } />
            <Route path='/admin/users' element={
              <AdminLayout>
                <Users />
              </AdminLayout>
            } />
            <Route path='/admin/images' element={
              <AdminLayout>
                <Images />
              </AdminLayout>
            } />
            <Route path="*" element={<p>There's nothing here: 404!</p>} />
          </Routes>
        </main>

        <Footer />
      </HelmetProvider>
    </MyGlobalContext.Provider>
  )
}

export default App
