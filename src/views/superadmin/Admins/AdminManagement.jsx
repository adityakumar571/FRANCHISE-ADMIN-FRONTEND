/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import {
  Users, Plus, Search, Eye, Edit2, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, X, Check, Shield,
  Clock, Mail, Phone, UserCheck, UserX, AlertCircle, Trash2, RefreshCw, Save,
} from 'lucide-react'
import { getRequest, postRequest, putRequest, deleteRequest, patchRequest } from '../../../Helpers/index'
import toast from 'react-hot-toast'

/* ─── Palette ── */
const C = {
  primary: '#0c3b73', accent: '#fabf22', success: '#16a34a',
  danger: '#dc2626', border: '#e5e7eb', bg: '#f8f9fb',
}

const inputStyle = {
  border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px',
  fontSize: 13, color: '#374151', outline: 'none', background: '#fff',
  fontFamily: 'Inter, -apple-system, sans-serif', width: '100%', boxSizing: 'border-box',
}
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }

const StatusBadge = ({ active }) => {
  const s = active
    ? { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Active' }
    : { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb', label: 'Inactive' }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>
  )
}

const RoleBadge = ({ role }) => {
  const isSA = role === 'SuperAdmin'
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
      background: isSA ? '#eff6ff' : '#faf5ff',
      color: isSA ? '#1d4ed8' : '#7c3aed',
      border: `1px solid ${isSA ? '#bfdbfe' : '#e9d5ff'}` }}>
      {role}
    </span>
  )
}

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
    padding: '16px 20px', flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 44, height: 44, borderRadius: 11, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>{value}</p>
      <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0', fontWeight: 500 }}>{label}</p>
    </div>
  </div>
)

const EMPTY_FORM = { name: '', email: '', phone: '', gender: '', role: 'Admin' }

export default function AdminManagement() {
  const [admins, setAdmins]             = useState([])
  const [total, setTotal]               = useState(0)
  const [loading, setLoading]           = useState(false)
  const [search, setSearch]             = useState('')
  const [draftSearch, setDraftSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [roleFilter, setRoleFilter]     = useState('All')
  const [page, setPage]                 = useState(1)
  const PER_PAGE = 10

  const [showModal, setShowModal]     = useState(false)
  const [editAdmin, setEditAdmin]     = useState(null)   // null = create, obj = edit
  const [form, setForm]               = useState(EMPTY_FORM)
  const [submitting, setSubmitting]   = useState(false)

  // Credentials popup after create
  const [credsPopup, setCredsPopup] = useState(null)  // { userId, password }

  /* ── Fetch admins ── */
  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: PER_PAGE })
      if (search)                        params.append('search', search)
      if (statusFilter !== 'All')        params.append('isActive', statusFilter === 'Active' ? 'true' : 'false')
      if (roleFilter   !== 'All')        params.append('role', roleFilter)

      const res  = await getRequest(`admins?${params.toString()}`)
      const data = res?.data?.data
      setAdmins(data?.data || [])
      setTotal(data?.total || 0)
    } catch (err) {
      console.error('[AdminManagement] fetch error:', err)
      toast.error('Failed to load admins')
      setAdmins([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, roleFilter])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])

  /* ── Derived stats from full list ── */
  const activeCount   = admins.filter(a => a.isActive).length
  const inactiveCount = admins.filter(a => !a.isActive).length

  /* ── Toggle status ── */
  const handleToggle = async (id) => {
    try {
      await patchRequest({ url: `admins/${id}/toggle`, cred: {} })
      toast.success('Status updated')
      fetchAdmins()
    } catch { toast.error('Failed to update status') }
  }

  /* ── Delete ── */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete admin "${name}"? This cannot be undone.`)) return
    try {
      await deleteRequest(`admins/${id}`)
      toast.success('Admin deleted')
      fetchAdmins()
    } catch { toast.error('Failed to delete admin') }
  }

  /* ── Open create modal ── */
  const openCreate = () => {
    setEditAdmin(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  /* ── Open edit modal ── */
  const openEdit = (admin) => {
    setEditAdmin(admin)
    setForm({
      name:   admin.name   || '',
      email:  admin.email  || '',
      phone:  admin.phone  || '',
      gender: admin.gender || '',
      role:   admin.role   || 'Admin',
    })
    setShowModal(true)
  }

  /* ── Submit (create or update) ── */
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    setSubmitting(true)
    try {
      if (editAdmin) {
        // Update
        await putRequest({ url: `admins/${editAdmin._id}`, cred: form })
        toast.success('Admin updated successfully')
        setShowModal(false)
        fetchAdmins()
      } else {
        // Create
        const res  = await postRequest({ url: 'admins/create', cred: form })
        const data = res?.data?.data
        toast.success('Admin created! Credentials shown below.')
        setShowModal(false)
        setForm(EMPTY_FORM)
        fetchAdmins()
        // Show credentials popup
        if (data?.credentials) setCredsPopup(data.credentials)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13, background: C.bg, minHeight: '100vh', padding: 4 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: C.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color={C.accent} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Admin Management</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Create and manage admin accounts</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchAdmins}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff',
              border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 14px',
              fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: '#fff',
              border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={15} /> Create Admin
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <StatCard icon={Users}       label="Total Admins" value={total}         color={C.primary} bg="#eff6ff" />
        <StatCard icon={UserCheck}   label="Active"       value={activeCount}   color={C.success} bg="#f0fdf4" />
        <StatCard icon={UserX}       label="Inactive"     value={inactiveCount} color="#6b7280"   bg="#f9fafb" />
        <StatCard icon={AlertCircle} label="Per Page"     value={PER_PAGE}      color="#d97706"   bg="#fffbeb" />
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10,
        padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={draftSearch}
            onChange={e => setDraftSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setSearch(draftSearch); setPage(1) } }}
            onBlur={() => { if (draftSearch !== search) { setSearch(draftSearch); setPage(1) } }}
            placeholder="Search by name, email, ID… (Enter)"
            style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ ...inputStyle, width: 'auto', minWidth: 130, cursor: 'pointer' }}>
          {['All', 'Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          style={{ ...inputStyle, width: 'auto', minWidth: 150, cursor: 'pointer' }}>
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="SuperAdmin">SuperAdmin</option>
        </select>
        {(search || statusFilter !== 'All' || roleFilter !== 'All') && (
          <button onClick={() => { setDraftSearch(''); setSearch(''); setStatusFilter('All'); setRoleFilter('All'); setPage(1) }}
            style={{ fontSize: 12, color: C.danger, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Clear filters
          </button>
        )}
      </div>

      {/* ── TABLE ── */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['#', 'User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, color: '#6b7280', fontWeight: 700,
                    textTransform: 'uppercase', textAlign: 'left', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                  <RefreshCw size={18} style={{ display: 'inline-block', marginRight: 8, animation: 'spin 1s linear infinite' }} />
                  Loading admins…
                </td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                  No admins found.
                </td></tr>
              ) : admins.map((a, i) => (
                <tr key={a._id}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8f9fb'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                  style={{ borderBottom: '1px solid #f3f4f6', transition: 'background .1s' }}>
                  <td style={{ padding: '11px 14px', fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
                    {(page - 1) * PER_PAGE + i + 1}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, fontFamily: 'monospace' }}>
                    {a.userId}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${C.primary}12`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Users size={14} color={C.primary} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{a.name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Mail size={11} color="#9ca3af" />
                      <span style={{ fontSize: 12, color: '#374151' }}>{a.email || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Phone size={11} color="#9ca3af" />
                      <span style={{ fontSize: 12, color: '#374151' }}>{a.phone || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}><RoleBadge role={a.role} /></td>
                  <td style={{ padding: '11px 14px' }}><StatusBadge active={a.isActive} /></td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} color="#9ca3af" />
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        {a.lastLogin ? new Date(a.lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {/* Edit */}
                      <button onClick={() => openEdit(a)}
                        title="Edit"
                        style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.border}`,
                          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Edit2 size={13} color="#6b7280" />
                      </button>
                      {/* Toggle */}
                      <button onClick={() => handleToggle(a._id)}
                        title={a.isActive ? 'Deactivate' : 'Activate'}
                        style={{ width: 28, height: 28, borderRadius: 7, border: 'none',
                          background: a.isActive ? '#fef2f2' : '#f0fdf4',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {a.isActive
                          ? <ToggleRight size={15} color={C.success} />
                          : <ToggleLeft  size={15} color="#9ca3af" />}
                      </button>
                      {/* Delete */}
                      <button onClick={() => handleDelete(a._id, a.name)}
                        title="Delete"
                        style={{ width: 28, height: 28, borderRadius: 7, border: 'none',
                          background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={13} color={C.danger} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderTop: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {total > 0
              ? `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, total)} of ${total} admins`
              : '0 admins'}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, page - 2)
              const n = start + i
              if (n > totalPages) return null
              return (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: 30, height: 30, borderRadius: 7,
                    border: `1px solid ${n === page ? C.primary : C.border}`,
                    background: n === page ? C.primary : '#fff',
                    color: n === page ? '#fff' : '#374151',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{n}</button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
              style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                opacity: (page === totalPages || totalPages === 0) ? 0.4 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          CREATE / EDIT ADMIN MODAL
      ═══════════════════════════════════════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: C.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editAdmin ? <Edit2 size={16} color="#fff" /> : <Plus size={16} color="#fff" />}
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>
                    {editAdmin ? 'Edit Admin' : 'Create Admin'}
                  </h2>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                    {editAdmin ? `Editing ${editAdmin.name}` : 'Fill details to create a new admin account'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`,
                  background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={15} color="#6b7280" />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Rajesh Kumar" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Email Address *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="admin@example.com" style={inputStyle}
                    disabled={!!editAdmin} />
                  {editAdmin && <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>Email cannot be changed after creation</p>}
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="9876543210" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Role *</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }} disabled={!!editAdmin}>
                    <option value="Admin">Admin</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                  </select>
                  {!editAdmin && (
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>
                      Password will be auto-generated and shown after creation
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowModal(false)}
                  style={{ padding: '9px 20px', borderRadius: 8, border: `1px solid ${C.border}`,
                    background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 8,
                    border: 'none', background: submitting ? '#6fa3d0' : C.primary,
                    color: '#fff', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  <Save size={14} />
                  {submitting ? 'Saving…' : editAdmin ? 'Save Changes' : 'Create Admin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          CREDENTIALS POPUP (after create)
      ═══════════════════════════════════════ */}
      {credsPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 420,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ background: C.primary, padding: '20px', textAlign: 'center' }}>
              <Check size={36} color={C.accent} style={{ marginBottom: 8 }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Admin Created Successfully!</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
                Save these credentials — they won&apos;t be shown again
              </p>
            </div>
            <div style={{ padding: '24px 24px 20px' }}>
              <div style={{ background: '#f8f9fb', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>User ID</label>
                  <p style={{ fontSize: 16, fontWeight: 800, color: C.primary, margin: '4px 0 0', fontFamily: 'monospace' }}>{credsPopup.userId}</p>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
                  <p style={{ fontSize: 16, fontWeight: 800, color: C.danger, margin: '4px 0 0', fontFamily: 'monospace' }}>{credsPopup.password}</p>
                </div>
              </div>
              <button onClick={() => setCredsPopup(null)}
                style={{ width: '100%', padding: '11px 0', background: C.primary, border: 'none',
                  borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                I&apos;ve saved the credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
