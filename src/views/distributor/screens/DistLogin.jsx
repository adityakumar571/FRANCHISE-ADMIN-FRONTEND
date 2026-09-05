/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { Truck, Eye, EyeOff, Lock, Phone, AlertCircle } from 'lucide-react'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL   // e.g. /api/

export default function DistLogin() {
  const navigate = useNavigate()

  const [form, setForm]       = useState({ mobile: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = (e) => {
    setError('')
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.mobile.trim() || !form.password.trim()) {
      setError('Please enter mobile number and password.')
      return
    }
    if (!/^\d{10}$/.test(form.mobile.trim())) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(`${BASE_URL}distributor/login`, {
        mobile:   form.mobile.trim(),
        password: form.password,
      })

      const { token, distributor } = res.data.data

      // Store token + context
      Cookies.set('DIST_TOKEN', token, { expires: 7, path: '/' })
      localStorage.setItem('distributor_context', JSON.stringify(distributor))

      navigate('/distributor/dashboard', { replace: true })
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Login failed. Please check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #071e3d 0%, #0c3b73 50%, #1a5276 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Background pattern */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0,
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 300 + i * 80,
            height: 300 + i * 80,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.04)',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 18,
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <Truck size={32} color="#fabf22" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
            PharmaNexus
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
            B2B Distributor Portal
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '32px 32px 28px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>
            Sign in to your distributor account
          </p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Mobile */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Mobile Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  autoComplete="username"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 14px 11px 38px',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: 10, fontSize: 14, color: '#111827',
                    outline: 'none', transition: 'border-color 0.15s',
                    background: '#f9fafb',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#0c3b73')}
                  onBlur={e  => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                  Password
                </label>
                <button type="button" style={{ fontSize: 12, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 42px 11px 38px',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: 10, fontSize: 14, color: '#111827',
                    outline: 'none', transition: 'border-color 0.15s',
                    background: '#f9fafb',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#0c3b73')}
                  onBlur={e  => (e.target.style.borderColor = '#e5e7eb')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9ca3af', display: 'flex' }}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fff1f2', border: '1px solid #fecaca',
                borderRadius: 9, padding: '10px 14px', marginBottom: 16,
              }}>
                <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0c3b73, #1a5276)',
                border: 'none', borderRadius: 10,
                color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s, transform 0.15s',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(12,59,115,0.4)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'dist-spin 0.7s linear infinite', display: 'inline-block',
                  }} />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Back link */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
              Franchise admin?{' '}
              <a href="/franchise-login" style={{ color: '#0c3b73', fontWeight: 600, textDecoration: 'none' }}>
                Login here
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          © 2025 PharmaNexus · B2B Distributor Platform
        </p>
      </div>

      {/* Spinner keyframes */}
      <style>{`@keyframes dist-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
