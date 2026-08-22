import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postRequest, getRequest, getTenant } from '../../../Helpers'
import useCookie from '../../../Hooks/cookie'
import toast from 'react-hot-toast'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { Users, LogIn, Building2 } from 'lucide-react'
import logo from '../../../assets/auctech-logo.png'

const HRLogin = () => {
  const navigate = useNavigate()
  const { setCookie, getCookie } = useCookie()
  const host = getTenant()

  const [form, setForm] = useState({ userId: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [schoolLogo, setSchoolLogo] = useState(null)
  const [schoolName, setSchoolName] = useState('')

  // ── Redirect if already logged in as HR ──────────────────
  useEffect(() => {
    const token = getCookie('LMS')
    const role  = localStorage.getItem('hr_role')
    if (token && (role === 'HRManager' || role === 'HRStaff')) {
      navigate('/hr/dashboard', { replace: true })
    }
  }, [])

  // ── Fetch school branding ─────────────────────────────────
  useEffect(() => {
    getRequest('schools?subdomain=' + host)
      .then((res) => {
        const school = res?.data?.data?.tenants?.[0]
        if (school) {
          setSchoolLogo(school.logo || null)
          setSchoolName(school.schoolName || '')
        }
      })
      .catch(() => {})
  }, [host])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.userId.trim()) return toast.error('User ID is required')
    if (!form.password.trim()) return toast.error('Password is required')

    setLoading(true)
    postRequest({ url: 'hr/login', cred: form })
      .then((res) => {
        const data = res?.data?.data
        // Use same LMS cookie as main app so DefaultLayout auth works
        setCookie('LMS', data?.authToken, 30)
        localStorage.setItem('hr_user', JSON.stringify(data))
        localStorage.setItem('hr_role', data?.role)
        toast.success(`Welcome, ${data?.name}!`)
        navigate('/hr/dashboard', { replace: true })
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Login failed')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">

        {/* ── CARD ── */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#0c3b73] to-[#e24028]" />

          <div className="p-8">

            {/* Logo + School Name */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#0c3b73]/10 flex items-center justify-center mb-3 overflow-hidden">
                {schoolLogo ? (
                  <img
                    src={schoolLogo}
                    alt="logo"
                    className="w-full h-full object-contain p-1"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-[#0c3b73]" />
                )}
              </div>
              {schoolName && (
                <p className="text-xs text-gray-500 font-medium">{schoolName}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <Users className="w-5 h-5 text-[#e24028]" />
                <h1 className="text-xl font-bold text-gray-800">HR Login</h1>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Sign in to access the HR Management Portal
              </p>
            </div>

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  placeholder="Enter your User ID"
                  autoComplete="username"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c3b73]/30 focus:border-[#0c3b73] transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c3b73]/30 focus:border-[#0c3b73] transition pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0c3b73] hover:bg-blue-800 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition text-sm"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>

            </form>

            {/* Back to main login */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-xs text-gray-400 hover:text-[#0c3b73] transition"
              >
                ← Back to Main Login
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-3 bg-gray-50 border-t text-center">
            <p className="text-xs text-gray-400">Franchise Management System &mdash; HR Module</p>
          </div>
        </div>

        {/* Role hint */}
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-700 font-medium mb-1">HR Roles:</p>
          <div className="flex gap-3 text-xs text-blue-600">
            <span className="bg-blue-100 px-2 py-0.5 rounded-full">HRManager</span>
            <span className="bg-blue-100 px-2 py-0.5 rounded-full">HRStaff</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HRLogin
