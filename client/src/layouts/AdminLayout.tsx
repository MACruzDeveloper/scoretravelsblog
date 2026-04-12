//import { Outlet } from 'react-router-dom'
import { useEffect, useState, useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { MyGlobalContext } from '../App'
import NavAdmin from '../components/admin/NavAdmin'

type ParamsAdminLayout = {
  children: JSX.Element
}

const AdminLayout = ({ children }: ParamsAdminLayout) => {
  const { token, isLoggedInValue } = useContext(MyGlobalContext)

  const [showCurtain, setShowCurtain] = useState(() => !sessionStorage.getItem('adminCurtainShown'))
  useEffect(() => {
    if (showCurtain) {
      setTimeout(() => {
        setShowCurtain(false)
        sessionStorage.setItem('adminCurtainShown', 'true')
      }, 4000)
    }
  }, [showCurtain])

  return <div className="page admin">
      <div className={showCurtain ? 'curtain on' : 'curtain'}>
        <span></span>

        <div className="loader">
          <span className="word word1">A</span>
          <span className="word word2">d</span>
          <span className="word word3">m</span>
          <span className="word word4">i</span>
          <span className="word word5">n</span>
        </div>
      </div>

      <div className="container">
        <div className="top">
          <h2 className="title">Admin Panel</h2>
          {isLoggedInValue.isLoggedIn}
          <NavAdmin />
        </div>

        {!token && !isLoggedInValue?.isLoggedIn ? <Navigate to="/login" replace /> : children}
      </div>
    </div>
}

export default AdminLayout