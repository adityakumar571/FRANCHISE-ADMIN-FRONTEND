/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Zap, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'

const MOCK = [
  { name: 'Crocin 650 Tablet',     cat: 'Pain Relief', totalSold: 1250, avgMonthly: 416, stockQty: 512, salesValue: '₹18,760.00' },
  { name: 'Paracetamol 650mg',     cat: 'Pain Relief', totalSold: 1160, avgMonthly: 386, stockQty: 380, salesValue: '₹11,550.00' },
  { name: 'Amoxicillin 500mg',     cat: 'Antibiotics', totalSold: 980,  avgMonthly: 326, stockQty: 200, salesValue: '₹24,990.00' },
  { name: 'Pantop DSR Capsule',    cat: 'Gastro',      totalSold: 875,  avgMonthly: 291, stockQty: 300, salesValue: '₹18,250.00' },
  { name: 'Dolo 650 Tablet',       cat: 'Pain Relief', totalSold: 760,  avgMonthly: 253, stockQty: 140, salesValue: '₹11,400.00' },
]

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function FastMoving() {
  const [search, setSearch] = useState('')
  const filtered = MOCK.filter(r => search === '' || r.name.toLowerCase().includes(search.toLowerCase()))
  const totalSold = MOCK.reduce((a, r) => a + r.totalSold, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={20} color="#16a34a" /> Fast Moving Items
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Top selling items — last 3 months</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 12 }}>
        {[
          { label: 'Fast Moving Items', value: String(MOCK.length), color: '#16a34a' },
          { label: 'Total Qty Sold',    value: totalSold.toLocaleString('en-IN'), color: '#0c3b73' },
          { label: 'Total Sales Value', value: '₹2,45,750.00', color: '#7c3aed' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fast moving items..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <select style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {['All Categories', 'Pain Relief', 'Antibiotics', 'Gastro'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {['Last 3 Months', 'Last 1 Month', 'Last 6 Months'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['#', 'Medicine Name', 'Category', 'Total Sold', 'Avg Monthly Sale', 'Stock Qty', 'Sales Value', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td style={{ color: '#9ca3af', fontWeight: 700 }}>{i + 1}</Td>
                  <Td style={{ fontWeight: 600, color: '#111827' }}>{r.name}</Td>
                  <Td><span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.cat}</span></Td>
                  <Td style={{ fontWeight: 700, color: '#16a34a' }}>{r.totalSold.toLocaleString('en-IN')}</Td>
                  <Td>{r.avgMonthly}</Td>
                  <Td style={{ fontWeight: 600, color: r.stockQty < 200 ? '#d97706' : '#374151' }}>{r.stockQty}</Td>
                  <Td style={{ fontWeight: 700, color: '#0c3b73' }}>{r.salesValue}</Td>
                  <Td>
                    <button style={{ fontSize: 11, fontWeight: 600, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer' }}>Reorder</button>
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
