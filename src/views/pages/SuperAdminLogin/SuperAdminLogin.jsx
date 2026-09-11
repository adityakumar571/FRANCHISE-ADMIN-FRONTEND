/* eslint-disable prettier/prettier */
/**
 * Super Admin Login — SOW Section 4 (Authentication)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function SuperAdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Email and password are required'); return }
    setLoading(true)
    try {
      const res = await axios.post(`${BASE_URL}auth/superadmin/login`, { email: form.email, password: form.password })
      const { token, user } = res.data?.data || {}
      if (token) {
        Cookies.set('SA_TOKEN', token, { expires: 1, path: '/' })
        Cookies.set('LMS', token, { expires: 1, path: '/' }) // shared token for API calls
        localStorage.setItem('sa_user', JSON.stringify(user || { email: form.email, role: 'SuperAdmin' }))
        toast.success('Welcome, Super Admin!')
        navigate('/superadmin/dashboard', { replace: true })
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb',
    borderRadius: 8, fontSize: 13, outline: 'none', background: '#fafafa',
    boxSizing: 'border-box', color: '#111827',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      {/* Left panel */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0c3b73 0%, #1e40af 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, minWidth: 300 }}>
        <div style={{ textAlign: 'center', color: '#fff', maxWidth: 360 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#fabf22', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Shield size={38} color="#0c3b73" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.5px' }}>Super Admin</h1>
          <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6, margin: 0 }}>
            Central command centre for the PharmaNexus SaaS network. Manage franchises, subscriptions, admins and suppliers.
          </p>
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
            {['Manage franchise network', 'Control subscriptions & plans', 'Assign suppliers to franchises', 'Monitor audit logs & reports'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fabf22', flexShrink: 0 }} />
                <span style={{ fontSize: 13, opacity: 0.85 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, background: '#f5f6f8', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40, minWidth: 340 }}>
        <div style={{ width: '100%', maxWidth: 420, background: '#fff', padding: 40, borderRadius: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} color="#fabf22" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c3b73', margin: 0 }}>Admin Login</h2>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Restricted access — authorised users only</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                Email Address <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@pharmanexus.in" required style={inp} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                Password <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Enter password" required style={{ ...inp, paddingRight: 42 }} />
                <span onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9ca3af' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', height: 46, background: loading ? '#6fa3d0' : '#0c3b73', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
              {loading ? 'Signing in…' : 'Sign In to Admin Panel'}
            </button>
          </form>

          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <button onClick={() => navigate('/franchise-login')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 12, cursor: 'pointer' }}>
              ← Franchise Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
