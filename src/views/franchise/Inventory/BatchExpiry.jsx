/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { FlaskConical, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react'
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

const LIMIT = 20

export default function BatchExpiry() {
  const [batches, setBatches]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]             = useState(1)
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(
        `/franchise/inventory/batch-expiry?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}&status=${statusFilter}`
      )
      const d = res.data?.data
      setBatches(d?.batches || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
    } catch { toast.error('Failed to load batches') }
    finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = (val) => { setSearch(val); setPage(1) }
  const handleStatus = (val) => { setStatusFilter(val); setPage(1) }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FlaskConical size={20} color="#7c3aed" /> Batch &amp; Expiry
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Batch-wise stock with expiry tracking — {total} batches</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search medicine or batch..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={e => handleStatus(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option value="">All Status</option>
          <option value="Expired">Expired</option>
          <option value="Critical">Critical (≤30d)</option>
          <option value="Warning">Warning (≤90d)</option>
          <option value="Safe">Safe</option>
        </select>
        {(search || statusFilter) && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); setPage(1) }}
            style={{ padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 7, background: '#fff', fontSize: 12, color: '#6b7280', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Medicine', 'Batch No.', 'Mfg Date', 'Expiry', 'Days Left', 'Qty', 'MRP (₹)', 'Rack', 'Status'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>{Array(9).fill(0).map((_, j) => (
                    <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>
                  ))}</tr>
                ))
                : batches.length === 0
                  ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No batches found</td></tr>
                  : batches.map((r, i) => {
                    const sc = STATUS_C[r.status] || STATUS_C.Safe
                    return (
                      <tr key={r._id || i}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
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
                        <Td>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            {r.status}
                          </span>
                        </Td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {total === 0 ? 'No records' : `Showing ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}`}
          </span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#d1d5db' : '#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <span key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span style={{ color: '#9ca3af', padding: '0 4px', fontSize: 12 }}>…</span>}
                  <button onClick={() => setPage(p)}
                    style={{ minWidth: 30, height: 30, borderRadius: 6, border: '1px solid', fontSize: 12, fontWeight: p === page ? 700 : 400, cursor: 'pointer',
                      background: p === page ? '#7c3aed' : '#fff', color: p === page ? '#fff' : '#374151', borderColor: p === page ? '#7c3aed' : '#e5e7eb' }}>
                    {p}
                  </button>
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
