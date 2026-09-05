/* eslint-disable prettier/prettier */
import React, { useContext, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { CSidebar, CSidebarBrand, CSidebarHeader } from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import useNav from '../_nav'
import { FranchiseContext } from '../Context/FranchiseContext'
import logo from '../assets/PharmaNexus.png'

/* ── Filter nav items based on menuAccess ── */
const filterNavByAccess = (items, hasAccess, role) => {
  // Franchise Owner always sees everything
  if (role === 'Franchise Owner') return items

  return items.reduce((acc, item) => {
    // If item has no accessKey — always show (e.g. group containers)
    if (!item.accessKey) {
      if (item.items) {
        // Filter children
        const filteredChildren = filterNavByAccess(item.items, hasAccess, role)
        // Only show group if it has at least 1 visible child
        if (filteredChildren.length > 0) {
          acc.push({ ...item, items: filteredChildren })
        }
      } else {
        acc.push(item)
      }
      return acc
    }

    // Check permission
    if (!hasAccess(item.accessKey)) return acc

    // Group with children — also filter children
    if (item.items) {
      const filteredChildren = filterNavByAccess(item.items, hasAccess, role)
      if (filteredChildren.length > 0) {
        acc.push({ ...item, items: filteredChildren })
      }
    } else {
      acc.push(item)
    }

    return acc
  }, [])
}

const AppSidebar = () => {
  const navigation    = useNav()
  const sidebarShow   = useSelector((state) => state.sidebarShow)
  const { franchiseInfo, franchiseUser, hasAccess } = useContext(FranchiseContext)

  const franchiseName = franchiseInfo?.franchiseName || 'Franchise Portal'
  const franchiseLogo = franchiseInfo?.logo || logo
  const initials      = franchiseName.slice(0, 2).toUpperCase()
  const role          = franchiseUser?.role

  /* Memoize filtered nav so it only recomputes when access changes */
  const filteredNav = useMemo(
    () => filterNavByAccess(navigation, hasAccess, role),
    [navigation, hasAccess, role]
  )

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
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
              {franchiseName}
            </p>
            <p style={{ color: '#fabf22', fontSize: 10, margin: 0, fontWeight: 600 }}>
              {role || 'Franchise Portal'}
            </p>
          </div>
        </CSidebarBrand>
      </CSidebarHeader>

      {/* Navigation — filtered by menuAccess */}
      <AppSidebarNav items={filteredNav} />
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
