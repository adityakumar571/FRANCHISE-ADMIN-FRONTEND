/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  Users, Plus, Search, Eye, Edit2, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, X, Check, Shield, MapPin,
  Clock, Mail, Phone, UserCheck, UserX, AlertCircle,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   PALETTE & SHARED PRIMITIVES
───────────────────────────────────────────── */
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

const StatusBadge = ({ status }) => {
  const map = {
    Active:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    Inactive: { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
    Pending:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  }
  const s = map[status] || map.Inactive
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  )
}

const RoleBadge = ({ role }) => {
  const isRegional = role === 'Regional Admin'
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
      background: isRegional ? '#eff6ff' : '#faf5ff',
      color: isRegional ? '#1d4ed8' : '#7c3aed',
      border: `1px solid ${isRegional ? '#bfdbfe' : '#e9d5ff'}` }}>
      {role}
    </span>
  )
}

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const STATES_DATA = {
  Maharashtra: ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad'],
  Karnataka:   ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru'],
  Telangana:   ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad'],
  'Tamil Nadu':['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
  Gujarat:     ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
}

const MOCK_ADMINS = [
  { id: 'ADM-001', name: 'Rajesh Kumar Sharma', email: 'rajesh.sharma@pharmanexus.in', phone: '9876543210', states: ['Maharashtra', 'Gujarat'], cities: ['Mumbai', 'Pune', 'Ahmedabad'], role: 'Regional Admin', status: 'Active',   lastLogin: '2 hrs ago' },
  { id: 'ADM-002', name: 'Priya Venkataraman',  email: 'priya.venkat@pharmanexus.in',  phone: '9865432109', states: ['Karnataka', 'Telangana'], cities: ['Bengaluru', 'Hyderabad'], role: 'Regional Admin', status: 'Active',   lastLogin: '5 hrs ago' },
  { id: 'ADM-003', name: 'Amit Desai',          email: 'amit.desai@pharmanexus.in',    phone: '9854321098', states: ['Gujarat'],                cities: ['Surat', 'Vadodara'],     role: 'Area Admin',    status: 'Active',   lastLogin: '1 day ago' },
  { id: 'ADM-004', name: 'Sunita Nair',         email: 'sunita.nair@pharmanexus.in',   phone: '9843210987', states: ['Tamil Nadu'],             cities: ['Chennai', 'Madurai'],    role: 'Area Admin',    status: 'Inactive', lastLogin: '15 days ago' },
  { id: 'ADM-005', name: 'Vikram Singh Rathore',email: 'vikram.singh@pharmanexus.in',  phone: '9832109876', states: ['Maharashtra'],            cities: ['Nashik', 'Nagpur'],      role: 'Area Admin',    status: 'Active',   lastLogin: '3 hrs ago' },
  { id: 'ADM-006', name: 'Meera Krishnamurthy', email: 'meera.krishna@pharmanexus.in', phone: '9821098765', states: ['Karnataka'],              cities: ['Mysuru', 'Hubli'],       role: 'Regional Admin', status: 'Pending', lastLogin: 'Never' },
  { id: 'ADM-007', name: 'Deepak Agarwal',      email: 'deepak.agarwal@pharmanexus.in',phone: '9810987654', states: ['Telangana'],             cities: ['Warangal', 'Karimnagar'],role: 'Area Admin',    status: 'Active',   lastLogin: '6 hrs ago' },
  { id: 'ADM-008', name: 'Ananya Pillai',        email: 'ananya.pillai@pharmanexus.in', phone: '9809876543', states: ['Tamil Nadu'],            cities: ['Coimbatore', 'Salem'],   role: 'Area Admin',    status: 'Inactive', lastLogin: '20 days ago' },
]

const PERMISSIONS = [
  'View Franchises', 'Create Franchise', 'Suspend Franchise', 'Manage Suppliers', 'View Reports',
]

const ALL_STATES = Object.keys(STATES_DATA)

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function AdminManagement() {
  const [admins, setAdmins]           = useState(MOCK_ADMINS)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [stateFilter, setStateFilter]   = useState('All')
  const [page, setPage]               = useState(1)
  const [showModal, setShowModal]     = useState(false)

  /* form state */
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'Regional Admin',
    selectedStates: [], selectedCities: [], permissions: [],
  })

  const PER_PAGE = 5

  /* ── filter logic ── */
  const filtered = admins.filter(a => {
    const q = search.toLowerCase()
    const matchQ = !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    const matchS = statusFilter === 'All' || a.status === statusFilter
    const matchSt = stateFilter === 'All' || a.states.includes(stateFilter)
    return matchQ && matchS && matchSt
  })

  const total     = filtered.length
  const totalPages = Math.ceil(total / PER_PAGE)
  const pageData  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  /* ── stat counts ── */
  const counts = {
    total:    admins.length,
    active:   admins.filter(a => a.status === 'Active').length,
    inactive: admins.filter(a => a.status === 'Inactive').length,
    pending:  admins.filter(a => a.status === 'Pending').length,
  }

  /* ── toggle status ── */
  const toggleStatus = (id) => {
    setAdmins(prev => prev.map(a => {
      if (a.id !== id) return a
      const next = a.status === 'Active' ? 'Inactive' : 'Active'
      return { ...a, status: next }
    }))
  }

  /* ── form helpers ── */
  const toggleState = (state) => {
    const sel = form.selectedStates.includes(state)
      ? form.selectedStates.filter(s => s !== state)
      : [...form.selectedStates, state]
    const allowedCities = sel.flatMap(s => STATES_DATA[s] || [])
    const filteredCities = form.selectedCities.filter(c => allowedCities.includes(c))
    setForm(f => ({ ...f, selectedStates: sel, selectedCities: filteredCities }))
  }

  const toggleCity = (city) => {
    setForm(f => ({
      ...f,
      selectedCities: f.selectedCities.includes(city)
        ? f.selectedCities.filter(c => c !== city)
        : [...f.selectedCities, city],
    }))
  }

  const togglePermission = (p) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(p)
        ? f.permissions.filter(x => x !== p)
        : [...f.permissions, p],
    }))
  }

  const availableCities = form.selectedStates.flatMap(s => STATES_DATA[s] || [])

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.phone || !form.password) return
    const newAdmin = {
      id: `ADM-${String(admins.length + 1).padStart(3, '0')}`,
      name: form.name, email: form.email, phone: form.phone,
      states: form.selectedStates, cities: form.selectedCities,
      role: form.role, status: 'Pending', lastLogin: 'Never',
    }
    setAdmins(prev => [newAdmin, ...prev])
    setShowModal(false)
    setForm({ name: '', email: '', phone: '', password: '', role: 'Regional Admin', selectedStates: [], selectedCities: [], permissions: [] })
  }

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13, background: C.bg, minHeight: '100vh', padding: 4 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color={C.accent} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Admin Management</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Create and manage regional admins with geographic scope</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: '#fff',
            border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={15} /> Create Admin
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <StatCard icon={Users}     label="Total Admins" value={counts.total}    color={C.primary}  bg="#eff6ff" />
        <StatCard icon={UserCheck} label="Active"       value={counts.active}   color={C.success}  bg="#f0fdf4" />
        <StatCard icon={UserX}     label="Inactive"     value={counts.inactive} color="#6b7280"    bg="#f9fafb" />
        <StatCard icon={AlertCircle} label="Pending"    value={counts.pending}  color="#d97706"    bg="#fffbeb" />
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px',
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, email, ID…"
            style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ ...inputStyle, width: 'auto', minWidth: 130, cursor: 'pointer' }}>
          {['All', 'Active', 'Inactive', 'Pending'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={stateFilter} onChange={e => { setStateFilter(e.target.value); setPage(1) }}
          style={{ ...inputStyle, width: 'auto', minWidth: 160, cursor: 'pointer' }}>
          <option value="All">All States</option>
          {ALL_STATES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* ── TABLE ── */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Admin ID', 'Name', 'Email', 'Phone', 'Assigned States', 'Assigned Cities', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, color: '#6b7280', fontWeight: 700,
                    textTransform: 'uppercase', textAlign: 'left', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No admins found.</td></tr>
              ) : pageData.map(a => (
                <tr key={a.id}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8f9fb'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                  style={{ borderBottom: '1px solid #f3f4f6', transition: 'background .1s' }}>
                  <td style={{ padding: '11px 14px', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{a.id}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${C.primary}12`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Users size={14} color={C.primary} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{a.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Mail size={11} color="#9ca3af" />
                      <span style={{ fontSize: 12, color: '#374151' }}>{a.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Phone size={11} color="#9ca3af" />
                      <span style={{ fontSize: 12, color: '#374151' }}>{a.phone}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {a.states.map(s => (
                        <span key={s} style={{ fontSize: 10, background: '#eff6ff', color: '#1d4ed8',
                          border: '1px solid #bfdbfe', borderRadius: 5, padding: '2px 6px', fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 180 }}>
                      {a.cities.slice(0, 3).map(c => (
                        <span key={c} style={{ fontSize: 10, background: '#f3f4f6', color: '#374151',
                          borderRadius: 5, padding: '2px 6px', fontWeight: 500 }}>{c}</span>
                      ))}
                      {a.cities.length > 3 && (
                        <span style={{ fontSize: 10, color: '#9ca3af' }}>+{a.cities.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}><RoleBadge role={a.role} /></td>
                  <td style={{ padding: '11px 14px' }}><StatusBadge status={a.status} /></td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} color="#9ca3af" />
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{a.lastLogin}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.border}`,
                        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Eye size={13} color="#6b7280" />
                      </button>
                      <button style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.border}`,
                        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Edit2 size={13} color="#6b7280" />
                      </button>
                      <button onClick={() => toggleStatus(a.id)}
                        style={{ width: 28, height: 28, borderRadius: 7, border: 'none',
                          background: a.status === 'Active' ? '#fef2f2' : '#f0fdf4',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {a.status === 'Active'
                          ? <ToggleRight size={15} color={C.success} />
                          : <ToggleLeft size={15} color="#9ca3af" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px',
          borderTop: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Showing {Math.min((page - 1) * PER_PAGE + 1, total)}–{Math.min(page * PER_PAGE, total)} of {total} admins
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${n === page ? C.primary : C.border}`,
                  background: n === page ? C.primary : '#fff', color: n === page ? '#fff' : '#374151',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════
          CREATE ADMIN MODAL
      ═══════════════════════════════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 640,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: C.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={16} color="#fff" />
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>Create Admin</h2>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Add a new regional or area admin</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`,
                  background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={15} color="#6b7280" />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Basic Info */}
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Basic Information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Rajesh Kumar Sharma" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="admin@pharmanexus.in" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="9876543210" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Password *</label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min 8 characters" style={inputStyle} />
                </div>
              </div>

              {/* Role */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Role *</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  style={{ ...inputStyle, width: 'auto', minWidth: 200, cursor: 'pointer' }}>
                  <option>Regional Admin</option>
                  <option>Area Admin</option>
                </select>
              </div>

              {/* Assign States */}
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Geographic Scope</p>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Assign States</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ALL_STATES.map(s => {
                    const sel = form.selectedStates.includes(s)
                    return (
                      <button key={s} onClick={() => toggleState(s)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
                          border: `1px solid ${sel ? C.primary : C.border}`,
                          background: sel ? `${C.primary}10` : '#f9fafb',
                          color: sel ? C.primary : '#374151',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        {sel && <Check size={11} />}
                        <MapPin size={11} />
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Assign Cities */}
              {availableCities.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Assign Cities (based on selected states)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {availableCities.map(c => {
                      const sel = form.selectedCities.includes(c)
                      return (
                        <button key={c} onClick={() => toggleCity(c)}
                          style={{ padding: '5px 11px', borderRadius: 7,
                            border: `1px solid ${sel ? C.success : C.border}`,
                            background: sel ? '#f0fdf4' : '#f9fafb',
                            color: sel ? C.success : '#374151',
                            fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                          {c}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Permissions */}
              <div style={{ marginBottom: 22 }}>
                <label style={labelStyle}>Permissions</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {PERMISSIONS.map(p => {
                    const sel = form.permissions.includes(p)
                    return (
                      <label key={p} onClick={() => togglePermission(p)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                          borderRadius: 8, border: `1px solid ${sel ? C.primary : C.border}`,
                          background: sel ? `${C.primary}08` : '#fafafa', cursor: 'pointer' }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? C.primary : '#d1d5db'}`,
                          background: sel ? C.primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: sel ? C.primary : '#374151' }}>{p}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowModal(false)}
                  style={{ padding: '9px 20px', borderRadius: 8, border: `1px solid ${C.border}`,
                    background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSubmit}
                  style={{ padding: '9px 22px', borderRadius: 8, border: 'none',
                    background: C.primary, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Create Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
