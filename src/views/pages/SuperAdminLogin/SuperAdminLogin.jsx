/* eslint-disable prettier/prettier */
/**
 * Super Admin Login — Premium Glass Morphism
 * SaaS Platform Central Control
 */
import './SuperAdminLogin.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Lock, BarChart3, Settings, Zap } from 'lucide-react'
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
    if (!form.email || !form.password) { toast.error('User ID and password are required'); return }
    setLoading(true)
    try {
      const res = await axios.post(`${BASE_URL}auth/superadmin/login`, { userId: form.email, password: form.password })
      const { token, user } = res.data?.data || {}
      if (token) {
        Cookies.set('SA_TOKEN', token, { expires: 1, path: '/' })
        Cookies.set('LMS', token, { expires: 1, path: '/' })
        Cookies.set('accessToken', token, { expires: 1, path: '/' })
        localStorage.setItem('SA_TOKEN', token)
        localStorage.setItem('superadmin_token', token)
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

  return (
    <div className="sa-page">
      {/* BACKGROUND */}
      <div className="sa-bg">
        <div className="sa-bg__grid"></div>
        <div className="sa-bg__orb sa-bg__orb--1"></div>
        <div className="sa-bg__orb sa-bg__orb--2"></div>
        <div className="sa-bg__orb sa-bg__orb--3"></div>
      </div>

      {/* CONTAINER */}
      <div className="sa-container">
        {/* LEFT PANEL — Branding */}
        <div className="sa-left">
          <div className="sa-left__inner">
            <div className="sa-logo-badge">
              <Shield size={32} />
            </div>

            <div className="sa-badge">
              <span className="sa-badge__dot"></span>
              Enterprise SaaS Control
            </div>

            <h1 className="sa-title">
              Super <span className="sa-title__blue">Admin</span> Panel
            </h1>

            <p className="sa-desc">
              Central command centre for the entire SaaS network. Manage franchises, subscriptions, suppliers, and global operations.
            </p>

            <ul className="sa-features">
              <li className="sa-feature">
                <div className="sa-feature__icon">
                  <BarChart3 size={16} />
                </div>
                <div>
                  <div className="sa-feature__title">Network Analytics</div>
                  <div className="sa-feature__desc">Monitor franchise performance & revenue</div>
                </div>
              </li>

              <li className="sa-feature">
                <div className="sa-feature__icon">
                  <Settings size={16} />
                </div>
                <div>
                  <div className="sa-feature__title">System Control</div>
                  <div className="sa-feature__desc">Manage global settings & configurations</div>
                </div>
              </li>

              <li className="sa-feature">
                <div className="sa-feature__icon">
                  <Zap size={16} />
                </div>
                <div>
                  <div className="sa-feature__title">Power Tools</div>
                  <div className="sa-feature__desc">Execute bulk operations & migrations</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL — Login Form */}
        <div className="sa-right">
          <div className="sa-glass">
            <div className="sa-glass__header">
              <div className="sa-glass__lock">
                <Lock size={20} />
              </div>
              <div>
                <div className="sa-glass__title">Admin Access</div>
                <div className="sa-glass__sub">Restricted — Authorized Personnel Only</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="sa-form">
              {/* USER ID */}
              <div className="sa-field">
                <label className="sa-label">User ID</label>
                <input
                  name="email"
                  type="text"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter admin user ID"
                  required
                  className="sa-input"
                  disabled={loading}
                />
              </div>

              {/* PASSWORD */}
              <div className="sa-field">
                <label className="sa-label">Password</label>
                <div className="sa-input-wrap">
                  <input
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    className="sa-input sa-input--pw"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="sa-eye"
                    onClick={() => setShowPw(v => !v)}
                    disabled={loading}
                    tabIndex="-1"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}
              <button type="submit" className="sa-btn" disabled={loading}>
                {loading && <div className="sa-spinner"></div>}
                {loading ? 'Signing in...' : 'Enter Admin Panel'}
              </button>
            </form>

            {/* FOOTER LINK */}
            <div className="sa-glass__footer">
              <button
                type="button"
                onClick={() => navigate('/franchise-login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.52)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  textDecoration: 'none',
                }}
              >
                ← Back to Franchise Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
