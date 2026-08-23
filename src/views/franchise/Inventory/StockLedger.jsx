/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { BookOpen, Search, Download } from 'lucide-react'

const MOCK = [
  { date: '01/05/2025', type: 'Opening Stock', refNo: '—',             inQty: 500,  outQty: null, balance: 500,  rate: 15.00, value: 7500.00 },
  { date: '03/05/2025', type: 'Purchase',      refNo: 'PUR-2025-120',  inQty: 1000, outQty: null, balance: 1500, rate: 14.50, value: 14500.00 },
  { date: '05/05/2025', type: 'Sale',          refNo: 'INV-2025-2548', inQty: null, outQty: 250,  balance: 1250, rate: 15.00, value: 3750.00 },
  { date: '10/05/2025', type: 'Sale',          refNo: 'INV-2025-2612', inQty: null, outQty: 180,  balance: 1070, rate: 15.00, value: 2700.00 },
  { date: '15/05/2025', type: 'Stock Adj.',    refNo: 'ADJ-2025-009',  inQty: null, outQty: 20,   balance: 1050, rate: 15.00, value: 300.00  },
  { date: '20/05/2025', type: 'Purchase',      refNo: 'PUR-2025-135',  inQty: 200,  outQty: null, balance: 1250, rate: 15.00, value: 3000.00 },
]

const TYPE_C = {
  'Opening Stock': { bg: '#e0e7ff', color: '#4f46e5' },
  'Purchase':      { bg: '#f0fdf4', color: '#16a34a' },
  'Sale':          { bg: '#fff1f2', color: '#dc2626' },
  'Stock Adj.':    { bg: '#fffbeb', color: '#d97706' },
}

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function StockLedger() {
  const [search, setSearch] = useState('Crocin 650 Tablet')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={20} color="#0891b2" /> Stock Ledger
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>View item-wise stock movement and ledger</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* Search medicine */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px' }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Search Medicine</label>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by medicine name..."
            style={{ width: '100%', padding: '9px 10px 9px 30px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        {search && (
          <div style={{ marginTop: 10, padding: '12px 16px', background: '#f8faff', borderRadius: 8, border: '1px solid #e0e7ff', display: 'flex', gap: 24 }}>
            <div><p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', fontWeight: 600 }}>Medicine</p><p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{search}</p></div>
            <div><p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', fontWeight: 600 }}>Code</p><p style={{ fontSize: 13, fontWeight: 600, color: '#0c3b73', margin: 0 }}>CRO65023</p></div>
            <div><p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', fontWeight: 600 }}>Opening Stock</p><p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>500</p></div>
            <div><p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', fontWeight: 600 }}>Current Stock</p><p style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', margin: 0 }}>1,250</p></div>
            <div><p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', fontWeight: 600 }}>Stock Value</p><p style={{ fontSize: 13, fontWeight: 700, color: '#0c3b73', margin: 0 }}>₹18,750.00</p></div>
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Ledger: {search || 'Select a medicine above'}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Date', 'Type', 'Ref. No.', 'In Qty', 'Out Qty', 'Balance Qty', 'Rate (₹)', 'Value (₹)'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {MOCK.map((r, i) => {
                const tc = TYPE_C[r.type] || { bg: '#f3f4f6', color: '#6b7280' }
                return (
                  <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.date}</Td>
                    <Td><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: tc.bg, color: tc.color }}>{r.type}</span></Td>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0c3b73' }}>{r.refNo}</span></Td>
                    <Td style={{ fontWeight: 700, color: r.inQty ? '#16a34a' : '#9ca3af' }}>{r.inQty ? `+${r.inQty}` : '—'}</Td>
                    <Td style={{ fontWeight: 700, color: r.outQty ? '#dc2626' : '#9ca3af' }}>{r.outQty ? `-${r.outQty}` : '—'}</Td>
                    <Td style={{ fontWeight: 700 }}>{r.balance.toLocaleString('en-IN')}</Td>
                    <Td>₹{r.rate.toFixed(2)}</Td>
                    <Td style={{ fontWeight: 600, color: '#0c3b73' }}>₹{r.value.toLocaleString('en-IN')}</Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing 1 to {MOCK.length} of {MOCK.length} entries</span>
        </div>
      </div>
    </div>
  )
}
