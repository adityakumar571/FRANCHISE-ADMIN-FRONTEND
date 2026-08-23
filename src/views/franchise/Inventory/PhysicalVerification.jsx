/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { ShieldCheck, Plus, Eye, CheckCircle, Clock, Search } from 'lucide-react'

const MOCK = [
  { id: 'PV-2025-008', started: '20/05/2025, 10:00 AM', user: 'Amit Kumar', total: 2450, verified: 1780, pct: 65, status: 'In Progress' },
  { id: 'PV-2025-004', started: '17/05/2025',           user: 'Rahul Sharma', total: 6045, verified: 6045, pct: 100, status: 'Completed' },
  { id: 'PV-2025-003', started: '15/05/2025',           user: 'Priya Singh', total: 8221, verified: 8221, pct: 100, status: 'Completed' },
  { id: 'PV-2025-001', started: '11/05/2025',           user: 'Anjali Verma', total: 7340, verified: 7340, pct: 100, status: 'Completed' },
  { id: 'PV-2025-000', started: '05/05/2025',           user: 'Neha Singh', total: 6580, verified: 6580, pct: 100, status: 'Completed' },
]

const STATUS_C = {
  'In Progress': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Completed':   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Pending':     { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
}

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function PhysicalVerification() {
  const [search, setSearch] = useState('')
  const filtered = MOCK.filter(r => r.id.toLowerCase().includes(search.toLowerCase()) || r.user.toLowerCase().includes(search.toLowerCase()) || search === '')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} color="#16a34a" /> Physical Stock Verification
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Verify physical stock against system records</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> New Verification
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Verifications', value: String(MOCK.length), color: '#0c3b73' },
          { label: 'Completed',           value: String(MOCK.filter(r => r.status === 'Completed').length), color: '#16a34a' },
          { label: 'In Progress',         value: String(MOCK.filter(r => r.status === 'In Progress').length), color: '#2563eb' },
          { label: 'Pending',             value: '2', color: '#d97706' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Ongoing verification highlight */}
      <div style={{ background: '#fff', border: '1px solid #c7d2fe', borderRadius: 10, padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Ongoing Verification</span>
            <span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 20, padding: '2px 8px', marginLeft: 8 }}>In Progress</span>
          </div>
          <span style={{ fontSize: 12, color: '#6b7280' }}>PV-2025-008</span>
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 10px' }}>Started: 20/05/2025 10:00 AM · User: Amit Kumar</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Items Verified</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>1,780 / 2,450 &nbsp;(65%)</span>
        </div>
        <div style={{ height: 8, background: '#e0e7ff', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '65%', background: '#2563eb', borderRadius: 4 }} />
        </div>
        <button style={{ marginTop: 12, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Continue Verification →
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by verification ID or user..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Verification ID', 'Started', 'By User', 'Total Items', 'Verified', 'Progress', 'Status', 'Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {filtered.map((r, i) => {
                const sc = STATUS_C[r.status] || STATUS_C.Pending
                return (
                  <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0c3b73', fontWeight: 600 }}>{r.id}</span></Td>
                    <Td style={{ fontSize: 12, color: '#6b7280' }}>{r.started}</Td>
                    <Td style={{ fontWeight: 500 }}>{r.user}</Td>
                    <Td>{r.total.toLocaleString('en-IN')}</Td>
                    <Td>{r.verified.toLocaleString('en-IN')}</Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                          <div style={{ height: '100%', width: `${r.pct}%`, background: r.pct === 100 ? '#16a34a' : '#2563eb' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: r.pct === 100 ? '#16a34a' : '#2563eb' }}>{r.pct}%</span>
                      </div>
                    </Td>
                    <Td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{r.status}</span></Td>
                    <Td>
                      <button style={{ background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#0c3b73', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
                        <Eye size={12} /> View
                      </button>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
