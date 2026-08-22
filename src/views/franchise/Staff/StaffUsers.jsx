/* eslint-disable prettier/prettier */
/**
 * StaffUsers — Franchise Staff & User Management
 * Manage franchise staff accounts, roles and permissions
 */
import { useState } from 'react'
import { UserCheck, Plus, Eye, Edit2, Search, Shield, UserCog, User, Key } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

const ROLES = ['Franchise Owner', 'Branch Manager', 'Pharmacist', 'Cashier']

const MOCK_STAFF = [
  { id: 'U-001', name: 'Ajay Sharma', phone: '9876543201', email: 'ajay@pharma.com', role: 'Franchise Owner', status: 'Active', lastLogin: '22 Aug 2026, 9:00 AM', joined: '01 Jan 2025' },
  { id: 'U-002', name: 'Sunita Rao', phone: '9812340001', email: 'sunita@pharma.com', role: 'Branch Manager', status: 'Active', lastLogin: '22 Aug 2026, 8:45 AM', joined: '10 Mar 2025' },
  { id: 'U-003', name: 'Amit Kumar', phone: '9988001122', email: 'amit@pharma.com', role: 'Pharmacist', status: 'Active', lastLogin: '22 Aug 2026, 9:15 AM', joined: '15 Apr 2025' },
  { id: 'U-004', name: 'Neha Gupta', phone: '8877001122', email: 'neha@pharma.com', role: 'Cashier', status: 'Active', lastLogin: '22 Aug 2026, 9:30 AM', joined: '01 Jun 2025' },
  { id: 'U-005', name: 'Ravi Singh', phone: '7766001122', email: 'ravi@pharma.com', role: 'Pharmacist', status: 'Inactive', lastLogin: '10 Aug 2026, 6:00 PM', joined: '20 Feb 2025' },
]

const roleColors = {
  'Franchise Owner': '#0c3b73',
  'Branch Manager': '#7c3aed',
  'Pharmacist': '#0891b2',
  'Cashier': '#16a34a',
}

const roleIcons = {
  'Franchise Owner': Shield,
  'Branch Manager': UserCog,
  'Pharmacist': User,
  'Cashier': User,
}

const PERMISSIONS = {
  'Franchise Owner': ['Dashboard', 'Sales/POS', 'Purchase', 'Inventory', 'Medicines', 'Suppliers', 'B2B Orders', 'Customers', 'Staff', 'Reports', 'Settings'],
  'Branch Manager': ['Dashboard', 'Purchase', 'Inventory', 'Medicines', 'Suppliers', 'Reports'],
  'Pharmacist': ['Dashboard', 'Medicines', 'Inventory', 'Sales/POS'],
  'Cashier': ['Dashboard', 'Sales/POS', 'Customers'],
}

const StaffFormModal = ({ staff, onClose }) => {
  const [form, setForm] = useState(staff || { name: '', phone: '', email: '', role: 'Cashier', password: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 500, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{staff ? 'Edit Staff' : 'Add Staff Member'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Full Name *', key: 'name', placeholder: 'Staff full name' },
            { label: 'Phone Number *', key: 'phone', placeholder: '10-digit mobile number' },
            { label: 'Email Address', key: 'email', placeholder: 'Email (used for login)' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
              <input
                value={form[key] || ''}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Role *</label>
            <select
              value={form.role}
              onChange={e => set('role', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
            >
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {!staff && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Password *</label>
              <input
                type="password"
                value={form.password || ''}
                onChange={e => set('password', e.target.value)}
                placeholder="Set login password"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* Permissions Preview */}
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 14 }}>
            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#374151' }}>Access Permissions for {form.role}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(PERMISSIONS[form.role] || []).map(p => (
                <span key={p} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: '#0c3b7318', color: '#0c3b73', fontWeight: 500 }}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>Cancel</button>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>
            {staff ? 'Update' : 'Add Staff'}
          </button>
        </div>
      </div>
    </div>
  )
}

const StaffDetailModal = ({ staff, onClose }) => {
  if (!staff) return null
  const RoleIcon = roleIcons[staff.role] || User
  const perms = PERMISSIONS[staff.role] || []

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: (roleColors[staff.role] || '#0c3b73') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RoleIcon size={22} color={roleColors[staff.role] || '#0c3b73'} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{staff.name}</h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: roleColors[staff.role] || '#6b7280', fontWeight: 600 }}>{staff.role}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            ['Staff ID', staff.id],
            ['Phone', staff.phone],
            ['Email', staff.email],
            ['Joined', staff.joined],
            ['Last Login', staff.lastLogin],
            ['Status', staff.status],
          ].map(([label, val]) => (
            <div key={label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{label}</p>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: '#111827', fontWeight: 600 }}>{val}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 14 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#374151' }}>Module Access</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {perms.map(p => (
              <span key={p} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, background: '#0c3b7318', color: '#0c3b73', fontWeight: 500 }}>{p}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>Close</button>
        </div>
      </div>
    </div>
  )
}

const StaffUsers = () => {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [viewStaff, setViewStaff] = useState(null)
  const [editStaff, setEditStaff] = useState(null)

  const filtered = MOCK_STAFF.filter(s =>
    (roleFilter === 'All' || s.role === roleFilter) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { title: 'ID', key: 'id', width: 70, render: v => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{v}</span> },
    {
      title: 'Staff', key: 'name', render: (v, row) => {
        const RoleIcon = roleIcons[row.role] || User
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: (roleColors[row.role] || '#0c3b73') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RoleIcon size={15} color={roleColors[row.role] || '#0c3b73'} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#111827' }}>{v}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{row.phone}</p>
            </div>
          </div>
        )
      }
    },
    {
      title: 'Role', key: 'role', render: v => (
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: (roleColors[v] || '#0c3b73') + '18', color: roleColors[v] || '#0c3b73' }}>{v}</span>
      )
    },
    { title: 'Last Login', key: 'lastLogin', render: v => <span style={{ fontSize: 11, color: '#6b7280' }}>{v}</span> },
    {
      title: 'Status', key: 'status', render: v => (
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: v === 'Active' ? '#dcfce7' : '#f3f4f6', color: v === 'Active' ? '#16a34a' : '#6b7280' }}>{v}</span>
      )
    },
    {
      title: 'Actions', key: '_a', render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setViewStaff(row)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <Eye size={12} /> View
          </button>
          <button onClick={() => setEditStaff(row)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <Edit2 size={12} />
          </button>
        </div>
      )
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={UserCheck} title="Staff & Users" subtitle="Manage franchise team members and their access" color="#7c3aed">
        <button onClick={() => setShowAdd(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0c3b73', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#fff', fontWeight: 600 }}>
          <Plus size={14} /> Add Staff
        </button>
      </PageHeader>

      {/* Role Summary Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {ROLES.map(role => {
          const count = MOCK_STAFF.filter(s => s.role === role).length
          const color = roleColors[role] || '#0c3b73'
          const RoleIcon = roleIcons[role] || User
          return (
            <div key={role} style={{ flex: '1 1 150px', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RoleIcon size={17} color={color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{role}</p>
                <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 700, color }}>{count}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter & Search */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search staff by name…"
            style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', ...ROLES].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              borderColor: roleFilter === r ? '#0c3b73' : '#e5e7eb',
              background: roleFilter === r ? '#0c3b73' : '#fff',
              color: roleFilter === r ? '#fff' : '#374151',
            }}>{r}</button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} total={filtered.length} page={1} limit={20} />

      {showAdd && <StaffFormModal onClose={() => setShowAdd(false)} />}
      {editStaff && <StaffFormModal staff={editStaff} onClose={() => setEditStaff(null)} />}
      {viewStaff && <StaffDetailModal staff={viewStaff} onClose={() => setViewStaff(null)} />}
    </div>
  )
}

export default StaffUsers
