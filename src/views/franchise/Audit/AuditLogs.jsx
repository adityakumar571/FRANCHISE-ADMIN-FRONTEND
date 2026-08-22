/* eslint-disable prettier/prettier */
/**
 * AuditLogs — Franchise Audit Log Viewer
 * Track all sensitive actions: user, role, action, record, timestamp
 */
import { useState } from 'react'
import { ShieldCheck, Search, Download, User, Package, ShoppingCart, Settings, Users, FileText } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

const MOCK_LOGS = [
  { id: 1, user: 'Ajay Sharma', role: 'Franchise Owner', action: 'LOGIN', module: 'Auth', record: 'Session started', ip: '192.168.1.1', time: '22 Aug 2026, 9:00 AM', result: 'Success' },
  { id: 2, user: 'Neha Gupta', role: 'Cashier', action: 'CREATE', module: 'POS', record: 'Invoice SI-0048 — ₹1,200', ip: '192.168.1.5', time: '22 Aug 2026, 10:30 AM', result: 'Success' },
  { id: 3, user: 'Ajay Sharma', role: 'Franchise Owner', action: 'UPDATE', module: 'Staff', record: 'User Ravi Singh — Status changed to Inactive', ip: '192.168.1.1', time: '22 Aug 2026, 10:45 AM', result: 'Success' },
  { id: 4, user: 'Sunita Rao', role: 'Branch Manager', action: 'CREATE', module: 'Purchase', record: 'PO-0031 created — Medico Agency', ip: '192.168.1.3', time: '22 Aug 2026, 11:00 AM', result: 'Success' },
  { id: 5, user: 'Amit Kumar', role: 'Pharmacist', action: 'UPDATE', module: 'Inventory', record: 'Stock adjustment — Paracetamol 650mg +100 units', ip: '192.168.1.4', time: '22 Aug 2026, 11:15 AM', result: 'Success' },
  { id: 6, user: 'Neha Gupta', role: 'Cashier', action: 'CREATE', module: 'POS', record: 'Return SR-0004 — Invoice SI-0041 returned ₹400', ip: '192.168.1.5', time: '22 Aug 2026, 11:30 AM', result: 'Success' },
  { id: 7, user: 'Ajay Sharma', role: 'Franchise Owner', action: 'UPDATE', module: 'Settings', record: 'Business profile updated', ip: '192.168.1.1', time: '22 Aug 2026, 12:00 PM', result: 'Success' },
  { id: 8, user: 'Unknown', role: '—', action: 'LOGIN', module: 'Auth', record: 'Failed login attempt — user ajay@pharma.com', ip: '103.45.67.89', time: '22 Aug 2026, 12:15 PM', result: 'Failed' },
  { id: 9, user: 'Sunita Rao', role: 'Branch Manager', action: 'CREATE', module: 'GRN', record: 'GRN-0024 created — PO-0031 received', ip: '192.168.1.3', time: '22 Aug 2026, 2:00 PM', result: 'Success' },
  { id: 10, user: 'Ajay Sharma', role: 'Franchise Owner', action: 'DELETE', module: 'Inventory', record: 'Batch B-2023-12-01 quarantined (expired)', ip: '192.168.1.1', time: '22 Aug 2026, 3:00 PM', result: 'Success' },
]

const actionColors = {
  LOGIN: '#0891b2',
  CREATE: '#16a34a',
  UPDATE: '#7c3aed',
  DELETE: '#dc2626',
  EXPORT: '#d97706',
}

const moduleIcons = {
  Auth: User,
  POS: ShoppingCart,
  Purchase: ShoppingCart,
  GRN: Package,
  Inventory: Package,
  Staff: Users,
  Settings: Settings,
}

const roleColors = {
  'Franchise Owner': '#0c3b73',
  'Branch Manager': '#7c3aed',
  'Pharmacist': '#0891b2',
  'Cashier': '#16a34a',
}

const AuditLogs = () => {
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('All')
  const [module, setModule] = useState('All')
  const [from, setFrom] = useState('2026-08-22')
  const [to, setTo] = useState('2026-08-22')

  const modules = ['All', 'Auth', 'POS', 'Purchase', 'GRN', 'Inventory', 'Staff', 'Settings']
  const actions = ['All', 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT']

  const filtered = MOCK_LOGS.filter(l =>
    (action === 'All' || l.action === action) &&
    (module === 'All' || l.module === module) &&
    (l.user.toLowerCase().includes(search.toLowerCase()) || l.record.toLowerCase().includes(search.toLowerCase()))
  )

  const columns = [
    { title: '#', key: 'id', width: 45, render: v => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v}</span> },
    {
      title: 'Action', key: 'action', render: (v) => {
        const color = actionColors[v] || '#6b7280'
        return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + '18', color, letterSpacing: '0.5px' }}>{v}</span>
      }
    },
    {
      title: 'Module', key: 'module', render: (v) => {
        const MIcon = moduleIcons[v] || FileText
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: '#374151' }}>
            <MIcon size={12} color="#9ca3af" /> {v}
          </span>
        )
      }
    },
    { title: 'Description', key: 'record', render: v => <span style={{ fontSize: 12, color: '#374151' }}>{v}</span> },
    {
      title: 'User', key: 'user', render: (v, row) => (
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#111827' }}>{v}</p>
          {row.role !== '—' && (
            <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 20, background: (roleColors[row.role] || '#9ca3af') + '18', color: roleColors[row.role] || '#9ca3af', fontWeight: 600 }}>
              {row.role}
            </span>
          )}
        </div>
      )
    },
    { title: 'IP Address', key: 'ip', render: v => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#9ca3af' }}>{v}</span> },
    { title: 'Timestamp', key: 'time', render: v => <span style={{ fontSize: 11, color: '#6b7280' }}>{v}</span> },
    {
      title: 'Result', key: 'result', render: v => (
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: v === 'Success' ? '#dcfce7' : '#fee2e2', color: v === 'Success' ? '#16a34a' : '#dc2626' }}>{v}</span>
      )
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={ShieldCheck} title="Audit Logs" subtitle="Track all user actions and system events with timestamp" color="#0c3b73">
        <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Download size={14} /> Export
        </button>
      </PageHeader>

      {/* Summary */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {Object.entries(actionColors).map(([act, color]) => (
          <div key={act} style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + '18', color }}>{act}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{MOCK_LOGS.filter(l => l.action === act).length}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search user or description…"
            style={{ width: '100%', padding: '9px 12px 9px 30px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Action</label>
          <select value={action} onChange={e => setAction(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}>
            {actions.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Module</label>
          <select value={module} onChange={e => setModule(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}>
            {modules.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        {[{ label: 'From', val: from, set: setFrom }, { label: 'To', val: to, set: setTo }].map(({ label, val, set }) => (
          <div key={label}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{label}</label>
            <input type="date" value={val} onChange={e => set(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }} />
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} total={filtered.length} page={1} limit={20} />
    </div>
  )
}

export default AuditLogs
