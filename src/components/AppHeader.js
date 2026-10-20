/* eslint-disable prettier/prettier */
import React, { useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { CContainer, CHeader, CHeaderNav, CHeaderToggler } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
import { Bell, Store, Package } from 'lucide-react'
import { FranchiseContext } from '../Context/FranchiseContext'
import { AppHeaderDropdown } from './header/index'

const AppHeader = () => {
  const dispatch    = useDispatch()
  const location    = useLocation()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { franchiseInfo, franchiseUser } = useContext(FranchiseContext)

  // Detect if we're in supplier portal
  const isSupplierPortal = location.pathname.startsWith('/supplier')

  // Get supplier info from localStorage if in supplier portal
  const supplierInfo = isSupplierPortal ? {
    supplierCode: localStorage.getItem('supplierCode'),
    supplierName: localStorage.getItem('supplierName'),
  } : null

  return (
    <CHeader position="sticky" className="p-0" style={{ background: '#0c3b73', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <CContainer
        fluid
        className="px-4 d-flex align-items-center justify-content-between"
        style={{ minHeight: 52 }}
      >
        {/* LEFT — menu toggle + code */}
        <div className="d-flex align-items-center gap-3">
          <CHeaderToggler
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
            style={{ marginInlineStart: '-14px', color: '#fff' }}
          >
            <CIcon icon={cilMenu} size="lg" style={{ color: '#fff' }} />
          </CHeaderToggler>

          {isSupplierPortal ? (
            supplierInfo?.supplierCode && (
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.6)',
                fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)',
                padding: '2px 8px', borderRadius: 4,
              }}>
                {supplierInfo.supplierCode}
              </span>
            )
          ) : (
            franchiseInfo?.franchiseCode && (
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.6)',
                fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)',
                padding: '2px 8px', borderRadius: 4,
              }}>
                {franchiseInfo.franchiseCode}
              </span>
            )
          )}
        </div>

        {/* RIGHT — name + notifications + profile */}
        <CHeaderNav className="d-flex align-items-center gap-3">

          {/* Name badge */}
          {isSupplierPortal ? (
            supplierInfo?.supplierName && (
              <div className="d-flex align-items-center gap-2" style={{ color: '#fff' }}>
                <Package size={14} style={{ opacity: 0.7 }} />
                <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>
                  {supplierInfo.supplierName}
                </span>
              </div>
            )
          ) : (
            franchiseInfo?.franchiseName && (
              <div className="d-flex align-items-center gap-2" style={{ color: '#fff' }}>
                <Store size={14} style={{ opacity: 0.7 }} />
                <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>
                  {franchiseInfo.franchiseName}
                </span>
              </div>
            )
          )}

          <span style={{ height: 24, width: 1, background: 'rgba(255,255,255,0.25)' }} />

          {/* Notifications */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px 6px', borderRadius: 6 }}>
            <Bell size={17} />
          </button>

          {/* Profile dropdown */}
          <AppHeaderDropdown />

        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
