/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { TrendingDown, Search } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function DeadStock() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/inventory/dead-stock')
        setItems(res.data?.data?.items || [])
      } catch { toast.error('Failed to load dead stock') }
      finally { setLoading(false) }
    })()
  }, [])

  const filtered = items.filter(r => !search || r.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingDown size={20} color="#6b7280" /> Dead Stock
        </h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Medicines with zero stock (out of stock)</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ position: 'relative', maxWidth: 320 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicine..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Medicine Name" /><Th c="Category" /><Th c="Current Stock" align="center" /><Th c="MRP (₹)" align="right" /><Th c="Status" />
            </tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : filtered.length === 0
                  ? <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No dead stock found</td></tr>
                  : filtered.map((r, i) => (
                    <tr key={r._id || i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td style={{ fontWeight: 600 }}>{r.name}</Td>
                      <Td style={{ color: '#6b7280' }}>{r.category}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>{r.currentStock}</Td>
                      <Td style={{ textAlign: 'right' }}>₹{Number(r.mrp || 0).toFixed(2)}</Td>
                      <Td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' }}>Dead Stock</span>
                      </Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{filtered.length} items shown</span>
        </div>
      </div>
    </div>
  )
}
