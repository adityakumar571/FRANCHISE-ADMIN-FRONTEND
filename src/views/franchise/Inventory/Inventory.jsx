/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { ClipboardList, Search, AlertTriangle, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react'

const MOCK = [
  { id: 'MED001', name: 'Paracetamol 650mg', batch: 'BT-23001', expiry: '31 Dec 2026', qty: 1250, mrp: '₹15.00', purchasePrice: '₹8.50', stockValue: '₹10,625', location: 'A-01', status: 'In Stock' },
  { id: 'MED002', name: 'Azithromycin 500mg', batch: 'BT-23002', expiry: '30 Jun 2025', qty: 22, mrp: '₹49.50', purchasePrice: '₹28.00', stockValue: '₹616', location: 'B-02', status: 'Low Stock' },
  { id: 'MED003', name: 'Pantoprazole 40mg', batch: 'BT-23003', expiry: '15 Sep 2026', qty: 860, mrp: '₹35.00', purchasePrice: '₹18.00', stockValue: '₹15,480', location: 'A-03', status: 'In Stock' },
  { id: 'MED004', name: 'Levocetirizine 5mg', batch: 'BT-23004', expiry: '20 Aug 2025', qty: 430, mrp: '₹28.00', purchasePrice: '₹14.50', stockValue: '₹6,235', location: 'C-01', status: 'Near Expiry' },
  { id: 'MED005', name: 'Amoxicillin 500mg', batch: 'BT-23005', expiry: '10 Nov 2026', qty: 0, mrp: '₹25.00', purchasePrice: '₹12.00', stockValue: '₹0', location: '—', status: 'Out of Stock' },
  { id: 'MED006', name: 'Metformin 500mg', batch: 'BT-23006', expiry: '28 Feb 2027', qty: 680, mrp: '₹12.00', purchasePrice: '₹6.00', stockValue: '₹4,080', location: 'A-04', status: 'In Stock' },
  { id: 'MED007', name: 'Vitamin D3 60K', batch: 'BT-23007', expiry: '01 Apr 2025', qty: 15, mrp: '₹45.00', purchasePrice: '₹22.00', stockValue: '₹330', location: 'D-01', status: 'Near Expiry' },
]

const statusColors = {
  'In Stock':    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Low Stock':   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'Out of Stock': { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
  'Near Expiry': { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
}

const Badge = ({ s }) => {
  const c = statusColors[s] || statusColors['In Stock']
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{s}</span>
}

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

const STATUSES = ['All Status', 'In Stock', 'Low Stock', 'Out of Stock', 'Near Expiry']

export default function Inventory() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All Status')

  const filtered = MOCK.filter(p =>
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.batch.toLowerCase().includes(search.toLowerCase())) &&
    (status === 'All Status' || p.status === status)
  )

  const totalValue = MOCK.reduce((acc, p) => {
    const val = parseFloat(p.stockValue.replace('₹', '').replace(',', '')) || 0
    return acc + val
  }, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Inventory</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Real-time stock overview and management</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Stock Adjustment
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <BarChart2 size={15} /> Stock Report
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Items',     value: '8,945',  color: '#0c3b73' },
          { label: 'Low Stock',       value: '156',    color: '#d97706' },
          { label: 'Out of Stock',    value: '98',     color: '#dc2626' },
          { label: 'Near Expiry',     value: '48',     color: '#ea580c' },
          { label: 'Total Stock Value', value: `₹${(totalValue / 100).toFixed(0)}L+`, color: '#7c3aed' },
        ].map((c) => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>{c.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Alert */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8 }}>
        <AlertTriangle size={15} color="#ea580c" />
        <span style={{ fontSize: 13, color: '#9a3412' }}>
          <strong>2 products</strong> are expiring within 30 days. Review inventory and initiate returns.
        </span>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or batch..." style={{ width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
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
              <tr>{['Code', 'Product Name', 'Batch No.', 'Expiry', 'Qty', 'MRP', 'Purchase Price', 'Stock Value', 'Location', 'Status'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No items found</td></tr>
                : filtered.map((p) => (
                  <tr key={p.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{p.id}</span></Td>
                    <Td style={{ fontWeight: 600, color: '#111827' }}>{p.name}</Td>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.batch}</span></Td>
                    <Td style={{ color: '#6b7280' }}>{p.expiry}</Td>
                    <Td style={{ fontWeight: 600, color: p.qty === 0 ? '#dc2626' : p.qty < 25 ? '#d97706' : '#111827' }}>{p.qty}</Td>
                    <Td style={{ fontWeight: 600 }}>{p.mrp}</Td>
                    <Td style={{ color: '#6b7280' }}>{p.purchasePrice}</Td>
                    <Td style={{ fontWeight: 600, color: '#0c3b73' }}>{p.stockValue}</Td>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{p.location}</span></Td>
                    <Td><Badge s={p.status} /></Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {MOCK.length} items</span>
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
