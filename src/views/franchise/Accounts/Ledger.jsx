/* eslint-disable prettier/prettier */
/**
 * Screen 92 — Ledger
 */
import { useState } from 'react'
import { BookMarked, Download, Filter, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { LEDGER_ENTRIES } from './accountsMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

const ACCOUNTS = ['Rahul Sharma (Debtor)', 'Priya Singh (Creditor)', 'Sales Account', 'Purchase Account', 'Cash Account', 'Bank Account']

export default function Ledger() {
  const [account, setAccount] = useState('Rahul Sharma (Debtor)')
  const [from, setFrom]       = useState('2025-04-01')
  const [to, setTo]           = useState('2025-05-20')
  const [search, setSearch]   = useState('')

  const totalDebit  = LEDGER_ENTRIES.reduce((s, e) => s + (e.debit || 0), 0)
  const totalCredit = LEDGER_ENTRIES.reduce((s, e) => s + (e.credit || 0), 0)
  const openBal     = 12400.00
  const closingBal  = openBal + totalCredit - totalDebit

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={BookMarked} title="Ledger" subtitle="View ledger accounts" color="#d97706">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer' }}><Filter size={12} /> Filter</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer' }}><Download size={12} /> Export</button>
        </div>
      </PageHeader>

      {/* Account Selector */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', margin: '0 0 8px', textTransform: 'uppercase' }}>Select Account</p>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <select value={account} onChange={e => setAccount(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 30px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', cursor: 'pointer' }}>
            {ACCOUNTS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {[
          { label: 'Account',         value: account.split(' ')[0],                                             color: '#d97706', large: false },
          { label: 'Total Sold',      value: `₹ ${totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#0c3b73', large: true },
          { label: 'Total Credit',    value: `₹ ${totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,  color: '#dc2626', large: true },
          { label: 'Closing Balance', value: `₹ ${closingBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: '#16a34a', large: true },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', borderLeft: `4px solid ${s.color}` }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: s.large ? 18 : 14, fontWeight: 700, color: s.color, margin: 0, wordBreak: 'break-word' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Ledger Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Ledger — {account}</p>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{from.split('-').reverse().join('/')} to {to.split('-').reverse().join('/')}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Date" /><Th c="Particular" />
              <Th c="Debit (₹)" align="right" /><Th c="Credit (₹)" align="right" /><Th c="Balance (₹)" align="right" />
            </tr></thead>
            <tbody>
              {LEDGER_ENTRIES.map((e, i) => (
                <tr key={i} onMouseEnter={ev => ev.currentTarget.style.background = '#fafafa'} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{e.date}</Td>
                  <Td style={{ fontWeight: 500 }}>{e.particular}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>{e.debit ? `₹ ${e.debit.toFixed(2)}` : '—'}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{e.credit ? `₹ ${e.credit.toFixed(2)}` : '—'}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>₹ {e.balance.toFixed(2)}</Td>
                </tr>
              ))}
              <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                <Td style={{ fontWeight: 800 }} colSpan={2}>Total</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>₹ {totalDebit.toFixed(2)}</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>₹ {totalCredit.toFixed(2)}</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#0c3b73' }}>₹ {closingBal.toFixed(2)}</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
