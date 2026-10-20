/* eslint-disable prettier/prettier */
/**
 * User Management — Franchise Admin Portal
 * Tabs: User List | User Access | Menu Access
 * Wired to real API: /api/users, /api/users/:id/access, /api/users/menu-access/:role
 */
import { useState, useMemo, useEffect, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
  Users, UserCheck, ShieldCheck, Plus, Eye, Edit2, Search,
  X, Save, ChevronLeft, ChevronRight, LayoutDashboard, ShoppingCart,
  PackagePlus, Package, Pill, Truck, FileText, IndianRupee,
  BarChart2, Settings, CheckSquare, Square, Shield, RefreshCw,
  AlertCircle, Lock, Eye as EyeIcon, EyeOff, KeyRound, Copy, Check,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

const BASE_URL = import.meta.env.VITE_API_BASE_URL   // /api/

// subdomain dynamic getter — module load pe nahi, har request pe fresh value
const getSubdomain = () =>
  localStorage.getItem('franchise_subdomain')
  || import.meta.env.VITE_TENANT_ID
  || window.location.hostname.split('.')[0]
  || ''

const token = () => Cookies.get('LMS') || ''

const api = axios.create({ baseURL: BASE_URL })
api.interceptors.request.use(cfg => {
  cfg.headers['Authorization'] = `Bearer ${token()}`
  cfg.headers['x-tenant-id']   = getSubdomain()   // har request pe fresh
  return cfg
})

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const ROLE_CONFIG = {
  SuperAdmin: { color: '#7c3aed', bg: '#f5f3ff', border: '#e9d5ff', label: 'Super Admin' },
  Admin:      { color: '#0c3b73', bg: '#e0e7ff', border: '#c7d2fe', label: 'Admin' },
  Accounts:   { color: '#0891b2', bg: '#e0f2fe', border: '#bae6fd', label: 'Accounts' },
  Staff:      { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0', label: 'Staff' },
  Customer:   { color: '#d97706', bg: '#fef3c7', border: '#fde68a', label: 'Customer' },
  Vendor:     { color: '#dc2626', bg: '#fee2e2', border: '#fecaca', label: 'Vendor/Supplier' },
}
const ALL_ROLES = Object.keys(ROLE_CONFIG)

const ALL_MODULES = [
  { key: 'dashboard',  label: 'Dashboard',    Icon: LayoutDashboard },
  { key: 'pos',        label: 'POS / Billing', Icon: ShoppingCart },
  { key: 'purchase',   label: 'Purchase',      Icon: PackagePlus },
  { key: 'inventory',  label: 'Inventory',     Icon: Package },
  { key: 'medicines',  label: 'Medicines',     Icon: Pill },
  { key: 'suppliers',  label: 'Suppliers',     Icon: Truck },
  { key: 'b2b',        label: 'B2B Orders',    Icon: FileText },
  { key: 'customers',  label: 'Customers',     Icon: Users },
  { key: 'accounts',   label: 'Accounts',      Icon: IndianRupee },
  { key: 'staff',      label: 'Staff & Users', Icon: UserCheck },
  { key: 'reports',    label: 'Reports',       Icon: BarChart2 },
  { key: 'settings',   label: 'Settings',      Icon: Settings },
]

const DEFAULT_ACCESS = {
  SuperAdmin: ['dashboard','pos','purchase','inventory','medicines','suppliers','b2b','customers','accounts','staff','reports','settings'],
  Admin:      ['dashboard','pos','purchase','inventory','medicines','suppliers','b2b','customers','accounts','reports'],
  Accounts:   ['dashboard','accounts','reports'],
  Staff:      ['dashboard','pos','medicines','inventory'],
  Customer:   ['dashboard'],
  Vendor:     ['dashboard','b2b'],
}

const MENU_GROUPS = [
  { group: 'Main',       items: ['Dashboard', 'Notifications'] },
  { group: 'Sales',      items: ['New Bill', 'Barcode Scan', 'Hold Bill', 'Return Bill', 'Day Closing'] },
  { group: 'Purchase',   items: ['Purchase Dashboard', 'Purchase Orders', 'GRN Inward', 'Purchase Returns', 'Live Rate Compare'] },
  { group: 'Inventory',  items: ['Stock Overview', 'Rack & Warehouse', 'Batch & Expiry', 'Near Expiry', 'Expired Stock', 'Physical Verification'] },
  { group: 'Medicines',  items: ['Medicine List', 'Add Medicine', 'Barcode Labels', 'Generic Mapping'] },
  { group: 'Suppliers',  items: ['Supplier List', 'Add Supplier', 'Outstanding', 'Payment History'] },
  { group: 'Customers',  items: ['Customer List', 'Customer Wallet', 'Medicine Reminders', 'Loyalty Points'] },
  { group: 'Accounts',   items: ['Cash Book', 'Bank Book', 'Day Book', 'Receipts', 'Payments', 'Expenses', 'Profit & Loss', 'Balance Sheet'] },
  { group: 'Reports',    items: ['Sales Report', 'Purchase Report', 'Stock Report', 'Expiry Report'] },
  { group: 'Management', items: ['Staff & Users', 'User Access', 'Menu Access', 'Audit Logs', 'Settings', 'Help & Support'] },
]

/* ── Shared UI helpers ── */
const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || { color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb', label: role }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  )
}
const StatusBadge = ({ active }) =>
  active
    ? <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 20, background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>Active</span>
    : <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 20, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>Inactive</span>

const FL = ({ children }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{children}</label>
)
const FI = ({ value, onChange, placeholder, type = 'text', disabled }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#111827', background: disabled ? '#f9fafb' : '#fff' }}
    onFocus={e => { if (!disabled) e.target.style.borderColor = '#0c3b73' }}
    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
  />
)

const Toast = ({ msg, type = 'success' }) => (
  <span style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8, border: `1px solid ${type === 'success' ? '#bbf7d0' : '#fecaca'}`, background: type === 'success' ? '#dcfce7' : '#fee2e2', color: type === 'success' ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
    {type === 'success' ? '✓' : '✕'} {msg}
  </span>
)

/* ══════════════════════════════════════════
   USER FORM MODAL
══════════════════════════════════════════ */
const UserFormModal = ({ user, onClose, onSave, saving }) => {
  const [form, setForm] = useState(
    user
      ? { name: user.name || '', phone: user.phone || '', email: user.email || '', role: user.role || 'Staff' }
      : { name: '', phone: '', email: '', role: 'Staff', password: '' }
  )
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 540, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{user ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={15} color="#6b7280" />
          </button>
        </div>

        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><FL>Full Name *</FL><FI value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter full name" /></div>
            <div><FL>Phone</FL><FI value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit mobile" /></div>
            <div><FL>Email</FL><FI value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" type="email" /></div>
            <div>
              <FL>Role *</FL>
              <select value={form.role} onChange={e => set('role', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer', color: '#111827' }}>
                {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
              </select>
            </div>
            {!user && (
              <div style={{ gridColumn: '1/-1' }}><FL>Password *</FL><FI value={form.password} onChange={e => set('password', e.target.value)} placeholder="Set login password" type="password" /></div>
            )}
          </div>

          {/* Module preview */}
          <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e0e7ff' }}>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={13} color="#0c3b73" /> Default Module Access — {ROLE_CONFIG[form.role]?.label}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(DEFAULT_ACCESS[form.role] || []).map(key => {
                const mod = ALL_MODULES.find(m => m.key === key)
                return mod ? <span key={key} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: '#0c3b7318', color: '#0c3b73', fontWeight: 600 }}>{mod.label}</span> : null
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '14px 22px', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: saving ? '#94a3b8' : '#0c3b73', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={13} /> {saving ? 'Saving…' : user ? 'Update User' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   VIEW USER MODAL
══════════════════════════════════════════ */
const ViewUserModal = ({ user, onClose, onEdit, onReset }) => {
  const [creds, setCreds]               = useState(null)
  const [credsLoading, setCredsLoading] = useState(true)
  const [copiedId, setCopiedId]         = useState(false)
  const [copiedPw, setCopiedPw]         = useState(false)

  useEffect(() => {
    if (!user?._id) return
    setCredsLoading(true)
    api.get(`users/${user._id}/credentials`)
      .then(r => setCreds(r.data?.data || null))
      .catch(() => setCreds({ userId: user.userId, password: null }))
      .finally(() => setCredsLoading(false))
  }, [user?._id])

  const copyText = (text, type) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'id') { setCopiedId(true); setTimeout(() => setCopiedId(false), 1500) }
      else               { setCopiedPw(true); setTimeout(() => setCopiedPw(false), 1500) }
    })
  }

  if (!user) return null
  const cfg = ROLE_CONFIG[user.role] || { color: '#6b7280', bg: '#f3f4f6', label: user.role }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 560, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', maxHeight: '92vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: cfg.color }}>
              {(user.name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{user.name}</h3>
              <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={15} color="#6b7280" /></button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Basic info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Phone', user.phone || '—'], ['Email', user.email || '—'], ['Role', cfg.label], ['Status', user.isActive ? 'Active' : 'Inactive'], ['Last Login', user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : '—']].map(([label, val]) => (
              <div key={label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{label}</p>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: '#111827', fontWeight: 600 }}>{val}</p>
              </div>
            ))}
          </div>

          {/* ── Login Credentials ── */}
          <div style={{ background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <KeyRound size={14} color="#0c3b73" />
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#0c3b73', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Login Credentials</p>
              </div>
              <button onClick={() => { onClose(); onReset(user) }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid #fde68a', background: '#fef3c7', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#d97706' }}>
                <Lock size={11} /> Reset PW
              </button>
            </div>
            {credsLoading ? (
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Loading…</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* User ID */}
                <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid #e0f2fe' }}>
                  <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>User ID (Login)</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0c3b73', fontFamily: 'monospace' }}>
                      {creds?.userId || user.userId || '—'}
                    </span>
                    <button onClick={() => copyText(creds?.userId || user?.userId || '', 'id')}
                      style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 5, border: '1px solid #bfdbfe', background: copiedId ? '#dcfce7' : '#eff6ff', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: copiedId ? '#16a34a' : '#0c3b73' }}>
                      {copiedId ? <><Check size={9} /> Done</> : <><Copy size={9} /> Copy</>}
                    </button>
                  </div>
                </div>
                {/* Password */}
                <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid #e0f2fe' }}>
                  <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Password</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>
                      {creds?.password || <span style={{ fontSize: 11, fontStyle: 'italic', color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Not set</span>}
                    </span>
                    {creds?.password && (
                      <button onClick={() => copyText(creds.password, 'pw')}
                        style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 5, border: '1px solid #bfdbfe', background: copiedPw ? '#dcfce7' : '#eff6ff', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: copiedPw ? '#16a34a' : '#0c3b73' }}>
                        {copiedPw ? <><Check size={9} /> Done</> : <><Copy size={9} /> Copy</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e0e7ff' }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#374151' }}>Default Module Access</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(DEFAULT_ACCESS[user.role] || []).map(key => {
                const mod = ALL_MODULES.find(m => m.key === key)
                return mod ? <span key={key} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, background: '#0c3b7318', color: '#0c3b73', fontWeight: 600 }}>{mod.label}</span> : null
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '14px 22px', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Close</button>
          <button onClick={() => { onClose(); onEdit(user) }} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Edit2 size={13} /> Edit
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   CREDENTIALS CARD MODAL
   Admin/HR → Staff ka User ID + Password dekhe aur share kare
══════════════════════════════════════════ */
const CredentialsCard = ({ user, onClose, onResetPassword }) => {
  const [creds, setCreds]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [copiedId, setCopiedId]   = useState(false)
  const [copiedPw, setCopiedPw]   = useState(false)
  const [showPw, setShowPw]       = useState(false)
  const [error, setError]         = useState(null)

  const cfg = ROLE_CONFIG[user?.role] || { color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb', label: user?.role }

  useEffect(() => {
    if (!user?._id) return
    setLoading(true)
    setError(null)

    const timeout = setTimeout(() => {
      setError('Request timed out. Please retry.')
      setLoading(false)
    }, 8000)

    api.get(`users/${user._id}/credentials`)
      .then(r => {
        clearTimeout(timeout)
        const data = r.data?.data || {}
        setCreds({
          userId:   data.userId   || user.userId || null,
          password: data.password || null,
        })
      })
      .catch(err => {
        clearTimeout(timeout)
        const status = err?.response?.status
        const msg = status === 401 || status === 403
          ? 'Permission denied — only Admin can view credentials'
          : status === 404 ? 'User not found'
          : err?.response?.data?.message || 'Failed to load credentials'
        setError(msg)
        // userId fallback from table row even on error
        setCreds({ userId: user.userId || null, password: null })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user?._id])

  const copy = (text, type) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'id') { setCopiedId(true); setTimeout(() => setCopiedId(false), 2000) }
      else               { setCopiedPw(true); setTimeout(() => setCopiedPw(false), 2000) }
    })
  }

  const copyBoth = () => {
    if (!creds?.userId) return
    const text = `User ID: ${creds.userId}\nPassword: ${creds.password || 'N/A'}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(true); setCopiedPw(true)
      setTimeout(() => { setCopiedId(false); setCopiedPw(false) }, 2000)
    })
  }

  if (!user) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ background: 'linear-gradient(135deg, #0c3b73 0%, #1e5ba8 100%)', padding: '20px 22px', position: 'relative' }}>
          <button onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} color="#fff" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', border: '2px solid rgba(255,255,255,0.4)' }}>
              {(user.name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>{user.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{cfg.label}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                  {user.isActive ? '● Active' : '○ Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <KeyRound size={13} color="rgba(255,255,255,0.8)" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Login Credentials — Admin View Only</span>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '24px 0' }}>
              <div style={{ width: 18, height: 18, border: '3px solid #e0e7ff', borderTopColor: '#0c3b73', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 13, color: '#6b7280' }}>Loading credentials…</span>
            </div>
          ) : (
            <>
              {/* Error banner */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 9 }}>
                  <AlertCircle size={14} color="#d97706" />
                  <span style={{ fontSize: 12, color: '#92400e', fontWeight: 500 }}>{error}</span>
                </div>
              )}

              {/* ── User ID Box ── */}
              <div style={{ background: '#f0f9ff', border: '2px solid #bae6fd', borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    👤 User ID (Login Username)
                  </span>
                  <button onClick={() => copy(creds?.userId, 'id')}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: `1px solid ${copiedId ? '#86efac' : '#bae6fd'}`, background: copiedId ? '#dcfce7' : '#e0f2fe', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: copiedId ? '#16a34a' : '#0369a1', transition: 'all .2s' }}>
                    {copiedId ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy</>}
                  </button>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0c3b73', fontFamily: 'monospace', letterSpacing: '2px', wordBreak: 'break-all' }}>
                  {creds?.userId || <span style={{ fontSize: 14, color: '#dc2626', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Not assigned</span>}
                </div>
              </div>

              {/* ── Password Box ── */}
              <div style={{ background: '#fafafa', border: `2px solid ${creds?.password ? '#d1d5db' : '#fde68a'}`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    🔑 Password
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Show/Hide toggle */}
                    <button onClick={() => setShowPw(p => !p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 11, color: '#6b7280' }}>
                      {showPw ? <><EyeOff size={10} /> Hide</> : <><EyeIcon size={10} /> Show</>}
                    </button>
                    {creds?.password && (
                      <button onClick={() => copy(creds.password, 'pw')}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: `1px solid ${copiedPw ? '#86efac' : '#d1d5db'}`, background: copiedPw ? '#dcfce7' : '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: copiedPw ? '#16a34a' : '#374151', transition: 'all .2s' }}>
                        {copiedPw ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy</>}
                      </button>
                    )}
                  </div>
                </div>
                {creds?.password ? (
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', fontFamily: 'monospace', letterSpacing: '2px', wordBreak: 'break-all' }}>
                    {showPw ? creds.password : '•'.repeat(Math.min(creds.password.length, 10))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', align: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#d97706', fontWeight: 600, fontStyle: 'italic' }}>
                      ⚠ Password not set — use "Reset Password" below to set one
                    </span>
                  </div>
                )}
              </div>

              {/* ── Copy Both button ── */}
              {creds?.userId && creds?.password && (
                <button onClick={copyBoth}
                  style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: '2px dashed #bfdbfe', background: '#f0f9ff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f0f9ff'}>
                  <Copy size={13} /> Copy User ID + Password Together
                </button>
              )}

              {/* ── Share Info ── */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 9, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#15803d' }}>Staff ko share karein:</p>
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: '#166534', lineHeight: 1.5 }}>
                    Yeh User ID aur Password {user.name} ko do taaki wo apna account login kar sake.
                    {!creds?.password && ' Pehle "Reset Password" se password set karein.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 22px', borderTop: '1px solid #f3f4f6', background: '#f9fafb' }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
            Close
          </button>
          <button onClick={() => { onClose(); onResetPassword(user) }}
            style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', background: '#d97706', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Lock size={13} /> Reset Password
          </button>
        </div>
      </div>
    </div>
  )
}
const ResetPasswordModal = ({ user, onClose, onSave, saving }) => {
  const [newPassword, setNewPassword]   = useState('')
  const [showNew, setShowNew]           = useState(false)
  const [showCurrPw, setShowCurrPw]     = useState(false)
  const [copiedId, setCopiedId]         = useState(false)
  const [copiedPw, setCopiedPw]         = useState(false)
  const [error, setError]               = useState('')
  const [creds, setCreds]               = useState(null)
  const [credsLoading, setCredsLoading] = useState(true)

  const cfg = ROLE_CONFIG[user?.role] || { color: '#6b7280', bg: '#f3f4f6', label: user?.role }

  useEffect(() => {
    if (!user?._id) return
    setCredsLoading(true)
    setCreds(null)

    const timeout = setTimeout(() => {
      setCreds({ userId: user.userId || null, password: null, _err: 'Request timed out' })
      setCredsLoading(false)
    }, 8000)

    api.get(`users/${user._id}/credentials`)
      .then(r => {
        clearTimeout(timeout)
        const data = r.data?.data || {}
        console.log('[credentials]', data)
        setCreds({
          userId:   data.userId   || user.userId || null,
          password: data.password || null,
          _err:     (!data.userId && !user.userId) ? 'User ID not found' : null,
        })
      })
      .catch(err => {
        clearTimeout(timeout)
        const status = err?.response?.status
        const msg = status === 401 || status === 403
          ? 'Permission denied — Admin access required'
          : status === 404 ? 'User not found in database'
          : err?.response?.data?.message || err.message || 'Failed to load'
        console.error('[credentials] fetch failed:', status, msg)
        setCreds({ userId: user.userId || null, password: null, _err: msg })
      })
      .finally(() => { clearTimeout(timeout); setCredsLoading(false) })
  }, [user?._id])

  const copyText = (text, type) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'id') { setCopiedId(true); setTimeout(() => setCopiedId(false), 2000) }
      else               { setCopiedPw(true); setTimeout(() => setCopiedPw(false), 2000) }
    })
  }

  const copyBoth = () => {
    if (!creds?.userId) return
    const text = `User ID: ${creds.userId}\nPassword: ${creds.password || '(not set)'}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(true); setCopiedPw(true)
      setTimeout(() => { setCopiedId(false); setCopiedPw(false) }, 2000)
    })
  }

  const handleSave = () => {
    if (newPassword.length < 6) { setError('Minimum 6 characters required'); return }
    setError('')
    onSave({ newPassword })
  }

  const strength = newPassword.length >= 10 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)
    ? 'Strong' : newPassword.length >= 6 ? 'Medium' : 'Weak'
  const sColor = { Weak: '#dc2626', Medium: '#d97706', Strong: '#16a34a' }
  const sWidth = { Weak: '25%', Medium: '60%', Strong: '100%' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflow: 'hidden', maxHeight: '95vh', overflowY: 'auto' }}>

        {/* ── Header ── */}
        <div style={{ background: 'linear-gradient(135deg, #0c3b73 0%, #1e5ba8 100%)', padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff', border: '2px solid rgba(255,255,255,0.35)' }}>
                {(user?.name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>{user?.name}</h3>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                  {cfg.label} · {user?.isActive ? '● Active' : '○ Inactive'}
                </span>
              </div>
            </div>
            <button onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={14} color="#fff" />
            </button>
          </div>
        </div>

        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ════ CURRENT CREDENTIALS SECTION ════ */}
          <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <KeyRound size={14} color="#0369a1" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Current Login Credentials
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>Admin View Only</span>
            </div>

            {credsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
                <div style={{ width: 16, height: 16, border: '2px solid #bae6fd', borderTopColor: '#0c3b73', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>Loading credentials…</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Error banner */}
                {creds?._err && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8 }}>
                    <AlertCircle size={13} color="#d97706" />
                    <span style={{ fontSize: 12, color: '#92400e' }}>{creds._err}</span>
                  </div>
                )}

                {/* ── User ID row ── */}
                <div style={{ background: '#fff', border: '1.5px solid #93c5fd', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>👤 User ID (Login)</p>
                    <p style={{ margin: '5px 0 0', fontSize: 20, fontWeight: 800, color: '#0c3b73', fontFamily: 'monospace', letterSpacing: '1.5px', wordBreak: 'break-all' }}>
                      {creds?.userId
                        ? creds.userId
                        : <span style={{ fontSize: 13, color: '#dc2626', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontStyle: 'italic' }}>Not assigned</span>
                      }
                    </p>
                  </div>
                  {creds?.userId && (
                    <button onClick={() => copyText(creds.userId, 'id')}
                      style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 8, border: `1.5px solid ${copiedId ? '#86efac' : '#93c5fd'}`, background: copiedId ? '#dcfce7' : '#eff6ff', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: copiedId ? '#16a34a' : '#0c3b73', transition: 'all .2s' }}>
                      {copiedId ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                    </button>
                  )}
                </div>

                {/* ── Password row ── */}
                <div style={{ background: '#fff', border: `1.5px solid ${creds?.password ? '#d1d5db' : '#fde68a'}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>🔑 Password</p>
                    {creds?.password ? (
                      <p style={{ margin: '5px 0 0', fontSize: 20, fontWeight: 800, color: '#111827', fontFamily: 'monospace', letterSpacing: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {showCurrPw ? creds.password : '•'.repeat(Math.min(creds.password.length, 12))}
                      </p>
                    ) : (
                      <p style={{ margin: '5px 0 0', fontSize: 12, color: '#d97706', fontStyle: 'italic', fontWeight: 500 }}>
                        ⚠ Not set — set new password below
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {creds?.password && (
                      <>
                        <button onClick={() => setShowCurrPw(p => !p)}
                          style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 11, color: '#6b7280' }}>
                          {showCurrPw ? <EyeOff size={12} /> : <EyeIcon size={12} />}
                        </button>
                        <button onClick={() => copyText(creds.password, 'pw')}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: `1.5px solid ${copiedPw ? '#86efac' : '#d1d5db'}`, background: copiedPw ? '#dcfce7' : '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: copiedPw ? '#16a34a' : '#374151', transition: 'all .2s' }}>
                          {copiedPw ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Copy Both ── */}
                {creds?.userId && creds?.password && (
                  <button onClick={copyBoth}
                    style={{ width: '100%', padding: '9px 0', borderRadius: 9, border: '2px dashed #93c5fd', background: '#f0f9ff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Copy size={13} />
                    {copiedId && copiedPw ? '✓ Copied both!' : 'Copy User ID + Password Together'}
                  </button>
                )}

                {/* ── Share tip ── */}
                <p style={{ margin: 0, fontSize: 11, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>💡</span>
                  Yeh User ID aur Password {user?.name} ko share karein taaki wo login kar sake.
                  {!creds?.password && ' Pehle neeche naya password set karein.'}
                </p>
              </div>
            )}
          </div>

          {/* ════ RESET PASSWORD SECTION ════ */}
          <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <Lock size={14} color="#d97706" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Set New Password
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError('') }}
                placeholder="Minimum 6 characters"
                style={{ width: '100%', padding: '10px 38px 10px 12px', border: `1.5px solid ${error ? '#dc2626' : '#e5e7eb'}`, borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: '1px' }}
                onFocus={e => e.target.style.borderColor = '#0c3b73'}
                onBlur={e => e.target.style.borderColor = error ? '#dc2626' : '#e5e7eb'}
              />
              <button onClick={() => setShowNew(p => !p)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 2 }}>
                {showNew ? <EyeOff size={15} /> : <EyeIcon size={15} />}
              </button>
            </div>

            {newPassword.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 4, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: sWidth[strength], background: sColor[strength], borderRadius: 4, transition: 'all .3s' }} />
                </div>
                <span style={{ fontSize: 11, color: sColor[strength], fontWeight: 600 }}>{strength} password</span>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '8px 12px', background: '#fee2e2', borderRadius: 8, border: '1px solid #fecaca' }}>
                <AlertCircle size={13} color="#dc2626" />
                <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{error}</span>
              </div>
            )}

            <p style={{ margin: '8px 0 0', fontSize: 11, color: '#9ca3af' }}>
              Password immediately update hoga. Upar credentials section refresh karke naya password copy kar sakte hain.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 22px', borderTop: '1px solid #f3f4f6', background: '#f9fafb' }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !newPassword}
            style={{ flex: 2, padding: '10px 0', borderRadius: 9, border: 'none', background: saving || !newPassword ? '#94a3b8' : '#d97706', fontSize: 13, fontWeight: 700, cursor: saving || !newPassword ? 'not-allowed' : 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Lock size={13} /> {saving ? 'Saving…' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   TAB 1 — USER LIST
══════════════════════════════════════════ */
const UserListTab = () => {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const [showAdd, setShowAdd]         = useState(false)
  const [editUser, setEditUser]       = useState(null)
  const [viewUser, setViewUser]       = useState(null)
  const [resetUser, setResetUser]     = useState(null)
  const [viewCredsUser, setViewCredsUser] = useState(null)
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState(null)
  const PER_PAGE = 20

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: PER_PAGE }
      if (search) params.search = search
      if (roleFilter !== 'All') params.role = roleFilter
      const res = await api.get('users', { params })
      setUsers(res.data.data.users || [])
      setTotal(res.data.data.total || 0)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editUser) {
        await api.put(`users/${editUser._id}`, form)
        showToast('User updated successfully')
      } else {
        await api.post('users', form)
        showToast('User created successfully')
      }
      setShowAdd(false)
      setEditUser(null)
      fetchUsers()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (user) => {
    try {
      await api.patch(`users/${user._id}/toggle`)
      fetchUsers()
    } catch (err) {
      showToast('Status update failed', 'error')
    }
  }

  const handleResetPassword = async ({ newPassword }) => {
    setSaving(true)
    try {
      await api.patch(`users/${resetUser._id}/reset-password`, { newPassword })
      showToast(`Password reset for ${resetUser.name}`)
      setResetUser(null)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Password reset failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {(showAdd || editUser) && <UserFormModal user={editUser} onClose={() => { setShowAdd(false); setEditUser(null) }} onSave={handleSave} saving={saving} />}
      {viewUser && <ViewUserModal user={viewUser} onClose={() => setViewUser(null)} onEdit={u => { setViewUser(null); setEditUser(u) }} onReset={u => { setViewUser(null); setResetUser(u) }} />}
      {viewCredsUser && <CredentialsCard user={viewCredsUser} onClose={() => setViewCredsUser(null)} onResetPassword={u => { setViewCredsUser(null); setResetUser(u) }} />}
      {resetUser && <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} onSave={handleResetPassword} saving={saving} />}

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {ALL_ROLES.map(role => {
          const count = users.filter(u => u.role === role).length
          const cfg = ROLE_CONFIG[role]
          return (
            <div key={role} onClick={() => setRoleFilter(role === roleFilter ? 'All' : role)}
              style={{ background: '#fff', borderRadius: 12, border: `1.5px solid ${roleFilter === role ? cfg.color : '#e5e7eb'}`, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={17} color={cfg.color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{cfg.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 700, color: cfg.color }}>{loading ? '…' : count}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search name, phone, user ID…"
            style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', ...ALL_ROLES].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1) }}
              style={{ padding: '7px 13px', borderRadius: 8, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                borderColor: roleFilter === r ? '#0c3b73' : '#e5e7eb',
                background:  roleFilter === r ? '#0c3b73' : '#fff',
                color:       roleFilter === r ? '#fff'    : '#374151',
              }}>
              {r === 'All' ? 'All' : ROLE_CONFIG[r]?.label || r}
            </button>
          ))}
        </div>
        <button onClick={fetchUsers} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: 12 }}>
          <RefreshCw size={13} /> Refresh
        </button>
        <button onClick={() => { setEditUser(null); setShowAdd(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <Plus size={14} /> Add User
        </button>
      </div>

      {/* Toast */}
      {toast && <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Toast msg={toast.msg} type={toast.type} /></div>}

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>Loading users…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['SR NO', 'Full Name', 'User ID', 'Role', 'Contact', 'Email', 'Login Access', 'Status', 'Last Login', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={10} style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No users found</td></tr>
                ) : users.map((u, idx) => {
                  const cfg = ROLE_CONFIG[u.role] || { color: '#6b7280', bg: '#f3f4f6' }
                  return (
                    <tr key={u._id}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      {/* SR NO */}
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#9ca3af', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                        {(page - 1) * PER_PAGE + idx + 1}
                      </td>
                      {/* Full Name */}
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
                            {(u.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{u.name}</span>
                        </div>
                      </td>
                      {/* User ID */}
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#0c3b73', fontFamily: 'monospace', fontWeight: 700, borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>
                        {u.userId || '—'}
                      </td>
                      {/* Role */}
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}><RoleBadge role={u.role} /></td>
                      {/* Contact */}
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>{u.phone || '—'}</td>
                      {/* Email */}
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email || '—'}</td>
                      {/* ── Login Access — credentials button ── */}
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                        <button
                          onClick={() => setViewCredsUser(u)}
                          title="View User ID & Password"
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #c7d2fe', borderRadius: 7, background: '#eef2ff', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#4338ca', whiteSpace: 'nowrap', transition: 'all .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#e0e7ff'; e.currentTarget.style.borderColor = '#a5b4fc' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d2fe' }}>
                          <KeyRound size={11} /> ID &amp; Password
                        </button>
                      </td>
                      {/* Status */}
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}><StatusBadge active={u.isActive} /></td>
                      {/* Last Login */}
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={() => setViewUser(u)} title="View Details"
                            style={{ width: 30, height: 30, border: '1px solid #e5e7eb', borderRadius: 7, background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                            <Eye size={13} />
                          </button>
                          <button onClick={() => setEditUser(u)} title="Edit"
                            style={{ width: 30, height: 30, border: '1px solid #e5e7eb', borderRadius: 7, background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => setResetUser(u)} title="Reset Password"
                            style={{ width: 30, height: 30, border: '1px solid #fde68a', borderRadius: 7, background: '#fef3c7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                            <Lock size={13} />
                          </button>
                          <button onClick={() => toggleStatus(u)} title={u.isActive ? 'Deactivate' : 'Activate'}
                            style={{ width: 30, height: 30, border: 'none', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: u.isActive ? '#dcfce7' : '#f3f4f6', color: u.isActive ? '#16a34a' : '#9ca3af' }}>
                            {u.isActive ? '●' : '○'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {total} total users | Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 9px', cursor: page === 1 ? 'default' : 'pointer', background: 'none', color: page === 1 ? '#d1d5db' : '#374151' }}>
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ background: page === p ? '#0c3b73' : 'none', border: `1px solid ${page === p ? '#0c3b73' : '#e5e7eb'}`, borderRadius: 6, padding: '5px 9px', cursor: 'pointer', color: page === p ? '#fff' : '#374151', fontSize: 12, fontWeight: page === p ? 700 : 400, minWidth: 30, textAlign: 'center' }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 9px', cursor: page === totalPages ? 'default' : 'pointer', background: 'none', color: page === totalPages ? '#d1d5db' : '#374151' }}>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   TAB 2 — USER ACCESS
══════════════════════════════════════════ */
const UserAccessTab = () => {
  const [users, setUsers]           = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [selected, setSelected]     = useState(null)
  const [modules, setModules]       = useState([])
  const [loadingAccess, setLoadingAccess] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    api.get('users', { params: { limit: 100 } })
      .then(r => setUsers(r.data.data.users || []))
      .catch(() => {})
  }, [])

  const selectUser = async (u) => {
    setSelected(u)
    setLoadingAccess(true)
    try {
      const res = await api.get(`users/${u._id}/access`)
      setModules(res.data.data.modules || DEFAULT_ACCESS[u.role] || [])
    } catch {
      setModules(DEFAULT_ACCESS[u.role] || [])
    } finally {
      setLoadingAccess(false)
    }
  }

  const toggle = (key) => {
    if (selected?.role === 'SuperAdmin') return
    setModules(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await api.put(`users/${selected._id}/access`, { modules })
      showToast('Access saved successfully')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const filtered = users.filter(u => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.role?.toLowerCase().includes(userSearch.toLowerCase()))

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {/* Left panel */}
      <div style={{ width: 260, flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', background: '#0c3b73' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>Select User</p>
        </div>
        <div style={{ padding: 10, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users…"
              style={{ width: '100%', padding: '8px 8px 8px 28px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 520 }}>
          {filtered.map(u => {
            const cfg = ROLE_CONFIG[u.role] || { color: '#6b7280', bg: '#f3f4f6' }
            const isSel = selected?._id === u._id
            return (
              <div key={u._id} onClick={() => selectUser(u)}
                style={{ padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', background: isSel ? '#eff6ff' : '#fff', borderLeft: `4px solid ${isSel ? '#0c3b73' : 'transparent'}`, display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
                  {(u.name || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: isSel ? '#0c3b73' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                  <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color }}>{ROLE_CONFIG[u.role]?.label || u.role}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1 }}>
        {!selected ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '60px 24px', textAlign: 'center' }}>
            <UserCheck size={48} color="#e5e7eb" style={{ marginBottom: 14 }} />
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Select a user from the left panel to configure module access.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Header */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: (ROLE_CONFIG[selected.role] || {}).bg || '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: (ROLE_CONFIG[selected.role] || {}).color || '#6b7280' }}>
                {(selected.name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{selected.name}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                  <RoleBadge role={selected.role} />
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{selected.userId}</span>
                </div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>{modules.length} / {ALL_MODULES.length} enabled</div>
            </div>

            {selected.role === 'SuperAdmin' && (
              <div style={{ background: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={18} color="#7c3aed" />
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#7c3aed' }}>SuperAdmin has full access — module restrictions are disabled.</p>
              </div>
            )}

            {loadingAccess ? (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading access…</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {ALL_MODULES.map(mod => {
                  const isOn = modules.includes(mod.key)
                  const ModIcon = mod.Icon
                  return (
                    <div key={mod.key} onClick={() => toggle(mod.key)}
                      style={{ background: '#fff', border: `1px solid ${isOn ? '#0c3b73' : '#e5e7eb'}`, borderRadius: 12, padding: '15px 13px', cursor: selected.role === 'SuperAdmin' ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, boxShadow: isOn ? '0 0 0 3px rgba(12,59,115,0.07)' : 'none', transition: 'all .15s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: isOn ? '#e8f0fb' : '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ModIcon size={16} color={isOn ? '#0c3b73' : '#9ca3af'} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: isOn ? '#0c3b73' : '#6b7280' }}>{mod.label}</span>
                      </div>
                      <div style={{ width: 36, height: 20, borderRadius: 10, background: isOn ? '#16a34a' : '#d1d5db', position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: isOn ? 19 : 3, transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
              {toast && <Toast msg={toast.msg} type={toast.type} />}
              <button onClick={save} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: saving ? '#94a3b8' : '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save Access'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   TAB 3 — MENU ACCESS
══════════════════════════════════════════ */
const MenuAccessTab = () => {
  const [selectedRole, setSelectedRole] = useState('SuperAdmin')
  const [menuAccess, setMenuAccess]     = useState({})
  const [loading, setLoading]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [toast, setToast]               = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const loadMenu = useCallback(async (role) => {
    setLoading(true)
    try {
      const res = await api.get(`users/menu-access/${role}`)
      const items = res.data.data.items || {}
      if (res.data.data.isDefault) {
        // Build defaults
        const defaults = {}
        MENU_GROUPS.forEach(g => g.items.forEach(item => { defaults[item] = role === 'SuperAdmin' || role === 'Admin' }))
        setMenuAccess(defaults)
      } else {
        setMenuAccess(items)
      }
    } catch {
      const defaults = {}
      MENU_GROUPS.forEach(g => g.items.forEach(item => { defaults[item] = role === 'SuperAdmin' || role === 'Admin' }))
      setMenuAccess(defaults)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMenu(selectedRole) }, [selectedRole, loadMenu])

  const toggle = (item) => setMenuAccess(p => ({ ...p, [item]: !p[item] }))
  const toggleGroup = (group, value) => {
    const items = MENU_GROUPS.find(g => g.group === group)?.items || []
    setMenuAccess(p => { const n = { ...p }; items.forEach(i => { n[i] = value }); return n })
  }
  const isGroupAll = (group) => MENU_GROUPS.find(g => g.group === group)?.items.every(i => menuAccess[i])

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`users/menu-access/${selectedRole}`, { items: menuAccess })
      showToast('Menu access saved')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const allItems = MENU_GROUPS.flatMap(g => g.items)
  const enabledCount = allItems.filter(i => menuAccess[i]).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Role selector */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Role</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ALL_ROLES.map(role => {
            const cfg = ROLE_CONFIG[role]
            const isActive = selectedRole === role
            return (
              <button key={role} onClick={() => setSelectedRole(role)}
                style={{ padding: '8px 16px', borderRadius: 20, border: `2px solid ${isActive ? cfg.color : '#e5e7eb'}`, background: isActive ? cfg.bg : '#fff', color: isActive ? cfg.color : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
          {MENU_GROUPS.map(g => (
            <div key={g.group} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#f9fafb', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0c3b73' }}>{g.group}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggleGroup(g.group, true)} style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 6, border: '1px solid #bbf7d0', background: '#dcfce7', color: '#16a34a', cursor: 'pointer' }}>All</button>
                  <button onClick={() => toggleGroup(g.group, false)} style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 6, border: '1px solid #fecaca', background: '#fee2e2', color: '#dc2626', cursor: 'pointer' }}>None</button>
                </div>
              </div>
              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {g.items.map(item => {
                  const isChecked = !!menuAccess[item]
                  return (
                    <label key={item} onClick={() => toggle(item)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 6px', borderRadius: 7, cursor: 'pointer', background: isChecked ? '#f0f9ff' : 'transparent', transition: 'background .1s' }}>
                      {isChecked ? <CheckSquare size={15} color="#0c3b73" /> : <Square size={15} color="#d1d5db" />}
                      <span style={{ fontSize: 13, color: isChecked ? '#111827' : '#6b7280', fontWeight: isChecked ? 600 : 400 }}>{item}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary + save */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 13, color: '#374151' }}>
          <strong>{enabledCount}</strong> of <strong>{allItems.length}</strong> menu items enabled for <strong>{ROLE_CONFIG[selectedRole]?.label}</strong>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {toast && <Toast msg={toast.msg} type={toast.type} />}
          <button onClick={save} disabled={saving}
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: saving ? '#94a3b8' : '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save Menu Access'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */
export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('users')

  const TABS = [
    { key: 'users',  label: 'User List',   Icon: Users },
    { key: 'access', label: 'User Access', Icon: ShieldCheck },
    { key: 'menu',   label: 'Menu Access', Icon: Settings },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={UserCheck} title="User Management" subtitle="Manage users, roles, module access & menu visibility" color="#0c3b73">
        <span style={{ fontSize: 12, color: '#9ca3af' }}>Franchise Admin Portal</span>
      </PageHeader>

      {/* Tab bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '6px 8px', display: 'flex', gap: 4, alignSelf: 'flex-start', flexWrap: 'wrap' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key
          const TabIcon = tab.Icon
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .15s',
                background: isActive ? '#0c3b73' : 'transparent',
                color:      isActive ? '#fff'    : '#6b7280',
              }}>
              <TabIcon size={15} /> {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'users'  && <UserListTab />}
      {activeTab === 'access' && <UserAccessTab />}
      {activeTab === 'menu'   && <MenuAccessTab />}
    </div>
  )
}
