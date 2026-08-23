/* eslint-disable prettier/prettier */
/**
 * Screen 49 — Supplier Live Stock
 */
import { useState } from 'react'
import { Warehouse, Search, Filter } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { MEDICINES } from './liveRatesMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

const STOCK_DATA = [
  { name: 'Paracetamol 650mg Tablet', strength: 'Tablet', pack: '10x15', inStock: 1050, lowStock: 460, liveStock: 'In Stock',  delivery: '1 Day',  price: 13.20 },
  { name: 'Azithral 500 Tablet',      strength: 'Tablet', pack: '10x3',  inStock: 968,  lowStock: 0,   liveStock: 'In Stock',  delivery: '2 Days', price: 36.80 },
  { name: 'Amoxicillin 500 Capsule',  strength: 'Capsule',pack: '10x10', inStock: 406,  lowStock: 0,   liveStock: 'Low Stock', delivery: '2 Days', price: 24.60 },
  { name: 'Pantop DSR Capsule',       strength: 'Capsule',pack: '10x10', inStock: 320,  lowStock: 0,   liveStock: 'In Stock',  delivery: '1 Day',  price: 92.40 },
  { name: 'Levothyroxine 5mg Tablet', strength: 'Tablet', pack: '10x10', inStock: 0,    lowStock: 0,   liveStock: 'Out of Stock', delivery: '3 Days', price: 18.60 },
]

export default function SupplierStock() {
  const [search, setSearch] = useState('')
  const [supplier, setSupplier] = useState('Medico Agency')

  const totalMeds = 8540, inStock = 7245, lowStock = 856, outStock = 439

  const filtered = STOCK_DATA.filter(m =>
    search === '' || m.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Warehouse} title="Supplier Live Stock" subtitle="Real-time stock availability from suppliers" color="#0891b2">
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Filter size={12} /> Filters
        </button>
      </PageHeader>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Supplier Selector + Search */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={supplier} onChange={e => setSupplier(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
              {['Medico Agency','Life Care Distributors','Apollo Pharma','Sunrise Pharmaceuticals'].map(s => <option key={s}>{s}</option>)}
            </select>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicine..."
                style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { label: 'Total Medicines', value: totalMeds.toLocaleString('en-IN'), color: '#0c3b73', bg: '#e0e7ff' },
              { label: 'In Stock',        value: inStock.toLocaleString('en-IN'),   color: '#16a34a', bg: '#dcfce7' },
              { label: 'Low Stock',       value: lowStock,                          color: '#d97706', bg: '#fef3c7' },
              { label: 'Out of Stock',    value: outStock,                          color: '#dc2626', bg: '#fee2e2' },
            ].map(k => (
              <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', borderLeft: `4px solid ${k.color}` }}>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: k.color, margin: 0 }}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Stock Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Stock List — {supplier}</p>
              <button style={{ fontSize: 12, fontWeight: 600, color: '#0891b2', background: 'none', border: 'none', cursor: 'pointer' }}>View All Medi-trees →</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <Th c="Medicine Name" /><Th c="Strength" /><Th c="Pack" />
                  <Th c="In Stock" align="center" /><Th c="Name" /><Th c="Status" /><Th c="Delivery Time" /><Th c="MRP (₹)" align="right" />
                </tr></thead>
                <tbody>
                  {filtered.map((m, i) => {
                    const statusColor = m.liveStock === 'In Stock' ? { bg: '#dcfce7', color: '#16a34a' } : m.liveStock === 'Low Stock' ? { bg: '#fef3c7', color: '#d97706' } : { bg: '#fee2e2', color: '#dc2626' }
                    return (
                      <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <Td style={{ fontWeight: 600 }}>{m.name}</Td>
                        <Td style={{ color: '#6b7280', fontSize: 11 }}>{m.strength}</Td>
                        <Td style={{ color: '#6b7280', fontSize: 11 }}>{m.pack}</Td>
                        <Td style={{ textAlign: 'center', fontWeight: 700, color: m.inStock === 0 ? '#dc2626' : '#111827' }}>{m.inStock}</Td>
                        <Td style={{ color: '#9ca3af', fontSize: 11 }}>—</Td>
                        <Td><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: statusColor.bg, color: statusColor.color }}>{m.liveStock}</span></Td>
                        <Td style={{ color: '#6b7280', fontSize: 12 }}>{m.delivery}</Td>
                        <Td style={{ textAlign: 'right', fontWeight: 700 }}>₹ {m.price.toFixed(2)}</Td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  )
}
