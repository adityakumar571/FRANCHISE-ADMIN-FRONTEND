/* eslint-disable prettier/prettier */
/**
 * TablePagination — reusable pagination bar for all franchise tables
 */
import { ChevronLeft, ChevronRight } from 'lucide-react'

const TablePagination = ({ page, total, limit = 10, onPageChange, onLimitChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (total === 0) return null

  const start = (page - 1) * limit + 1
  const end   = Math.min(page * limit, total)

  // smart page range: show at most 5 pages around current
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = []
    if (page <= 4) {
      for (let i = 1; i <= Math.min(5, totalPages); i++) pages.push(i)
      if (totalPages > 6) pages.push('...')
      pages.push(totalPages)
    } else if (page >= totalPages - 3) {
      pages.push(1)
      if (totalPages > 6) pages.push('...')
      for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages)
    }
    return pages
  }

  const btnBase = {
    border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px',
    background: 'none', fontSize: 12, cursor: 'pointer', minWidth: 32,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          Showing {start}–{end} of {total}
        </span>
        {onLimitChange && (
          <select value={limit} onChange={e => { onLimitChange(Number(e.target.value)); onPageChange(1) }}
            style={{ padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, outline: 'none', cursor: 'pointer', color: '#374151' }}>
            {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v} / page</option>)}
          </select>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          style={{ ...btnBase, color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'default' : 'pointer' }}>
          <ChevronLeft size={14} />
        </button>
        {getPages().map((p, i) =>
          p === '...'
            ? <span key={`dot-${i}`} style={{ padding: '5px 4px', fontSize: 12, color: '#9ca3af' }}>…</span>
            : (
              <button key={p} onClick={() => onPageChange(p)}
                style={{ ...btnBase, background: page === p ? '#0c3b73' : 'none', borderColor: page === p ? '#0c3b73' : '#e5e7eb', color: page === p ? '#fff' : '#374151', fontWeight: page === p ? 700 : 400 }}>
                {p}
              </button>
            )
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          style={{ ...btnBase, color: page === totalPages ? '#d1d5db' : '#374151', cursor: page === totalPages ? 'default' : 'pointer' }}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

export default TablePagination
