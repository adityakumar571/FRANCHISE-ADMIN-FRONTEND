/* eslint-disable prettier/prettier */
/**
 * Menu Access Control — Franchise
 * Tab 1: User Access  (table with login-toggle, reset-password, edit)
 * Tab 2: Menu Access  (select user → module cards with switches)
 * Exact replication of TFMS UserAccess + UserMenuAccess — franchise design system
 */
import { useState, useContext, useEffect, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
  ShieldCheck, Save, CheckSquare, Search, Download,
  Edit2, Lock, RefreshCw, X, Eye, EyeOff, Users,
  UserCheck, UserX, Shield, ChevronDown, ChevronRight,
  Printer, FileText, RotateCcw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { useFranchise } from '../../../Context/FranchiseContext'

/* ── API Setup ── */
const BASE_URL    = import.meta.env.VITE_API_BASE_URL
const getSubdomain = () => localStorage.getItem('franchise_subdomain') || import.meta.env.VITE_TENANT_ID || ''
const getToken     = () => Cookies.get('LMS') || ''
const api = axios.create({ baseURL: BASE_URL })
api.interceptors.request.use(cfg => {
  cfg.headers['Authorization'] = `Bearer ${getToken()}`
  cfg.headers['x-tenant-id']   = getSubdomain()
  return cfg
})

/* ── Helper: map API user → component user ── */
const mapUser = (u) => ({
  _id:        u._id,
  id:         u.userId || u._id,
  userId:     u.userId,
  name:       u.name || '—',
  role:       u.role  || 'Staff',
  phone:      u.phone || '',
  email:      u.email || '',
  loginAccess: u.isActive !== false,
  status:     u.isActive !== false ? 'Active' : 'Inactive',
  lastLogin:  u.lastLogin
    ? new Date(u.lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—',
})

/* ═══════════════════════════════════════════════════════
   CONSTANTS — MODULES (franchise menus)
═══════════════════════════════════════════════════════ */
const MODULES = [
  {
    key: 'dashboard', label: 'Dashboard', icon: '📊',
    items: [
      { key: 'dashboard_main',     label: 'Main Dashboard' },
      { key: 'dashboard_layout3d', label: '3D Rack Layout' },
    ],
  },
  {
    key: 'pos', label: 'POS Billing', icon: '🧾',
    items: [
      { key: 'pos_billing',      label: 'New Billing' },
      { key: 'pos_barcode',      label: 'Barcode Scan' },
      { key: 'pos_prescription', label: 'Prescription Billing' },
      { key: 'pos_payment',      label: 'Payment' },
      { key: 'pos_split',        label: 'Split Payment' },
      { key: 'pos_hold',         label: 'Hold Bill' },
      { key: 'pos_return',       label: 'Return Bill' },
      { key: 'pos_exchange',     label: 'Exchange Bill' },
      { key: 'pos_credit',       label: 'Credit Sale' },
      { key: 'pos_dayclosing',   label: 'Day Closing' },
    ],
  },
  {
    key: 'purchase', label: 'Purchase', icon: '🛒',
    items: [
      { key: 'purchase_dashboard', label: 'Purchase Dashboard' },
      { key: 'purchase_orders',    label: 'Purchase Orders' },
      { key: 'purchase_grn',       label: 'GRN / Inward' },
      { key: 'purchase_returns',   label: 'Purchase Returns' },
      { key: 'purchase_ledger',    label: 'Supplier Ledger' },
      { key: 'purchase_liverates', label: 'Live Rate Compare' },
    ],
  },
  {
    key: 'inventory', label: 'Inventory', icon: '📦',
    items: [
      { key: 'inventory_dashboard',   label: 'Inventory Dashboard' },
      { key: 'inventory_stock',       label: 'Current Stock' },
      { key: 'inventory_adjustment',  label: 'Stock Adjustment' },
      { key: 'inventory_nearexpiry',  label: 'Near Expiry' },
      { key: 'inventory_expired',     label: 'Expired Stock' },
      { key: 'inventory_damage',      label: 'Damage Stock' },
      { key: 'inventory_dead',        label: 'Dead Stock' },
      { key: 'inventory_fastmoving',  label: 'Fast Moving' },
      { key: 'inventory_slowmoving',  label: 'Slow Moving' },
      { key: 'inventory_ledger',      label: 'Stock Ledger' },
      { key: 'inventory_rack',        label: 'Rack & Warehouse' },
      { key: 'inventory_audit',       label: 'Inventory Audit' },
      { key: 'inventory_verification',label: 'Physical Verification' },
    ],
  },
  {
    key: 'liverates', label: 'Live Wholesale Rates', icon: '📈',
    items: [
      { key: 'liverates_dashboard', label: 'Live Rates Dashboard' },
      { key: 'liverates_compare',   label: 'Compare Suppliers' },
      { key: 'liverates_stock',     label: 'Supplier Stock' },
      { key: 'liverates_scheme',    label: 'Scheme Comparison' },
      { key: 'liverates_bestdeal',  label: 'Best Deal' },
      { key: 'liverates_cart',      label: 'Purchase Cart' },
      { key: 'liverates_order',     label: 'Place Order' },
      { key: 'liverates_tracking',  label: 'Order Tracking' },
    ],
  },
  {
    key: 'medicines', label: 'Medicine Master', icon: '💊',
    items: [
      { key: 'medicines_list',    label: 'Medicine List' },
      { key: 'medicines_add',     label: 'Add Medicine' },
      { key: 'medicines_edit',    label: 'Edit Medicine' },
      { key: 'medicines_rack',    label: 'Rack Management' },
      { key: 'medicines_barcode', label: 'Barcode & Label' },
    ],
  },
  {
    key: 'suppliers', label: 'Suppliers', icon: '🚚',
    items: [
      { key: 'suppliers_list',        label: 'Supplier List' },
      { key: 'suppliers_add',         label: 'Add Supplier' },
      { key: 'suppliers_outstanding', label: 'Outstanding' },
      { key: 'suppliers_ledger',      label: 'Supplier Ledger' },
      { key: 'suppliers_payments',    label: 'Payment History' },
    ],
  },
  {
    key: 'customers', label: 'Customers', icon: '👥',
    items: [
      { key: 'customers_list',       label: 'Customer List' },
      { key: 'customers_wallet',     label: 'Customer Wallet' },
      { key: 'customers_history',    label: 'Purchase History' },
      { key: 'customers_reminder',   label: 'Medicine Reminder' },
      { key: 'customers_membership', label: 'Membership' },
      { key: 'customers_loyalty',    label: 'Loyalty Program' },
      { key: 'customers_carecoin',   label: 'CareCoin' },
    ],
  },
  {
    key: 'b2b', label: 'B2B / Online Orders', icon: '🏪',
    items: [
      { key: 'b2b_orders', label: 'B2B Orders' },
    ],
  },
  {
    key: 'accounts', label: 'Accounts', icon: '💰',
    items: [
      { key: 'accounts_cashbook', label: 'Cash Book' },
      { key: 'accounts_bankbook', label: 'Bank Book' },
      { key: 'accounts_daybook',  label: 'Day Book' },
      { key: 'accounts_receipts', label: 'Receipts' },
      { key: 'accounts_payments', label: 'Payments' },
      { key: 'accounts_expenses', label: 'Expenses' },
      { key: 'accounts_income',   label: 'Income' },
      { key: 'accounts_journal',  label: 'Journal' },
      { key: 'accounts_ledger',   label: 'Ledger' },
      { key: 'accounts_trial',    label: 'Trial Balance' },
      { key: 'accounts_pl',       label: 'Profit & Loss' },
      { key: 'accounts_bs',       label: 'Balance Sheet' },
    ],
  },
  {
    key: 'reports', label: 'Reports', icon: '📋',
    items: [
      { key: 'reports_sales',    label: 'Sales Report' },
      { key: 'reports_purchase', label: 'Purchase Report' },
      { key: 'reports_stock',    label: 'Stock Report' },
      { key: 'reports_expiry',   label: 'Expiry Report' },
    ],
  },
  {
    key: 'staff', label: 'Staff & Users', icon: '👤',
    items: [
      { key: 'staff_list',   label: 'Staff List' },
      { key: 'staff_add',    label: 'Add Staff' },
      { key: 'staff_access', label: 'Menu Access Control' },
    ],
  },
  {
    key: 'settings', label: 'Settings', icon: '⚙️',
    items: [
      { key: 'settings_business', label: 'Business Profile' },
      { key: 'settings_profile',  label: 'My Profile' },
      { key: 'settings_notif',    label: 'Notifications' },
      { key: 'settings_security', label: 'Security' },
      { key: 'settings_print',    label: 'Printing & Invoice' },
    ],
  },
  {
    key: 'audit', label: 'Audit & Logs', icon: '🛡️',
    items: [
      { key: 'audit_logs',     label: 'Audit Logs' },
      { key: 'audit_activity', label: 'Activity Logs' },
    ],
  },
]

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const ALL_KEYS = MODULES.flatMap(m => [m.key, ...m.items.map(i => i.key)])
const buildAllKeys  = ()  => Object.fromEntries(ALL_KEYS.map(k => [k, false]))
const buildFullKeys = ()  => Object.fromEntries(ALL_KEYS.map(k => [k, true]))
const FULL_ACCESS   = buildFullKeys()
const NO_ACCESS     = buildAllKeys()

const buildAccess = (keys) => Object.fromEntries(ALL_KEYS.map(k => [k, keys.includes(k)]))

const ROLE_DEFAULTS = {
  SuperAdmin: FULL_ACCESS,
  Admin: FULL_ACCESS,
  'Franchise Owner': FULL_ACCESS,
  Accounts: buildAccess([
    'dashboard','dashboard_main',
    'accounts','accounts_cashbook','accounts_bankbook','accounts_daybook','accounts_receipts',
    'accounts_payments','accounts_expenses','accounts_income','accounts_journal',
    'accounts_ledger','accounts_trial','accounts_pl','accounts_bs',
    'reports','reports_sales','reports_purchase','reports_stock','reports_expiry',
  ]),
  Staff: buildAccess([
    'dashboard','dashboard_main',
    'pos','pos_billing','pos_barcode','pos_prescription','pos_payment','pos_hold','pos_return','pos_dayclosing',
    'inventory','inventory_stock','inventory_nearexpiry',
    'medicines','medicines_list',
    'customers','customers_list',
  ]),
  HRManager: buildAccess([
    'dashboard','dashboard_main',
    'staff','staff_list','staff_add','staff_access',
    'reports','reports_sales',
  ]),
  HRStaff: buildAccess([
    'dashboard','dashboard_main',
    'staff','staff_list',
  ]),
  Customer: buildAccess(['dashboard','dashboard_main']),
  Vendor: buildAccess(['dashboard','dashboard_main','b2b','b2b_orders']),
  'Branch Manager': buildAccess([
    'dashboard','dashboard_main',
    'purchase','purchase_dashboard','purchase_orders','purchase_grn','purchase_returns',
    'inventory','inventory_dashboard','inventory_stock','inventory_nearexpiry','inventory_rack',
    'medicines','medicines_list','medicines_rack',
    'suppliers','suppliers_list','suppliers_outstanding',
    'reports','reports_sales','reports_purchase','reports_stock',
    'staff','staff_list',
  ]),
  Pharmacist: buildAccess([
    'dashboard','dashboard_main',
    'pos','pos_billing','pos_barcode','pos_prescription','pos_payment','pos_hold','pos_return',
    'inventory','inventory_stock','inventory_nearexpiry',
    'medicines','medicines_list',
    'customers','customers_list',
  ]),
  Cashier: buildAccess([
    'dashboard','dashboard_main',
    'pos','pos_billing','pos_payment','pos_split','pos_hold','pos_credit','pos_dayclosing',
    'customers','customers_list',
  ]),
}

const ROLE_COLOR_MAP = {
  'Franchise Owner': '#7c3aed',
  'Branch Manager':  '#0891b2',
  'Pharmacist':      '#0c3b73',
  'Cashier':         '#16a34a',
  'SuperAdmin':      '#7c3aed',
  'Admin':           '#0c3b73',
  'Accounts':        '#0891b2',
  'Staff':           '#16a34a',
  'HRManager':       '#d97706',
  'HRStaff':         '#ea580c',
  'Customer':        '#9333ea',
  'Vendor':          '#dc2626',
}

// Dynamic color for any unknown role
const ROLE_PALETTE_COLORS = ['#7c3aed','#0c3b73','#0891b2','#16a34a','#d97706','#dc2626','#9333ea','#ea580c']
const getRoleColor = (role) => {
  if (ROLE_COLOR_MAP[role]) return ROLE_COLOR_MAP[role]
  const idx = [...(role||'')].reduce((a,c) => a + c.charCodeAt(0), 0) % ROLE_PALETTE_COLORS.length
  return ROLE_PALETTE_COLORS[idx]
}

/* ═══════════════════════════════════════════════════════
   SMALL SHARED COMPONENTS
═══════════════════════════════════════════════════════ */

/* Toggle Switch */
function Toggle({ checked, onChange, disabled = false }) {
  return (
    <div
      onClick={disabled ? undefined : onChange}
      style={{
        width: 40, height: 22, borderRadius: 11, cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? '#0c3b73' : '#d1d5db',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        opacity: disabled ? 0.45 : 1,
      }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: checked ? 21 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }} />
    </div>
  )
}

/* Reset Password Modal */
function ResetPasswordModal({ user, onClose, onSave }) {
  const [pwd, setPwd]   = useState('')
  const [show, setShow] = useState(false)
  const handleSave = () => {
    if (pwd.length < 6) { toast.error('Password must be at least 6 characters'); return }
    onSave(pwd)
    toast.success(`Password reset for ${user.name}`)
    onClose()
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={16} color="#d97706" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Reset Password</h3>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{user.name} · {user.role}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: '20px 22px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>New Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              placeholder="Minimum 6 characters"
              style={{ width: '100%', padding: '9px 40px 9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
            <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9ca3af' }}>Password will be updated immediately after saving.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '14px 22px', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#d97706', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={13} /> Reset Password
          </button>
        </div>
      </div>
    </div>
  )
}

/* Edit User Modal */
function EditUserModal({ user, roles, onClose, onSave }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Edit User — {user.id}</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={lbl}>Full Name</label><input value={form.name} onChange={set('name')} style={inp} /></div>
            <div><label style={lbl}>Phone</label><input value={form.phone} onChange={set('phone')} style={inp} /></div>
          </div>
          <div><label style={lbl}>Email</label><input value={form.email} onChange={set('email')} type="email" style={inp} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Role</label>
              <select value={form.role} onChange={set('role')} style={{ ...inp, background: '#fff' }}>
                {roles.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select value={form.status} onChange={set('status')} style={{ ...inp, background: '#fff' }}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '14px 22px', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
          <button onClick={() => { onSave(form); toast.success('User updated successfully'); onClose() }} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={13} /> Update User
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   TAB 1 — USER ACCESS (table)
═══════════════════════════════════════════════════════ */
function UserAccessTab({ staff, setStaff, fetchStaff }) {
  const [search, setSearch]       = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [loginFilter, setLoginFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [resetUser, setResetUser] = useState(null)
  const [editUser, setEditUser]   = useState(null)

  const ROLES = ['All', ...new Set(staff.map(s => s.role).filter(Boolean))].sort()

  const filtered = staff.filter(s => {
    const q = search.toLowerCase()
    return (
      (roleFilter   === 'All' || s.role === roleFilter) &&
      (loginFilter  === 'All' || (loginFilter === 'Enabled' ? s.loginAccess : !s.loginAccess)) &&
      (statusFilter === 'All' || s.status === statusFilter) &&
      (search === '' || s.name.toLowerCase().includes(q) || (s.email||'').toLowerCase().includes(q) || (s.phone||'').includes(q) || (s.id||'').toLowerCase().includes(q) || (s.userId||'').toLowerCase().includes(q))
    )
  })

  const toggleLogin = async (s) => {
    try {
      await api.patch(`users/${s._id}/toggle`)
      toast.success(`Login access ${s.loginAccess ? 'disabled' : 'enabled'} for ${s.name}`)
      fetchStaff()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Status update failed')
    }
  }

  const handleEdit = async (form) => {
    try {
      await api.put(`users/${editUser._id}`, {
        name:  form.name,
        phone: form.phone,
        email: form.email,
        role:  form.role,
      })
      toast.success('User updated successfully')
      fetchStaff()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed')
    }
  }

  const handleResetPassword = async (newPassword) => {
    try {
      await api.patch(`users/${resetUser._id}/reset-password`, { newPassword })
      toast.success(`Password reset for ${resetUser.name}`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset failed')
    }
  }

  const resetFilters = () => { setSearch(''); setRoleFilter('All'); setLoginFilter('All'); setStatusFilter('All') }

  const totalActive   = staff.filter(s => s.status === 'Active').length
  const totalInactive = staff.filter(s => s.status !== 'Active').length
  const totalEnabled  = staff.filter(s => s.loginAccess).length

  const Th = ({ c, align = 'left' }) => (
    <th style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
  )
  const Td = ({ children, style = {} }) => (
    <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {resetUser && <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} onSave={handleResetPassword} />}
      {editUser  && <EditUserModal user={editUser} roles={['All', ...new Set(staff.map(s => s.role).filter(Boolean))].filter(r => r !== 'All')} onClose={() => setEditUser(null)} onSave={handleEdit} />}

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Users',      value: staff.length,   icon: Users,     color: '#0c3b73', bg: '#e0e7ff' },
          { label: 'Active Users',     value: totalActive,    icon: UserCheck, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Inactive Users',   value: totalInactive,  icon: UserX,     color: '#dc2626', bg: '#fee2e2' },
          { label: 'Login Enabled',    value: totalEnabled,   icon: Shield,    color: '#7c3aed', bg: '#f5f3ff' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={18} color={k.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{k.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>Search</label>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
              style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
          </div>
        </div>
        {[
          { label: 'Role',         val: roleFilter,   set: setRoleFilter,   opts: ROLES },
          { label: 'Login Access', val: loginFilter,  set: setLoginFilter,  opts: ['All','Enabled','Disabled'] },
          { label: 'Status',       val: statusFilter, set: setStatusFilter, opts: ['All','Active','Inactive'] },
        ].map(f => (
          <div key={f.label}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</label>
            <select value={f.val} onChange={e => f.set(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer', outline: 'none' }}>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <button onClick={resetFilters} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
          <RotateCcw size={13} /> Reset
        </button>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {[
            { label: 'Excel',  color: '#16a34a', icon: FileText },
            { label: 'CSV',    color: '#0891b2', icon: FileText },
            { label: 'Print',  color: '#6b7280', icon: Printer  },
          ].map(b => (
            <button key={b.label} onClick={() => toast.success(`Exporting as ${b.label}...`)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', border: 'none', borderRadius: 8, background: b.color, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>
              <b.icon size={12} /> {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={16} color="#d97706" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>All Users ({filtered.length})</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th c="Sr No" /><Th c="Full Name" /><Th c="User ID" /><Th c="Role" />
                <Th c="Contact" /><Th c="Email" /><Th c="Login Access" align="center" />
                <Th c="Status" align="center" /><Th c="Last Login" /><Th c="Actions" align="center" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No users found</td></tr>
              ) : filtered.map((s, i) => {
                const rc = getRoleColor(s.role)
                return (
                  <tr key={s.id} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                    <Td style={{ color: '#9ca3af', fontSize: 12 }}>{i + 1}</Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: rc + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: rc, fontSize: 13, flexShrink: 0 }}>{s.name[0]}</div>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{s.name}</span>
                      </div>
                    </Td>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{s.id}</span></Td>
                    <Td>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: rc + '18', color: rc }}>{s.role}</span>
                    </Td>
                    <Td style={{ fontSize: 12, color: '#6b7280' }}>{s.phone}</Td>
                    <Td style={{ fontSize: 12, color: '#6b7280' }}>{s.email}</Td>
                    <Td style={{ textAlign: 'center' }}>
                      <Toggle checked={s.loginAccess} onChange={() => toggleLogin(s)} />
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.status === 'Active' ? '#dcfce7' : '#f3f4f6', color: s.status === 'Active' ? '#16a34a' : '#6b7280' }}>
                        {s.status}
                      </span>
                    </Td>
                    <Td style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>{s.lastLogin}</Td>
                    <Td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button onClick={() => setResetUser(s)} title="Reset Password"
                          style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#fef3c7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Lock size={13} color="#d97706" />
                        </button>
                        <button onClick={() => setEditUser(s)} title="Edit User"
                          style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#e0e7ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Edit2 size={13} color="#0c3b73" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 18px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {staff.length} users</span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   TAB 2 — MENU ACCESS (module cards with switches)
═══════════════════════════════════════════════════════ */
function MenuAccessTab({ staff }) {
  const { setMenuAccess, franchiseUser } = useFranchise()
  const [selectedId, setSelectedId] = useState(staff[0].id)
  const [accessMap, setAccessMap]   = useState(() =>
    Object.fromEntries(staff.map(s => [s.id, { ...(ROLE_DEFAULTS[s.role] || NO_ACCESS) }]))
  )
  const [saving, setSaving] = useState(false)

  const currentUser = staff.find(s => s.id === selectedId)
  const access      = accessMap[selectedId] || NO_ACCESS

  const totalEnabled = ALL_KEYS.filter(k => access[k]).length

  const updateAccess = (id, updated) => setAccessMap(p => ({ ...p, [id]: updated }))

  const toggleItem = (key, mod) => {
    const updated = { ...access, [key]: !access[key] }
    updated[mod.key] = mod.items.every(i => updated[i.key])
    updateAccess(selectedId, updated)
  }

  const toggleModule = (mod) => {
    const newVal = !mod.items.every(i => access[i.key])
    const updated = { ...access, [mod.key]: newVal }
    mod.items.forEach(i => { updated[i.key] = newVal })
    updateAccess(selectedId, updated)
  }

  const handleSelectAll = () => {
    updateAccess(selectedId, { ...FULL_ACCESS })
    toast('All permissions enabled', { icon: '✅' })
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      // If saving for the currently logged-in user, update sidebar immediately
      const isCurrentUser = franchiseUser && (
        franchiseUser._id === selectedId ||
        franchiseUser.userId === selectedId ||
        franchiseUser.name === currentUser?.name
      )
      if (isCurrentUser) {
        setMenuAccess(access, franchiseUser._id || 'default')
      } else {
        // Save to localStorage for that user
        localStorage.setItem(`franchise_menu_access_${selectedId}`, JSON.stringify(access))
      }
      toast.success(`Menu access saved for ${currentUser?.name}`)
    }, 600)
  }

  const rc = getRoleColor(currentUser?.role)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Top bar — user selector + info + actions */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 22px', display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>

        {/* User dropdown */}
        <div style={{ minWidth: 260 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Select User</label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', cursor: 'pointer' }}>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
        </div>

        {/* Role (readonly) */}
        <div style={{ minWidth: 160 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Role</label>
          <div style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', color: rc, fontWeight: 600 }}>
            {currentUser?.role}
          </div>
        </div>

        {/* Login Access (readonly) */}
        <div style={{ minWidth: 140 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Login Access</label>
          <div style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', color: currentUser?.loginAccess ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
            {currentUser?.loginAccess ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        {/* Access count */}
        <div style={{ minWidth: 120, textAlign: 'center', padding: '10px 16px', background: '#f0f4ff', borderRadius: 8, border: '1px solid #c7d2fe' }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0c3b73' }}>{totalEnabled}</p>
          <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>of {ALL_KEYS.length} enabled</p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button onClick={handleSelectAll}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1px solid #0c3b7330', borderRadius: 8, background: '#e0e7ff', color: '#0c3b73', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <CheckSquare size={14} /> Select All
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', border: 'none', borderRadius: 8, background: saving ? '#9ca3af' : '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>Access Level — {currentUser?.name}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#0c3b73' }}>{Math.round((totalEnabled / ALL_KEYS.length) * 100)}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: '#f3f4f6', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(totalEnabled / ALL_KEYS.length) * 100}%`, background: 'linear-gradient(90deg,#0c3b73,#1a6fd4)', borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Module Cards Grid — 3 columns like TFMS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {MODULES.map(mod => {
          const allOn   = mod.items.every(i => access[i.key])
          const someOn  = mod.items.some(i => access[i.key])
          const partial = someOn && !allOn
          const enabledCount = mod.items.filter(i => access[i.key]).length

          return (
            <div key={mod.key} style={{
              background: '#fff',
              borderRadius: 10,
              padding: '18px 20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              border: `1px solid ${allOn ? '#c7d2fe' : partial ? '#fde68a' : '#e5e7eb'}`,
              height: '100%',
            }}>
              {/* Module header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{mod.icon}</span>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{mod.label}</span>
                    <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{enabledCount}/{mod.items.length} enabled</p>
                  </div>
                </div>
                <Toggle
                  checked={allOn}
                  onChange={() => toggleModule(mod)}
                />
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mod.items.map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: access[item.key] ? '#111827' : '#9ca3af', paddingLeft: 4, fontWeight: access[item.key] ? 500 : 400 }}>
                      {item.label}
                    </span>
                    <Toggle
                      checked={!!access[item.key]}
                      onChange={() => toggleItem(item.key, mod)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sticky save bar */}
      <div style={{ position: 'sticky', bottom: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)', zIndex: 10 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
          {currentUser?.name} — <strong style={{ color: '#0c3b73' }}>{totalEnabled}</strong> of {ALL_KEYS.length} permissions enabled
        </p>
        <button onClick={handleSave} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 24px', borderRadius: 9, border: 'none', background: saving ? '#9ca3af' : '#0c3b73', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
          <Save size={15} /> {saving ? 'Saving...' : 'Save Access Settings'}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN — tabs wrapper
═══════════════════════════════════════════════════════ */
export default function MenuAccessControl() {
  const { franchiseUser } = useFranchise()
  const [tab, setTab]     = useState('access')
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  /* ── Fetch users from API ── */
  const fetchStaff = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('users?limit=200')
      const users = res.data?.data?.users || []
      setStaff(users.map(mapUser))
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  const TABS = [
    { id: 'access', label: 'User Access', icon: Shield },
    { id: 'menu',   label: 'Menu Access', icon: ShieldCheck },
  ]

  if (loading) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PageHeader icon={ShieldCheck} title="User Access Management" subtitle="Control login access and menu permissions for each staff member" color="#0c3b73" />
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
          Loading users…
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page Header */}
      <PageHeader icon={ShieldCheck} title="User Access Management" subtitle="Control login access and menu permissions for each staff member" color="#0c3b73" />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
        {TABS.map(t => {
          const TIcon = t.icon
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '12px 22px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: active ? 700 : 500,
              color: active ? '#0c3b73' : '#6b7280',
              borderBottom: `2px solid ${active ? '#0c3b73' : 'transparent'}`,
              marginBottom: -2,
              transition: 'all 0.15s',
            }}>
              <TIcon size={15} /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {tab === 'access' && <UserAccessTab staff={staff} setStaff={setStaff} fetchStaff={fetchStaff} />}
      {tab === 'menu'   && staff.length > 0 && <MenuAccessTab staff={staff} />}
      {tab === 'menu'   && staff.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 48, textAlign: 'center', color: '#9ca3af' }}>
          No users found. Add users first.
        </div>
      )}
    </div>
  )
}
