/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

const LIMIT = 20

export default function DamageStock() {
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/inventory/damaged?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}`)
      const d = res.data?.data
      setItems(d?.items || [])
      setTotal(d?.total || 0)
      setTotalPages(Math.ceil((d?.total || 0) / LIMIT) || 1)
    } catch { toast.error('Failed to load damaged stock') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = (val) => { setSearch(val); setPage(1) }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color="#ea580c" /> Damage Stock
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Medicines marked as damaged through stock adjustments ({total} records)</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search medicine or batch..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Adj. No.', 'Medicine', 'Batch', 'Qty Damaged', 'Reason', 'Date', 'Recorded By'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : items.length === 0
                  ? <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No damaged stock records found</td></tr>
                  : items.map((r, i) => (
                    <tr key={r._id || i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td style={{ fontWeight: 700, color: '#ea580c', fontFamily: 'monospace', fontSize: 11 }}>{r.adjNo}</Td>
                      <Td style={{ fontWeight: 600 }}>{r.medicine}</Td>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.batch || '—'}</span></Td>
                      <Td style={{ fontWeight: 700, color: '#dc2626' }}>{r.qty}</Td>
                      <Td style={{ color: '#6b7280' }}>{r.reason}</Td>
                      <Td style={{ color: '#6b7280' }}>{r.date}</Td>
                      <Td>{r.by}</Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {total === 0 ? 'No records' : `Showing ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}`}
          </span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#d1d5db' : '#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, i, arr) => (
              <span key={p}>
                {i > 0 && arr[i - 1] !== p - 1 && <span style={{ color: '#9ca3af', padding: '0 4px', fontSize: 12 }}>…</span>}
                <button onClick={() => setPage(p)} style={{ minWidth: 30, height: 30, borderRadius: 6, border: '1px solid', fontSize: 12, fontWeight: p === page ? 700 : 400, cursor: 'pointer',
                  background: p === page ? '#0c3b73' : '#fff', color: p === page ? '#fff' : '#374151', borderColor: p === page ? '#0c3b73' : '#e5e7eb' }}>{p}</button>
              </span>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#d1d5db' : '#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
