/* eslint-disable prettier/prettier */
/**
 * Screen 48 — Compare Suppliers
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitCompare, Plus, ShoppingCart } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { SUPPLIERS } from './liveRatesMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

const SELECTED = [
  { name: 'Azithral 500 Tablet',      qty: '10 x 3',  count: 3 },
  { name: 'Amoxicillin 500 Capsule',  qty: '10 x 3',  count: 1 },
  { name: 'Amoxicillin 500 Capsule',  qty: '10 x 10', count: 2 },
]

export default function CompareSuppliers() {
  const navigate    = useNavigate()
  const [medicine, setMedicine] = useState('Paracetamol 650mg Tablet')
  const [selected, setSelected] = useState([])

  const toggleSelect = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const savings = 2450.00
  const BEST = SUPPLIERS[0]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={GitCompare} title="Compare Suppliers" subtitle="Compare medicine prices all across suppliers" color="#7c3aed">
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Plus size={12} /> Add More Items
        </button>
      </PageHeader>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Medicine Search */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
            <input value={medicine} onChange={e => setMedicine(e.target.value)} placeholder="Search medicine..."
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
            {/* Suppliers Table */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>All Suppliers ({SUPPLIERS.length})</p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <Th c="" /><Th c="Supplier" /><Th c="Price (MRP)" align="right" /><Th c="Discount" align="center" />
                    <Th c="Your Price" align="right" /><Th c="Stock" /><Th c="Delivery" /><Th c="Rating" align="center" />
                  </tr></thead>
                  <tbody>
                    {SUPPLIERS.map((s, i) => (
                      <tr key={s.id}
                        style={{ background: i === 0 ? '#fffbeb' : '', cursor: 'pointer' }}
                        onMouseEnter={e => { if (i !== 0) e.currentTarget.style.background = '#fafafa' }}
                        onMouseLeave={e => { if (i !== 0) e.currentTarget.style.background = '' }}>
                        <Td>
                          <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)}
                            style={{ width: 14, height: 14, accentColor: '#0c3b73', cursor: 'pointer' }} />
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600 }}>{s.name}</span>
                            {i === 0 && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>BEST</span>}
                          </div>
                        </Td>
                        <Td style={{ textAlign: 'right', color: '#6b7280' }}>₹ {s.priceMRP.toFixed(2)}</Td>
                        <Td style={{ textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{s.discount}</Td>
                        <Td style={{ textAlign: 'right', fontWeight: 700, color: i === 0 ? '#16a34a' : '#111827' }}>₹ {s.yourPrice.toFixed(2)}</Td>
                        <Td>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#dcfce7', color: '#16a34a', fontWeight: 600 }}>{s.stock}</span>
                        </Td>
                        <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.delivery}</Td>
                        <Td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>⭐ {s.rating}</span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={() => navigate('/franchise/live-rates/compare-suppliers')}
                  style={{ fontSize: 12, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer' }}>
                  View All Suppliers (12) →
                </button>
              </div>
            </div>

            {/* Right: Selected + Savings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Selected Items */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Your Selected Items (3)</p>
                {SELECTED.map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 12, borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#374151', fontWeight: 500 }}>{it.name}</span>
                    <span style={{ color: '#0c3b73', fontWeight: 600 }}>{it.qty} × {it.count}</span>
                  </div>
                ))}
              </div>

              {/* Savings Card */}
              <div style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', borderRadius: 12, padding: 18, color: '#fff', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, opacity: 0.85 }}>You can save up to</p>
                <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 900 }}>₹ {savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <p style={{ margin: '0 0 14px', fontSize: 11, opacity: 0.8 }}>by comparing suppliers</p>
                <button onClick={() => navigate('/franchise/live-rates/purchase-cart')}
                  style={{ background: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, color: '#16a34a', cursor: 'pointer', width: '100%' }}>
                  <ShoppingCart size={13} style={{ marginRight: 6 }} /> Add All to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
