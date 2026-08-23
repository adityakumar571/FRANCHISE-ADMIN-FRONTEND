/* eslint-disable prettier/prettier */
/**
 * Screen 91 — Journal
 */
import { useState } from 'react'
import { FileText, Download, Filter, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { JOURNAL_ENTRIES } from './accountsMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function Journal() {
  const [from, setFrom] = useState('2025-05-01')
  const [to, setTo]     = useState('2025-05-20')

  const totalDebit  = JOURNAL_ENTRIES.reduce((s, e) => s + e.debit, 0)
  const totalCredit = JOURNAL_ENTRIES.reduce((s, e) => s + e.credit, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={FileText} title="Journal" subtitle="All journal entries" color="#7c3aed">
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0c3b73', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Plus size={13} /> Add Entry
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer' }}><Filter size={12} /> Filter</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer' }}><Download size={12} /> Export</button>
        </div>
      </PageHeader>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Total Entries', value: JOURNAL_ENTRIES.length, color: '#7c3aed', bg: '#f5f3ff', isCount: true },
          { label: 'Total Debit',   value: totalDebit,             color: '#dc2626', bg: '#fee2e2' },
          { label: 'Total Credit',  value: totalCredit,            color: '#16a34a', bg: '#dcfce7' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${s.color}` }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>
              {s.isCount ? s.value : `₹ ${s.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            </p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Date" /><Th c="Journal No." /><Th c="Particulars" />
              <Th c="Debit (₹)" align="right" /><Th c="Credit (₹)" align="right" />
            </tr></thead>
            <tbody>
              {JOURNAL_ENTRIES.map((e, i) => (
                <tr key={i} onMouseEnter={ev => ev.currentTarget.style.background = '#fafafa'} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{e.date}</Td>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f5f3ff', color: '#7c3aed', padding: '2px 7px', borderRadius: 4 }}>{e.jvNo}</span></Td>
                  <Td style={{ fontWeight: 500 }}>{e.particulars}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>₹ {e.debit.toFixed(2)}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>₹ {e.credit.toFixed(2)}</Td>
                </tr>
              ))}
              <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                <Td style={{ fontWeight: 800 }} colSpan={3}>Total</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>₹ {totalDebit.toFixed(2)}</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>₹ {totalCredit.toFixed(2)}</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
