/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { IndianRupee, Search, Download, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'

const MOCK_PAYMENTS = [
  { id: 'PAY-001', franchise: 'Sharma Medical Store',    amount: 24500, paid: 24500, due: 0,     mode: 'NEFT',   date: '22 Aug 2026', status: 'Paid'    },
  { id: 'PAY-002', franchise: 'City Pharma - Andheri',   amount: 18200, paid: 0,     due: 18200, mode: '—',      date: '22 Aug 2026', status: 'Due'     },
  { id: 'PAY-003', franchise: 'HealthZone Pharmacy',     amount: 48600, paid: 48600, due: 0,     mode: 'Cheque', date: '21 Aug 2026', status: 'Paid'    },
  { id: 'PAY-004', franchise: 'MedPlus Store - Thane',   amount: 12400, paid: 10000, due: 2400,  mode: 'UPI',    date: '20 Aug 2026', status: 'Partial' },
  { id: 'PAY-005', franchise: 'Apollo Pharma - Kothrud', amount: 38000, paid: 0,     due: 38000, mode: '—',      date: '19 Aug 2026', status: 'Overdue' },
  { id: 'PAY-006', franchise: 'Lifeline Medical',        amount: 21500, paid: 21500, due: 0,     mode: 'NEFT',   date: '18 Aug 2026', status: 'Paid'    },
  { id: 'PAY-007', franchise: 'CureMed Pharmacy',        amount: 31200, paid: 31200, due: 0,     mode: 'RTGS',   date: '17 Aug 2026', status: 'Paid'    },
  { id: 'PAY-008', franchise: 'Ganesh Drug House',       amount: 56200, paid: 0,     due: 56200, mode: '—',      date: '16 Aug 2026', status: 'Overdue' },
]

const STATUS_CFG = {
  Paid:     { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' },
  Due:      { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
  Partial:  { bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe' },
  Overdue:  { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' },
}

const MODE_CFG = {
  NEFT:   { bg: '#dcfce7', color: '#16a34a' },
  UPI:    { bg: '#f5f3ff', color: '#7c3aed' },
  Cheque: { bg: '#fef3c7', color: '#d97706' },
  RTGS:   { bg: '#dbeafe', color: '#2563eb' },
  '—':    { bg: '#f3f4f6', color: '#9ca3af' },
}

const PER = 6
const Th = ({ c, a = 'left' }) => <th style={{ padding: '9px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: a, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

export default function DistPayments() {
  const [payments] = useState(MOCK_PAYMENTS)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = payments.filter(p =>
    (filter === 'All' || p.status === filter) &&
    (search === '' || p.franchise.toLowerCase().includes(search.toLowerCase()))
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER))
  const paged = filtered.slice((page - 1) * PER, page * PER)

  const totalDue      = payments.reduce((s, p) => s + p.due, 0)
  const totalReceived = payments.reduce((s, p) => s + p.paid, 0)
  const overdue       = payments.filter(p => p.status === 'Overdue').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IndianRupee size={20} color="#fabf22" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Payments & Dues</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Track incoming payments from franchise partners</p>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
          <Download size={14} /> Export Statement
        </button>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total Billed',     value: `₹${(payments.reduce((s, p) => s + p.amount, 0) / 1000).toFixed(1)}K`, color: '#0c3b73' },
          { label: 'Amount Received',  value: `₹${(totalReceived / 1000).toFixed(1)}K`,                              color: '#16a34a' },
          { label: 'Total Outstanding',value: `₹${(totalDue / 1000).toFixed(1)}K`,                                   color: '#dc2626' },
          { label: 'Overdue Accounts', value: overdue,                                                                color: '#d97706' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${k.color}` }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {overdue > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} color="#ea580c" />
          <span style={{ fontSize: 13, color: '#9a3412', fontWeight: 600 }}>
            {overdue} franchise(s) have overdue payments — follow up required.
          </span>
        </div>
      )}

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search franchise..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        {['All', 'Paid', 'Due', 'Partial', 'Overdue'].map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1) }}
            style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${filter === s ? '#0c3b73' : '#e5e7eb'}`, background: filter === s ? '#0c3b73' : '#fff', color: filter === s ? '#fff' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Payment ID" /><Th c="Franchise" />
              <Th c="Amount" a="right" /><Th c="Paid" a="right" />
              <Th c="Due" a="right" /><Th c="Mode" />
              <Th c="Date" /><Th c="Status" /><Th c="Action" />
            </tr></thead>
            <tbody>
              {paged.length === 0
                ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No records found</td></tr>
                : paged.map(p => {
                  const s = STATUS_CFG[p.status]
                  const m = MODE_CFG[p.mode] || MODE_CFG['—']
                  return (
                    <tr key={p.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#0c3b73' }}>{p.id}</span></Td>
                      <Td style={{ fontWeight: 600 }}>{p.franchise}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700 }}>₹{p.amount.toLocaleString('en-IN')}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{p.paid.toLocaleString('en-IN')}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700, color: p.due > 0 ? '#dc2626' : '#16a34a' }}>
                        {p.due > 0 ? `₹${p.due.toLocaleString('en-IN')}` : '—'}
                      </Td>
                      <Td><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: m.bg, color: m.color }}>{p.mode}</span></Td>
                      <Td style={{ fontSize: 12, color: '#6b7280' }}>{p.date}</Td>
                      <Td><span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{p.status}</span></Td>
                      <Td>
                        {p.due > 0 && (
                          <button style={{ padding: '5px 10px', border: 'none', borderRadius: 6, background: '#0c3b73', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            Remind
                          </button>
                        )}
                      </Td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {paged.length} of {filtered.length} records</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none', color: page === 1 ? '#d1d5db' : '#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ background: page === p ? '#0c3b73' : 'none', border: `1px solid ${page === p ? '#0c3b73' : '#e5e7eb'}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: page === p ? '#fff' : '#374151', fontSize: 12 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none', color: page === totalPages ? '#d1d5db' : '#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
