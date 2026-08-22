/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Activity, Search } from 'lucide-react'

const LOGS = [
  { time: '20 May 2025, 11:15 AM', user: 'Amit Kumar',    action: 'Invoice Created',    detail: 'INV-2025-1524 · ₹1,250',  module: 'Billing',   type: 'Create' },
  { time: '20 May 2025, 10:45 AM', user: 'Rahul Sharma',  action: 'Stock Updated',      detail: 'Dolo 650 | +20 Qty',       module: 'Inventory', type: 'Update' },
  { time: '20 May 2025, 10:30 AM', user: 'Neha Singh',    action: 'Payment Received',   detail: 'INV-2025-1523 · ₹2,450',  module: 'Billing',   type: 'Payment' },
  { time: '20 May 2025, 10:05 AM', user: 'Amit Kumar',    action: 'Purchase Entry',     detail: 'Medico Agency · ₹25,430', module: 'Purchase',  type: 'Create' },
  { time: '20 May 2025, 09:45 AM', user: 'Priya Singh',   action: 'New Customer Added', detail: 'Ramesh Gupta · 9876543210',module: 'Customers', type: 'Create' },
  { time: '20 May 2025, 09:30 AM', user: 'Rahul Sharma',  action: 'Login',              detail: 'Device: Web Browser',     module: 'Auth',      type: 'Login' },
  { time: '20 May 2025, 09:15 AM', user: 'Vikram Patel',  action: 'Return Approved',    detail: 'INV-2025-1508 · ₹450',    module: 'Billing',   type: 'Update' },
  { time: '19 May 2025, 04:30 PM', user: 'Neha Singh',    action: 'Salary Processed',   detail: 'May 2025 Payroll',        module: 'Staff',     type: 'System' },
  { time: '19 May 2025, 02:15 PM', user: 'Amit Kumar',    action: 'Order Dispatched',   detail: 'ORD-250519-012',          module: 'Orders',    type: 'Update' },
  { time: '19 May 2025, 11:00 AM', user: 'System',        action: 'Auto Backup',        detail: 'Daily backup completed',  module: 'System',    type: 'System' },
]

const TYPE_C = {
  Create:  { bg: '#f0fdf4', color: '#16a34a' },
  Update:  { bg: '#fffbeb', color: '#d97706' },
  Delete:  { bg: '#fff1f2', color: '#dc2626' },
  Login:   { bg: '#eff6ff', color: '#2563eb' },
  Payment: { bg: '#f0ecff', color: '#7c3aed' },
  System:  { bg: '#f3f4f6', color: '#6b7280' },
}

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function ActivityLogs() {
  const [search, setSearch] = useState('')
  const [type, setType]     = useState('All')
  const [module, setModule] = useState('All')

  const modules = ['All', ...new Set(LOGS.map(l => l.module))]

  const filtered = LOGS.filter(l =>
    (search === '' || l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase())) &&
    (type === 'All' || l.type === type) &&
    (module === 'All' || l.module === module)
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={20} color="#0c3b73" /> Activity Logs
        </h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Recent system activity and user actions</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user or action..." style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {['All', 'Create', 'Update', 'Delete', 'Login', 'Payment', 'System'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={module} onChange={e => setModule(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {modules.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Date & Time', 'User', 'Action', 'Details', 'Module', 'Type'].map(h => <Th key={h} c={h} />)}</tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No logs found</td></tr>
              : filtered.map((l, i) => {
                  const tc = TYPE_C[l.type] || { bg: '#f3f4f6', color: '#6b7280' }
                  return (
                    <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{l.time}</Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#0c3b7322', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#0c3b73', flexShrink: 0 }}>{l.user[0]}</div>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{l.user}</span>
                        </div>
                      </Td>
                      <Td style={{ fontWeight: 500 }}>{l.action}</Td>
                      <Td style={{ fontSize: 12, color: '#6b7280' }}>{l.detail}</Td>
                      <Td><span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4, color: '#374151' }}>{l.module}</span></Td>
                      <Td>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: tc.bg, color: tc.color }}>{l.type}</span>
                      </Td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {LOGS.length} logs</span>
        </div>
      </div>
    </div>
  )
}
