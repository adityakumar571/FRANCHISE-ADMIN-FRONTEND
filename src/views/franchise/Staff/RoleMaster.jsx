/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Shield, Plus, Edit2, Trash2, X, Save, RefreshCw, AlertTriangle, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'

/* ── API Setup ── */
const BASE_URL     = import.meta.env.VITE_API_BASE_URL
const getSubdomain = () => localStorage.getItem('franchise_subdomain') || import.meta.env.VITE_TENANT_ID || ''
const getToken     = () => Cookies.get('LMS') || ''
const api = axios.create({ baseURL: BASE_URL })
api.interceptors.request.use(cfg => {
  cfg.headers['Authorization'] = `Bearer ${getToken()}`
  cfg.headers['x-tenant-id']   = getSubdomain()
  return cfg
})

/* ── Color options ── */
const COLOR_OPTIONS = [
  '#7c3aed','#0c3b73','#0891b2','#16a34a',
  '#d97706','#dc2626','#9333ea','#ea580c',
  '#0369a1','#4f46e5','#be185d','#065f46',
]

/* ══════════════════════════════════════════
   ADD / EDIT MODAL
══════════════════════════════════════════ */
const RoleModal = ({ role, onClose, onSaved }) => {
  const isEdit = !!role
  const [form, setForm] = useState({
    name:        role?.name        || '',
    description: role?.description || '',
    color:       role?.color       || '#0c3b73',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Role name is required'); return }
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`roles/${role._id}`, form)
        toast.success('Role updated')
      } else {
        await api.post('roles', form)
        toast.success('Role created')
      }
      onSaved(); onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{isEdit ? 'Edit Role' : 'Add New Role'}</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Role Name * {isEdit && role?.isSystem && <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(system — locked)</span>}
            </label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Pharmacist" disabled={isEdit && role?.isSystem}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: isEdit && role?.isSystem ? '#f9fafb' : '#fff' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Short description of this role"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Badge Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {COLOR_OPTIONS.map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #111827' : '3px solid transparent', cursor: 'pointer', outline: 'none', boxSizing: 'border-box' }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Preview:</span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: form.color + '18', color: form.color, border: `1px solid ${form.color}40` }}>
                {form.name || 'Role Name'}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '14px 22px', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: saving ? '#94a3b8' : '#0c3b73', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={13} /> {saving ? 'Saving…' : isEdit ? 'Update' : 'Add Role'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   DELETE MODAL
══════════════════════════════════════════ */
const DeleteModal = ({ role, onClose, onConfirm, loading }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 380, padding: '28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertTriangle size={20} color="#dc2626" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Delete Role?</h3>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>This cannot be undone.</p>
        </div>
      </div>
      <p style={{ fontSize: 13, color: '#374151', margin: '0 0 20px' }}>
        Delete role <strong style={{ color: role?.color }}>{role?.name}</strong>? Users with this role must be reassigned first.
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

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function RoleMaster() {
  const [roles, setRoles]         = useState([])
  const [loading, setLoading]     = useState(false)
  const [search, setSearch]       = useState('')
  const [addModal, setAddModal]   = useState(false)
  const [editRole, setEditRole]   = useState(null)
  const [deleteRole, setDeleteRole] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [meta, setMeta] = useState({ maxCustomRoles: 10, customCount: 0, canAddMore: true })

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await api.get('roles')
      const data = res.data?.data
      setRoles(data?.roles || [])
      setMeta({
        maxCustomRoles: data?.maxCustomRoles || 10,
        customCount:    data?.customCount    || 0,
        canAddMore:     data?.canAddMore     !== false,
      })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load roles')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const confirmDelete = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`roles/${deleteRole._id}`)
      toast.success('Role deleted')
      setDeleteRole(null)
      fetchRoles()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    } finally { setDeleteLoading(false) }
  }

  const filtered = roles.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) || (r.description||'').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Modals */}
      {(addModal || editRole) && <RoleModal role={editRole} onClose={() => { setAddModal(false); setEditRole(null) }} onSaved={fetchRoles} />}
      {deleteRole && <DeleteModal role={deleteRole} onClose={() => setDeleteRole(null)} onConfirm={confirmDelete} loading={deleteLoading} />}

      {/* Header */}
      <PageHeader icon={Shield} title="Role Master" subtitle={`Manage staff roles · ${meta.customCount}/${meta.maxCustomRoles} custom roles used`} color="#7c3aed">
        <button onClick={fetchRoles} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
          <RefreshCw size={13} /> Refresh
        </button>
        <button onClick={() => { setEditRole(null); setAddModal(true) }} disabled={!meta.canAddMore}
          title={!meta.canAddMore ? `Max ${meta.maxCustomRoles} custom roles reached` : ''}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, border: 'none', background: meta.canAddMore ? '#7c3aed' : '#94a3b8', color: '#fff', fontSize: 13, fontWeight: 600, cursor: meta.canAddMore ? 'pointer' : 'not-allowed' }}>
          <Plus size={14} /> Add Role
        </button>
      </PageHeader>

      {/* Table Card */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="#7c3aed" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>All Roles ({filtered.length})</span>
            {/* Limit dots */}
            <div style={{ display: 'flex', gap: 3, marginLeft: 8 }}>
              {Array.from({ length: meta.maxCustomRoles }, (_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i < meta.customCount ? '#7c3aed' : '#e5e7eb' }} />
              ))}
              <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 4 }}>{meta.customCount}/{meta.maxCustomRoles} custom</span>
            </div>
          </div>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: 220 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles…"
              style={{ width: '100%', padding: '7px 10px 7px 30px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box', background: '#f9fafb' }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Sr.', 'Role Name', 'Badge', 'Description', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 11, color: '#6b7280', fontWeight: 700, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading roles…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No roles found</td></tr>
              ) : filtered.map((role, i) => (
                <tr key={role._id}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>

                  {/* Sr */}
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>{i + 1}</td>

                  {/* Name */}
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: role.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Shield size={15} color={role.color} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{role.name}</span>
                    </div>
                  </td>

                  {/* Badge preview */}
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: role.color + '18', color: role.color, border: `1px solid ${role.color}30`, whiteSpace: 'nowrap' }}>
                      {role.name}
                    </span>
                  </td>

                  {/* Description */}
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6', maxWidth: 220 }}>
                    {role.description || <span style={{ color: '#d1d5db' }}>—</span>}
                  </td>

                  {/* Type */}
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    {role.isSystem
                      ? <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>System</span>
                      : <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: '#eff6ff', color: '#0c3b73', border: '1px solid #bfdbfe' }}>Custom</span>
                    }
                  </td>

                  {/* Status */}
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: role.isActive !== false ? '#dcfce7' : '#fee2e2', color: role.isActive !== false ? '#16a34a' : '#dc2626', border: `1px solid ${role.isActive !== false ? '#bbf7d0' : '#fecaca'}` }}>
                      {role.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setEditRole(role)} title="Edit"
                        style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                        <Edit2 size={13} />
                      </button>
                      {!role.isSystem && (
                        <button onClick={() => setDeleteRole(role)} title="Delete"
                          style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #fecaca', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 18px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {roles.length} roles</span>
        </div>
      </div>
    </div>
  )
}
