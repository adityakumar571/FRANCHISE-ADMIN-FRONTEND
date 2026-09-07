/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import Cookies from 'js-cookie'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { Store } from 'lucide-react'
import { useFranchise } from '../../../Context/FranchiseContext'

import logo from '../../../assets/PharmaNexus.png'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * Resolve subdomain automatically — no user input needed.
 * Priority:
 *  1. URL subdomain  e.g. sharma-pharmacy.yourdomain.com
 *  2. localStorage   franchise_subdomain (set after any previous login)
 *  3. VITE_TENANT_ID env var (dev fallback)
 */
const resolveSubdomain = () => {
  // 1. URL
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  const skip = ['www', 'app', 'admin', 'portal', 'dashboard', 'localhost', '127']
  if (parts.length >= 2 && !skip.includes(parts[0])) return parts[0]

  // 2. localStorage
  const stored = localStorage.getItem('franchise_subdomain')
  if (stored) return stored

  // 3. env fallback (dev only)
  return import.meta.env.VITE_TENANT_ID || ''
}

const FranchiseLogin = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const navigate = useNavigate()
  const { setFranchiseUser, setFranchiseInfo } = useFranchise()

  const [form, setForm] = useState({ userId: '', password: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const subdomain = resolveSubdomain()

    if (!subdomain) {
      toast.error('Franchise not identified. Please open the correct franchise URL.')
      return
    }

    setLoading(true)

    try {
      const res = await axios.post(
        `${BASE_URL}franchise/login`,
        { userId: form.userId, password: form.password },
        { headers: { 'x-tenant-id': subdomain.toLowerCase() } }
      )

      const { token, user, franchise } = res?.data?.data

      Cookies.set('LMS', token, { expires: 30, path: '/' })
      setFranchiseUser(user)
      setFranchiseInfo(franchise)

      toast.success(`Welcome, ${user.name || franchise.franchiseName}!`)

      const roleRedirect = {
        SuperAdmin: '/franchise/dashboard',
        Admin:      '/franchise/dashboard',
        Accounts:   '/franchise/accounts/cash-book',
        Staff:      '/franchise/dashboard',
        Customer:   '/franchise/pos/billing',
        Vendor:     '/franchise/suppliers',
      }
      navigate(roleRedirect[user.role] || '/franchise/dashboard', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Show detected subdomain as a subtle info badge (helps debug, not user-editable)
  const detectedSubdomain = resolveSubdomain()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap' }}>

      {/* LEFT — Brand panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #0c3b73 0%, #1a6fd4 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px', minWidth: '300px',
      }}>
        <div style={{ textAlign: 'center', color: '#fff', maxWidth: '380px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Store size={36} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            Franchise Portal
          </h1>
          <p style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.6, margin: 0 }}>
            Sign in to manage your franchise operations — inventory, billing, staff, and more.
          </p>
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            {['Complete franchise management', 'Real-time analytics & reports', 'Inventory & billing control', 'Staff & customer management'].map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fabf22', flexShrink: 0 }} />
                <span style={{ fontSize: 13, opacity: 0.85 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Login form */}
      <div style={{
        flex: 1, background: '#f5f6f8',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '40px', position: 'relative', minWidth: '340px',
      }}>

        <div style={{ position: 'absolute', top: 24, right: 36 }}>
          <img src={logo} alt="logo" style={{ height: 40 }} />
        </div>

        <div style={{
          width: '100%', maxWidth: '420px',
          background: '#fff', padding: '40px',
          borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{ fontWeight: 700, color: '#0c3b73', marginBottom: 4, fontSize: 22 }}>
            Franchise Login
          </h2>

          {/* Detected franchise badge */}
          {detectedSubdomain && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 20, padding: '3px 12px', marginBottom: 20,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} />
              <span style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600 }}>
                {detectedSubdomain}
              </span>
            </div>
          )}

          <p style={{ color: '#888', marginBottom: 24, fontSize: 13 }}>
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit}>

            {/* User ID */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                User ID <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input
                type="text"
                name="userId"
                value={form.userId}
                onChange={handleChange}
                placeholder="Enter User ID"
                required
                autoComplete="username"
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                Password <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  required
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: 42 }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#888' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 46, border: 'none', borderRadius: 8,
                background: loading ? '#6fa3d0' : '#0c3b73',
                color: '#fff', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 15, transition: 'background 0.2s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#888', fontSize: 12, cursor: 'pointer' }}
            >
              ← Back to Super Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', height: 44,
  border: '1px solid #e0e0e0', borderRadius: 8,
  padding: '0 14px', outline: 'none',
  fontSize: 13, background: '#fafafa',
  boxSizing: 'border-box',
}

export default FranchiseLogin
