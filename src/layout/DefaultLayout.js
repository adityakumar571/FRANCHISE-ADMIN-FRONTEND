/* eslint-disable prettier/prettier */
/**
 * DefaultLayout — Franchise Portal Shell
 *
 * Auth guard: checks only LMS cookie.
 * Cookie missing → redirect to /franchise-login.
 *
 * FranchiseContext loads from localStorage automatically on mount.
 */
import React, { useEffect } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'

const DefaultLayout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Single cookie check on mount - no location dependency
    const token = Cookies.get('LMS')
    
    if (!token) {
      console.log('❌ No LMS cookie - redirecting to login')
      navigate('/franchise-login', { replace: true })
    }
  }, [navigate]) // Only depend on navigate, not location

  return (
    <div>
      <AppSidebar />

      <div
        className="wrapper d-flex flex-column min-vh-100"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <AppHeader />

        <div className="body flex-grow-1">
          <AppContent />
        </div>

        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
