/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Trash2, Search, Download, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'

const MOCK = [
  { name: 'Cefuroxime 250 Tablet',     batch: 'CEF0035',  expiry: '10/04/2025', expiredBy: '40 Days', qty: 130, mrp: 22.00, value: 2860 },
  { name: 'Diclofenac 50 mg Tablet',   batch: 'DIC0311',  expiry: '05/04/2025', expiredBy: '45 Days', qty: 200, mrp: 7.00,  value: 1400 },
  { name: 'Metronidazole 400 Tablet',  batch: 'MET0143',  expiry: '22/03/2025', expiredBy: '59 Days', qty: 160, mrp: 5.00,  value: 800  },
  { name: 'Ranitidine 150 Tablet',     batch: 'RAN10006', expiry: '18/02/2025', expiredBy: '90 Days', qty: 120, mrp: 5.00,  value: 600  },
  { name: 'Domperidone 10 Tablet',     batch: 'DOM1506',  expiry: '13/03/2025', expiredBy: '68 Days', qty: 200, mrp: 8.00,  value: 1600 },
]

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function ExpiredStock() {
  const [search, setSearch] = useState('')
  const filtered = MOCK.filter(r => search === '' || r.name.toLowerCase().includes(search.toLowerCase()))
  const totalQty = MOCK.reduce((a, r) => a + r.qty, 0)
  const totalVal = MOCK.reduce((a, r) => a + r.value, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trash2 size={20} color="#dc2626" /> Expired Stock
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>All expired medicines — take immediate action</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Trash2 size={14} /> Dispose Stock
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Expired Items', value: String(MOCK.length), color: '#dc2626' },
          { label: 'Total Quantity',      value: String(totalQty),    color: '#0c3b73' },
          { label: 'Total Value',         value: `₹${totalVal.toLocaleString('en-IN')}`, color: '#7c3aed' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertTriangle size={14} color="#dc2626" />
        <span style={{ fontSize: 13, color: '#9f1239', fontWeight: 500 }}>All expired stock must be removed from shelves immediately and disposed per regulations.</span>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by medicine or batch..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Medicine Name', 'Batch No.', 'Expiry Date', 'Expired By', 'Qty', 'MRP (₹)', 'Value (₹)', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td style={{ fontWeight: 600 }}>{r.name}</Td>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.batch}</span></Td>
                  <Td style={{ color: '#dc2626', fontWeight: 600 }}>{r.expiry}</Td>
                  <Td style={{ color: '#dc2626' }}>{r.expiredBy}</Td>
                  <Td style={{ fontWeight: 600 }}>{r.qty}</Td>
                  <Td>₹{r.mrp.toFixed(2)}</Td>
                  <Td style={{ fontWeight: 600, color: '#dc2626' }}>₹{r.value.toLocaleString('en-IN')}</Td>
                  <Td>
                    <button style={{ fontSize: 11, fontWeight: 600, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer' }}>
                      Dispose
                    </button>
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
