import { useEffect, useState, useContext, Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { MyGlobalContext } from '@/components/context/useGlobalContext'
import NavAdmin from '../components/admin/NavAdmin'
import Spinner from '@/components/common/Spinner'

const CURTAIN_MS = 4000

const AdminLayout = () => {
  const { isLoggedIn, authChecked } = useContext(MyGlobalContext)

  const [showCurtain, setShowCurtain] = useState(() => !sessionStorage.getItem('adminCurtainShown'))
  useEffect(() => {
    if (!showCurtain) return
    const timer = setTimeout(() => {
      setShowCurtain(false)
      sessionStorage.setItem('adminCurtainShown', 'true')
    }, CURTAIN_MS)
    return () => clearTimeout(timer)
  }, [showCurtain])

  // Wait for the session check before deciding: a reload must not bounce to /login
  if (!authChecked) return <Spinner />
  if (!isLoggedIn) return <Navigate to="/login" replace />

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
          <NavAdmin />
        </div>

        {/* Any signed in user manages their experiences here; admin sections check the role */}
        <Suspense fallback={<Spinner />}><Outlet /></Suspense>
      </div>
    </div>
}

export default AdminLayout
