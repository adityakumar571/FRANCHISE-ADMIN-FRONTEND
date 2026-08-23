/* eslint-disable prettier/prettier */
/**
 * Staff & Users — Franchise Staff Management
 * Matches the design shown in the screenshot exactly
 */
import { useState } from 'react'
import {
  UserCheck, Plus, Eye, Edit2, Search,
  Shield, UserCog, User, X, Save, ChevronLeft, ChevronRight,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

/* ── Constants ── */
const ROLES = ['Franchise Owner', 'Branch Manager', 'Pharmacist', 'Cashier']

const ROLE_COLORS = {
  'Franchise Owner': { color: '#7c3aed', bg: '#f5f3ff', border: '#e9d5ff' },
  'Branch Manager':  { color: '#0891b2', bg: '#e0f2fe', border: '#bae6fd' },
  'Pharmacist':      { color: '#0c3b73', bg: '#e0e7ff', border: '#c7d2fe' },
  'Cashier':         { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
}

const ROLE_ICONS = {
  'Franchise Owner': Shield,
  'Branch Manager':  UserCog,
  'Pharmacist':      User,
  'Cashier':         User,
}

const PERMISSIONS = {
  'Franchise Owner': ['Dashboard', 'Sales/POS', 'Purchase', 'Inventory', 'Medicines', 'Suppliers', 'B2B Orders', 'Customers', 'Staff', 'Reports', 'Settings'],
  'Branch Manager':  ['Dashboard', 'Purchase', 'Inventory', 'Medicines', 'Suppliers', 'Reports'],
  'Pharmacist':      ['Dashboard', 'Medicines', 'Inventory', 'Sales/POS'],
  'Cashier':         ['Dashboard', 'Sales/POS', 'Customers'],
}

const INIT_STAFF = [
  { id: 'U-001', name: 'Ajay Sharma',  phone: '9876543201', email: 'ajay@pharma.com',   role: 'Franchise Owner', status: 'Active',   lastLogin: '22 Aug 2026, 9:00 AM',  joined: '01 Jan 2025' },
  { id: 'U-002', name: 'Sunita Rao',   phone: '9812340001', email: 'sunita@pharma.com', role: 'Branch Manager',  status: 'Active',   lastLogin: '22 Aug 2026, 8:45 AM',  joined: '10 Mar 2025' },
  { id: 'U-003', name: 'Amit Kumar',   phone: '9988001122', email: 'amit@pharma.com',   role: 'Pharmacist',      status: 'Active',   lastLogin: '22 Aug 2026, 9:15 AM',  joined: '15 Apr 2025' },
  { id: 'U-004', name: 'Neha Gupta',   phone: '8877001122', email: 'neha@pharma.com',   role: 'Cashier',         status: 'Active',   lastLogin: '22 Aug 2026, 9:30 AM',  joined: '01 Jun 2025' },
  { id: 'U-005', name: 'Ravi Singh',   phone: '7766001122', email: 'ravi@pharma.com',   role: 'Pharmacist',      status: 'Inactive', lastLogin: '10 Aug 2026, 6:00 PM',  joined: '20 Feb 2025' },
]

const EMPTY_FORM = { name: '', phone: '', email: '', role: 'Cashier', password: '' }

/* ── Small helpers ── */
const RoleBadge = ({ role }) => {
  const cfg = ROLE_COLORS[role] || { color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' }
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap' }}>
      {role}
    </span>
  )
}

const StatusBadge = ({ status }) =>
  status === 'Active'
    ? <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>Active</span>
    : <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>Inactive</span>

const Field = ({ label, children }) => (
  <div>
    <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
    {children}
  </div>
)

const Input = ({ value, onChange, placeholder, type = 'text' }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#111827' }}
    onFocus={e => e.target.style.borderColor = '#0c3b73'}
    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
  />
)

/* ── Add / Edit Modal ── */
const StaffModal = ({ staff, onClose, onSave }) => {
  const [form, setForm] = useState(staff ? { ...staff } : { ...EMPTY_FORM })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) { alert('Name and phone are required'); return }
    onSave(form)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={15} color="#6b7280" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Full Name *">
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Staff full name" />
            </Field>
            <Field label="Phone Number *">
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit mobile" />
            </Field>
            <Field label="Email Address">
              <Input value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" type="email" />
            </Field>
            <Field label="Role *">
              <select value={form.role} onChange={e => set('role', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer', color: '#111827' }}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </div>

          {!staff && (
            <Field label="Password *">
              <Input value={form.password} onChange={e => set('password', e.target.value)} placeholder="Set login password" type="password" />
            </Field>
          )}

          {/* Permissions Preview */}
          <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e0e7ff' }}>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={13} color="#0c3b73" /> Access Permissions — {form.role}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(PERMISSIONS[form.role] || []).map(p => (
                <span key={p} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: '#0c3b7318', color: '#0c3b73', fontWeight: 600 }}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '14px 22px', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={13} /> {staff ? 'Update Staff' : 'Add Staff'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── View Detail Modal ── */
const ViewModal = ({ staff, onClose, onEdit }) => {
  if (!staff) return null
  const cfg    = ROLE_COLORS[staff.role] || { color: '#6b7280', bg: '#f3f4f6' }
  const Icon   = ROLE_ICONS[staff.role] || User
  const perms  = PERMISSIONS[staff.role] || []

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 540, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={22} color={cfg.color} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{staff.name}</h3>
              <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{staff.role}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={15} color="#6b7280" />
          </button>
        </div>

        {/* Details Grid */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['Staff ID',   staff.id],
              ['Phone',      staff.phone],
              ['Email',      staff.email || '—'],
              ['Joined',     staff.joined],
              ['Last Login', staff.lastLogin],
              ['Status',     staff.status],
            ].map(([label, val]) => (
              <div key={label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{label}</p>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: '#111827', fontWeight: 600 }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Module Access */}
          <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e0e7ff' }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#374151' }}>Module Access</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {perms.map(p => (
                <span key={p} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, background: '#0c3b7318', color: '#0c3b73', fontWeight: 600 }}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '14px 22px', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Close</button>
          <button onClick={() => { onClose(); onEdit(staff) }} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Edit2 size={13} /> Edit Staff
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function StaffUsers() {
  const [data, setData]         = useState(INIT_STAFF)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [page, setPage]         = useState(1)
  const [perPage]               = useState(20)
  const [showAdd, setShowAdd]   = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [viewItem, setViewItem] = useState(null)

  const filtered = data.filter(s =>
    (roleFilter === 'All' || s.role === roleFilter) &&
    (search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.id.toLowerCase().includes(search.toLowerCase()))
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged      = filtered.slice((page - 1) * perPage, page * perPage)

  const handleSave = form => {
    if (editItem) {
      setData(p => p.map(s => s.id === form.id ? form : s))
    } else {
      const newId = `U-${String(data.length + 1).padStart(3, '0')}`
      setData(p => [...p, { ...form, id: newId, lastLogin: '—', joined: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }])
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Modals */}
      {(showAdd || editItem) && (
        <StaffModal
          staff={editItem}
          onClose={() => { setShowAdd(false); setEditItem(null) }}
          onSave={handleSave}
        />
      )}
      {viewItem && (
        <ViewModal
          staff={viewItem}
          onClose={() => setViewItem(null)}
          onEdit={s => { setViewItem(null); setEditItem(s) }}
        />
      )}

      {/* Page Header */}
      <PageHeader icon={UserCheck} title="Staff & Users" subtitle="Manage franchise team members and their access" color="#7c3aed">
        <button onClick={() => { setEditItem(null); setShowAdd(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> + Add Staff
        </button>
      </PageHeader>

      {/* Role Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12 }}>
        {ROLES.map(role => {
          const count = data.filter(s => s.role === role).length
          const cfg   = ROLE_COLORS[role]
          const Icon  = ROLE_ICONS[role] || User
          return (
            <div key={role} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
              onClick={() => setRoleFilter(role === roleFilter ? 'All' : role)}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={cfg.color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{role}</p>
                <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 700, color: cfg.color }}>{count}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search + Role Filter */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search staff by name..."
            style={{ width: '100%', padding: '9px 12px 9px 33px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', ...ROLES].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1) }}
              style={{
                padding: '8px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                borderColor: roleFilter === r ? '#0c3b73' : '#e5e7eb',
                background:  roleFilter === r ? '#0c3b73' : '#fff',
                color:       roleFilter === r ? '#fff'    : '#374151',
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['ID', 'Staff', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', fontSize: 12, color: '#6b7280', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                    No staff found
                  </td>
                </tr>
              ) : paged.map(s => {
                const cfg  = ROLE_COLORS[s.role] || { color: '#6b7280', bg: '#f3f4f6' }
                const Icon = ROLE_ICONS[s.role] || User
                return (
                  <tr key={s.id}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>

                    {/* ID */}
                    <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280', fontFamily: 'monospace', borderBottom: '1px solid #f3f4f6' }}>
                      {s.id}
                    </td>

                    {/* Staff Name + Phone */}
                    <td style={{ padding: '13px 16px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={17} color={cfg.color} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.name}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>{s.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '13px 16px', borderBottom: '1px solid #f3f4f6' }}>
                      <RoleBadge role={s.role} />
                    </td>

                    {/* Last Login */}
                    <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>
                      {s.lastLogin}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '13px 16px', borderBottom: '1px solid #f3f4f6' }}>
                      <StatusBadge status={s.status} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '13px 16px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={() => setViewItem(s)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 7, background: '#f9fafb', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151' }}>
                          <Eye size={13} /> View
                        </button>
                        <button onClick={() => setEditItem(s)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: '1px solid #e5e7eb', borderRadius: 7, background: '#f9fafb', cursor: 'pointer', color: '#6b7280' }}>
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

        {/* Pagination Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page === 1 ? 'default' : 'pointer', background: 'none', color: page === 1 ? '#d1d5db' : '#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ background: page === p ? '#0c3b73' : 'none', border: `1px solid ${page === p ? '#0c3b73' : '#e5e7eb'}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: page === p ? '#fff' : '#374151', fontSize: 12, fontWeight: page === p ? 700 : 400, minWidth: 32 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page === totalPages ? 'default' : 'pointer', background: 'none', color: page === totalPages ? '#d1d5db' : '#374151' }}>
              <ChevronRight size={14} />
            </button>
            <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{perPage} / page</span>
          </div>
        </div>
      </div>
    </div>
  )
}
