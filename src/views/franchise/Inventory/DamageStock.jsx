/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { AlertTriangle, Search, Download } from 'lucide-react'

const MOCK = [
  { name: 'Paracetamol 650mg',   batch: 'PAR6524',  date: '20/05/2025', reason: 'Strip Torn',     qty: 120, mrp: 15.00, value: 1800 },
  { name: 'Vitamin C 500 Tablet',batch: 'VTC0011',  date: '18/05/2025', reason: 'Moisture',       qty: 90,  mrp: 8.90,  value: 801  },
  { name: 'ORS Packet',          batch: 'ORS2501',  date: '15/05/2025', reason: 'Water Damage',   qty: 200, mrp: 3.00,  value: 600  },
  { name: 'Cough Syrup 100ml',   batch: 'CGH0191',  date: '12/05/2025', reason: 'Bottle Leak',    qty: 45,  mrp: 65.00, value: 2925 },
  { name: 'Amoxicillin 500mg',   batch: 'AMX3001',  date: '10/05/2025', reason: 'Strip Damage',   qty: 60,  mrp: 22.50, value: 1350 },
]

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function DamageStock() {
  const [search, setSearch] = useState('')
  const filtered = MOCK.filter(r => search === '' || r.name.toLowerCase().includes(search.toLowerCase()))
  const totalQty = MOCK.reduce((a, r) => a + r.qty, 0)
  const totalVal = MOCK.reduce((a, r) => a + r.value, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color="#ea580c" /> Damage Stock
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>All damage and defective stock items</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ea580c', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <AlertTriangle size={14} /> Dispose Stock
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Damage Items', value: String(MOCK.length), color: '#ea580c' },
          { label: 'Total Quantity',     value: String(totalQty),    color: '#0c3b73' },
          { label: 'Total Value',        value: `₹${totalVal.toLocaleString('en-IN')}`, color: '#dc2626' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search damage stock..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Medicine Name', 'Batch No.', 'Date', 'Damage Reason', 'Qty', 'MRP (₹)', 'Value (₹)', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td style={{ fontWeight: 600 }}>{r.name}</Td>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.batch}</span></Td>
                  <Td style={{ color: '#6b7280' }}>{r.date}</Td>
                  <Td><span style={{ fontSize: 11, background: '#fff7ed', color: '#c2410c', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>{r.reason}</span></Td>
                  <Td style={{ fontWeight: 600 }}>{r.qty}</Td>
                  <Td>₹{r.mrp.toFixed(2)}</Td>
                  <Td style={{ fontWeight: 600, color: '#dc2626' }}>₹{r.value.toLocaleString('en-IN')}</Td>
                  <Td>
                    <button style={{ fontSize: 11, fontWeight: 600, background: '#ea580c', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer' }}>Dispose</button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {MOCK.length} items</span>
        </div>
      </div>
    </div>
  )
}
