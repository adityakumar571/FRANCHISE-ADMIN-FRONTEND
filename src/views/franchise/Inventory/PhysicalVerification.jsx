/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'

const Th = ({ c }) => <th style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

const LIMIT = 20

export default function PhysicalVerification() {
  const [records, setRecords]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [starting, setStarting]     = useState(false)
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/inventory/physical-verification?page=${page}&limit=${LIMIT}`)
      const d   = res.data?.data
      // API returns either array or { records, total, totalPages }
      if (Array.isArray(d)) {
        setRecords(d)
        setTotal(d.length)
        setTotalPages(Math.ceil(d.length / LIMIT) || 1)
      } else {
        setRecords(d?.records || d || [])
        setTotal(d?.total || (d?.records || []).length)
        setTotalPages(d?.totalPages || 1)
      }
    } catch { toast.error('Failed to load verifications') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const handleStart = async () => {
    setStarting(true)
    try {
      await postRequest({ url: '/franchise/inventory/physical-verification', cred: { notes: 'Physical count verification' } })
      toast.success('Verification submitted')
      setPage(1)
      fetchRecords()
    } catch { toast.error('Failed to submit') }
    finally { setStarting(false) }
  }

  /* client-side search on fetched page */
  const displayed = search
    ? records.filter(r => r.auditNo?.toLowerCase().includes(search.toLowerCase()) || r.by?.toLowerCase().includes(search.toLowerCase()))
    : records

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={ShieldCheck} title="Physical Verification" subtitle={`Track physical stock verification records — ${total} total`} color="#16a34a">
        <button onClick={handleStart} disabled={starting}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none',
            background: starting ? '#9ca3af' : '#0c3b73', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          <Plus size={14} /> {starting ? 'Submitting...' : 'New Verification'}
        </button>
      </PageHeader>

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search audit no. or user..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Audit No.', 'Date', 'Items', 'By', 'Status'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>{Array(5).fill(0).map((_, j) => (
                    <td key={j} style={{ padding: '10px 14px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>
                  ))}</tr>
                ))
                : displayed.length === 0
                  ? <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No verification records found</td></tr>
                  : displayed.map((r, i) => (
                    <tr key={r._id || i}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td><span style={{ fontWeight: 700, color: '#16a34a' }}>{r.auditNo}</span></Td>
                      <Td style={{ color: '#6b7280' }}>{r.date}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 600 }}>{r.items}</Td>
                      <Td>{r.by}</Td>
                      <Td><StatusBadge status={r.status} /></Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
                      background: p === page ? '#0c3b73' : '#fff', color: p === page ? '#fff' : '#374151', borderColor: p === page ? '#0c3b73' : '#e5e7eb' }}>
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
