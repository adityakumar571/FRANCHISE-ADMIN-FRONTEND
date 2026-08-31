/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  ClipboardList, Download, Search, ChevronLeft, ChevronRight,
  LogIn, Plus, Edit2, Trash2, Link2, ToggleRight, Calendar,
  Shield, User, Building2, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Activity, AlertOctagon, Users,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   PALETTE & PRIMITIVES
───────────────────────────────────────────── */
const C = {
  primary: '#0c3b73', accent: '#fabf22', success: '#16a34a',
  danger: '#dc2626', border: '#e5e7eb', bg: '#f8f9fb',
}

const inputStyle = {
  border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px',
  fontSize: 13, color: '#374151', outline: 'none', background: '#fff',
  fontFamily: 'Inter, -apple-system, sans-serif', boxSizing: 'border-box',
}

/* ─────────────────────────────────────────────
   ACTION TYPE CONFIG
───────────────────────────────────────────── */
const ACTION_CONFIG = {
  Login:         { color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: LogIn },
  Create:        { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: Plus },
  Update:        { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Edit2 },
  Delete:        { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: Trash2 },
  Assign:        { color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', icon: Link2 },
  'Status Change':{ color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: ToggleRight },
}

const ROLE_CONFIG = {
  'Super Admin':     { color: C.primary,  bg: '#eff6ff',  border: '#bfdbfe' },
  'Admin':           { color: '#7c3aed',  bg: '#faf5ff',  border: '#e9d5ff' },
  'Franchise Owner': { color: '#d97706',  bg: '#fffbeb',  border: '#fde68a' },
}

/* ─────────────────────────────────────────────
   MOCK AUDIT DATA
───────────────────────────────────────────── */
const AUDIT_LOGS = [
  {
    id: 'LOG-001', timestamp: '28 Jun 2025, 10:34 AM',
    user: 'Arjun Mehta', role: 'Super Admin',
    action: 'Create', description: 'Created new franchise: MedPlus Pharmacy - Andheri',
    record: 'FRN-009', recordType: 'Franchise',
    ip: '192.168.1.101', status: 'Success',
    details: { module: 'Franchise Management', before: null, after: { name: 'MedPlus Pharmacy - Andheri', city: 'Mumbai', plan: 'Enterprise', status: 'Pending' } },
  },
  {
    id: 'LOG-002', timestamp: '28 Jun 2025, 09:15 AM',
    user: 'Arjun Mehta', role: 'Super Admin',
    action: 'Assign', description: 'Assigned Professional plan to Raj Medicos - Salt Lake',
    record: 'FRN-008', recordType: 'Subscription',
    ip: '192.168.1.101', status: 'Success',
    details: { module: 'Subscription Management', before: { plan: 'Basic' }, after: { plan: 'Professional', startDate: '01 Jun 2025', endDate: '01 Jul 2025' } },
  },
  {
    id: 'LOG-003', timestamp: '27 Jun 2025, 06:45 PM',
    user: 'Rajesh Kumar Sharma', role: 'Admin',
    action: 'Login', description: 'Successful login from Chrome/Windows',
    record: 'ADM-001', recordType: 'Admin',
    ip: '10.0.2.88', status: 'Success',
    details: { module: 'Authentication', browser: 'Chrome 125', os: 'Windows 11', location: 'Mumbai, Maharashtra' },
  },
  {
    id: 'LOG-004', timestamp: '27 Jun 2025, 04:22 PM',
    user: 'Arjun Mehta', role: 'Super Admin',
    action: 'Create', description: 'Onboarded new supplier: MedLife Wholesale',
    record: 'SUP-007', recordType: 'Supplier',
    ip: '192.168.1.101', status: 'Success',
    details: { module: 'Supplier Management', after: { name: 'MedLife Wholesale', type: 'Wholesaler', city: 'Delhi' } },
  },
  {
    id: 'LOG-005', timestamp: '27 Jun 2025, 02:10 PM',
    user: 'Priya Venkataraman', role: 'Admin',
    action: 'Status Change', description: 'Suspended franchise: Apollo Medicals - Sector 18',
    record: 'FRN-004', recordType: 'Franchise',
    ip: '172.16.0.45', status: 'Success',
    details: { module: 'Franchise Management', before: { status: 'Active' }, after: { status: 'Suspended' }, reason: 'Non-payment of dues for 3 months' },
  },
  {
    id: 'LOG-006', timestamp: '27 Jun 2025, 11:55 AM',
    user: 'Arjun Mehta', role: 'Super Admin',
    action: 'Create', description: 'Created admin account: Meera Krishnamurthy',
    record: 'ADM-006', recordType: 'Admin',
    ip: '192.168.1.101', status: 'Success',
    details: { module: 'Admin Management', after: { name: 'Meera Krishnamurthy', role: 'Regional Admin', states: ['Karnataka'], email: 'meera.krishna@pharmanexus.in' } },
  },
  {
    id: 'LOG-007', timestamp: '26 Jun 2025, 05:30 PM',
    user: 'Arjun Mehta', role: 'Super Admin',
    action: 'Update', description: 'Updated Basic plan pricing from ₹799 to ₹999',
    record: 'PLN-001', recordType: 'Plan',
    ip: '192.168.1.101', status: 'Success',
    details: { module: 'Subscription Plans', before: { price: 799 }, after: { price: 999 } },
  },
  {
    id: 'LOG-008', timestamp: '26 Jun 2025, 03:18 PM',
    user: 'Vikram Singh Rathore', role: 'Admin',
    action: 'Login', description: 'Failed login attempt — incorrect password',
    record: 'ADM-005', recordType: 'Admin',
    ip: '203.0.113.42', status: 'Failed',
    details: { module: 'Authentication', browser: 'Firefox 127', os: 'macOS 14', attempts: 2 },
  },
  {
    id: 'LOG-009', timestamp: '26 Jun 2025, 01:45 PM',
    user: 'Ravi Patel', role: 'Franchise Owner',
    action: 'Update', description: 'Updated store profile: Lifeline Pharmacy - Vastrapur',
    record: 'FRN-006', recordType: 'Franchise',
    ip: '59.180.24.11', status: 'Success',
    details: { module: 'Franchise Profile', before: { phone: '9876500001' }, after: { phone: '9876543210', address: 'Plot 12, Vastrapur Lake Road' } },
  },
  {
    id: 'LOG-010', timestamp: '25 Jun 2025, 11:22 AM',
    user: 'Arjun Mehta', role: 'Super Admin',
    action: 'Delete', description: 'Deleted inactive supplier: Old Pharma Depot',
    record: 'SUP-003', recordType: 'Supplier',
    ip: '192.168.1.101', status: 'Success',
    details: { module: 'Supplier Management', before: { name: 'Old Pharma Depot', status: 'Inactive', lastActivity: '90 days ago' }, after: null },
  },
  {
    id: 'LOG-011', timestamp: '25 Jun 2025, 09:05 AM',
    user: 'Arjun Mehta', role: 'Super Admin',
    action: 'Assign', description: 'Assigned states [Maharashtra, Gujarat] to admin Rajesh Sharma',
    record: 'ADM-001', recordType: 'Admin',
    ip: '192.168.1.101', status: 'Success',
    details: { module: 'Admin Management', before: { states: ['Maharashtra'] }, after: { states: ['Maharashtra', 'Gujarat'] } },
  },
  {
    id: 'LOG-012', timestamp: '24 Jun 2025, 07:50 PM',
    user: 'Priya Venkataraman', role: 'Admin',
    action: 'Status Change', description: 'Activated franchise: Shree Ram Medicals - Kothrud',
    record: 'FRN-005', recordType: 'Franchise',
    ip: '172.16.0.45', status: 'Success',
    details: { module: 'Franchise Management', before: { status: 'Pending' }, after: { status: 'Active' } },
  },
]

/* ─────────────────────────────────────────────
   BADGES
───────────────────────────────────────────── */
const ActionBadge = ({ action }) => {
  const cfg = ACTION_CONFIG[action] || ACTION_CONFIG['Update']
  const Icon = cfg.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700,
      padding: '3px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <Icon size={10} strokeWidth={2.5} />
      {action}
    </span>
  )
}

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG['Admin']
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {role}
    </span>
  )
}

const StatusBadge = ({ status }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
    background: status === 'Success' ? '#f0fdf4' : '#fef2f2',
    color: status === 'Success' ? '#16a34a' : '#dc2626',
    border: `1px solid ${status === 'Success' ? '#bbf7d0' : '#fecaca'}` }}>
    {status === 'Success' ? <CheckCircle size={10} /> : <XCircle size={10} />}
    {status}
  </span>
)

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
    padding: '16px 20px', flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 44, height: 44, borderRadius: 11, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>{value}</p>
      <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0', fontWeight: 500 }}>{label}</p>
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   EXPANDED ROW DETAIL
───────────────────────────────────────────── */
const ExpandedDetail = ({ log }) => {
  const renderValue = (val) => {
    if (val === null) return <em style={{ color: '#9ca3af' }}>None</em>
    if (typeof val === 'object') {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.entries(val).map(([k, v]) => (
            <span key={k} style={{ fontSize: 11, background: '#f3f4f6', borderRadius: 6, padding: '3px 8px', color: '#374151' }}>
              <strong>{k}:</strong> {Array.isArray(v) ? v.join(', ') : String(v)}
            </span>
          ))}
        </div>
      )
    }
    return <span style={{ fontSize: 12, color: '#374151' }}>{String(val)}</span>
  }

  return (
    <div style={{ background: '#f8f9fb', borderTop: `1px solid ${C.border}`, padding: '16px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Log Details</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 12, color: '#374151' }}><strong>Log ID:</strong> {log.id}</span>
            <span style={{ fontSize: 12, color: '#374151' }}><strong>Module:</strong> {log.details.module}</span>
            <span style={{ fontSize: 12, color: '#374151' }}><strong>Record ID:</strong> {log.record} ({log.recordType})</span>
            <span style={{ fontSize: 12, color: '#374151' }}><strong>IP Address:</strong> {log.ip}</span>
          </div>
        </div>
        {log.details.before !== undefined && log.details.before !== null && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Before</p>
            {renderValue(log.details.before)}
          </div>
        )}
        {log.details.after !== undefined && log.details.after !== null && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>After</p>
            {renderValue(log.details.after)}
          </div>
        )}
        {log.details.reason && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Reason</p>
            <span style={{ fontSize: 12, color: '#374151' }}>{log.details.reason}</span>
          </div>
        )}
        {log.details.browser && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Session Info</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#374151' }}><strong>Browser:</strong> {log.details.browser}</span>
              <span style={{ fontSize: 12, color: '#374151' }}><strong>OS:</strong> {log.details.os}</span>
              {log.details.location && <span style={{ fontSize: 12, color: '#374151' }}><strong>Location:</strong> {log.details.location}</span>}
              {log.details.attempts && <span style={{ fontSize: 12, color: '#dc2626' }}><strong>Failed Attempts:</strong> {log.details.attempts}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function SuperAdminAuditLogs() {
  const [search, setSearch]           = useState('')
  const [dateFrom, setDateFrom]       = useState('')
  const [dateTo, setDateTo]           = useState('')
  const [actionFilter, setActionFilter] = useState('All')
  const [roleFilter, setRoleFilter]   = useState('All')
  const [page, setPage]               = useState(1)
  const [expandedRow, setExpandedRow] = useState(null)

  const PER_PAGE = 6

  /* ── filter logic ── */
  const filtered = AUDIT_LOGS.filter(log => {
    const q = search.toLowerCase()
    const matchQ  = !q || log.description.toLowerCase().includes(q) || log.user.toLowerCase().includes(q) || log.action.toLowerCase().includes(q)
    const matchA  = actionFilter === 'All' || log.action === actionFilter
    const matchR  = roleFilter   === 'All' || log.role   === roleFilter
    return matchQ && matchA && matchR
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const toggleExpand = (id) => setExpandedRow(prev => prev === id ? null : id)

  /* ── stats ── */
  const today = new Date().toDateString()
  const todayCount = AUDIT_LOGS.filter(l => new Date(l.timestamp).toDateString() === today).length || 24
  const criticalCount = AUDIT_LOGS.filter(l => ['Delete', 'Status Change'].includes(l.action)).length

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13, background: C.bg, minHeight: '100vh', padding: 4 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: C.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={20} color={C.accent} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Audit Logs</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Track all admin actions and system events across the platform</p>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.success, color: '#fff',
          border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <StatCard icon={ClipboardList} label="Total Logs"      value="1,847" color={C.primary}  bg="#eff6ff" />
        <StatCard icon={Activity}      label="Today"           value={todayCount}  color={C.success}  bg="#f0fdf4" />
        <StatCard icon={AlertOctagon}  label="Critical Actions" value={criticalCount} color={C.danger} bg="#fef2f2" />
        <StatCard icon={Users}         label="Admin Actions"   value="156"  color="#7c3aed"    bg="#faf5ff" />
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px',
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search action, user, description…"
            style={{ ...inputStyle, paddingLeft: 32, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={13} color="#9ca3af" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ ...inputStyle, minWidth: 140 }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ ...inputStyle, minWidth: 140 }} />
        </div>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1) }}
          style={{ ...inputStyle, minWidth: 160, cursor: 'pointer' }}>
          {['All', 'Login', 'Create', 'Update', 'Delete', 'Assign', 'Status Change'].map(a => <option key={a}>{a}</option>)}
        </select>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          style={{ ...inputStyle, minWidth: 170, cursor: 'pointer' }}>
          {['All', 'Super Admin', 'Admin', 'Franchise Owner'].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* ── TABLE ── */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Timestamp', 'User', 'Action Type', 'Description', 'Affected Record', 'IP Address', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 10, color: '#6b7280', fontWeight: 700,
                    textTransform: 'uppercase', textAlign: 'left', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>No logs found.</td></tr>
              ) : pageData.map(log => (
                <>
                  <tr key={log.id}
                    onClick={() => toggleExpand(log.id)}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f9fb'}
                    onMouseLeave={e => e.currentTarget.style.background = expandedRow === log.id ? '#f0f4ff' : ''}
                    style={{
                      borderBottom: expandedRow === log.id ? 'none' : '1px solid #f3f4f6',
                      cursor: 'pointer',
                      background: expandedRow === log.id ? '#f0f4ff' : '#fff',
                      transition: 'background .1s',
                    }}>
                    {/* Timestamp */}
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={11} color="#9ca3af" />
                        <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>{log.timestamp}</span>
                      </div>
                    </td>
                    {/* User */}
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7,
                          background: ROLE_CONFIG[log.role]?.bg || '#f3f4f6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {log.role === 'Super Admin' ? <Shield size={13} color={C.primary} /> :
                           log.role === 'Admin'       ? <User size={13} color="#7c3aed" /> :
                           <Building2 size={13} color="#d97706" />}
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{log.user}</p>
                          <RoleBadge role={log.role} />
                        </div>
                      </div>
                    </td>
                    {/* Action Type */}
                    <td style={{ padding: '11px 14px' }}><ActionBadge action={log.action} /></td>
                    {/* Description */}
                    <td style={{ padding: '11px 14px', maxWidth: 260 }}>
                      <p style={{ fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.4,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.description}
                      </p>
                    </td>
                    {/* Affected Record */}
                    <td style={{ padding: '11px 14px' }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', margin: 0 }}>{log.record}</p>
                        <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>{log.recordType}</p>
                      </div>
                    </td>
                    {/* IP */}
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7280',
                        background: '#f3f4f6', borderRadius: 5, padding: '2px 7px' }}>{log.ip}</span>
                    </td>
                    {/* Status */}
                    <td style={{ padding: '11px 14px' }}><StatusBadge status={log.status} /></td>
                    {/* Expand */}
                    <td style={{ padding: '11px 14px' }}>
                      <button style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`,
                        background: expandedRow === log.id ? C.primary : '#f9fafb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {expandedRow === log.id
                          ? <ChevronUp size={13} color="#fff" />
                          : <ChevronDown size={13} color="#6b7280" />}
                      </button>
                    </td>
                  </tr>

                  {/* ── EXPANDED DETAIL ROW ── */}
                  {expandedRow === log.id && (
                    <tr key={`${log.id}-expanded`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <ExpandedDetail log={log} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px',
          borderTop: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} logs
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${n === page ? C.primary : C.border}`,
                  background: n === page ? C.primary : '#fff', color: n === page ? '#fff' : '#374151',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
