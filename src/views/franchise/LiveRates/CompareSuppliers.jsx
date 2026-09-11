/* eslint-disable prettier/prettier */
import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitCompare, Search, ShoppingCart, Star } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function CompareSuppliers() {
  const navigate        = useNavigate()
  const [medicine, setMedicine] = useState('Paracetamol 650mg')
  const [suppliers, setSuppliers] = useState([])
  const [savings, setSavings]   = useState(0)
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef()

  const fetchCompare = useCallback(async (med) => {
    if (!med) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await getRequest(`/franchise/live-rates/compare-suppliers?medicine=${encodeURIComponent(med)}`)
      setSuppliers(res.data?.data?.suppliers || [])
      setSavings(res.data?.data?.savings || 0)
    } catch { toast.error('Failed to load comparison') }
    finally   { setLoading(false) }
  }, [])

  const handleChange = (val) => {
    setMedicine(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchCompare(val), 500)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={GitCompare} title="Compare Suppliers" subtitle="Compare medicine prices across all suppliers" color="#7c3aed" />

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
        <input value={medicine} onChange={e => handleChange(e.target.value)}
          placeholder="Type medicine name to compare suppliers..."
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
      </div>

      {!searched && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
          <GitCompare size={36} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
          Start typing a medicine name to compare suppliers
        </div>
      )}

      {searched && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>
          {/* Suppliers Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>All Suppliers ({suppliers.length})</p>
              {savings > 0 && (
                <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '4px 10px', borderRadius: 20, border: '1px solid #bbf7d0' }}>
                  Save ₹{savings.toFixed(2)} per unit by choosing best
                </span>
              )}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <Th c="" /><Th c="Supplier" /><Th c="MRP (₹)" align="right" /><Th c="Discount" align="center" />
                  <Th c="Your Price" align="right" /><Th c="Scheme" /><Th c="Stock" /><Th c="Delivery" /><Th c="Rating" align="center" />
                </tr></thead>
                <tbody>
                  {loading
                    ? Array(4).fill(0).map((_, i) => (
                      <tr key={i}>{Array(9).fill(0).map((_, j) => (
                        <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>
                      ))}</tr>
                    ))
                    : suppliers.length === 0
                      ? <tr><td colSpan={9} style={{ padding: 28, textAlign: 'center', color: '#9ca3af' }}>No supplier data found</td></tr>
                      : suppliers.map((s, i) => (
                        <tr key={s.id || i}
                          style={{ background: s.best ? '#f0fdf4' : '#fff' }}
                          onMouseEnter={e => { if (!s.best) e.currentTarget.style.background = '#fafafa' }}
                          onMouseLeave={e => { if (!s.best) e.currentTarget.style.background = '' }}>
                          <Td>
                            <input type="checkbox" style={{ cursor: 'pointer' }} />
                          </Td>
                          <Td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 600 }}>{s.name}</span>
                              {s.verified && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: '#dcfce7', color: '#16a34a' }}>✓</span>}
                              {s.best && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: '#fef3c7', color: '#d97706' }}>Best</span>}
                            </div>
                          </Td>
                          <Td style={{ textAlign: 'right', color: '#6b7280' }}>₹ {s.priceMRP?.toFixed(2)}</Td>
                          <Td style={{ textAlign: 'center', fontWeight: 600, color: '#16a34a' }}>{s.discount}</Td>
                          <Td style={{ textAlign: 'right', fontWeight: 700, color: s.best ? '#16a34a' : '#111827' }}>₹ {s.yourPrice?.toFixed(2)}</Td>
                          <Td style={{ fontSize: 12, color: '#6b7280' }}>{s.scheme}</Td>
                          <Td>
                            <span style={{ fontSize: 11, fontWeight: 600, color: s.stockQty > 0 ? '#16a34a' : '#dc2626' }}>{s.stock}</span>
                          </Td>
                          <Td style={{ fontSize: 12, color: '#6b7280' }}>{s.delivery}</Td>
                          <Td style={{ textAlign: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>
                              <Star size={12} fill="#f59e0b" /> {s.rating}
                            </span>
                          </Td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Best Supplier Panel */}
          {suppliers[0] && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Best Supplier</h3>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14 }}>
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#111827' }}>{suppliers[0].name}</p>
                <p style={{ margin: '0 0 8px', fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Best Price ₹{suppliers[0].yourPrice?.toFixed(2)}</p>
                {[
                  ['MRP',      `₹${suppliers[0].priceMRP?.toFixed(2)}`],
                  ['Discount', suppliers[0].discount],
                  ['Scheme',   suppliers[0].scheme],
                  ['Stock',    suppliers[0].stock],
                  ['Delivery', suppliers[0].delivery],
                  ['Rating',   `⭐ ${suppliers[0].rating}`],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #dcfce7', fontSize: 12 }}>
                    <span style={{ color: '#6b7280' }}>{l}</span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/franchise/live-rates/purchase-cart')}
                style={{ padding: '10px', border: 'none', borderRadius: 8, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <ShoppingCart size={14} /> Add to Cart
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
