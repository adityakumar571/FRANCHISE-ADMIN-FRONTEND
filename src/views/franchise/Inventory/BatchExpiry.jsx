/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { FlaskConical, Search } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const STATUS_C = {
  Expired:  { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
  Critical: { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
  Warning:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Safe:     { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
}
const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function BatchExpiry() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest(`/franchise/inventory/batch-expiry?page=${page}&limit=20`)
        setBatches(res.data?.data?.batches || [])
      } catch { toast.error('Failed to load batches') }
      finally { setLoading(false) }
    })()
  }, [page])

  const filtered = batches.filter(r =>
    !search || r.medicine?.toLowerCase().includes(search.toLowerCase()) || r.batch?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FlaskConical size={20} color="#7c3aed" /> Batch & Expiry
        </h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Batch-wise stock with expiry tracking</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicine or batch..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Medicine', 'Batch No.', 'Mfg Date', 'Expiry', 'Days Left', 'Qty', 'MRP (₹)', 'Rack', 'Status'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(9).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : filtered.map((r, i) => {
                  const sc = STATUS_C[r.status] || STATUS_C.Safe
                  return (
                    <tr key={r._id || i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td style={{ fontWeight: 600 }}>{r.medicine}</Td>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.batch}</span></Td>
                      <Td style={{ color: '#6b7280' }}>{r.mfgDate}</Td>
                      <Td style={{ color: r.daysLeft < 0 ? '#dc2626' : '#6b7280' }}>{r.expiry}</Td>
                      <Td style={{ fontWeight: 700, color: r.daysLeft < 0 ? '#dc2626' : r.daysLeft <= 30 ? '#d97706' : '#374151' }}>
                        {r.daysLeft < 0 ? `Expired ${Math.abs(r.daysLeft)}d ago` : `${r.daysLeft}d`}
                      </Td>
                      <Td style={{ fontWeight: 600 }}>{r.qty}</Td>
                      <Td>₹{Number(r.mrp || 0).toFixed(2)}</Td>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.rackLabel}</span></Td>
                      <Td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{r.status}</span></Td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{filtered.length} batches shown</span>
        </div>
      </div>
    </div>
  )
}
