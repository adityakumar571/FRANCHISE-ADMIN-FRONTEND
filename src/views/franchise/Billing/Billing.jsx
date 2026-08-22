/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Receipt, Search, Eye, Download, ChevronLeft, ChevronRight, IndianRupee, CreditCard, Clock } from 'lucide-react'

const INVOICES = [
  { no: 'INV-2025-1524', date: '20 May 2025', customer: 'Walk-in Customer', items: 6,  amount: 1250, payment: 'Cash',   status: 'Paid',    due: 0 },
  { no: 'INV-2025-1523', date: '20 May 2025', customer: 'Rahul Sharma',     items: 4,  amount: 2450, payment: 'UPI',    status: 'Paid',    due: 0 },
  { no: 'INV-2025-1522', date: '20 May 2025', customer: 'Priya Verma',      items: 8,  amount: 3650, payment: 'Card',   status: 'Paid',    due: 0 },
  { no: 'INV-2025-1521', date: '20 May 2025', customer: 'Walk-in Customer', items: 3,  amount: 850,  payment: 'Cash',   status: 'Paid',    due: 0 },
  { no: 'INV-2025-1520', date: '20 May 2025', customer: 'Amit Kumar',       items: 5,  amount: 1150, payment: 'UPI',    status: 'Paid',    due: 0 },
  { no: 'INV-2025-1519', date: '19 May 2025', customer: 'Neha Singh',       items: 7,  amount: 2250, payment: 'Credit', status: 'Due',     due: 2250 },
  { no: 'INV-2025-1518', date: '19 May 2025', customer: 'Walk-in Customer', items: 2,  amount: 420,  payment: 'Cash',   status: 'Paid',    due: 0 },
  { no: 'INV-2025-1517', date: '18 May 2025', customer: 'Suresh Gupta',     items: 10, amount: 4800, payment: 'Credit', status: 'Partial', due: 2400 },
  { no: 'INV-2025-1516', date: '18 May 2025', customer: 'Meena Devi',       items: 3,  amount: 780,  payment: 'UPI',    status: 'Paid',    due: 0 },
  { no: 'INV-2025-1515', date: '17 May 2025', customer: 'Vikram Patel',     items: 6,  amount: 1890, payment: 'Card',   status: 'Paid',    due: 0 },
]

const STATUS_C = {
  Paid:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Due:     { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
  Partial: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
}
const PAY_C = { Cash: '#16a34a', UPI: '#7c3aed', Card: '#2563eb', Credit: '#d97706' }

const Badge = ({ val, map }) => {
  const c = map[val]
  return c
    ? <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{val}</span>
    : <span style={{ fontSize: 12, color: '#374151' }}>{val}</span>
}

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function Billing() {
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('All')
  const [tab, setTab]         = useState('Today')
  const [page, setPage]       = useState(1)
  const PER = 8

  const filtered = INVOICES.filter(i =>
    (search === '' || i.no.toLowerCase().includes(search.toLowerCase()) || i.customer.toLowerCase().includes(search.toLowerCase())) &&
    (status === 'All' || i.status === status)
  )
  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const rows  = filtered.slice((page - 1) * PER, page * PER)

  const totalSales    = INVOICES.reduce((a, i) => a + i.amount, 0)
  const totalPaid     = INVOICES.filter(i => i.status === 'Paid').reduce((a, i) => a + i.amount, 0)
  const totalDue      = INVOICES.reduce((a, i) => a + i.due, 0)
  const totalInvoices = INVOICES.length

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Receipt size={20} color="#0c3b73" /> Billing &amp; Invoices
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>View all sales invoices and payment records</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {['Today', 'This Week', 'This Month'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#0c3b73' : '#6b7280', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
            {t}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Invoices',  value: String(totalInvoices),                    icon: Receipt,      color: '#0c3b73', bg: '#e0e7ff', bd: '#c7d2fe' },
          { label: 'Total Sales',     value: `₹${totalSales.toLocaleString('en-IN')}`, icon: IndianRupee,  color: '#7c3aed', bg: '#f0ecff', bd: '#d4c8ff' },
          { label: 'Collected',       value: `₹${totalPaid.toLocaleString('en-IN')}`,  icon: CreditCard,   color: '#16a34a', bg: '#f0fdf4', bd: '#bbf7d0' },
          { label: 'Outstanding Due', value: `₹${totalDue.toLocaleString('en-IN')}`,   icon: Clock,        color: '#dc2626', bg: '#fff1f2', bd: '#fecdd3' },
        ].map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: `1px solid ${c.bd}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={c.color} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 3px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by invoice no or customer..." style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {['All', 'Paid', 'Due', 'Partial'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Invoice No.', 'Date', 'Customer', 'Items', 'Amount (₹)', 'Payment', 'Due (₹)', 'Status', 'Action'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {rows.length === 0
                ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No invoices found</td></tr>
                : rows.map((inv) => (
                  <tr key={inv.no} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0c3b73', fontWeight: 600 }}>{inv.no}</span></Td>
                    <Td style={{ color: '#6b7280', fontSize: 12 }}>{inv.date}</Td>
                    <Td style={{ fontWeight: 500 }}>{inv.customer}</Td>
                    <Td>{inv.items}</Td>
                    <Td style={{ fontWeight: 700 }}>₹{inv.amount.toLocaleString('en-IN')}</Td>
                    <Td>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: (PAY_C[inv.payment] || '#6b7280') + '18', color: PAY_C[inv.payment] || '#6b7280' }}>
                        {inv.payment}
                      </span>
                    </Td>
                    <Td style={{ fontWeight: 600, color: inv.due > 0 ? '#dc2626' : '#16a34a' }}>
                      {inv.due > 0 ? `₹${inv.due.toLocaleString('en-IN')}` : '—'}
                    </Td>
                    <Td><Badge val={inv.status} map={STATUS_C} /></Td>
                    <Td>
                      <button title="View" style={{ background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#0c3b73' }}><Eye size={13} /></button>
                    </Td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {rows.length} of {filtered.length} invoices</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronLeft size={14} /></button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} style={{ background: page === i + 1 ? '#0c3b73' : 'none', border: page === i + 1 ? 'none' : '1px solid #e5e7eb', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: page === i + 1 ? '#fff' : '#374151', fontSize: 12 }}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
