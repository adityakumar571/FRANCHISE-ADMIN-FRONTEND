/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback, useRef } from 'react'
import { BookOpen, Search, ChevronLeft, ChevronRight, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

const LIMIT = 20

export default function StockLedger() {
  const [entries, setEntries]         = useState([])
  const [medicineName, setMedicineName] = useState('')
  const [loading, setLoading]         = useState(false)
  const [searched, setSearched]       = useState(false)
  const [medicineInput, setMedicineInput] = useState('')
  const [page, setPage]               = useState(1)
  const [total, setTotal]             = useState(0)
  const [totalPages, setTotalPages]   = useState(1)
  const inputRef = useRef()

  const fetchLedger = useCallback(async () => {
    if (!medicineInput.trim()) return
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/inventory/ledger?medicineId=${encodeURIComponent(medicineInput.trim())}&page=${page}&limit=${LIMIT}`)
      const d = res.data?.data
      setEntries(d?.entries || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
      setMedicineName(d?.medicine || medicineInput)
      setSearched(true)
    } catch { toast.error('Failed to load stock ledger') }
    finally { setLoading(false) }
  }, [medicineInput, page])

  useEffect(() => {
    if (searched) fetchLedger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleSearch = () => {
    setPage(1)
    setSearched(false)
    fetchLedger()
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={20} color="#0891b2" /> Stock Ledger
        </h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Item-wise stock movement history</p>
      </div>

      {/* Search bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input ref={inputRef} value={medicineInput} onChange={e => setMedicineInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setPage(1); handleSearch() } }}
            placeholder="Search medicine name and press Enter or click Search..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <button onClick={handleSearch} disabled={!medicineInput.trim()}
          style={{ padding: '8px 20px', border: 'none', borderRadius: 7, background: medicineInput.trim() ? '#0c3b73' : '#9ca3af', color: '#fff', fontSize: 13, fontWeight: 600, cursor: medicineInput.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
          Search
        </button>
        {searched && (
          <button onClick={() => { setMedicineInput(''); setSearched(false); setEntries([]); setTotal(0); setPage(1); inputRef.current?.focus() }}
            style={{ padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 7, background: '#fff', fontSize: 12, color: '#6b7280', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {searched && medicineName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Showing ledger for:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0c3b73', background: '#e0e7ff', padding: '2px 10px', borderRadius: 20 }}>{medicineName}</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{total} entries</span>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th c="Date" /><Th c="Type" /><Th c="Voucher" />
                <Th c="In (+)" align="center" /><Th c="Out (-)" align="center" />
                <Th c="Balance" align="center" /><Th c="Remark" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>{Array(7).fill(0).map((_, j) => (
                    <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>
                  ))}</tr>
                ))
                : entries.length === 0
                  ? (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                      {searched ? 'No stock movements found' : 'Search a medicine to see stock movements'}
                    </td></tr>
                  )
                  : entries.map((r, i) => (
                    <tr key={i}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td style={{ color: '#6b7280' }}>{r.date}</Td>
                      <Td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: r.type === 'Sale' ? '#fff1f2' : '#f0fdf4',
                          color: r.type === 'Sale' ? '#dc2626' : '#16a34a' }}>
                          {r.type === 'Sale'
                            ? <ArrowUpCircle size={11} />
                            : <ArrowDownCircle size={11} />
                          }
                          {r.type}
                        </span>
                      </Td>
                      <Td style={{ fontFamily: 'monospace', fontSize: 11, color: '#0c3b73' }}>{r.voucher}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{r.qty > 0 ? r.qty : '—'}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>{r.qty < 0 ? Math.abs(r.qty) : '—'}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 700 }}>{r.balance}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.remark}</Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {!searched ? 'Enter a medicine name to search' :
              total === 0 ? 'No entries' : `Showing ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}`}
          </span>
          {totalPages > 1 && (
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
          )}
        </div>
      </div>
    </div>
  )
}
