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
  AlertCircle,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

const BASE_URL = import.meta.env.VITE_API_BASE_URL   // /api/
const subdomain = localStorage.getItem('franchise_subdomain') || ''
const token = () => Cookies.get('LMS') || ''

const api = axios.create({ baseURL: BASE_URL })
api.interceptors.request.use(cfg => {
  cfg.headers['Authorization'] = `Bearer ${token()}`
  cfg.headers['x-tenant-id']   = subdomain
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
const ViewUserModal = ({ user, onClose, onEdit }) => {
  if (!user) return null
  const cfg = ROLE_CONFIG[user.role] || { color: '#6b7280', bg: '#f3f4f6', label: user.role }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 540, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', maxHeight: '92vh', overflow: 'auto' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['User ID', user.userId], ['Phone', user.phone || '—'], ['Email', user.email || '—'], ['Role', cfg.label], ['Status', user.isActive ? 'Active' : 'Inactive'], ['Last Login', user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : '—']].map(([label, val]) => (
              <div key={label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{label}</p>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: '#111827', fontWeight: 600 }}>{val}</p>
              </div>
            ))}
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
   TAB 1 — USER LIST
══════════════════════════════════════════ */
const UserListTab = () => {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const [showAdd, setShowAdd]     = useState(false)
  const [editUser, setEditUser]   = useState(null)
  const [viewUser, setViewUser]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState(null)
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

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {(showAdd || editUser) && <UserFormModal user={editUser} onClose={() => { setShowAdd(false); setEditUser(null) }} onSave={handleSave} saving={saving} />}
      {viewUser && <ViewUserModal user={viewUser} onClose={() => setViewUser(null)} onEdit={u => { setViewUser(null); setEditUser(u) }} />}

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
                  {['User ID', 'Name', 'Role', 'Phone', 'Email', 'Last Login', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', fontSize: 12, color: '#6b7280', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No users found</td></tr>
                ) : users.map(u => {
                  const cfg = ROLE_CONFIG[u.role] || { color: '#6b7280', bg: '#f3f4f6' }
                  return (
                    <tr key={u._id}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '12px 14px', fontSize: 11, color: '#6b7280', fontFamily: 'monospace', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>{u.userId}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
                            {(u.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}><RoleBadge role={u.role} /></td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : '—'}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}><StatusBadge active={u.isActive} /></td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setViewUser(u)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 7, background: '#f9fafb', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#374151' }}><Eye size={12} /> View</button>
                          <button onClick={() => setEditUser(u)} style={{ width: 30, height: 30, border: '1px solid #e5e7eb', borderRadius: 7, background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}><Edit2 size={12} /></button>
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
