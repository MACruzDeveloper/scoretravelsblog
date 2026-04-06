import { useState, useEffect, createContext, useContext, useMemo } from 'react'
import { postData } from './utils/utils'
import { Route, Routes, useLocation } from 'react-router-dom'
import { URL } from './config'
import AdminLayout from './layouts/AdminLayout'
import Header from './components/common/Header'
import Breadcrumb from './components/common/Breadcrumb'
import Footer from './components/common/Footer'
import Home from './components/Home'
import Login from './containers/login/Login'
import Register from './containers/login/Register'
import SearchPage from './components/search/SearchPage'
import SearchPageContinent from './components/search/SearchPageContinent'
import Experience from './components/experiences/Experience'
import AllExperiences from './components/experiences/AllExperiences'
import Gallery from './components/Gallery'
import Contact from './components/Contact'
import Experiences from './containers/experiences/Experiences'
import Categories from './containers/Categories'
import Comments from './containers/Comments'
import Scores from './containers/Scores'
import Users from './containers/Users'
import Images from './containers/Images'
import ScrollToTop from './components/common/ScrollToTop'
import './assets/sass/main.scss'

export type GlobalContent = {
  token: string
  isLoggedInValue: any
  user: string
  role: string
  setRole:(c: string) => void
  titleExperience: string
  setTitleExperience:(c: string) => void
}

export const MyGlobalContext = createContext<GlobalContent>({
  token: '',
  isLoggedInValue: null,
  user: '',
  role: '',
  setRole: () => {},
  titleExperience: '',
  setTitleExperience: () => {}
})

export const useGlobalContext = () => useContext(MyGlobalContext)

function App() {
  const token = JSON.parse(localStorage.getItem('token'))
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [user, setUser] = useState('')
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
      }
      return response.data.ok ? setIsLoggedIn(true) : setIsLoggedIn(false)
    }
    catch (error) {
      console.log(error)
    }
  }

  const login = (token: string, role: string) => {
    //console.log('token ===>'+token)
    setRole(role)
    localStorage.setItem('token', JSON.stringify(token))
    setIsLoggedIn(true)
  }
  
  const logout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
  }

  useEffect(() => {
    verify_token()
  }, [])

  // breadcrumbs
  const pagesWithBreadcrumbs = [
    { page: 'experiences' },
    { page: 'experience' }
  ]

  const location = useLocation()
  const [page, setPage] = useState('')
  const [showBreadcrumb, setShowBreadcrumb] = useState(false)

  useEffect(() => {
    const pathname = location.pathname.split('/')[1]
    setPage(pathname)

    if (pagesWithBreadcrumbs.some((item) => item.page === page)) {
      setShowBreadcrumb(true)
    } else {
      setShowBreadcrumb(false)
    }
  }, [location, page])

  const contextValues = {
    token,
    isLoggedInValue, 
    user,
    role,
    setRole,
    titleExperience, 
    setTitleExperience
  }

  return (
    <MyGlobalContext.Provider value={contextValues}>
      <ScrollToTop />
      <Header isLoggedIn={isLoggedIn} logout={logout} />

      { showBreadcrumb &&
      <Breadcrumb page={page} />
      }

      <main>
        <Routes>
          <Route index element={<Home />} />
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
    </MyGlobalContext.Provider>
  )
}

export default App
