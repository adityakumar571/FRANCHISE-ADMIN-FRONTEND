/* eslint-disable prettier/prettier */
/**
 * Screen 88 — Payments
 */
import { useState } from 'react'
import { ArrowUpCircle, Download, Filter, Plus, Banknote, Landmark } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { PAYMENTS } from './accountsMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function Payments() {
  const [from, setFrom] = useState('2025-05-15')
  const [to, setTo]     = useState('2025-05-20')

  const total     = PAYMENTS.reduce((s, r) => s + r.amount, 0)
  const cashPay   = PAYMENTS.filter(r => r.mode === 'Cash').reduce((s, r) => s + r.amount, 0)
  const bankPay   = PAYMENTS.filter(r => r.mode === 'Bank').reduce((s, r) => s + r.amount, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={ArrowUpCircle} title="Payments" subtitle="All payment transactions" color="#dc2626">
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0c3b73', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Plus size={13} /> Add Payment
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer' }}><Filter size={12} /> Filter</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer' }}><Download size={12} /> Export</button>
        </div>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Payments', value: total,    color: '#dc2626', bg: '#fee2e2', icon: ArrowUpCircle },
          { label: 'Cash Payments',  value: cashPay,  color: '#d97706', bg: '#fef3c7', icon: Banknote },
          { label: 'Bank Payments',  value: bankPay,  color: '#0891b2', bg: '#e0f2fe', icon: Landmark },
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
              <Th c="Date" /><Th c="Voucher No." /><Th c="Particulars" /><Th c="Mode" /><Th c="Amount (₹)" align="right" />
            </tr></thead>
            <tbody>
              {PAYMENTS.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.date}</Td>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.voucher}</span></Td>
                  <Td style={{ fontWeight: 500 }}>{r.particulars}</Td>
                  <Td>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: r.mode === 'Cash' ? '#fef3c7' : '#e0f2fe', color: r.mode === 'Cash' ? '#d97706' : '#0891b2', border: `1px solid ${r.mode === 'Cash' ? '#fde68a' : '#bae6fd'}` }}>
                      {r.mode}
                    </span>
                  </Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>₹ {r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                </tr>
              ))}
              <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                <Td style={{ fontWeight: 800 }} colSpan={4}>Total</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626', fontSize: 15 }}>₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
