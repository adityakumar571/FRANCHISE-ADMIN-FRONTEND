/* eslint-disable prettier/prettier */
/**
 * SuperAdminLayout — Full shell for Super Admin portal
 * SOW Section 4: Super Admin Module
 *
 * Auth guard: checks SA_TOKEN cookie
 * Missing → redirect to /superadmin/login
 */
import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Cookies from 'js-cookie'
import {
  LayoutDashboard, Users, Building2, CreditCard, Package, Truck,
  Link2, ClipboardList, Settings, Bell, ChevronDown, ChevronRight,
  LogOut, Shield, Menu, X, BarChart2, HelpCircle,
} from 'lucide-react'

/* ─── Nav config (SOW Section 4 Screen Groups) ─── */
const NAV = [
  { label: 'Dashboard',         path: '/superadmin/dashboard',     icon: LayoutDashboard },
  { label: 'Admin Management',  path: '/superadmin/admins',        icon: Users },
  { label: 'Franchise Mgmt',    path: '/superadmin/franchises',    icon: Building2 },
  { label: 'Subscriptions',     path: '/superadmin/subscriptions', icon: CreditCard },
  { label: 'Medicine Master',   path: '/superadmin/medicines',     icon: Package },
  { label: 'Distributors',      path: '/superadmin/distributors',  icon: Truck },
  { label: 'Supplier Assignment',path: '/superadmin/supplier-assignment', icon: Link2 },
  { label: 'Reports',           path: '/superadmin/reports',       icon: BarChart2 },
  { label: 'Audit Logs',        path: '/superadmin/audit',         icon: ClipboardList },
  { label: 'Settings',          path: '/superadmin/settings',      icon: Settings },
]

const PRIMARY   = '#0c3b73'
const ACCENT    = '#fabf22'
const SIDEBAR_W = 230

export default function SuperAdminLayout() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [sideOpen, setSideOpen] = useState(true)

  /* Auth guard */
  useEffect(() => {
    const token = Cookies.get('SA_TOKEN') || Cookies.get('LMS')
    if (!token) navigate('/superadmin/login', { replace: true })
  }, [navigate])

  const handleLogout = () => {
    Cookies.remove('SA_TOKEN', { path: '/' })
    Cookies.remove('LMS',      { path: '/' })
    navigate('/superadmin/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fb', fontFamily: 'Inter, sans-serif' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sideOpen ? SIDEBAR_W : 60,
        flexShrink: 0,
        background: PRIMARY,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 200,
        transition: 'width 0.2s ease',
        overflowX: 'hidden',
      }}>
        {/* Brand */}
        <div style={{ padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10, minHeight: 60 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={18} color={PRIMARY} />
          </div>
          {sideOpen && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>Super Admin</p>
              <p style={{ margin: 0, fontSize: 10, color: ACCENT, fontWeight: 600 }}>PharmaNexus SaaS</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {NAV.map(item => {
            const active = location.pathname.startsWith(item.path)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', margin: '1px 8px', borderRadius: 9,
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  borderLeft: active ? `3px solid ${ACCENT}` : '3px solid transparent',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                  <item.icon size={16} color={active ? ACCENT : 'rgba(255,255,255,0.7)'} style={{ flexShrink: 0 }} />
                  {sideOpen && (
                    <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#fff' : 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                </div>
              </NavLink>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', width: '100%', border: 'none', borderRadius: 9, background: 'rgba(220,38,38,0.15)', cursor: 'pointer', color: '#fca5a5' }}>
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {sideOpen && <span style={{ fontSize: 12, fontWeight: 600 }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div style={{ marginLeft: sideOpen ? SIDEBAR_W : 60, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}>

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: PRIMARY, borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '0 20px', minHeight: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Sidebar toggle */}
            <button onClick={() => setSideOpen(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', padding: '4px' }}>
              <Menu size={18} />
            </button>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
              {location.pathname.replace('/superadmin/', '').toUpperCase() || 'DASHBOARD'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Notifications */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', position: 'relative', padding: '4px 6px', borderRadius: 7 }}>
              <Bell size={16} />
              <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, background: '#dc2626', borderRadius: '50%', border: '1.5px solid' + PRIMARY }} />
            </button>

            <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.2)' }} />

            {/* Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: PRIMARY }}>S</div>
              {sideOpen && (
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#fff' }}>Super Admin</p>
                  <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>admin@pharmanexus.in</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={{ padding: '10px 20px', borderTop: '1px solid #e5e7eb', background: '#fff', fontSize: 11, color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
          <span>© {new Date().getFullYear()} PharmaNexus SaaS — Super Admin Panel</span>
          <span>v1.0.0</span>
        </footer>
      </div>
    </div>
  )
}
