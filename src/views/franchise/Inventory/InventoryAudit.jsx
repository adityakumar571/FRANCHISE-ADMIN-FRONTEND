/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { ClipboardList, Plus, Eye, Search } from 'lucide-react'

const MOCK = [
  { id: 'AUD-2025-016', date: '20/05/2025', auditor: 'Rahul Sharma',  items: 6045, variance: '+₹2,750', status: 'Completed'  },
  { id: 'AUD-2025-015', date: '18/05/2025', auditor: 'Neha Singh',    items: 4580, variance: '-₹880',   status: 'Completed'  },
  { id: 'AUD-2025-014', date: '15/05/2025', auditor: 'Pooja Sharma',  items: 8221, variance: '+₹1,200', status: 'Completed'  },
  { id: 'AUD-2025-013', date: '12/05/2025', auditor: 'Anjali Verma',  items: 7380, variance: '₹0',      status: 'In Progress'},
  { id: 'AUD-2025-012', date: '10/05/2025', auditor: 'Arjit Kumar',   items: 5210, variance: '-₹430',   status: 'Pending'    },
]

const STATUS_C = {
  'Completed':   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'In Progress': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Pending':     { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
}

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function InventoryAudit() {
  const [search, setSearch] = useState('')
  const filtered = MOCK.filter(r => search === '' || r.id.toLowerCase().includes(search.toLowerCase()) || r.auditor.toLowerCase().includes(search.toLowerCase()))
  const totalPositive = MOCK.filter(r => r.variance.startsWith('+')).length

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={20} color="#dc2626" /> Inventory Audit
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Complete audit history and reports</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> New Audit
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Audits',  value: String(MOCK.length), color: '#0c3b73' },
          { label: 'Completed',     value: String(MOCK.filter(r => r.status === 'Completed').length), color: '#16a34a' },
          { label: 'In Progress',   value: String(MOCK.filter(r => r.status === 'In Progress').length), color: '#2563eb' },
          { label: 'Pending',       value: String(MOCK.filter(r => r.status === 'Pending').length), color: '#d97706' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Variance summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>Total Positive Variance</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#16a34a', margin: 0 }}>₹2,750.00</p>
        </div>
        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>Total Negative Variance</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#dc2626', margin: 0 }}>-₹1,880.00</p>
        </div>
        <div style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>Net Variance</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#4f46e5', margin: 0 }}>₹870.00</p>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by audit ID or auditor..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Audit ID', 'Date', 'Auditor', 'Items Audited', 'Variance', 'Status', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {filtered.map((r, i) => {
                const sc = STATUS_C[r.status] || STATUS_C.Pending
                const varColor = r.variance.startsWith('+') ? '#16a34a' : r.variance === '₹0' ? '#374151' : '#dc2626'
                return (
                  <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0c3b73', fontWeight: 600 }}>{r.id}</span></Td>
                    <Td style={{ fontSize: 12, color: '#6b7280' }}>{r.date}</Td>
                    <Td style={{ fontWeight: 500 }}>{r.auditor}</Td>
                    <Td>{r.items.toLocaleString('en-IN')}</Td>
                    <Td style={{ fontWeight: 700, color: varColor }}>{r.variance}</Td>
                    <Td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{r.status}</span></Td>
                    <Td>
                      <button style={{ background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#0c3b73', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
                        <Eye size={12} /> View
                      </button>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {MOCK.length} audits</span>
        </div>
      </div>
    </div>
  )
}
