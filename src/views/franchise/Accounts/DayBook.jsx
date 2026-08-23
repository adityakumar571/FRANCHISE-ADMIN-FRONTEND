/* eslint-disable prettier/prettier */
/**
 * Screen 86 — Day Book
 */
import { useState } from 'react'
import { CalendarDays, Download, Filter } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { DAY_BOOK } from './accountsMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

const TRANSACTION_SUMMARY = [
  { particulars: 'Cash',         count: 24, amount: 2460700.00 },
  { particulars: 'Purchase',     count: 12, amount: 560550.00  },
  { particulars: 'Receipts',     count: 18, amount: 1740300.00 },
  { particulars: 'Payments',     count: 15, amount: 1250000.00 },
  { particulars: 'Journal Entries', count: 5, amount: 22400.00 },
]

export default function DayBook() {
  const [date, setDate] = useState('2025-05-20')

  const totalDebit  = DAY_BOOK.reduce((s, r) => s + (r.debit || 0), 0)
  const totalCredit = DAY_BOOK.reduce((s, r) => s + (r.credit || 0), 0)
  const netBalance  = totalCredit - totalDebit

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={CalendarDays} title="Day Book" subtitle="Summary of all transactions" color="#7c3aed">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
          <input type="date" defaultValue="2025-05-20" style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer' }}><Filter size={12} /> Filter</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer' }}><Download size={12} /> Export</button>
        </div>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        {/* Transactions Table */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>All Transactions — {date.split('-').reverse().join('/')}</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <Th c="Date" /><Th c="Voucher No." /><Th c="Particulars" />
                <Th c="Debit (₹)" align="right" /><Th c="Credit (₹)" align="right" />
              </tr></thead>
              <tbody>
                {DAY_BOOK.map((r, i) => (
                  <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.date}</Td>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.voucher}</span></Td>
                    <Td style={{ fontWeight: 500 }}>{r.particulars}</Td>
                    <Td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>{r.debit ? `₹ ${r.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}</Td>
                    <Td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{r.credit ? `₹ ${r.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}</Td>
                  </tr>
                ))}
                <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                  <Td style={{ fontWeight: 800 }} colSpan={3}>Total</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>₹ {totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>₹ {totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Net Balance (Receipts - Payments)</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: netBalance >= 0 ? '#16a34a' : '#dc2626' }}>
              ₹ {Math.abs(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Transaction Summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Transaction Summary</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Particulars" /><Th c="Count" align="center" /><Th c="Amount (₹)" align="right" />
            </tr></thead>
            <tbody>
              {TRANSACTION_SUMMARY.map((s, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td style={{ fontWeight: 600 }}>{s.particulars}</Td>
                  <Td style={{ textAlign: 'center' }}>{s.count}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>₹ {s.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '12px 16px', borderTop: '2px solid #0c3b73', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800 }}>
            <span>Net Balance</span>
            <span style={{ color: '#0c3b73' }}>₹ {netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
