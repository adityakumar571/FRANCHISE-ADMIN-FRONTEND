/* eslint-disable prettier/prettier */
import React, { useContext } from 'react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { MdArrowDropDown } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { FranchiseContext } from '../../Context/FranchiseContext'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const { franchiseUser, logoutFranchise } = useContext(FranchiseContext)

  const handleLogout = (e) => {
    e.preventDefault()
    logoutFranchise()
    navigate('/franchise-login', { replace: true })
  }

  const name = franchiseUser?.name || franchiseUser?.userId || 'Admin'
  const role = franchiseUser?.role || 'Franchise Admin'
  const initial = name.slice(0, 1).toUpperCase()

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
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
