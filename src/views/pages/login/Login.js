/* eslint-disable react/no-unknown-property */
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import useCookie from '../../../Hooks/cookie'
import { FaEye, FaEyeSlash, FaChartLine, FaUsers, FaCog } from 'react-icons/fa'

import logo from '../../../assets/auctech-logo.png'
import { validateMobile } from '../../../Utils'
import { getRequest, getTenant, postRequest } from '../../../Helpers'
import { IoMdArrowRoundBack } from 'react-icons/io'
import { AppContext } from '../../../Context/AppContext'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const { setCookie } = useCookie()
  const [loaginWithPassword, setLoginWithPassword] = useState(true)
  const [isOtp, setiSOtp] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [otp, setOtp] = useState('')
  const [tenantDetail, setTenantDetail] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  })

  const { setTenantDetails } = useContext(AppContext)
  const host = getTenant()

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'userId') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    if (tenantDetail?.isActive === false) {
      toast.error('Your franchise is not active. Please contact administrator.')
      setLoading(false)
      return
    } else
      postRequest({
        url: `auth/loginWithPassword`,
        cred: formData,
      })
        .then((res) => {
          setLoading(false)
          setCookie('LMS', res?.data?.data?.authToken, 30)
          toast.success(res?.data?.message || 'User Login Successfully')
          navigate('/')
        })
        .catch((error) => {
          setLoading(false)
          toast.error(error?.response?.data?.message || 'Login failed')
        })
  }

  const getTenantDetails = async () => {
    try {
      setDetailsLoading(true)
      const response = await getRequest('schools?subdomain=' + host)
      setTenantDetails(response?.data?.data?.tenants?.[0] || null)
      setTenantDetail(response?.data?.data?.tenants?.[0] || null)
    } catch (error) {
      console.error('Error fetching tenant details:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  useEffect(() => {
    getTenantDetails()
  }, [host])

  useEffect(() => {
    let timer
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else {
      setCanResend(true)
    }
    return () => clearInterval(timer)
  }, [timeLeft])

  const sendOtp = (e) => {
    e.preventDefault()
    setLoading(true)

    postRequest({
      url: 'auth/registerOrLogin',
      cred: {
        userId: formData?.userId,
      },
    })
      .then((res) => {
        setLoading(false)
        toast.success(res?.data?.message)
        setiSOtp(true)
        setTimeLeft(60)
        setCanResend(false)
      })
      .catch((error) => {
        setLoading(false)
        toast.error(error?.response?.data?.message)
      })
  }

  const handleResend = (e) => {
    e.preventDefault()
    setLoading(true)

    postRequest({
      url: 'auth/resendOtp',
      cred: {
        phone: formData?.phone,
      },
    })
      .then((res) => {
        setLoading(false)
        toast.success(res?.data?.message)
        setiSOtp(true)
        setTimeLeft(60)
        setCanResend(false)
      })
      .catch((error) => {
        setLoading(false)
        toast.error(error?.response?.data?.message)
      })
  }

  const verifyOtp = (e) => {
    e.preventDefault()
    setLoading(true)
    postRequest({
      url: 'auth/verifyOtp',
      cred: {
        userId: formData?.userId,
        otp: otp,
      },
    })
      .then((res) => {
        setLoading(false)
        toast.success(res?.data?.message)

        setCookie('LMS', res?.data?.data?.authToken, 30)
        navigate('/')
        window.location.reload()
      })
      .catch((error) => {
        setLoading(false)
        toast.error(error?.response?.data?.message)
      })
  }

  return (
    <div className="lp-page">
      {/* BACKGROUND */}
      <div className="lp-bg">
        <div className="lp-bg__grid"></div>
        <div className="lp-bg__orb lp-bg__orb--1"></div>
        <div className="lp-bg__orb lp-bg__orb--2"></div>
        <div className="lp-bg__orb lp-bg__orb--3"></div>
      </div>

      {/* CONTAINER */}
      <div className="lp-container">
        {/* LEFT PANEL — Branding */}
        <div className="lp-left">
          <div className="lp-left__inner">
            <img src={tenantDetail?.logo || logo} alt="Logo" className="lp-logo" />

            <div className="lp-badge">
              <span className="lp-badge__dot"></span>
              Franchise Management
            </div>

            <h1 className="lp-title">
              Grow Your <span className="lp-title__gold">Franchise</span> Today
            </h1>

            <p className="lp-desc">
              Complete management solution for pharmacy franchises. Control operations, maximize revenue, and scale your business.
            </p>

            <ul className="lp-features">
              <li className="lp-feature">
                <div className="lp-feature__icon">
                  <FaChartLine />
                </div>
                <div>
                  <div className="lp-feature__title">Analytics & Reports</div>
                  <div className="lp-feature__desc">Real-time insights into your business performance</div>
                </div>
              </li>

              <li className="lp-feature">
                <div className="lp-feature__icon">
                  <FaUsers />
                </div>
                <div>
                  <div className="lp-feature__title">Team Management</div>
                  <div className="lp-feature__desc">Manage staff and roles with ease</div>
                </div>
              </li>

              <li className="lp-feature">
                <div className="lp-feature__icon">
                  <FaCog />
                </div>
                <div>
                  <div className="lp-feature__title">Full Control</div>
                  <div className="lp-feature__desc">Customize every aspect of your operations</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL — Login Form */}
        <div className="lp-right">
          <div className="lp-glass">
            {/* Logo inside glass (shown on small screens) */}
            <div className="lp-glass__logo-row">
              <img src={tenantDetail?.logo || logo} alt="Logo" className="lp-glass__logo" />
            </div>

            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="lp-spinner"></div>
              </div>
            ) : (
              <>
                <div className="lp-glass__title">Welcome</div>
                <div className="lp-glass__sub">Sign in to your franchise account</div>

                {!loaginWithPassword ? (
                  <>
                    {isOtp ? (
                      <form className="lp-form">
                        {/* OTP FIELD */}
                        <div className="lp-field">
                          <label className="lp-label">Verification Code</label>
                          <input
                            type="number"
                            className="lp-input"
                            placeholder="Enter OTP"
                            name="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            disabled={loading}
                            required
                          />
                        </div>

                        {/* RESEND */}
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.52)', marginBottom: '14px' }}>
                          {canResend ? (
                            <button
                              type="button"
                              className="btn btn-link p-0 text-decoration-none"
                              style={{
                                color: '#fabf22',
                                fontSize: '12px',
                                fontWeight: '600',
                              }}
                              onClick={handleResend}
                            >
                              Resend OTP
                            </button>
                          ) : (
                            <span>Resend OTP in {timeLeft}s</span>
                          )}
                        </div>

                        {/* SUBMIT */}
                        <button
                          type="submit"
                          className="lp-btn"
                          onClick={verifyOtp}
                          disabled={loading}
                        >
                          {loading && <div className="lp-spinner"></div>}
                          {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        {/* BACK */}
                        <div style={{ marginTop: '14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'rgba(255,255,255,0.52)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              fontSize: '13px',
                              margin: '0 auto',
                            }}
                            onClick={() => setiSOtp(false)}
                          >
                            <IoMdArrowRoundBack size={14} />
                            Back
                          </button>
                        </div>
                      </form>
                    ) : (
                      <form className="lp-form">
                        {/* USER ID */}
                        <div className="lp-field">
                          <label className="lp-label">User ID</label>
                          <input
                            type="text"
                            className="lp-input"
                            placeholder="Enter your user ID"
                            name="userId"
                            value={formData?.userId}
                            onChange={handleInputChange}
                            disabled={loading}
                            required
                          />
                        </div>

                        {/* SUBMIT */}
                        <button
                          type="submit"
                          className="lp-btn"
                          onClick={sendOtp}
                          disabled={loading}
                        >
                          {loading && <div className="lp-spinner"></div>}
                          {loading ? 'Sending...' : 'Send OTP'}
                        </button>

                        {/* SWITCH */}
                        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '13px' }}>
                          <button
                            type="button"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#fabf22',
                              cursor: 'pointer',
                              fontWeight: '600',
                              textDecoration: 'none',
                            }}
                            onClick={() => setLoginWithPassword(true)}
                          >
                            Login with Password
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleSubmit} className="lp-form">
                    {/* USER ID */}
                    <div className="lp-field">
                      <label className="lp-label">User ID</label>
                      <input
                        type="text"
                        className="lp-input"
                        placeholder="Enter your user ID"
                        name="userId"
                        value={formData?.userId}
                        onChange={handleInputChange}
                        disabled={loading}
                        required
                      />
                    </div>

                    {/* PASSWORD */}
                    <div className="lp-field">
                      <label className="lp-label">Password</label>
                      <div className="lp-input-wrap">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="lp-input lp-input--pw"
                          placeholder="Enter your password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          disabled={loading}
                          required
                        />
                        <button
                          type="button"
                          className="lp-eye"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          tabIndex="-1"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    {/* SUBMIT */}
                    <button type="submit" className="lp-btn" disabled={loading}>
                      {loading && <div className="lp-spinner"></div>}
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {/* SWITCH TO OTP - Commented out for now */}
                    {/* <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '13px' }}>
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#fabf22',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                        onClick={() => setLoginWithPassword(false)}
                      >
                        Login with OTP
                      </button>
                    </div> */}
                  </form>
                )}

                <div className="lp-glass__footer">
                  © 2024 Franchise Management. All rights reserved.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
