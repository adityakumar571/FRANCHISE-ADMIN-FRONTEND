/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Tag, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function SchemeComparison() {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/live-rates/schemes')
        setSchemes(res.data?.data || [])
      } catch { toast.error('Failed to load schemes') }
      finally   { setLoading(false) }
    })()
  }, [])

  const filtered = schemes.filter(s =>
    !search ||
    s.supplier?.toLowerCase().includes(search.toLowerCase()) ||
    s.medicine?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Tag} title="Scheme Comparison" subtitle="Compare supplier schemes and offers" color="#7c3aed" />

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search supplier or medicine..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Supplier', 'Medicine', 'Discount', 'Scheme', 'Free Items', 'Target', 'Valid Till', 'Net Price (₹)'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : filtered.length === 0
                  ? <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>No schemes found</td></tr>
                  : filtered.map((s, i) => (
                    <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td style={{ fontWeight: 600 }}>{s.supplier}</Td>
                      <Td>{s.medicine}</Td>
                      <Td style={{ fontWeight: 700, color: '#16a34a' }}>{s.discount}</Td>
                      <Td><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>{s.scheme}</span></Td>
                      <Td style={{ color: '#6b7280' }}>{s.freeItems}</Td>
                      <Td style={{ color: '#6b7280' }}>{s.target || '—'}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.validity}</Td>
                      <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹ {s.netPrice?.toFixed(2)}</Td>
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
