/* eslint-disable prettier/prettier */
import React, { useContext } from 'react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { MdArrowDropDown } from 'react-icons/md'
import { useNavigate, useLocation } from 'react-router-dom'
import { FranchiseContext } from '../../Context/FranchiseContext'
import { logoutSupplier } from '../../utils/supplierAuth'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { franchiseUser, logoutFranchise } = useContext(FranchiseContext)

  // Detect if we're in supplier portal
  const isSupplierPortal = location.pathname.startsWith('/supplier')

  const handleLogout = async (e) => {
    e.preventDefault()
    
    if (isSupplierPortal) {
      // Supplier logout using utility function
      try {
        await logoutSupplier()
        // Redirect to login page
        navigate('/supplier/login', { replace: true })
        // Force reload to ensure all state is cleared
        window.location.reload()
      } catch (error) {
        console.error('Logout failed:', error)
        // Force redirect anyway
        navigate('/supplier/login', { replace: true })
        window.location.reload()
      }
    } else {
      // Franchise logout
      logoutFranchise()
      navigate('/franchise-login', { replace: true })
    }
  }

  // Get name and role based on portal type
  let name, role, initial
  if (isSupplierPortal) {
    name = localStorage.getItem('supplierName') || 'Supplier'
    role = 'Supplier'
    initial = name.slice(0, 1).toUpperCase()
  } else {
    name = franchiseUser?.name || franchiseUser?.userId || 'Admin'
    role = franchiseUser?.role || 'Franchise Admin'
    initial = name.slice(0, 1).toUpperCase()
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0 p-0 m-0" caret={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{name}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{role}</div>
          </div>
          <MdArrowDropDown style={{ color: '#fff', fontSize: 18 }} />
          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#fabf22', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14, color: '#0c3b73', flexShrink: 0,
          }}>
            {initial}
          </div>
        </div>
      </CDropdownToggle>

      <CDropdownMenu style={{ minWidth: 180 }} placement="bottom-end">
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', background: '#f9fafb' }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>{role}</div>
        </div>
        {isSupplierPortal ? (
          <>
            <CDropdownItem onClick={() => navigate('/supplier/profile')}>
              <CIcon icon={cilUser} className="me-2" />
              Profile
            </CDropdownItem>
            <CDropdownItem onClick={() => navigate('/supplier/settings')}>
              <CIcon icon={cilLockLocked} className="me-2" />
              Change Password
            </CDropdownItem>
            <CDropdownItem onClick={handleLogout} style={{ color: '#ef4444' }}>
              <CIcon icon={cilLockLocked} className="me-2" />
              Log Out
            </CDropdownItem>
          </>
        ) : (
          <>
            <CDropdownItem onClick={() => navigate('/franchise/settings')}>
              <CIcon icon={cilUser} className="me-2" />
              Profile
            </CDropdownItem>
            <CDropdownItem onClick={() => navigate('/franchise/settings')}>
              <CIcon icon={cilLockLocked} className="me-2" />
              Change Password
            </CDropdownItem>
            <CDropdownItem onClick={handleLogout} style={{ color: '#ef4444' }}>
              <CIcon icon={cilLockLocked} className="me-2" />
              Log Out
            </CDropdownItem>
          </>
        )}
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
