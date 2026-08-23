/* eslint-disable prettier/prettier */
/**
 * Screen 93 — Trial Balance
 */
import { Scale, Download } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { TRIAL_BALANCE } from './accountsMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function TrialBalance() {
  const totalDebit  = TRIAL_BALANCE.reduce((s, r) => s + (r.debit || 0), 0)
  const totalCredit = TRIAL_BALANCE.reduce((s, r) => s + (r.credit || 0), 0)
  const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.01

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Scale} title="Trial Balance" subtitle="Trial balance as on 31 May 2025" color="#0c3b73">
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
      </PageHeader>

      {/* Balance Status */}
      <div style={{ background: isBalanced ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'linear-gradient(135deg,#dc2626,#ef4444)', borderRadius: 12, padding: '16px 22px', color: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Scale size={22} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{isBalanced ? '✓ Trial Balance is Balanced' : '✗ Trial Balance is Not Balanced'}</p>
          <p style={{ margin: '3px 0 0', fontSize: 12, opacity: 0.85 }}>Debit: ₹ {totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })} &nbsp;=&nbsp; Credit: ₹ {totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th c="Particulars" />
                <Th c="Debit (₹)" align="right" />
                <Th c="Credit (₹)" align="right" />
              </tr>
            </thead>
            <tbody>
              {TRIAL_BALANCE.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td style={{ fontWeight: 500 }}>{r.particulars}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: r.debit ? '#dc2626' : '#9ca3af' }}>
                    {r.debit ? `₹ ${r.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                  </Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: r.credit ? '#16a34a' : '#9ca3af' }}>
                    {r.credit ? `₹ ${r.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                  </Td>
                </tr>
              ))}
              {/* Total Row */}
              <tr style={{ background: '#f9fafb', borderTop: '2px solid #0c3b73' }}>
                <Td style={{ fontWeight: 800, fontSize: 14 }}>Total</Td>
                <Td style={{ textAlign: 'right', fontWeight: 900, color: '#dc2626', fontSize: 15 }}>₹ {totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                <Td style={{ textAlign: 'right', fontWeight: 900, color: '#16a34a', fontSize: 15 }}>₹ {totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
