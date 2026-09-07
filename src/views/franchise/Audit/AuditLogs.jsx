/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback, useRef } from 'react'
import { ShieldCheck, Search, Download } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const ACTION_COLORS = {
  LOGIN:  { bg: '#e0e7ff', color: '#0c3b73' },
  LOGOUT: { bg: '#f3f4f6', color: '#6b7280' },
  CREATE: { bg: '#dcfce7', color: '#16a34a' },
  UPDATE: { bg: '#fef3c7', color: '#d97706' },
  DELETE: { bg: '#fee2e2', color: '#dc2626' },
  VIEW:   { bg: '#f0fdf4', color: '#0891b2' },
  EXPORT: { bg: '#f5f3ff', color: '#7c3aed' },
}
const RESULT_COLORS = {
  Success: { bg: '#dcfce7', color: '#16a34a' },
  Failed:  { bg: '#fee2e2', color: '#dc2626' },
}

const Th = ({ c }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 12, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function AuditLogs() {
  const [logs, setLogs]         = useState([])
  const [countMap, setCountMap] = useState({})
  const [search, setSearch]     = useState('')
  const [actionFilter, setAction] = useState('')
  const [moduleFilter, setModule] = useState('')
  const [dateFrom, setFrom]     = useState('')
  const [dateTo, setTo]         = useState('')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]   = useState(true)
  const debounceRef = useRef()

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(
        `/franchise/audit-logs?action=${actionFilter}&module=${encodeURIComponent(moduleFilter)}&from=${dateFrom}&to=${dateTo}&search=${encodeURIComponent(search)}&page=${page}&limit=20`
      )
      const d = res.data?.data
      setLogs(d?.logs || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
      if (d?.countMap) setCountMap(d.countMap)
    } catch { toast.error('Failed to load audit logs') }
    finally   { setLoading(false) }
  }, [search, actionFilter, moduleFilter, dateFrom, dateTo, page])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const handleSearchChange = (val) => {
    setSearch(val); setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchLogs, 400)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={ShieldCheck} title="Audit Logs" subtitle="Track all user actions and system events" color="#0c3b73">
        <button style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <Download size={12} /> Export
        </button>
      </PageHeader>

      {/* Action Count Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
        {['LOGIN', 'CREATE', 'UPDATE', 'DELETE'].map(a => {
          const cfg = ACTION_COLORS[a] || ACTION_COLORS.VIEW
          return (
            <button key={a} onClick={() => { setAction(actionFilter === a ? '' : a); setPage(1) }}
              style={{ background: actionFilter === a ? cfg.color : '#fff', border: `2px solid ${actionFilter === a ? cfg.color : '#e5e7eb'}`, borderRadius: 10, padding: '12px 10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: actionFilter === a ? '#fff' : cfg.color, margin: '0 0 2px' }}>{countMap[a] || 0}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: actionFilter === a ? 'rgba(255,255,255,0.8)' : '#6b7280', margin: 0 }}>{a}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => handleSearchChange(e.target.value)} placeholder="Search description or user..."
            style={{ width: '100%', padding: '8px 10px 8px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={actionFilter} onChange={e => { setAction(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option value="">All Actions</option>
          {['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT'].map(a => <option key={a}>{a}</option>)}
        </select>
        <select value={moduleFilter} onChange={e => { setModule(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option value="">All Modules</option>
          {['Auth', 'POS', 'Purchase', 'Inventory', 'Medicine', 'Supplier', 'Customer', 'Staff', 'Reports', 'Settings'].map(m => <option key={m}>{m}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => { setFrom(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer' }} />
        <input type="date" value={dateTo} onChange={e => { setTo(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer' }} />
        {(search || actionFilter || moduleFilter || dateFrom || dateTo) && (
          <button onClick={() => { setSearch(''); setAction(''); setModule(''); setFrom(''); setTo(''); setPage(1) }}
            style={{ padding: '8px 14px', border: 'none', borderRadius: 8, background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['#', 'Action', 'Module', 'Description', 'User · Role', 'IP Address', 'Timestamp', 'Result'].map(h => <Th key={h} c={h} />)}
            </tr></thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : logs.length === 0
                  ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No audit logs found</td></tr>
                  : logs.map((l, i) => {
                    const aCfg = ACTION_COLORS[l.action] || ACTION_COLORS.VIEW
                    const rCfg = RESULT_COLORS[l.result] || RESULT_COLORS.Success
                    return (
                      <tr key={l._id || i}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <Td style={{ color: '#9ca3af' }}>{(page - 1) * 20 + i + 1}</Td>
                        <Td>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: aCfg.bg, color: aCfg.color }}>{l.action}</span>
                        </Td>
                        <Td style={{ fontWeight: 500 }}>{l.module}</Td>
                        <Td style={{ color: '#374151', maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.description}</Td>
                        <Td>
                          <p style={{ margin: 0, fontWeight: 600 }}>{l.userName}</p>
                          <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{l.userRole}</p>
                        </Td>
                        <Td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{l.ipAddress}</Td>
                        <Td style={{ fontSize: 11, color: '#6b7280' }}>{l.timestamp}</Td>
                        <Td>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: rCfg.bg, color: rCfg.color }}>{l.result}</span>
                        </Td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {logs.length} of {total} entries</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none' }}>← Prev</button>
            <span style={{ padding: '5px 10px', fontSize: 12 }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none' }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
