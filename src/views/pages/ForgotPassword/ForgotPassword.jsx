/* eslint-disable prettier/prettier */
import React, { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { getRequest, getTenant, postRequest } from '../../../Helpers'
import { AppContext } from '../../../Context/AppContext'
import logo from '../../../assets/auctech-logo.png'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ otp: '', newPassword: '' })
  const [loading, setLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(true)
  const [tenantDetail, setTenantDetail] = useState(null)

  const { setTenantDetails } = useContext(AppContext)
  const host = getTenant()

  // fetch tenant logo — same as Login
  useEffect(() => {
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
    getTenantDetails()
  }, [host])

  // ===============================
  // STEP 1 — SEND OTP
  // ===============================
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!userId.trim()) return toast.error('Please enter your User ID')
    try {
      setLoading(true)
      const res = await postRequest({
        url: 'auth/forgot-password',
        cred: { userId },
      })
      setOtpEmail(res?.data?.data?.email || '')
      toast.success(res?.data?.message || 'OTP Sent Successfully!')
      setStep(2)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // ===============================
  // STEP 2 — RESET PASSWORD
  // ===============================
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!formData.otp.trim() || !formData.newPassword.trim())
      return toast.error('Please fill in all fields')
    try {
      setLoading(true)
      const res = await postRequest({
        url: 'auth/reset-password',
        cred: { userId, otp: formData.otp, newPassword: formData.newPassword },
      })
      toast.success(res?.data?.message || 'Password Reset Successfully!')
      navigate('/login')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const btnStyle = {
    background: 'linear-gradient(to right, #9F8054, #9F8054)',
  }

  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: '#000000' }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card p-4 bg-white shadow">
              <div className="card-body text-center">

                {/* LOGO — same as Login */}
                {detailsLoading ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: '80px' }}
                  >
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <img
                    src={tenantDetail?.logo || logo}
                    alt="Logo"
                    referrerPolicy="no-referrer"
                    style={{ width: '100px', marginBottom: '10px', margin: 'auto', display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}

                <h3 className="mb-1 text-black">Forgot Password</h3>
                <p className="text-muted small mb-4">
                  {step === 1
                    ? 'Enter your User ID to receive a verification OTP.'
                    : 'Enter the OTP sent to your email and set a new password.'}
                </p>

                {/* STEP PROGRESS BAR */}
                <div className="d-flex gap-2 mb-4">
                  {[1, 2].map((s) => (
                    <div
                      key={s}
                      style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        background: step >= s ? '#9F8054' : '#e0e0e0',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>

                {/* ===== STEP 1 ===== */}
                {step === 1 && (
                  <form onSubmit={handleSendOtp}>
                    <div className="input-block text-start mb-4">
                      <label className="col-form-label text-black">User ID</label>
                      <input
                        type="text"
                        className="form-control bg-white text-black"
                        placeholder="Enter your User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 text-white"
                      style={btnStyle}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending OTP...
                        </>
                      ) : 'Send OTP'}
                    </button>
                  </form>
                )}

                {/* ===== STEP 2 ===== */}
                {step === 2 && (
                  <form onSubmit={handleResetPassword}>

                    {/* EMAIL BANNER */}
                    {otpEmail && (
                      <div
                        className="d-flex align-items-center gap-2 mb-4 text-start"
                        style={{
                          background: '#fdf6ec',
                          border: '1px solid #e8c98a',
                          borderRadius: '8px',
                          padding: '10px 14px',
                        }}
                      >
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'linear-gradient(to right, #9F8054, #9F8054)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '15px',
                          }}
                        >
                          📧
                        </div>
                        <div>
                          <p className="mb-0" style={{ fontSize: '11px', color: '#888' }}>OTP sent to</p>
                          <p className="mb-0 fw-semibold" style={{ fontSize: '13px', color: '#9F8054', wordBreak: 'break-all' }}>
                            {otpEmail}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* OTP */}
                    <div className="input-block text-start mb-3">
                      <label className="col-form-label text-black">OTP Code</label>
                      <input
                        type="text"
                        className="form-control bg-white text-black"
                        placeholder="Enter 6-digit OTP"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                        maxLength={6}
                        required
                        style={{ letterSpacing: '3px' }}
                      />
                    </div>

                    {/* NEW PASSWORD */}
                    <div className="input-block text-start mb-4">
                      <label className="col-form-label text-black">New Password</label>
                      <div className="position-relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control bg-white text-black"
                          placeholder="Enter new password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          required
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            right: '15px',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                          }}
                        >
                          {showPassword
                            ? <FaEyeSlash className="text-black fs-5" />
                            : <FaEye className="text-black fs-5" />}
                        </span>
                      </div>
                    </div>

                    {/* RESET BUTTON */}
                    <button
                      type="submit"
                      className="btn w-100 text-white mb-2"
                      style={btnStyle}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Resetting...
                        </>
                      ) : 'Reset Password'}
                    </button>

                    {/* CHANGE USER ID */}
                    <button
                      type="button"
                      className="btn w-100 btn-outline-secondary"
                      onClick={() => setStep(1)}
                      style={{ fontSize: '13px' }}
                    >
                      ← Change User ID
                    </button>
                  </form>
                )}

                {/* BACK TO LOGIN */}
                <div className="mt-4">
                  <Link
                    to="/login"
                    className="text-decoration-none small fw-semibold"
                    style={{ color: '#9F8054' }}
                  >
                    ← Back To Login
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
