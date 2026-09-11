/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Warehouse, Search } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'

const Th = ({ c }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function SupplierStock() {
  const [stock, setStock]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/live-rates/supplier-stock')
        setStock(res.data?.data || [])
      } catch { toast.error('Failed to load supplier stock') }
      finally   { setLoading(false) }
    })()
  }, [])

  const filtered = stock.filter(s => !search || s.medicine?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Warehouse} title="Supplier Stock" subtitle="Live stock available from all suppliers" color="#d97706" />

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicine..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Medicine', 'Strength', 'Pack', 'Rate (₹)', 'Stock', 'Scheme'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {loading
                ? Array(6).fill(0).map((_, i) => <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : filtered.length === 0
                  ? <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>No stock data</td></tr>
                  : filtered.map((s, i) => (
                    <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td style={{ fontWeight: 600 }}>{s.medicine}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.strength || '—'}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.packSize || '—'}</Td>
                      <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹ {s.rate?.toFixed(2)}</Td>
                      <Td style={{ fontWeight: 600, color: s.stock > 50 ? '#16a34a' : s.stock > 0 ? '#d97706' : '#dc2626' }}>
                        {s.stock > 0 ? `${s.stock} units` : 'Out of Stock'}
                      </Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.scheme}</Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
