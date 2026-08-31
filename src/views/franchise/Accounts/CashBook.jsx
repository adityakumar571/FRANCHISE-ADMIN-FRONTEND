/* eslint-disable prettier/prettier */
/**
 * Screen 84 — Cash Book
 */
import { useState } from 'react'
import { BookOpen, Download, Filter, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import TablePagination from '../components/TablePagination'
import { CASH_BOOK } from './accountsMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

const StatCard = ({ label, value, color, icon: Icon, bg }) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 44, height: 44, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 700, color, margin: '2px 0 0' }}>{value}</p>
    </div>
  </div>
)

export default function CashBook() {
  const [from, setFrom] = useState('2025-05-01')
  const [to, setTo]     = useState('2025-05-20')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const openBal   = 25430.00
  const totalIn   = CASH_BOOK.reduce((s, r) => s + (r.cashIn || 0), 0)
  const totalOut  = CASH_BOOK.reduce((s, r) => s + (r.cashOut || 0), 0)
  const closeBal  = openBal + totalIn - totalOut
  const paged     = CASH_BOOK.slice((page - 1) * limit, page * limit)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={BookOpen} title="Cash Book" subtitle="All cash transactions" color="#0c3b73">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer', color: '#374151' }}>
            <Filter size={12} /> Filter
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer', color: '#374151' }}>
            <Download size={12} /> Export
          </button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        <StatCard label="Opening Balance" value={`₹ ${openBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}  color="#0c3b73" bg="#e0e7ff" icon={Wallet} />
        <StatCard label="Cash In"         value={`₹ ${totalIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}   color="#16a34a" bg="#dcfce7" icon={TrendingUp} />
        <StatCard label="Cash Out"        value={`₹ ${totalOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}  color="#dc2626" bg="#fee2e2" icon={TrendingDown} />
        <StatCard label="Closing Balance" value={`₹ ${closeBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="#7c3aed" bg="#f5f3ff" icon={Wallet} />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th c="Date" />
                <Th c="Voucher No." />
                <Th c="Particulars" />
                <Th c="Cash In (₹)" align="right" />
                <Th c="Cash Out (₹)" align="right" />
                <Th c="Balance (₹)" align="right" />
              </tr>
            </thead>
            <tbody>
              {/* Opening Row */}
              <tr style={{ background: '#f0f9ff' }}>
                <Td style={{ fontWeight: 700, color: '#0c3b73' }}>Opening Balance</Td>
                <Td>—</Td>
                <Td style={{ fontWeight: 600 }}>Brought Forward</Td>
                <Td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹ {openBal.toFixed(2)}</Td>
                <Td style={{ textAlign: 'right' }}>—</Td>
                <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>₹ {openBal.toFixed(2)}</Td>
              </tr>
              {CASH_BOOK.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.date}</Td>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.voucher}</span></Td>
                  <Td style={{ fontWeight: 500 }}>{r.particulars}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{r.cashIn ? `₹ ${r.cashIn.toFixed(2)}` : '—'}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>{r.cashOut ? `₹ ${r.cashOut.toFixed(2)}` : '—'}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>₹ {r.balance.toFixed(2)}</Td>
                </tr>
              ))}
              <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                <Td style={{ fontWeight: 800, color: '#111827' }} colSpan={3}>Total</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>₹ {totalIn.toFixed(2)}</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>₹ {totalOut.toFixed(2)}</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#0c3b73' }}>₹ {closeBal.toFixed(2)}</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
