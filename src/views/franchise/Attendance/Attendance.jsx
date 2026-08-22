/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Users, Clock, UserCheck, UserX, Search } from 'lucide-react'

const MOCK = [
  { id: 'STA001', name: 'Rahul Sharma',  role: 'Pharmacist',      inTime: '09:02 AM', outTime: '06:10 PM', status: 'Present', late: false, hours: '9h 8m' },
  { id: 'STA002', name: 'Neha Singh',    role: 'Cashier',          inTime: '09:05 AM', outTime: '06:00 PM', status: 'Present', late: false, hours: '8h 55m' },
  { id: 'STA003', name: 'Amit Kumar',    role: 'Store Manager',    inTime: '09:15 AM', outTime: '06:20 PM', status: 'Late',    late: true,  hours: '9h 5m' },
  { id: 'STA004', name: 'Priya Singh',   role: 'Sales Executive',  inTime: '09:00 AM', outTime: '05:55 PM', status: 'Present', late: false, hours: '8h 55m' },
  { id: 'STA005', name: 'Vikram Patel',  role: 'Accountant',       inTime: '—',        outTime: '—',        status: 'Absent',  late: false, hours: '—' },
  { id: 'STA006', name: 'Sandeep Yadav', role: 'Delivery Boy',     inTime: '—',        outTime: '—',        status: 'Leave',   late: false, hours: '—' },
  { id: 'STA007', name: 'Kavita Joshi',  role: 'HR Executive',     inTime: '09:10 AM', outTime: '—',        status: 'Present', late: false, hours: 'Ongoing' },
]

const STATUS_C = {
  Present: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Late:    { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Absent:  { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
  Leave:   { bg: '#f0f4ff', color: '#4f46e5', border: '#c7d2fe' },
}

const Badge = ({ val }) => {
  const c = STATUS_C[val] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' }
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{val}</span>
}
const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function Attendance() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0])

  const present = MOCK.filter(m => m.status === 'Present').length
  const absent  = MOCK.filter(m => m.status === 'Absent').length
  const late    = MOCK.filter(m => m.status === 'Late').length
  const leave   = MOCK.filter(m => m.status === 'Leave').length

  const filtered = MOCK.filter(m =>
    (search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'All' || m.status === filter)
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={20} color="#0c3b73" /> Attendance
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Daily attendance overview</p>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Staff', value: MOCK.length, color: '#0c3b73', icon: Users },
          { label: 'Present',     value: present,     color: '#16a34a', icon: UserCheck },
          { label: 'Absent',      value: absent,      color: '#dc2626', icon: UserX },
          { label: 'Late',        value: late,        color: '#d97706', icon: Clock },
          { label: 'On Leave',    value: leave,       color: '#4f46e5', icon: UserCheck },
        ].map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: c.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color={c.color} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: '#6b7280', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '0 0 8px' }}>Attendance Summary — {date}</p>
        <div style={{ height: 10, borderRadius: 5, background: '#f3f4f6', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${(present / MOCK.length) * 100}%`, background: '#16a34a' }} />
          <div style={{ width: `${(late / MOCK.length) * 100}%`, background: '#d97706' }} />
          <div style={{ width: `${(absent / MOCK.length) * 100}%`, background: '#dc2626' }} />
          <div style={{ width: `${(leave / MOCK.length) * 100}%`, background: '#4f46e5' }} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {[['#16a34a', 'Present', present], ['#d97706', 'Late', late], ['#dc2626', 'Absent', absent], ['#4f46e5', 'Leave', leave]].map(([c, l, v]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: '#6b7280' }}>{l} ({((v / MOCK.length) * 100).toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..." style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {['All', 'Present', 'Late', 'Absent', 'Leave'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['ID', 'Name', 'Role', 'In Time', 'Out Time', 'Hours', 'Status'].map(h => <Th key={h} c={h} />)}</tr></thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{m.id}</span></Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0c3b7322', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0c3b73', flexShrink: 0 }}>{m.name[0]}</div>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{m.name}</span>
                  </div>
                </Td>
                <Td style={{ color: '#6b7280' }}>{m.role}</Td>
                <Td style={{ fontFamily: 'monospace', fontSize: 12, color: m.late ? '#d97706' : '#374151', fontWeight: m.late ? 600 : 400 }}>{m.inTime}</Td>
                <Td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{m.outTime}</Td>
                <Td style={{ fontWeight: 500 }}>{m.hours}</Td>
                <Td><Badge val={m.status} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {MOCK.length} staff members</span>
        </div>
      </div>
    </div>
  )
}
