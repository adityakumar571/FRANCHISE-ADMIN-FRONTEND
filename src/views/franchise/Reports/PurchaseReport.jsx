/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { ShoppingCart, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'

const MOCK = [
  { no: 'PUR-2025-124', date: '20 May 2025', supplier: 'MedPlus Pharma',         items: 78,  amount: 25430, discount: 850,  tax: 1850, net: 28250, payment: 'Cash',   status: 'Paid' },
  { no: 'PUR-2025-123', date: '20 May 2025', supplier: 'HealthCare Distributors', items: 61,  amount: 18750, discount: 620,  tax: 1455, net: 18750, payment: 'UPI',    status: 'Paid' },
  { no: 'PUR-2025-122', date: '20 May 2025', supplier: 'Universal Medicines',     items: 54,  amount: 15600, discount: 580,  tax: 1210, net: 15600, payment: 'Credit', status: 'Due' },
  { no: 'PUR-2025-121', date: '19 May 2025', supplier: 'Sarthi Pharma',           items: 32,  amount: 12350, discount: 220,  tax: 960,  net: 12350, payment: 'NEFT',   status: 'Paid' },
  { no: 'PUR-2025-120', date: '18 May 2025', supplier: 'Reliable Medicos',        items: 45,  amount: 15520, discount: 400,  tax: 1200, net: 15520, payment: 'Cash',   status: 'Paid' },
  { no: 'PUR-2025-119', date: '17 May 2025', supplier: 'MedPlus Pharma',          items: 90,  amount: 32000, discount: 1200, tax: 2460, net: 32000, payment: 'NEFT',   status: 'Paid' },
  { no: 'PUR-2025-118', date: '16 May 2025', supplier: 'Gupta Pharma',            items: 38,  amount: 11250, discount: 300,  tax: 875,  net: 11250, payment: 'UPI',    status: 'Partial' },
]

const STATUS_C = {
  Paid:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Due:     { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
  Partial: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
}

const Badge = ({ val }) => {
  const c = STATUS_C[val] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' }
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{val}</span>
}
const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function PurchaseReport() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const filtered = MOCK.filter(r =>
    (search === '' || r.no.toLowerCase().includes(search.toLowerCase()) || r.supplier.toLowerCase().includes(search.toLowerCase())) &&
    (status === 'All' || r.status === status)
  )

  const totalPurchase = MOCK.reduce((a, r) => a + r.amount, 0)
  const totalDiscount = MOCK.reduce((a, r) => a + r.discount, 0)
  const totalTax      = MOCK.reduce((a, r) => a + r.tax, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={20} color="#0c3b73" /> Purchase Report
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Detailed purchase summary</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Bills',     value: String(MOCK.length),                         color: '#0c3b73' },
          { label: 'Total Purchase',  value: `₹${totalPurchase.toLocaleString('en-IN')}`, color: '#7c3aed' },
          { label: 'Total Discount',  value: `₹${totalDiscount.toLocaleString('en-IN')}`, color: '#d97706' },
          { label: 'Total Tax (GST)', value: `₹${totalTax.toLocaleString('en-IN')}`,      color: '#16a34a' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by bill no or supplier..." style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {['All', 'Paid', 'Due', 'Partial'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Bill No.', 'Date', 'Supplier', 'Items', 'Amount (₹)', 'Discount (₹)', 'Tax (₹)', 'Payment', 'Status'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No records found</td></tr>
                : filtered.map(r => (
                  <tr key={r.no} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0c3b73', fontWeight: 600 }}>{r.no}</span></Td>
                    <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.date}</Td>
                    <Td style={{ fontWeight: 500 }}>{r.supplier}</Td>
                    <Td>{r.items}</Td>
                    <Td style={{ fontWeight: 700 }}>₹{r.amount.toLocaleString('en-IN')}</Td>
                    <Td style={{ color: '#d97706' }}>₹{r.discount.toLocaleString('en-IN')}</Td>
                    <Td>₹{r.tax.toLocaleString('en-IN')}</Td>
                    <Td><span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.payment}</span></Td>
                    <Td><Badge val={r.status} /></Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {MOCK.length} bills</span>
        </div>
      </div>
    </div>
  )
}
