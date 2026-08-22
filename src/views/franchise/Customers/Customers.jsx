/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Users, Plus, Eye, Edit, Search, Phone, Mail, ChevronLeft, ChevronRight, Wallet } from 'lucide-react'

const MOCK = [
  { id: 'CUS001', name: 'Rahul Sharma',    phone: '9912345678', email: 'rahul@email.com', orders: 28, totalPurchase: '₹18,650', due: '₹0',   status: 'Active',   lastVisit: '20 May 2025' },
  { id: 'CUS002', name: 'Priya Singh',     phone: '9823456789', email: 'priya@email.com', orders: 24, totalPurchase: '₹14,320', due: '₹250', status: 'Active',   lastVisit: '19 May 2025' },
  { id: 'CUS003', name: 'Amit Kumar',      phone: '9734567890', email: 'amit@email.com',  orders: 20, totalPurchase: '₹11,980', due: '₹0',   status: 'Active',   lastVisit: '18 May 2025' },
  { id: 'CUS004', name: 'Neha Verma',      phone: '9645678901', email: 'neha@email.com',  orders: 18, totalPurchase: '₹9,850',  due: '₹500', status: 'Active',   lastVisit: '17 May 2025' },
  { id: 'CUS005', name: 'Vikram Patel',    phone: '9556789012', email: 'vikram@email.com', orders: 16, totalPurchase: '₹8,600', due: '₹0',  status: 'Active',   lastVisit: '16 May 2025' },
  { id: 'CUS006', name: 'Sunita Devi',     phone: '9467890123', email: 'sunita@email.com', orders: 12, totalPurchase: '₹5,200', due: '₹100', status: 'Active',  lastVisit: '15 May 2025' },
  { id: 'CUS007', name: 'Ravi Shankar',    phone: '9378901234', email: '',                orders: 8,  totalPurchase: '₹3,800',  due: '₹0',   status: 'Inactive', lastVisit: '10 May 2025' },
]

const Badge = ({ status }) => {
  const c = status === 'Active' ? { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' } : { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' }
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{status}</span>
}

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>{c}</th>
const Td = ({ children, s = {} }) => <td style={{ padding: '11px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...s }}>{children}</td>

export default function Customers() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const filtered = MOCK.filter(c =>
    (search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)) &&
    (status === 'All' || c.status === status)
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Customers</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage all franchise customers</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Add Customer
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Customers', value: '4,258',   icon: Users,  color: '#0c3b73' },
          { label: 'Active Customers', value: '3,682',  icon: Users,  color: '#16a34a' },
          { label: 'Total Due',        value: '₹12,450', icon: Wallet, color: '#dc2626' },
          { label: 'New This Month',   value: '215',     icon: Users,  color: '#7c3aed' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." style={{ width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option>All</option><option>Active</option><option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Customer ID', 'Name', 'Phone', 'Email', 'Orders', 'Total Purchase', 'Due Amount', 'Last Visit', 'Status', 'Actions'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No customers found</td></tr>
                : filtered.map((c) => (
                  <tr key={c.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{c.id}</span></Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0c3b7325', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0c3b73', flexShrink: 0 }}>
                          {c.name.slice(0, 1)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{c.name}</span>
                      </div>
                    </Td>
                    <Td><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} style={{ color: '#9ca3af' }} />{c.phone}</div></Td>
                    <Td><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} style={{ color: '#9ca3af' }} />{c.email || '—'}</div></Td>
                    <Td>{c.orders}</Td>
                    <Td style={{ fontWeight: 600 }}>{c.totalPurchase}</Td>
                    <Td style={{ color: c.due !== '₹0' ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{c.due}</Td>
                    <Td style={{ color: '#6b7280' }}>{c.lastVisit}</Td>
                    <Td><Badge status={c.status} /></Td>
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
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {MOCK.length} customers</span>
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
