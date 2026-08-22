/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Store, Plus, Eye, Edit, Search, MapPin, Phone, Users, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'

const MOCK = [
  { id: 'BR001', name: 'Main Branch — Alambagh', city: 'Lucknow', state: 'UP', manager: 'Rahul Sharma', phone: '9876543210', status: 'Active', sales: '₹2,45,670', orders: 384 },
  { id: 'BR002', name: 'Gomti Nagar Branch',     city: 'Lucknow', state: 'UP', manager: 'Neha Verma',  phone: '9876543211', status: 'Active', sales: '₹2,15,430', orders: 312 },
  { id: 'BR003', name: 'Hazratganj Branch',       city: 'Lucknow', state: 'UP', manager: 'Amit Kumar',  phone: '9876543212', status: 'Active', sales: '₹1,98,760', orders: 298 },
  { id: 'BR004', name: 'Indira Nagar Branch',     city: 'Lucknow', state: 'UP', manager: 'Priya Singh', phone: '9876543213', status: 'Active', sales: '₹1,85,250', orders: 245 },
  { id: 'BR005', name: 'Raebareli Branch',        city: 'Raebareli', state: 'UP', manager: 'Vikram Patel', phone: '9876543214', status: 'Inactive', sales: '₹1,65,430', orders: 210 },
  { id: 'BR006', name: 'Kanpur Branch',           city: 'Kanpur',   state: 'UP', manager: 'Sandeep Yadav', phone: '9876543215', status: 'Active', sales: '₹1,58,900', orders: 205 },
]

const Badge = ({ status }) => {
  const colors = {
    Active:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    Inactive: { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
  }
  const c = colors[status] || colors.Inactive
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {status}
    </span>
  )
}

const Th = ({ children }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', textAlign: 'left' }}>
    {children}
  </th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '11px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>
    {children}
  </td>
)

export default function Branches() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const filtered = MOCK.filter(b =>
    (search === '' || b.name.toLowerCase().includes(search.toLowerCase()) || b.city.toLowerCase().includes(search.toLowerCase())) &&
    (status === 'All' || b.status === status)
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Branches / Outlets</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage all franchise branches</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Add Branch
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Branches', value: '12', icon: Store, color: '#0c3b73' },
          { label: 'Active Branches', value: '10', icon: TrendingUp, color: '#16a34a' },
          { label: 'Total Staff', value: '78', icon: Users, color: '#7c3aed' },
          { label: 'Total Sales (Month)', value: '₹24,56,700', icon: TrendingUp, color: '#d97706' },
        ].map((c) => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: c.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <c.icon size={18} color={c.color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{c.label}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search branch by name or city..."
            style={{ width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }}
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th>Branch Code</Th>
                <Th>Branch Name</Th>
                <Th>Location</Th>
                <Th>Manager</Th>
                <Th>Phone</Th>
                <Th>Sales (Month)</Th>
                <Th>Orders</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No branches found</td></tr>
                : filtered.map((b) => (
                  <tr key={b.id} style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{b.id}</span></Td>
                    <Td style={{ fontWeight: 600, color: '#111827' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Store size={13} color="#0c3b73" />
                        </div>
                        {b.name}
                      </div>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                        <MapPin size={12} />
                        {b.city}, {b.state}
                      </div>
                    </Td>
                    <Td>{b.manager}</Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                        <Phone size={12} />
                        {b.phone}
                      </div>
                    </Td>
                    <Td style={{ fontWeight: 600 }}>{b.sales}</Td>
                    <Td>{b.orders}</Td>
                    <Td><Badge status={b.status} /></Td>
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
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {MOCK.length} branches</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#374151' }}><ChevronLeft size={14} /></button>
            <button style={{ background: '#0c3b73', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#fff', fontSize: 12 }}>1</button>
            <button style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#374151' }}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
