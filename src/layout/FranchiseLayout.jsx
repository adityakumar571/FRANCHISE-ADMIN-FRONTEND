/* eslint-disable prettier/prettier */
/**
 * FranchiseLayout
 *
 * Dedicated layout for Franchise Admin.
 * Completely separate from the existing DefaultLayout (Super Admin / School LMS).
 * Handles:
 *  - Auth guard → redirects to /franchise-login if no LMS token or franchise context
 *  - Franchise Sidebar
 *  - Franchise Header
 *  - Outlet for nested franchise routes
 */
import { useEffect, useState } from 'react'
import { useNavigate, Outlet, NavLink, useLocation } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useFranchise } from '../Context/FranchiseContext'
import {
  LayoutDashboard, Store, Users, ShoppingCart, Package,
  FileText, Settings, ChevronRight, ChevronDown,
  Bell, LogOut, Menu, X, BarChart2, ClipboardList,
  UserCheck, Wallet, CalendarDays, HelpCircle, Activity,
} from 'lucide-react'

import logo from '../assets/PharmaNexus.png'

/* ── Nav Config ── */
const NAV = [
  { label: 'Dashboard',        to: '/franchise/dashboard',      icon: LayoutDashboard },
  { label: 'Franchises',       to: '/franchise/branches',       icon: Store },
  { label: 'Customers',        to: '/franchise/customers',      icon: Users },
  { label: 'Products',         to: '/franchise/products',       icon: Package },
  { label: 'Inventory',        to: '/franchise/inventory',      icon: ClipboardList },
  { label: 'Orders',           to: '/franchise/orders',         icon: ShoppingCart },
  { label: 'Billing',          to: '/franchise/billing',        icon: Wallet },
  { label: 'Staff',            to: '/franchise/staff',          icon: UserCheck },
  {
    label: 'Reports', icon: BarChart2,
    children: [
      { label: 'Sales Report',     to: '/franchise/reports/sales' },
      { label: 'Purchase Report',  to: '/franchise/reports/purchase' },
      { label: 'Stock Report',     to: '/franchise/reports/stock' },
      { label: 'Financial Report', to: '/franchise/reports/financial' },
    ],
  },
  { label: 'Attendance',       to: '/franchise/attendance',     icon: CalendarDays },
  { label: 'Activity Logs',    to: '/franchise/activity',       icon: Activity },
  { label: 'Settings',         to: '/franchise/settings',       icon: Settings },
  { label: 'Help & Support',   to: '/franchise/support',        icon: HelpCircle },
]

/* ── NavItem ── */
function NavItem({ icon: Icon, label, to, depth = 0 }) {
  const location = useLocation()
  const active = location.pathname === to || location.pathname.startsWith(to + '/')
  return (
    <NavLink
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: depth === 1 ? '7px 12px 7px 44px' : '9px 14px',
        borderRadius: 8, margin: '1px 8px',
        textDecoration: 'none', fontSize: 13, fontWeight: 500,
        background: active ? 'rgba(12,59,115,0.12)' : 'transparent',
        color: active ? '#0c3b73' : '#4b5563',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#f3f4f6' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {Icon && <Icon size={16} style={{ flexShrink: 0, color: active ? '#0c3b73' : '#9ca3af' }} />}
      <span style={{ flex: 1 }}>{label}</span>
      {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0c3b73', flexShrink: 0 }} />}
    </NavLink>
  )
}

/* ── NavGroup ── */
function NavGroup({ icon: Icon, label, children }) {
  const location = useLocation()
  const anyActive = children.some((c) => location.pathname === c.to || location.pathname.startsWith(c.to + '/'))
  const [open, setOpen] = useState(anyActive)
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: 'calc(100% - 16px)',
          padding: '9px 14px', borderRadius: 8, margin: '1px 8px',
          background: anyActive ? 'rgba(12,59,115,0.08)' : 'transparent',
          color: anyActive ? '#0c3b73' : '#4b5563', fontSize: 13, fontWeight: 500,
          border: 'none', cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {Icon && <Icon size={16} style={{ flexShrink: 0, color: anyActive ? '#0c3b73' : '#9ca3af' }} />}
        <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>
      {open && <div>{children.map((c) => <NavItem key={c.to} label={c.label} to={c.to} depth={1} />)}</div>}
    </div>
  )
}

/* ── Main Layout ── */
const FranchiseLayout = () => {
  const navigate = useNavigate()
  const { franchiseUser, franchiseInfo, logoutFranchise } = useFranchise()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  /* Auth guard */
  useEffect(() => {
    const token = Cookies.get('LMS')
    if (!token || !franchiseUser) {
      navigate('/franchise-login', { replace: true })
    }
  }, [])

  const handleLogout = () => {
    logoutFranchise()
    navigate('/franchise-login', { replace: true })
  }

  const initials = franchiseInfo?.franchiseName
    ? franchiseInfo.franchiseName.slice(0, 2).toUpperCase()
    : 'FR'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 0,
        minHeight: '100vh',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 40,
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.2s ease',
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
      }}>

        {/* Brand */}
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {franchiseInfo?.logo
            ? <img src={franchiseInfo.logo} alt="logo" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', border: '1px solid #e5e7eb' }} />
            : <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{initials}</span>
              </div>
          }
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {franchiseInfo?.franchiseName || 'Franchise'}
            </p>
            <p style={{ fontSize: 10, color: '#0c3b73', margin: 0, fontWeight: 600 }}>
              {franchiseUser?.role || 'Admin'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {NAV.map((item) =>
            item.children
              ? <NavGroup key={item.label} icon={item.icon} label={item.label}>{item.children}</NavGroup>
              : <NavItem key={item.to} icon={item.icon} label={item.label} to={item.to} />
          )}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '8px 12px', borderRadius: 8,
              border: 'none', background: 'transparent',
              color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? 240 : 0,
        display: 'flex', flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.2s ease',
      }}>

        {/* Header */}
        <header style={{
          height: 56, background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          {/* Left: Menu toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#6b7280' }}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            {franchiseInfo?.franchiseCode && (
              <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>
                {franchiseInfo.franchiseCode}
              </span>
            )}
          </div>

          {/* Right: Notifications + Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: '#6b7280' }}>
              <Bell size={17} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>
                  {franchiseUser?.name?.slice(0, 1)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>
                  {franchiseUser?.name || franchiseUser?.userId || 'Franchise Admin'}
                </p>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>{franchiseUser?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default FranchiseLayout
