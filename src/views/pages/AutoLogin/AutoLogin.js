import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Cookies from 'js-cookie'

/**
 * AutoLogin
 *
 * Opened via:
 *   Dev:  http://harsh.localhost:5179/auto-login?token=<jwt>
 *   Prod: https://harsh.schoolcloudx.com/auto-login?token=<jwt>
 *
 * 1. Reads token from URL
 * 2. Stores in LMS cookie
 * 3. Redirects to /dashboard
 *
 * getTenant() automatically reads subdomain from hostname in both cases.
 * No need to pass subdomain as query param anymore.
 */
const AutoLogin = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const token = searchParams.get('token')

    if (!token) {
      console.warn('[AutoLogin] No token in URL → redirecting to /login')
      navigate('/login', { replace: true })
      return
    }

    // Store token in LMS cookie
    Cookies.set('LMS', token, { expires: 30, path: '/' })

    console.log('[AutoLogin] ✅ Token stored → redirecting to dashboard')

    setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 100)
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'sans-serif',
        color: '#555',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid #0c3b73',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ margin: 0, fontSize: 14 }}>Logging you in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default AutoLogin
