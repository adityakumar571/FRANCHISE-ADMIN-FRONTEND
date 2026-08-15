/* eslint-disable prettier/prettier */
/**
 * AutoLogin
 *
 * Used by Super Admin "Quick Login" to open franchise portal with a JWT.
 *
 * URL params:
 *   token     — JWT for the franchise admin user
 *   subdomain — franchise subdomain (optional, for context)
 *
 * Flow:
 *  1. Read token from URL
 *  2. Store token in LMS cookie
 *  3. Store minimal franchise context in localStorage
 *  4. Navigate to /franchise/dashboard
 */
import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Cookies from 'js-cookie'

const AutoLogin = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const token     = searchParams.get('token')
    const subdomain = searchParams.get('subdomain') ||
                      (() => {
                        const parts = window.location.hostname.split('.')
                        return parts.length > 1 ? parts[0] : ''
                      })()

    if (!token) {
      navigate('/franchise-login', { replace: true })
      return
    }

    // 1. Store token in LMS cookie
    Cookies.set('LMS', token, { expires: 30, path: '/' })

    // 2. Store franchise context so sidebar/header show correct info
    const context = {
      subdomain,
      franchiseName: subdomain || 'Franchise',
      franchiseCode: '',
      _id: '',
      logo: '',
    }
    localStorage.setItem('franchise_context',  JSON.stringify(context))
    localStorage.setItem('franchise_subdomain', subdomain)
    localStorage.setItem('franchise_user', JSON.stringify({
      userId: `admin_${subdomain}`,
      role:   'Admin',
      name:   'Admin',
    }))

    // 3. Go to franchise dashboard
    navigate('/franchise/dashboard', { replace: true })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: 12,
      fontFamily: 'Inter, sans-serif', color: '#555', background: '#f8fafc',
    }}>
      <div style={{
        width: 44, height: 44,
        border: '3px solid #0c3b73', borderTopColor: 'transparent',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#374151' }}>
        Logging you in…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default AutoLogin
