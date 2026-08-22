/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Package, Search, AlertTriangle, Download } from 'lucide-react'

const MOCK = [
  { name: 'Paracetamol 650mg',    category: 'Tablets',    company: 'GSK',      mrp: 15.00, stock: 1250, lowStock: false, expiry: '2026-12-31', value: 18750 },
  { name: 'Amoxicillin 500mg',    category: 'Capsules',   company: 'Cipla',    mrp: 25.50, stock: 22,   lowStock: true,  expiry: '2025-08-15', value: 561 },
  { name: 'Azithromycin 500mg',   category: 'Tablets',    company: 'Alembic',  mrp: 32.00, stock: 18,   lowStock: true,  expiry: '2025-10-20', value: 576 },
  { name: 'Pantoprazole 40mg',    category: 'Tablets',    company: 'GSK',      mrp: 20.00, stock: 12,   lowStock: true,  expiry: '2025-07-10', value: 240 },
  { name: 'Cetrizine 10mg',       category: 'Tablets',    company: 'Cipla',    mrp: 8.50,  stock: 650,  lowStock: false, expiry: '2026-09-30', value: 5525 },
  { name: 'Dolo 650 Tablet',      category: 'Tablets',    company: 'Micro Labs',mrp: 16.00, stock: 920,  lowStock: false, expiry: '2026-06-15', value: 14720 },
  { name: 'Vitamin D3 60K',       category: 'Capsules',   company: 'Lupin',    mrp: 85.00, stock: 200,  lowStock: false, expiry: '2026-03-31', value: 17000 },
  { name: 'Metformin 500mg',      category: 'Tablets',    company: 'Sun Pharma',mrp: 12.00, stock: 8,    lowStock: true,  expiry: '2025-09-20', value: 96 },
  { name: 'Atorvastatin 10mg',    category: 'Tablets',    company: 'Pfizer',   mrp: 22.00, stock: 340,  lowStock: false, expiry: '2026-11-15', value: 7480 },
  { name: 'ORS Powder',           category: 'Powder',     company: 'Electral', mrp: 45.00, stock: 150,  lowStock: false, expiry: '2026-08-01', value: 6750 },
]

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function StockReport() {
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('All')
  const [lowOnly, setLowOnly]     = useState(false)

  const categories = ['All', ...new Set(MOCK.map(m => m.category))]

  const filtered = MOCK.filter(m =>
    (search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.company.toLowerCase().includes(search.toLowerCase())) &&
    (category === 'All' || m.category === category) &&
    (!lowOnly || m.lowStock)
  )

  const totalItems  = MOCK.length
  const totalValue  = MOCK.reduce((a, m) => a + m.value, 0)
  const lowStockCt  = MOCK.filter(m => m.lowStock).length
  const totalQty    = MOCK.reduce((a, m) => a + m.stock, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={20} color="#0c3b73" /> Stock Report
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Inventory stock summary</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Items',   value: String(totalItems),                        color: '#0c3b73' },
          { label: 'Total Qty',     value: totalQty.toLocaleString('en-IN'),           color: '#7c3aed' },
          { label: 'Total Value',   value: `₹${totalValue.toLocaleString('en-IN')}`,  color: '#16a34a' },
          { label: 'Low Stock',     value: String(lowStockCt),                         color: '#dc2626' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by medicine or company..." style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500, color: lowOnly ? '#dc2626' : '#374151' }}>
          <input type="checkbox" checked={lowOnly} onChange={e => setLowOnly(e.target.checked)} style={{ cursor: 'pointer' }} />
          <AlertTriangle size={13} color={lowOnly ? '#dc2626' : '#9ca3af'} /> Low Stock Only
        </label>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Medicine Name', 'Category', 'Company', 'MRP (₹)', 'Stock Qty', 'Expiry', 'Stock Value (₹)', 'Status'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No records found</td></tr>
                : filtered.map((m, i) => (
                  <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td style={{ fontWeight: 600 }}>{m.name}</Td>
                    <Td><span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{m.category}</span></Td>
                    <Td style={{ color: '#6b7280' }}>{m.company}</Td>
                    <Td>₹{m.mrp.toFixed(2)}</Td>
                    <Td>
                      <span style={{ fontWeight: 700, color: m.lowStock ? '#dc2626' : '#16a34a' }}>
                        {m.stock} {m.lowStock && <AlertTriangle size={11} style={{ display: 'inline', marginLeft: 3 }} />}
                      </span>
                    </Td>
                    <Td style={{ color: '#6b7280', fontSize: 12 }}>{m.expiry}</Td>
                    <Td style={{ fontWeight: 600 }}>₹{m.value.toLocaleString('en-IN')}</Td>
                    <Td>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: m.lowStock ? '#fff1f2' : '#f0fdf4', color: m.lowStock ? '#dc2626' : '#16a34a', border: `1px solid ${m.lowStock ? '#fecdd3' : '#bbf7d0'}` }}>
                        {m.lowStock ? 'Low Stock' : 'In Stock'}
                      </span>
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
