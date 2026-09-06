/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserCheck, Plus, Eye, Edit2, Search, Shield, UserCog, User,
  X, Save, ChevronLeft, ChevronRight, ShieldCheck, Lock,
  EyeOff, Eye as EyeIcon, Copy, Check, RefreshCw, Download,
  FileText, Printer, AlertTriangle,
} from 'lucide-react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Switch } from 'antd'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'

/* ─────────────────────────────────────────
   API Setup
───────────────────────────────────────── */
const BASE_URL  = import.meta.env.VITE_API_BASE_URL
const getSubdomain = () => localStorage.getItem('franchise_subdomain') || import.meta.env.VITE_TENANT_ID || ''
const getToken     = () => Cookies.get('LMS') || ''

const api = axios.create({ baseURL: BASE_URL })
api.interceptors.request.use(cfg => {
  cfg.headers['Authorization'] = `Bearer ${getToken()}`
  cfg.headers['x-tenant-id']   = getSubdomain()
  return cfg
})

/* ─────────────────────────────────────────
   Role Config — dynamic colors for any role
───────────────────────────────────────── */
const ROLE_PALETTE = [
  { color: '#7c3aed', bg: '#f5f3ff', border: '#e9d5ff' },
  { color: '#0c3b73', bg: '#e0e7ff', border: '#c7d2fe' },
  { color: '#0891b2', bg: '#e0f2fe', border: '#bae6fd' },
  { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
  { color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  { color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  { color: '#0c3b73', bg: '#f0f9ff', border: '#bae6fd' },
  { color: '#9333ea', bg: '#fdf4ff', border: '#e9d5ff' },
]

// Returns a consistent color for any role string
const getRoleStyle = (role) => {
  const idx = [...(role || '')].reduce((acc, c) => acc + c.charCodeAt(0), 0) % ROLE_PALETTE.length
  return ROLE_PALETTE[idx]
}

const RoleBadge = ({ role }) => {
  if (!role) return null
  const s = getRoleStyle(role)
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {role}
    </span>
  )
}

/* ─────────────────────────────────────────
   Small Helpers
───────────────────────────────────────── */

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

/* ─────────────────────────────────────────
   Add / Edit Modal
───────────────────────────────────────── */
const StaffModal = ({ staff, onClose, onSaved, availableRoles = [] }) => {
  const isEdit = !!staff
  const [form, setForm]   = useState({
    name:     staff?.name     || '',
    phone:    staff?.phone    || '',
    email:    staff?.email    || '',
    role:     staff?.role     || 'Admin',
    password: '',
  })
  const [saving, setSaving] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) { toast.error('Name and phone are required'); return }
    if (!isEdit && !form.password) { toast.error('Password is required'); return }
    setSaving(true)
    try {
      const payload = { ...form }
      if (isEdit && !payload.password) delete payload.password
      if (isEdit) {
        await api.put(`users/${staff._id}`, payload)
        toast.success('User updated')
      } else {
        await api.post('users', payload)
        toast.success('User created')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{isEdit ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={15} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><FL>Full Name *</FL><FI value={form.name} onChange={e => set('name', e.target.value)} placeholder="Staff full name" /></div>
            <div><FL>Phone *</FL><FI value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit mobile" /></div>
            <div><FL>Email</FL><FI value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" type="email" /></div>
            <div>
              <FL>Role *</FL>
              <select value={form.role} onChange={e => set('role', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer', color: '#111827' }}>
                {(availableRoles.length > 0 ? availableRoles : ['SuperAdmin','Admin','Accounts','Staff','Customer','Vendor']).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <FL>{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</FL>
            <div style={{ position: 'relative' }}>
              <FI value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" type={showPw ? 'text' : 'password'} />
              <button onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {showPw ? <EyeOff size={14} /> : <EyeIcon size={14} />}
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '14px 22px', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: saving ? '#94a3b8' : '#0c3b73', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={13} /> {saving ? 'Saving…' : isEdit ? 'Update User' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Password / Credentials Modal
───────────────────────────────────────── */
const CredentialsModal = ({ user, onClose }) => {
  const [creds, setCreds]           = useState(null)
  const [credsLoading, setCredsLoading] = useState(true)
  const [newPassword, setNewPassword]   = useState('')
  const [showNew, setShowNew]           = useState(false)
  const [showCurrent, setShowCurrent]   = useState(false)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [copiedId, setCopiedId]         = useState(false)
  const [copiedPw, setCopiedPw]         = useState(false)

  const cfg = ROLE_COLORS[user?.role] || { color: '#6b7280', bg: '#f3f4f6' }

  useEffect(() => {
    if (!user?._id) { setCreds({ userId: user?.userId || '—', password: null }); setCredsLoading(false); return }
    api.get(`users/${user._id}/credentials`)
      .then(r => setCreds(r.data?.data || { userId: user.userId, password: null }))
      .catch(() => setCreds({ userId: user?.userId || '—', password: null }))
      .finally(() => setCredsLoading(false))
  }, [user?._id])

  const copyText = (text, type) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'id') { setCopiedId(true); setTimeout(() => setCopiedId(false), 1500) }
      else               { setCopiedPw(true); setTimeout(() => setCopiedPw(false), 1500) }
    })
  }

  const handleReset = async () => {
    if (newPassword.length < 6) { setError('Minimum 6 characters required'); return }
    setError(''); setSaving(true)
    try {
      await api.patch(`users/${user._id}/reset-password`, { newPassword })
      setCreds(p => ({ ...p, password: newPassword }))
      setSuccess('Password reset successfully!')
      setNewPassword('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed')
    } finally { setSaving(false) }
  }

  const strength = newPassword.length >= 10 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)
    ? 'Strong' : newPassword.length >= 6 ? 'Medium' : 'Weak'
  const SC = { Weak: '#dc2626', Medium: '#d97706', Strong: '#16a34a' }
  const SW = { Weak: '25%', Medium: '60%', Strong: '100%' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fff7e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} color="#d97706" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Password & Credentials</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{user?.name} · <span style={{ color: cfg.color, fontWeight: 600 }}>{user?.role}</span></p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={15} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#f8faff', borderRadius: 10, border: '1px solid #dbeafe', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#0c3b73', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Login Credentials</p>
            {credsLoading ? <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Loading…</p> : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>User ID</p>
                    <p style={{ margin: '3px 0 0', fontSize: 16, fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>{creds?.userId || '—'}</p>
                  </div>
                  <button onClick={() => copyText(creds?.userId, 'id')}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #bfdbfe', background: copiedId ? '#dcfce7' : '#eff6ff', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: copiedId ? '#16a34a' : '#0c3b73', whiteSpace: 'nowrap' }}>
                    {copiedId ? <Check size={12} /> : <Copy size={12} />} {copiedId ? 'Copied' : 'Copy ID'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 10, borderTop: '1px solid #dbeafe' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Current Password</p>
                    <p style={{ margin: '3px 0 0', fontSize: 16, fontWeight: 700, color: '#111827', fontFamily: 'monospace', letterSpacing: showCurrent ? '0.3px' : '4px' }}>
                      {creds?.password
                        ? (showCurrent ? creds.password : '••••••••')
                        : <span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', fontWeight: 400, letterSpacing: 0 }}>Reset below to set new password</span>}
                    </p>
                  </div>
                  {creds?.password && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setShowCurrent(p => !p)}
                        style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #bfdbfe', background: '#eff6ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0c3b73' }}>
                        {showCurrent ? <EyeOff size={14} /> : <EyeIcon size={14} />}
                      </button>
                      <button onClick={() => copyText(creds?.password, 'pw')}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #bfdbfe', background: copiedPw ? '#dcfce7' : '#eff6ff', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: copiedPw ? '#16a34a' : '#0c3b73', whiteSpace: 'nowrap' }}>
                        {copiedPw ? <Check size={12} /> : <Copy size={12} />} {copiedPw ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div>
            <FL>Set New Password</FL>
            <div style={{ position: 'relative' }}>
              <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => { setNewPassword(e.target.value); setError('') }}
                placeholder="Minimum 6 characters"
                style={{ width: '100%', padding: '9px 38px 9px 12px', border: `1px solid ${error ? '#dc2626' : '#e5e7eb'}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              <button onClick={() => setShowNew(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                {showNew ? <EyeOff size={15} /> : <EyeIcon size={15} />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div style={{ marginTop: 6 }}>
                <div style={{ height: 4, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: SW[strength], background: SC[strength], borderRadius: 4, transition: 'all .3s' }} />
                </div>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: SC[strength], fontWeight: 600 }}>{strength} password</p>
              </div>
            )}
          </div>
          {error   && <p style={{ margin: 0, fontSize: 12, color: '#dc2626', fontWeight: 600, background: '#fee2e2', padding: '8px 12px', borderRadius: 8, border: '1px solid #fecaca' }}>⚠ {error}</p>}
          {success && <p style={{ margin: 0, fontSize: 12, color: '#16a34a', fontWeight: 600, background: '#dcfce7', padding: '8px 12px', borderRadius: 8, border: '1px solid #bbf7d0' }}>✓ {success}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '14px 22px', borderTop: '1px solid #f3f4f6', background: '#f9fafb', borderRadius: '0 0 14px 14px' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Close</button>
          <button onClick={handleReset} disabled={saving || !newPassword}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: saving || !newPassword ? '#94a3b8' : '#d97706', fontSize: 13, fontWeight: 600, cursor: saving || !newPassword ? 'not-allowed' : 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={13} /> {saving ? 'Saving…' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Delete Confirm Modal
───────────────────────────────────────── */
const DeleteModal = ({ user, onClose, onConfirm, loading }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 400, padding: '28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle size={20} color="#dc2626" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Delete User?</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>This action cannot be undone.</p>
        </div>
      </div>
      <p style={{ fontSize: 13, color: '#374151', margin: '0 0 20px' }}>
        Are you sure you want to delete <strong>{user?.name}</strong>?
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: loading ? '#94a3b8' : '#dc2626', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', color: '#fff' }}>
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
)

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const PER_PAGE = 10

export default function StaffUsers() {
  const navigate = useNavigate()

  /* list state */
  const [users, setUsers]       = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [page, setPage]         = useState(1)
  const [stats, setStats]       = useState({ total: 0, active: 0, inactive: 0, loginEnabled: 0 })
  const [availableRoles, setAvailableRoles] = useState([]) // dynamic from API

  /* filters */
  const [search, setSearch]           = useState('')
  const [draftSearch, setDraftSearch] = useState('')
  const [roleFilter, setRoleFilter]   = useState('All')
  const [accessFilter, setAccessFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  /* modals */
  const [addModal, setAddModal]     = useState(false)
  const [editUser, setEditUser]     = useState(null)
  const [credsUser, setCredsUser]   = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  /* ── fetch paginated list ── */
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: PER_PAGE })
      if (search)               params.append('search', search)
      if (roleFilter !== 'All') params.append('role', roleFilter)
      if (accessFilter !== 'All') params.append('isActive', accessFilter === 'Active' ? 'true' : 'false')

      const res  = await api.get(`users?${params}`)
      const data = res.data?.data
      setUsers(data?.users || [])
      setTotal(data?.total || 0)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, accessFilter])

  /* ── fetch stats (all users, no pagination) ── */
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('users?limit=1000')
      const data = res.data?.data
      const all  = data?.users || []
      const realTotal = data?.total || all.length
      // Extract unique roles dynamically from actual user data
      const roles = [...new Set(all.map(u => u.role).filter(Boolean))].sort()
      setAvailableRoles(roles)
      setStats({
        total:        realTotal,
        active:       all.filter(u => u.isActive !== false).length,
        inactive:     all.filter(u => u.isActive === false).length,
        loginEnabled: all.filter(u => u.isActive !== false).length,
      })
    } catch { /* silently ignore */ }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { fetchStats()  }, [fetchStats])

  /* refresh both after any mutation */
  const refreshAll = useCallback(() => { fetchUsers(); fetchStats() }, [fetchUsers, fetchStats])

  /* ── toggle status ── */
  const handleToggle = async (user) => {
    try {
      await api.patch(`users/${user._id}/toggle`)
      refreshAll()
    } catch { toast.error('Status update failed') }
  }

  /* ── delete ── */
  const confirmDelete = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`users/${deleteUser._id}`)
      toast.success('User deleted')
      setDeleteUser(null)
      refreshAll()
    } catch { toast.error('Delete failed') }
    finally { setDeleteLoading(false) }
  }

  /* ── export helpers ── */
  const exportCSV = () => {
    const headers = ['SR', 'Full Name', 'User ID', 'Role', 'Contact', 'Email', 'Status', 'Last Login']
    const rows = users.map((u, i) => [
      i + 1, u.name, u.userId, u.role, u.phone || '', u.email || '',
      u.isActive ? 'Active' : 'Inactive',
      u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : '—',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click()
  }

  const handlePrint = () => window.print()

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  /* ── filtered display count ── */
  const displayedFrom = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const displayedTo   = Math.min(page * PER_PAGE, total)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Modals */}
      {(addModal || editUser) && (
        <StaffModal staff={editUser} onClose={() => { setAddModal(false); setEditUser(null) }} onSaved={refreshAll} availableRoles={availableRoles} />
      )}
      {credsUser  && <CredentialsModal user={credsUser}  onClose={() => setCredsUser(null)} />}
      {deleteUser && <DeleteModal user={deleteUser} onClose={() => setDeleteUser(null)} onConfirm={confirmDelete} loading={deleteLoading} />}

      {/* ── Page Header ── */}
      <PageHeader icon={UserCheck} title="Staff & Users" subtitle="Manage franchise team members and their access" color="#0c3b73">
        <button onClick={() => navigate('/franchise/staff/menu-access')}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#0c3b73', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <ShieldCheck size={14} /> Menu Access
        </button>
        <button onClick={() => { setEditUser(null); setAddModal(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, border: 'none', background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Add User
        </button>
      </PageHeader>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Users',    value: stats.total,        color: '#0c3b73', bg: '#e0e7ff', icon: UserCheck },
          { label: 'Active Users',   value: stats.active,       color: '#16a34a', bg: '#dcfce7', icon: UserCheck },
          { label: 'Inactive Users', value: stats.inactive,     color: '#dc2626', bg: '#fee2e2', icon: UserCheck },
          { label: 'Login Enabled',  value: stats.loginEnabled, color: '#7c3aed', bg: '#f5f3ff', icon: ShieldCheck },
        ].map(card => {
          const CardIcon = card.icon
          return (
            <div key={card.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CardIcon size={20} color={card.color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Filter bar ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={draftSearch}
            onChange={e => setDraftSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setSearch(draftSearch); setPage(1) } }}
            placeholder="Search users..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#f9fafb' }} />
        </div>

        {/* Role */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Role</span>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
            style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', cursor: 'pointer', minWidth: 120 }}>
            <option value="All">All</option>
            {availableRoles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Login Access */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Login Access</span>
          <select value={accessFilter} onChange={e => { setAccessFilter(e.target.value); setPage(1) }}
            style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', cursor: 'pointer', minWidth: 110 }}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Status (same as login access for now) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Status</span>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', cursor: 'pointer', minWidth: 110 }}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Reset */}
        <button onClick={() => { setDraftSearch(''); setSearch(''); setRoleFilter('All'); setAccessFilter('All'); setStatusFilter('All'); setPage(1) }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 7, background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
          <RefreshCw size={12} /> Reset
        </button>

        {/* Export buttons */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={exportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 7, border: 'none', background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <FileText size={13} /> Excel
          </button>
          <button onClick={exportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 7, border: 'none', background: '#0891b2', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Download size={13} /> CSV
          </button>
          <button onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 7, border: 'none', background: '#6b7280', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Printer size={13} /> Print
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>

        {/* Count header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserCheck size={16} color="#d97706" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>All Users ({total})</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['SR NO', 'FULL NAME', 'USER ID', 'ROLE', 'CONTACT', 'EMAIL', 'LOGIN ACCESS', 'STATUS', 'LAST LOGIN', 'ACTIONS'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>Loading users…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No users found</td></tr>
              ) : users.map((u, i) => {
                const cfg = ROLE_COLORS[u.role] || { color: '#6b7280', bg: '#f3f4f6' }
                return (
                  <tr key={u._id}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>

                    {/* SR */}
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>
                      {(page - 1) * PER_PAGE + i + 1}
                    </td>

                    {/* Full Name */}
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
                          {(u.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{u.name}</span>
                      </div>
                    </td>

                    {/* User ID */}
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280', fontFamily: 'monospace', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>
                      {u.userId}
                    </td>

                    {/* Role */}
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#374151', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>
                      {u.phone || '—'}
                    </td>

                    {/* Email */}
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#374151', borderBottom: '1px solid #f3f4f6', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email || '—'}
                    </td>

                    {/* Login Access toggle */}
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }} onClick={e => e.stopPropagation()}>
                      <Switch checked={u.isActive !== false} onChange={() => handleToggle(u)} size="default" />
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                      {u.isActive !== false
                        ? <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>Active</span>
                        : <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>Inactive</span>}
                    </td>

                    {/* Last Login */}
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {/* Password/Credentials */}
                        <button onClick={() => setCredsUser(u)} title="View / Reset Password"
                          style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #fde68a', background: '#fef3c7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                          <Lock size={13} />
                        </button>
                        {/* Edit */}
                        <button onClick={() => setEditUser(u)} title="Edit User"
                          style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {total === 0 ? 'No users' : `Showing ${displayedFrom}–${displayedTo} of ${total} users`}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 9px', cursor: page === 1 ? 'default' : 'pointer', background: 'none', color: page === 1 ? '#d1d5db' : '#374151' }}>
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
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
