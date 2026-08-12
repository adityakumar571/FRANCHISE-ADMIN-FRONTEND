import React, { useState } from 'react'
import { postRequest } from '../../../Helpers'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import toast from 'react-hot-toast'

const ChangePassword = () => {
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
  })

  // ===============================
  // HANDLE INPUT CHANGE
  // ===============================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // ===============================
  // HANDLE SUBMIT WITH VALIDATION
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault()

    // 1. Empty Fields Validation
    if (!formData.oldPassword || !formData.newPassword) {
      return toast.error('All fields are required')
    }

    // 2. Minimum Length Validation
    if (formData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long')
    }

    // 3. Same Password Validation
    if (formData.oldPassword === formData.newPassword) {
      return toast.error('New password cannot be the same as your old password')
    }

    try {
      setLoading(true)

      // Corrected mounted route matching your backend setup
      const res = await postRequest({
        url: 'auth/change-password',
        cred: formData,
      })

      // Success Toast
      toast.success(res?.data?.message || 'Password changed successfully!')

      // Reset Form State
      setFormData({
        oldPassword: '',
        newPassword: '',
      })
    } catch (error) {
      // Error Toast
      toast.error(error?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center px-3"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #eef2ff, #f8fafc)',
      }}
    >
      <div
        className="card border-0 shadow-lg p-4"
        style={{
          width: '100%',
          maxWidth: '450px',
          borderRadius: '24px',
        }}
      >
        {/* HEADER */}
        <div className="text-center mb-4">
          <div
            className="mx-auto d-flex justify-content-center align-items-center mb-3"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#042954',
            }}
          >
            <LockKeyhole color="white" size={26} />
          </div>

          <h2 className="fw-bold mb-1 font-medium text-dark" style={{ fontSize: '24px' }}>
            Change Password
          </h2>
          <p className="text-muted mb-0 font-medium" style={{ fontSize: '14px' }}>
            Secure your account with a new password
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* OLD PASSWORD */}
          <div className="mb-3">
            <label className="form-label font-medium text-secondary">Old Password</label>
            <div className="position-relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                className="form-control p-2 pe-3 font-medium"
                name="oldPassword"
                placeholder="Enter old password"
                value={formData.oldPassword}
                onChange={handleChange}
                style={{ borderRadius: '12px', fontSize: '15px' }}
              />
              <span
                onClick={() => setShowOldPassword(!showOldPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '15px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div className="mb-4">
            <label className="form-label font-medium text-secondary">New Password</label>
            <div className="position-relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="form-control p-2 pe-3 font-medium"
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                style={{ borderRadius: '12px', fontSize: '15px' }}
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '15px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="btn w-100 py-3 font-medium text-white border-0 shadow-sm"
            disabled={loading}
            style={{
              borderRadius: '12px',
              fontSize: '16px',
              background: '#042954',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
