/* eslint-disable prettier/prettier */
/**
 * Screen 85 — Bank Book
 */
import { useState } from 'react'
import { Landmark, Download, Filter, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { BANK_BOOK } from './accountsMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function BankBook() {
  const [from, setFrom] = useState('2025-05-01')
  const [to, setTo]     = useState('2025-05-20')

  const openBal  = 1354930.00
  const totalDep = BANK_BOOK.reduce((s, r) => s + (r.deposit || 0), 0)
  const totalWdr = BANK_BOOK.reduce((s, r) => s + (r.withdrawal || 0), 0)
  const closeBal = openBal + totalDep - totalWdr

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Landmark} title="Bank Book" subtitle="All bank transactions" color="#0891b2">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer', color: '#374151' }}><Filter size={12} /> Filter</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer', color: '#374151' }}><Download size={12} /> Export</button>
        </div>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        {[
          { label: 'Opening Balance', value: openBal,  color: '#0c3b73', bg: '#e0e7ff', icon: Wallet },
          { label: 'Total Deposit',   value: totalDep, color: '#16a34a', bg: '#dcfce7', icon: TrendingUp },
          { label: 'Total Withdraw',  value: totalWdr, color: '#dc2626', bg: '#fee2e2', icon: TrendingDown },
          { label: 'Closing Balance', value: closeBal, color: '#0891b2', bg: '#e0f2fe', icon: Wallet },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><s.icon size={20} color={s.color} /></div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: s.color, margin: '2px 0 0' }}>₹ {s.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Date" /><Th c="Voucher No." /><Th c="Particulars" />
              <Th c="Deposit (₹)" align="right" /><Th c="Withdrawal (₹)" align="right" /><Th c="Balance (₹)" align="right" />
            </tr></thead>
            <tbody>
              <tr style={{ background: '#f0f9ff' }}>
                <Td style={{ fontWeight: 700, color: '#0891b2' }}>Opening Balance</Td>
                <Td>—</Td><Td style={{ fontWeight: 600 }}>Brought Forward</Td>
                <Td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹ {openBal.toFixed(2)}</Td>
                <Td style={{ textAlign: 'right' }}>—</Td>
                <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0891b2' }}>₹ {openBal.toFixed(2)}</Td>
              </tr>
              {BANK_BOOK.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.date}</Td>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.voucher}</span></Td>
                  <Td style={{ fontWeight: 500 }}>{r.particulars}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{r.deposit ? `₹ ${r.deposit.toFixed(2)}` : '—'}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>{r.withdrawal ? `₹ ${r.withdrawal.toFixed(2)}` : '—'}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0891b2' }}>₹ {r.balance.toFixed(2)}</Td>
                </tr>
              ))}
              <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                <Td style={{ fontWeight: 800 }} colSpan={3}>Total</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>₹ {totalDep.toFixed(2)}</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>₹ {totalWdr.toFixed(2)}</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#0891b2' }}>₹ {closeBal.toFixed(2)}</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
