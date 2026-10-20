import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AppFooter } from '../components'
import Cookies from 'js-cookie'
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarHeader,
  CNavTitle,
  CNavItem,
  CNavGroup,
  CContainer,
  CHeader,
  CHeaderToggler,
  CHeaderNav,
  CHeaderBrand,
} from '@coreui/react'
import { cilMenu } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import supplierNav from '../_supplierNav'
import { AppSidebarNav } from '../components/AppSidebarNav'
import logo from '../assets/PharmaNexus.png'
import { AppHeaderDropdown } from '../components/header'

const SupplierLayout = () => {
  const navigate = useNavigate()
  const [sidebarShow, setSidebarShow] = useState(true)
  const [supplierInfo, setSupplierInfo] = useState({
    name: 'Supplier',
    email: '',
    code: 'SUP-001'
  })

  useEffect(() => {
    // Check supplier authentication
    const token = Cookies.get('supplierToken')
    if (!token) {
      navigate('/supplier/login', { replace: true })
      return
    }

    // Load supplier info from localStorage
    const name = localStorage.getItem('supplierName') || 'Supplier'
    const email = localStorage.getItem('supplierEmail') || ''
    const code = localStorage.getItem('supplierCode') || 'SUP-001'
    
    setSupplierInfo({ name, email, code })
    console.log('📦 Supplier info loaded:', { name, email, code })
  }, [navigate])

  const initials = supplierInfo.name.slice(0, 2).toUpperCase()

  return (
    <div>
      {/* Supplier Sidebar - Franchise Theme */}
      <CSidebar
        style={{ zIndex: 3, backgroundColor: '#0f1f3d' }}
        className="border-end"
        colorScheme="dark"
        position="fixed"
        visible={sidebarShow}
      >
        {/* Brand Header */}
        <CSidebarHeader
          style={{ backgroundColor: '#0c3b73', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '14px 16px' }}
          className="border-bottom"
        >
          <CSidebarBrand to="/supplier/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, overflow: 'hidden',
              flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#d97706',
            }}>
              <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                {supplierInfo.name}
              </p>
              <p style={{ color: '#fabf22', fontSize: 10, margin: 0, fontWeight: 600 }}>
                Supplier Portal
              </p>
            </div>
          </CSidebarBrand>
        </CSidebarHeader>

        {/* Navigation - Using AppSidebarNav for consistent styling */}
        <AppSidebarNav items={supplierNav} />
      </CSidebar>

      {/* Main Content Wrapper */}
      <div
        className="wrapper d-flex flex-column min-vh-100"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Supplier Header */}
        <CHeader position="sticky" className="mb-4">
          <CContainer fluid>
            <CHeaderToggler
              className="ps-1"
              onClick={() => setSidebarShow(!sidebarShow)}
            >
              <CIcon icon={cilMenu} size="lg" />
            </CHeaderToggler>
            <CHeaderBrand className="mx-auto d-md-none" to="/supplier/dashboard">
              <img src={logo} height={32} alt="PharmaNexus" />
            </CHeaderBrand>
            <CHeaderNav className="ms-auto">
              <AppHeaderDropdown />
            </CHeaderNav>
          </CContainer>
        </CHeader>

        <div className="body flex-grow-1">
          <div style={{ backgroundColor: '#f8fafc', padding: '20px', minHeight: 'calc(100vh - 52px)' }}>
            {/* Supplier pages will render here */}
            <Outlet />
          </div>
        </div>

        <AppFooter />
      </div>
    </div>
  )
}

export default SupplierLayout
