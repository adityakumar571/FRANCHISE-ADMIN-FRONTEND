import React, { useEffect, useState, useContext } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components'
import { getRequest } from '../Helpers'
import { useNavigate } from 'react-router-dom'
import { deleteCookie } from '../Hooks/cookie'
import { AppContext } from '../Context/AppContext'
import { useRoles } from '../Context/AuthContext'
import Cookies from 'js-cookie'
import { useSubscriptionStatus } from '../Hooks/useSubscriptionStatus'
import SubscriptionWarningBanner from '../components/SubscriptionWarningBanner'
import AiChatWidget from '../components/AiChat/AiChatWidget'

const DefaultLayout = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const { setRole } = useRoles()
  const { setUser } = useContext(AppContext)
  const subscriptionStatus = useSubscriptionStatus()

  useEffect(() => {
    // 🔐 No token at all → go to login immediately
    const token = Cookies.get('LMS')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const savedUser = localStorage.getItem('LMS')
    const parsedUser = JSON.parse(savedUser)
    setUserData(parsedUser)

    // 🔐 Fetch logged-in user profile
    getRequest('auth/profile')
      .then((res) => {
        const data = res?.data?.data
        setUser({
          ...data?.user,
          role: data?.role,
          profile: data?.profile,
          currentSession: data?.currentSession,
        })
        setRole(data?.role)
      })
      .catch((error) => {
        const status = error.response?.status
        if (status === 401) {
          // Token invalid/expired → logout
          deleteCookie('LMS')
          deleteCookie('UserId')
          localStorage.removeItem('tenant_subdomain')
          navigate('/login', { replace: true })
        } else if (status === 400) {
          // No active session yet — still show dashboard, just no session data
          console.warn('No active session found. Dashboard will load without session info.')
        } else {
          console.error('Profile API Error:', error)
        }
      })
  }, [navigate, setUser])

  return (
    <div>
      <AppSidebar userData={userData} />

      <div
        className="wrapper d-flex flex-column min-vh-100"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <AppHeader userData={userData} />

        {/* Real-time subscription warning — shows on every page */}
        <SubscriptionWarningBanner subscriptionStatus={subscriptionStatus} />

        <div className="body flex-grow-1">
          <AppContent userData={userData} />
        </div>

        <AppFooter userData={userData} />
      </div>

      {/* AI Chat Widget — floating on all pages */}
      <AiChatWidget />
    </div>
  )
}

export default DefaultLayout
