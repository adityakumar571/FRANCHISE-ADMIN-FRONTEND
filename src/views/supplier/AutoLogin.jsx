import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Spin, message } from 'antd'
import Cookies from 'js-cookie'

const AutoLogin = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const supplierId = searchParams.get('supplierId')

    if (!token) {
      message.error('Invalid login link')
      navigate('/supplier/login')
      return
    }

    // Set authentication token
    Cookies.set('supplierToken', token, { expires: 1 }) // 1 day
    
    if (supplierId) {
      localStorage.setItem('supplierId', supplierId)
    }

    message.success('Login successful! Redirecting...')
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate('/supplier/dashboard')
    }, 1000)
  }, [searchParams, navigate])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Spin size="large" />
      <p style={{
        color: '#fff',
        fontSize: 18,
        marginTop: 24,
        fontWeight: 500
      }}>
        Logging you in...
      </p>
    </div>
  )
}

export default AutoLogin
