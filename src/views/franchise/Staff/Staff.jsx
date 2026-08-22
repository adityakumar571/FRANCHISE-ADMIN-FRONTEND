/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { UserCheck, Plus, Eye, Edit, Search, Phone, Mail, ChevronLeft, ChevronRight, Clock } from 'lucide-react'

const MOCK = [
  { id: 'STA001', name: 'Rahul Sharma',  role: 'Pharmacist',     dept: 'Sales',     phone: '9876543210', email: 'rahul@store.com', status: 'Active', shift: 'Morning', todaySales: '₹18,250', attendance: 'Present' },
  { id: 'STA002', name: 'Neha Singh',    role: 'Cashier',        dept: 'Accounts',  phone: '9123456780', email: 'neha@store.com',  status: 'Active', shift: 'Morning', todaySales: '—',       attendance: 'Present' },
  { id: 'STA003', name: 'Amit Kumar',    role: 'Store Manager',  dept: 'Inventory', phone: '9988776655', email: 'amit@store.com',  status: 'Active', shift: 'Full Day', todaySales: '₹24,600', attendance: 'Present' },
  { id: 'STA004', name: 'Priya Singh',   role: 'Sales Executive',dept: 'Sales',     phone: '8765432109', email: 'priya@store.com', status: 'Active', shift: 'Evening', todaySales: '₹16,780', attendance: 'Late' },
  { id: 'STA005', name: 'Vikram Patel',  role: 'Accountant',     dept: 'Accounts',  phone: '7654321098', email: 'vp@store.com',    status: 'Active', shift: 'Full Day', todaySales: '—',       attendance: 'Present' },
  { id: 'STA006', name: 'Sandeep Yadav', role: 'Delivery Boy',   dept: 'Operations',phone: '9001023334', email: '',               status: 'Active', shift: 'Morning', todaySales: '—',       attendance: 'Absent' },
  { id: 'STA007', name: 'Kavita Joshi',  role: 'HR Executive',   dept: 'HR',        phone: '8147490530', email: 'kj@store.com',   status: 'On Leave', shift: 'Full Day', todaySales: '—',     attendance: 'Leave' },
]

const attColors = {
  Present:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Late:     { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Absent:   { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
  Leave:    { bg: '#f0f4ff', color: '#4f46e5', border: '#c7d2fe' },
}

const statusColors = {
  Active:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'On Leave': { bg: '#f0f4ff', color: '#4f46e5', border: '#c7d2fe' },
  Inactive: { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
}

const Badge = ({ val, colorMap }) => {
  const c = colorMap[val] || colorMap['Active']
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{val}</span>
}

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function Staff() {
  const [search, setSearch] = useState('')
  const [dept,   setDept]   = useState('All')
  const [status, setStatus] = useState('All')

  const depts = ['All', ...new Set(MOCK.map(s => s.dept))]

  const filtered = MOCK.filter(s =>
    (search === '' || s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase())) &&
    (dept === 'All' || s.dept === dept) &&
    (status === 'All' || s.status === status)
  )

  const present = MOCK.filter(s => s.attendance === 'Present').length
  const absent  = MOCK.filter(s => s.attendance === 'Absent').length
  const late    = MOCK.filter(s => s.attendance === 'Late').length

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Staff Management</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage all staff members</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Add Staff
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Staff', value: String(MOCK.length), color: '#0c3b73' },
          { label: 'Present Today', value: String(present), color: '#16a34a' },
          { label: 'Absent Today', value: String(absent), color: '#dc2626' },
          { label: 'Late Arrivals', value: String(late), color: '#d97706' },
        ].map((c) => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>{c.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or role..." style={{ width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <select value={dept} onChange={e => setDept(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option>All</option><option>Active</option><option>On Leave</option><option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['ID', 'Name', 'Role', 'Dept', 'Phone', 'Shift', "Today's Sales", 'Attendance', 'Status', 'Actions'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No staff found</td></tr>
                : filtered.map((s) => (
                  <tr key={s.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{s.id}</span></Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0c3b7322', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0c3b73', flexShrink: 0 }}>
                          {s.name.slice(0, 1)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 13 }}>{s.name}</p>
                          {s.email && <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{s.email}</p>}
                        </div>
                      </div>
                    </Td>
                    <Td>{s.role}</Td>
                    <Td><span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4, color: '#374151' }}>{s.dept}</span></Td>
                    <Td><div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}><Phone size={12} />{s.phone}</div></Td>
                    <Td><div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}><Clock size={12} />{s.shift}</div></Td>
                    <Td style={{ fontWeight: 600 }}>{s.todaySales}</Td>
                    <Td><Badge val={s.attendance} colorMap={attColors} /></Td>
                    <Td><Badge val={s.status} colorMap={statusColors} /></Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button title="View" style={{ background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#0c3b73' }}><Eye size={13} /></button>
                        <button title="Edit" style={{ background: '#fffbeb', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#d97706' }}><Edit size={13} /></button>
                      </div>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {MOCK.length} staff members</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronLeft size={14} /></button>
            <button style={{ background: '#0c3b73', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#fff', fontSize: 12 }}>1</button>
            <button style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

    </div>
  )
}
