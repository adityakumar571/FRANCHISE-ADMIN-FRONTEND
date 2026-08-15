/* eslint-disable prettier/prettier */
import React, { useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
} from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import useNav from '../_nav'
import { FranchiseContext } from '../Context/FranchiseContext'
import logo from '../assets/PharmaNexus.png'

const AppSidebar = () => {
  const navigation  = useNav()
  const dispatch    = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const { franchiseInfo } = useContext(FranchiseContext)
  const franchiseName = franchiseInfo?.franchiseName || 'Franchise Portal'
  const franchiseLogo = franchiseInfo?.logo || logo

  const initials = franchiseName.slice(0, 2).toUpperCase()

  return (
    <CSidebar
      style={{ zIndex: 3, backgroundColor: '#0f1f3d' }}
      className="border-end"
      colorScheme="dark"
      position="fixed"
      visible={sidebarShow}
    >
      {/* Brand */}
      <CSidebarHeader
        style={{ backgroundColor: '#0c3b73', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '14px 16px' }}
        className="border-bottom"
      >
        <CSidebarBrand to="/franchise/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          {/* Logo / Initials */}
          <div style={{
            width: 38, height: 38, borderRadius: 10, overflow: 'hidden',
            flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1a6fd4',
          }}>
            {franchiseInfo?.logo
              ? <img src={franchiseLogo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
              : <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{initials}</span>
            }
          </div>
          {/* Name */}
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
              {franchiseName}
            </p>
            <p style={{ color: '#fabf22', fontSize: 10, margin: 0, fontWeight: 600 }}>
              Franchise Portal
            </p>
          </div>
        </CSidebarBrand>
      </CSidebarHeader>

      {/* Navigation */}
      <AppSidebarNav items={navigation} />
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
