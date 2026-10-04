import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AppSidebar, AppFooter, AppHeader } from '../components'
import Cookies from 'js-cookie'

const SupplierLayout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Check supplier authentication
    const token = Cookies.get('supplierToken')
    if (!token) {
      navigate('/supplier/login', { replace: true })
    }
  }, [navigate])

  return (
    <div>
      <AppSidebar />

      <div
        className="wrapper d-flex flex-column min-vh-100"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <AppHeader />

        <div className="body flex-grow-1">
          {/* Supplier pages will render here */}
          <Outlet />
        </div>

        <AppFooter />
      </div>
    </div>
  )
}

export default SupplierLayout
