/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import {
  ClipboardList, Download, Search, ChevronLeft, ChevronRight,
  LogIn, Plus, Edit2, Trash2, Link2, ToggleRight, Calendar,
  Shield, User, Building2, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Activity, AlertOctagon, Users, RefreshCw, Loader2,
} from 'lucide-react'
import { getRequest, deleteRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

/* ─── palette ─── */
const C = {
  primary: '#0c3b73', accent: '#fabf22', success: '#16a34a',
  danger: '#dc2626', border: '#e5e7eb', bg: '#f8f9fb',
}

const inputStyle = {
  border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px',
  fontSize: 13, color: '#374151', outline: 'none', background: '#fff',
  fontFamily: 'Inter, -apple-system, sans-serif', boxSizing: 'border-box',
}

/* ─── action / role config ─── */
const ACTION_CONFIG = {
  Login:           { color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: LogIn },
  Logout:          { color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb', icon: LogIn },
  Create:          { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: Plus },
  Update:          { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Edit2 },
  Delete:          { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: Trash2 },
  Assign:          { color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', icon: Link2 },
  'Status Change': { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: ToggleRight },
  System:          { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', icon: Activity },
  Other:           { color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb', icon: Edit2 },
}

const ROLE_CONFIG = {
  SuperAdmin:      { color: C.primary, bg: '#eff6ff',  border: '#bfdbfe' },
  Admin:           { color: '#7c3aed', bg: '#faf5ff',  border: '#e9d5ff' },
  'Super Admin':   { color: C.primary, bg: '#eff6ff',  border: '#bfdbfe' },
  System:          { color: '#0891b2', bg: '#ecfeff',  border: '#a5f3fc' },
}

/* ─── badges ─── */
const ActionBadge = ({ action }) => {
  const cfg  = ACTION_CONFIG[action] || ACTION_CONFIG.Other
  const Icon = cfg.icon
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700,
      padding:'3px 9px', borderRadius:20, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
      <Icon size={10} strokeWidth={2.5} />{action}
    </span>
  )
}

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.Admin
  return (
    <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:20,
      background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
      {role}
    </span>
  )
}

const StatusBadge = ({ status }) => {
  const ok = status === 'Success' || status === true
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700,
      padding:'3px 9px', borderRadius:20,
      background: ok ? '#f0fdf4' : '#fef2f2',
      color:      ok ? '#16a34a' : '#dc2626',
      border:`1px solid ${ok ? '#bbf7d0' : '#fecaca'}` }}>
      {ok ? <CheckCircle size={10} /> : <XCircle size={10} />}
      {ok ? 'Success' : 'Failed'}
    </span>
  )
}

/* ─── stat card ─── */
const StatCard = ({ icon: Icon, label, value, color, bg, loading }) => (
  <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:12,
    padding:'16px 20px', flex:'1 1 160px', display:'flex', alignItems:'center', gap:14 }}>
    <div style={{ width:44, height:44, borderRadius:11, background:bg,
      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize:22, fontWeight:800, color:'#111827', margin:0 }}>
        {loading ? '…' : value}
      </p>
      <p style={{ fontSize:12, color:'#6b7280', margin:'2px 0 0', fontWeight:500 }}>{label}</p>
    </div>
  </div>
)

/* ─── skeleton row ─── */
const SkeletonRow = () => (
  <tr>
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} style={{ padding:'14px', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ height:12, borderRadius:6, background:'#f3f4f6',
          width: i === 3 ? '70%' : i === 7 ? 24 : '50%', animation:'pulse 1.5s infinite' }} />
      </td>
    ))}
  </tr>
)

/* ─── expanded detail ─── */
const ExpandedDetail = ({ log }) => {
  const renderValue = (val) => {
    if (val == null) return <em style={{ color:'#9ca3af' }}>None</em>
    if (typeof val === 'object') {
      return (
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {Object.entries(val).map(([k, v]) => (
            <span key={k} style={{ fontSize:11, background:'#f3f4f6', borderRadius:6, padding:'3px 8px', color:'#374151' }}>
              <strong>{k}:</strong> {Array.isArray(v) ? v.join(', ') : String(v)}
            </span>
          ))}
        </div>
      )
    }
    return <span style={{ fontSize:12, color:'#374151' }}>{String(val)}</span>
  }

  const meta = log.meta || {}

  return (
    <div style={{ background:'#f8f9fb', borderTop:`1px solid ${C.border}`, padding:'16px 20px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Log Details</p>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            <span style={{ fontSize:12, color:'#374151' }}><strong>Log ID:</strong> {log._id}</span>
            <span style={{ fontSize:12, color:'#374151' }}><strong>Module:</strong> {log.module}</span>
            <span style={{ fontSize:12, color:'#374151' }}><strong>Type:</strong> {log.type}</span>
            <span style={{ fontSize:12, color:'#374151' }}><strong>IP Address:</strong> {log.ip}</span>
          </div>
        </div>
        {meta.before != null && (
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Before</p>
            {renderValue(meta.before)}
          </div>
        )}
        {meta.after != null && (
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>After</p>
            {renderValue(meta.after)}
          </div>
        )}
        {meta.reason && (
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Reason</p>
            <span style={{ fontSize:12, color:'#374151' }}>{meta.reason}</span>
          </div>
        )}
        {Object.keys(meta).length === 0 && (
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Metadata</p>
            <em style={{ fontSize:12, color:'#9ca3af' }}>No additional metadata</em>
          </div>
        )}
      </div>
    </div>
  )
}

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-IN', {
    day:'2-digit', month:'short', year:'numeric',
    hour:'2-digit', minute:'2-digit', hour12:true,
  }) : '—'

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function SuperAdminAuditLogs() {
  /* ── filters ── */
  const [search,       setSearch]       = useState('')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [typeFilter,   setTypeFilter]   = useState('All')
  const [page,         setPage]         = useState(1)
  const [expandedRow,  setExpandedRow]  = useState(null)

  /* ── data ── */
  const [logs,    setLogs]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(false)

  const PER_PAGE = 10

  /* ── fetch ── */
  const fetchLogs = useCallback(() => {
    setLoading(true)
    setExpandedRow(null)
    const params = new URLSearchParams({ page, limit: PER_PAGE })
    if (search)              params.set('search', search)
    if (typeFilter !== 'All') params.set('type', typeFilter)
    if (dateFrom)            params.set('from', dateFrom)
    if (dateTo)              params.set('to', dateTo)

    getRequest(`activity-logs?${params}`)
      .then(res => {
        const d = res?.data?.data
        setLogs(d?.data  || [])
        setTotal(d?.total || 0)
      })
      .catch(() => toast.error('Failed to load audit logs'))
      .finally(() => setLoading(false))
  }, [page, search, typeFilter, dateFrom, dateTo])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const applyFilter = (fn) => { fn(); setPage(1) }

  /* ── delete a log ── */
  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this log entry?')) return
    deleteRequest(`activity-logs/${id}`)
      .then(() => { toast.success('Log deleted'); fetchLogs() })
      .catch(() => toast.error('Failed to delete log'))
  }

  /* ── derived stats from current fetch (not full DB) ── */
  const todayCount    = logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length
  const criticalCount = logs.filter(l => ['Delete', 'Status Change'].includes(l.type)).length
  const totalPages    = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div style={{ fontFamily:'Inter, -apple-system, sans-serif', fontSize:13, background:C.bg, minHeight:'100vh', padding:4 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:11, background:C.primary,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ClipboardList size={20} color={C.accent} />
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:'#111827', margin:0 }}>Audit Logs</h1>
            <p style={{ fontSize:12, color:'#9ca3af', margin:'2px 0 0' }}>Track all admin actions and system events across the platform</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={fetchLogs}
            disabled={loading}
            style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', color:'#374151',
              border:`1px solid ${C.border}`, borderRadius:9, padding:'9px 16px', fontSize:13, fontWeight:700, cursor:'pointer',
              opacity: loading ? 0.6 : 1 }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button style={{ display:'flex', alignItems:'center', gap:6, background:C.success, color:'#fff',
            border:'none', borderRadius:9, padding:'9px 18px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:16 }}>
        <StatCard icon={ClipboardList} label="Total Logs"       value={total}        color={C.primary}  bg="#eff6ff" loading={loading} />
        <StatCard icon={Activity}      label="Today (this page)" value={todayCount}  color={C.success}  bg="#f0fdf4" loading={loading} />
        <StatCard icon={AlertOctagon}  label="Critical (page)"   value={criticalCount} color={C.danger} bg="#fef2f2" loading={loading} />
        <StatCard icon={Users}         label="Showing"           value={logs.length} color="#7c3aed"    bg="#faf5ff" loading={loading} />
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:10, padding:'12px 16px',
        display:'flex', flexWrap:'wrap', gap:10, alignItems:'center', marginBottom:14 }}>

        {/* Search */}
        <div style={{ position:'relative', flex:'1 1 220px', minWidth:180 }}>
          <Search size={14} color="#9ca3af" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => applyFilter(() => setSearch(e.target.value))}
            placeholder="Search action, user, target…"
            style={{ ...inputStyle, paddingLeft:32, width:'100%' }}
          />
        </div>

        {/* Date range */}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Calendar size={13} color="#9ca3af" />
          <input type="date" value={dateFrom} onChange={e => applyFilter(() => setDateFrom(e.target.value))}
            style={{ ...inputStyle, minWidth:140 }} />
          <span style={{ fontSize:12, color:'#9ca3af' }}>to</span>
          <input type="date" value={dateTo} onChange={e => applyFilter(() => setDateTo(e.target.value))}
            style={{ ...inputStyle, minWidth:140 }} />
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => applyFilter(() => setTypeFilter(e.target.value))}
          style={{ ...inputStyle, minWidth:160, cursor:'pointer' }}>
          {['All', 'Login', 'Logout', 'Create', 'Update', 'Delete', 'System', 'Other'].map(a => (
            <option key={a}>{a}</option>
          ))}
        </select>

        {/* Clear */}
        {(search || dateFrom || dateTo || typeFilter !== 'All') && (
          <button
            onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setTypeFilter('All'); setPage(1) }}
            style={{ ...inputStyle, background:'#fff1f1', color:C.danger, cursor:'pointer', border:`1px solid #fecaca`, fontWeight:600 }}>
            Clear
          </button>
        )}
      </div>

      {/* ── TABLE ── */}
      <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f9fafb' }}>
                {['Timestamp', 'User', 'Action Type', 'Description', 'Target', 'IP Address', 'Module', ''].map(h => (
                  <th key={h} style={{ padding:'10px 14px', fontSize:10, color:'#6b7280', fontWeight:700,
                    textTransform:'uppercase', textAlign:'left', borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: PER_PAGE }).map((_, i) => <SkeletonRow key={i} />)
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding:48, textAlign:'center', color:'#9ca3af' }}>
                    <ClipboardList size={36} style={{ marginBottom:8, opacity:0.3 }} />
                    <p style={{ margin:0 }}>No audit logs found</p>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <>
                    <tr
                      key={log._id}
                      onClick={() => setExpandedRow(p => p === log._id ? null : log._id)}
                      onMouseEnter={e => { if (expandedRow !== log._id) e.currentTarget.style.background = '#f8f9fb' }}
                      onMouseLeave={e => { if (expandedRow !== log._id) e.currentTarget.style.background = '' }}
                      style={{
                        borderBottom: expandedRow === log._id ? 'none' : `1px solid #f3f4f6`,
                        cursor:'pointer',
                        background: expandedRow === log._id ? '#f0f4ff' : '#fff',
                        transition:'background .1s',
                      }}>

                      {/* Timestamp */}
                      <td style={{ padding:'11px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <Calendar size={11} color="#9ca3af" />
                          <span style={{ fontSize:11, color:'#6b7280', whiteSpace:'nowrap' }}>{fmtDate(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td style={{ padding:'11px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <div style={{ width:28, height:28, borderRadius:7,
                            background: (ROLE_CONFIG[log.user] || ROLE_CONFIG.Admin).bg,
                            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {log.user === 'System' ? <Activity size={13} color="#0891b2" />
                              : <User size={13} color={C.primary} />}
                          </div>
                          <div>
                            <p style={{ fontSize:12, fontWeight:600, color:'#111827', margin:0 }}>{log.user}</p>
                            <RoleBadge role={log.type === 'Login' ? 'Admin' : 'Admin'} />
                          </div>
                        </div>
                      </td>

                      {/* Action Type */}
                      <td style={{ padding:'11px 14px' }}><ActionBadge action={log.type} /></td>

                      {/* Description */}
                      <td style={{ padding:'11px 14px', maxWidth:220 }}>
                        <p style={{ fontSize:12, color:'#374151', margin:0, lineHeight:1.4,
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {log.action}
                        </p>
                      </td>

                      {/* Target */}
                      <td style={{ padding:'11px 14px' }}>
                        <div>
                          <p style={{ fontSize:11, fontWeight:600, color:'#374151', margin:0 }}>{log.target}</p>
                          <p style={{ fontSize:10, color:'#9ca3af', margin:'2px 0 0' }}>{log.module}</p>
                        </div>
                      </td>

                      {/* IP */}
                      <td style={{ padding:'11px 14px' }}>
                        <span style={{ fontSize:11, fontFamily:'monospace', color:'#6b7280',
                          background:'#f3f4f6', borderRadius:5, padding:'2px 7px' }}>{log.ip}</span>
                      </td>

                      {/* Module badge */}
                      <td style={{ padding:'11px 14px' }}>
                        <span style={{ fontSize:10, background:'#f3f4f6', color:'#6b7280', padding:'2px 8px', borderRadius:20, fontWeight:600 }}>
                          {log.module}
                        </span>
                      </td>

                      {/* Expand + delete */}
                      <td style={{ padding:'11px 14px' }}>
                        <div style={{ display:'flex', gap:5 }}>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(log._id, e) }}
                            style={{ width:26, height:26, borderRadius:6, border:`1px solid #fecaca`,
                              background:'#fff1f1', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                            <Trash2 size={12} color={C.danger} />
                          </button>
                          <button style={{ width:26, height:26, borderRadius:6, border:`1px solid ${C.border}`,
                            background: expandedRow === log._id ? C.primary : '#f9fafb',
                            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                            {expandedRow === log._id
                              ? <ChevronUp size={13} color="#fff" />
                              : <ChevronDown size={13} color="#6b7280" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expandedRow === log._id && (
                      <tr key={`${log._id}-exp`} style={{ borderBottom:`1px solid ${C.border}` }}>
                        <td colSpan={8} style={{ padding:0 }}>
                          <ExpandedDetail log={log} />
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px',
          borderTop:`1px solid ${C.border}`, flexWrap:'wrap', gap:8 }}>
          <span style={{ fontSize:12, color:'#6b7280' }}>
            {total === 0
              ? 'No entries'
              : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, total)} of ${total} logs`}
          </span>
          <div style={{ display:'flex', gap:4 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ width:30, height:30, borderRadius:7, border:`1px solid ${C.border}`, background:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={14} />
            </button>

            {/* page number pills — max 7 shown */}
            {(() => {
              const delta = 2
              const pages = []
              for (let n = 1; n <= totalPages; n++) {
                if (n === 1 || n === totalPages || (n >= page - delta && n <= page + delta)) {
                  pages.push(n)
                } else if (pages[pages.length - 1] !== '…') {
                  pages.push('…')
                }
              }
              return pages.map((n, i) =>
                n === '…' ? (
                  <span key={`sep-${i}`} style={{ width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#9ca3af' }}>…</span>
                ) : (
                  <button key={n} onClick={() => setPage(n)}
                    style={{ width:30, height:30, borderRadius:7,
                      border:`1px solid ${n === page ? C.primary : C.border}`,
                      background: n === page ? C.primary : '#fff',
                      color: n === page ? '#fff' : '#374151',
                      fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    {n}
                  </button>
                )
              )
            })()}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ width:30, height:30, borderRadius:7, border:`1px solid ${C.border}`, background:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
