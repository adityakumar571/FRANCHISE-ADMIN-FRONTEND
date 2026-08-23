/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { AlertTriangle, Search, Download, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

const MOCK = [
  { name: 'Amoxicillin 500 Capsule',  batch: 'AMX0021',  expiry: '15/06/2025', daysLeft: 25, qty: 120,  mrp: 25.50, value: 3060.00,  status: 'Critical' },
  { name: 'Azithral 500 Tablet',      batch: 'AZT0012',  expiry: '20/06/2025', daysLeft: 30, qty: 200,  mrp: 33.00, value: 6600.00,  status: 'Critical' },
  { name: 'Pantoprazole 40mg Tablet', batch: 'PAN2506',  expiry: '25/06/2025', daysLeft: 35, qty: 380,  mrp: 11.80, value: 4484.00,  status: 'Warning'  },
  { name: 'Crocin 650 Tablet',        batch: 'CRO65023', expiry: '04/07/2025', daysLeft: 44, qty: 300,  mrp: 16.00, value: 4800.00,  status: 'Warning'  },
  { name: 'Levocetirizine 5mg Tablet',batch: 'LEV5001',  expiry: '05/07/2025', daysLeft: 45, qty: 180,  mrp: 8.20,  value: 1476.00,  status: 'Warning'  },
]

const STATUS_C = {
  Critical: { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
  Warning:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Safe:     { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
}
const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function NearExpiry() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const totalValue = MOCK.reduce((a, r) => a + r.value, 0)
  const critical   = MOCK.filter(r => r.daysLeft <= 30).length

  const filtered = MOCK.filter(r =>
    (search === '' || r.name.toLowerCase().includes(search.toLowerCase()) || r.batch.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'All' || (filter === 'Critical' ? r.daysLeft <= 30 : r.daysLeft > 30))
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color="#d97706" /> Near Expiry
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Medicines expiring within next 90 days</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Near Expiry', value: String(MOCK.length), color: '#d97706' },
          { label: 'Total Quantity',    value: '3,450',              color: '#0c3b73' },
          { label: 'Total Value',       value: `₹${totalValue.toLocaleString('en-IN')}`, color: '#7c3aed' },
          { label: 'Critical (≤30d)',   value: String(critical),     color: '#dc2626' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertTriangle size={14} color="#ea580c" />
        <span style={{ fontSize: 13, color: '#9a3412', fontWeight: 500 }}>
          <strong>{critical} items</strong> are expiring within 30 days — take action immediately.
        </span>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by medicine or batch..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {['All', 'Critical', 'Warning'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {['Next 90 Days', 'Next 60 Days', 'Next 30 Days'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Medicine Name', 'Batch No.', 'Expiry Date', 'Days Left', 'Qty', 'MRP (₹)', 'Value (₹)', 'Status', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No records found</td></tr>
                : filtered.map((r, i) => {
                  const sc = STATUS_C[r.status] || STATUS_C.Warning
                  return (
                    <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td style={{ fontWeight: 600, color: '#111827' }}>{r.name}</Td>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.batch}</span></Td>
                      <Td style={{ color: '#6b7280' }}>{r.expiry}</Td>
                      <Td><span style={{ fontSize: 12, fontWeight: 700, color: r.daysLeft <= 30 ? '#dc2626' : '#d97706' }}>{r.daysLeft} days</span></Td>
                      <Td style={{ fontWeight: 600 }}>{r.qty}</Td>
                      <Td>₹{r.mrp.toFixed(2)}</Td>
                      <Td style={{ fontWeight: 600, color: '#0c3b73' }}>₹{r.value.toLocaleString('en-IN')}</Td>
                      <Td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{r.status}</span></Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button style={{ fontSize: 11, fontWeight: 600, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 8px', cursor: 'pointer' }}>Return</button>
                          <button style={{ fontSize: 11, fontWeight: 600, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 8px', cursor: 'pointer' }}>Sale</button>
                        </div>
                      </Td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
