/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { ShoppingCart, Eye, Search, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'

const MOCK = [
  { id: 'ORD-250520-001', customer: 'Rahul Sharma',  time: '09:25 AM', items: 6, amount: '₹1,250', payment: 'UPI',    status: 'Delivered' },
  { id: 'ORD-250520-002', customer: 'Priya Verma',   time: '09:10 AM', items: 4, amount: '₹2,450', payment: 'Cash',   status: 'Delivered' },
  { id: 'ORD-250520-003', customer: 'Walk-in',       time: '08:45 AM', items: 8, amount: '₹3,650', payment: 'Card',   status: 'Delivered' },
  { id: 'ORD-250520-004', customer: 'Neha Singh',    time: '08:30 AM', items: 3, amount: '₹850',   payment: 'Cash',   status: 'Delivered' },
  { id: 'ORD-250520-005', customer: 'Amit Kumar',    time: '11:00 AM', items: 5, amount: '₹1,150', payment: 'UPI',    status: 'Pending' },
  { id: 'ORD-250520-006', customer: 'Suresh Gupta',  time: '11:15 AM', items: 2, amount: '₹450',   payment: 'Credit', status: 'Pending' },
  { id: 'ORD-250520-007', customer: 'Meena Devi',    time: '10:30 AM', items: 7, amount: '₹2,200', payment: 'UPI',    status: 'Processing' },
]

const statusColors = {
  Delivered:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Pending:    { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Processing: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  Cancelled:  { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
}

const paymentColors = {
  UPI:    '#7c3aed', Cash: '#16a34a', Card: '#2563eb', Credit: '#d97706',
}

const Badge = ({ val, colorMap }) => {
  const c = colorMap[val]
  return c
    ? <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{val}</span>
    : <span style={{ fontSize: 11, color: '#374151' }}>{val}</span>
}

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

const STATUSES = ['All', 'Delivered', 'Pending', 'Processing', 'Cancelled']

export default function Orders() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [tab, setTab]       = useState('Today')

  const filtered = MOCK.filter(o =>
    (search === '' || o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase())) &&
    (status === 'All' || o.status === status)
  )

  const totalSales = MOCK.reduce((a, o) => a + parseFloat(o.amount.replace('₹', '').replace(',', '')), 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Orders</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>View and manage all sales orders</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {['Today', 'This Week', 'This Month'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#0c3b73' : '#6b7280', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Orders',   value: String(MOCK.length),           color: '#0c3b73' },
          { label: 'Delivered',      value: String(MOCK.filter(o => o.status === 'Delivered').length), color: '#16a34a' },
          { label: 'Pending',        value: String(MOCK.filter(o => o.status === 'Pending').length),   color: '#d97706' },
          { label: 'Total Sales',    value: `₹${totalSales.toLocaleString('en-IN')}`,                color: '#7c3aed' },
        ].map((c) => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>{c.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or customer..." style={{ width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Order ID', 'Customer', 'Time', 'Items', 'Amount', 'Payment', 'Status', 'Actions'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No orders found</td></tr>
                : filtered.map((o) => (
                  <tr key={o.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0c3b73', fontWeight: 600 }}>{o.id}</span></Td>
                    <Td style={{ fontWeight: 500 }}>{o.customer}</Td>
                    <Td style={{ color: '#6b7280' }}>{o.time}</Td>
                    <Td>{o.items}</Td>
                    <Td style={{ fontWeight: 700 }}>{o.amount}</Td>
                    <Td>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: (paymentColors[o.payment] || '#6b7280') + '18', color: paymentColors[o.payment] || '#6b7280' }}>
                        {o.payment}
                      </span>
                    </Td>
                    <Td><Badge val={o.status} colorMap={statusColors} /></Td>
                    <Td>
                      <button title="View" style={{ background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#0c3b73' }}><Eye size={13} /></button>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {MOCK.length} orders</span>
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
