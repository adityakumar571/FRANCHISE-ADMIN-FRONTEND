/* eslint-disable prettier/prettier */
/**
 * Screen 95 — Balance Sheet
 */
import { CheckCircle, Download, LayoutTemplate } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const LIABILITIES = [
  { head: 'Capital & Reserves', items: [{ name: 'Capital Account', amount: 4990990.00 }] },
  { head: 'Current Liabilities', items: [
    { name: 'Creditors',         amount: 129430.00 },
    { name: 'Bank OD',           amount: 25000.00  },
    { name: 'Other Liabilities', amount: 19400.00  },
  ]},
]
const ASSETS = [
  { head: 'Current Assets', items: [
    { name: 'Cash in Hand',      amount: 41960.00  },
    { name: 'Bank Account',      amount: 217840.00 },
    { name: 'Stock in Hand',     amount: 335680.00 },
    { name: 'Debtors',           amount: 145230.00 },
    { name: 'Other Curr. Assets',amount: 25000.00  },
  ]},
  { head: 'Fixed Assets', items: [
    { name: 'Furniture',  amount: 55000.00 },
    { name: 'Equipment',  amount: 45000.00 },
  ]},
]

const SectionTable = ({ head, items }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{head}</p>
    {items.map(it => (
      <div key={it.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>
        <span style={{ color: '#374151' }}>{it.name}</span>
        <span style={{ fontWeight: 600, color: '#111827' }}>₹ {it.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
    ))}
  </div>
)

export default function BalanceSheet() {
  const totalLiabilities = LIABILITIES.flatMap(s => s.items).reduce((s, i) => s + i.amount, 0)
  const totalAssets      = ASSETS.flatMap(s => s.items).reduce((s, i) => s + i.amount, 0)
  const isBalanced       = Math.abs(totalAssets - totalLiabilities) < 0.01

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={LayoutTemplate} title="Balance Sheet" subtitle="As on 20 May 2025" color="#0c3b73">
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
      </PageHeader>

      {/* Balanced Status Banner */}
      {isBalanced && (
        <div style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', borderRadius: 12, padding: '14px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckCircle size={22} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Balance Sheet is Balanced ✓</p>
            <p style={{ margin: '3px 0 0', fontSize: 12, opacity: 0.9 }}>Total Assets = Total Liabilities = ₹ {totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 240px', gap: 16, alignItems: 'start' }}>
        {/* Liabilities */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#fff1f2', borderBottom: '1px solid #fecdd3' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#dc2626' }}>Liabilities</p>
          </div>
          <div style={{ padding: '14px 16px' }}>
            {LIABILITIES.map(s => <SectionTable key={s.head} head={s.head} items={s.items} />)}
            <div style={{ borderTop: '2px solid #dc2626', paddingTop: 10, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800 }}>
                <span>Total Liabilities</span>
                <span style={{ color: '#dc2626' }}>₹ {totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assets */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#16a34a' }}>Assets</p>
          </div>
          <div style={{ padding: '14px 16px' }}>
            {ASSETS.map(s => <SectionTable key={s.head} head={s.head} items={s.items} />)}
            <div style={{ borderTop: '2px solid #16a34a', paddingTop: 10, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800 }}>
                <span>Total Assets</span>
                <span style={{ color: '#16a34a' }}>₹ {totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>Summary</p>
          {[
            { label: 'Total Assets',      value: totalAssets,      color: '#16a34a' },
            { label: 'Total Liabilities', value: totalLiabilities, color: '#dc2626' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px' }}>{s.label}</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: s.color, margin: 0 }}>₹ {s.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px' }}>Difference</p>
            <p style={{ fontSize: 18, fontWeight: 900, color: isBalanced ? '#16a34a' : '#dc2626', margin: 0 }}>
              {isBalanced ? '0.00' : `₹ ${Math.abs(totalAssets - totalLiabilities).toFixed(2)}`}
            </p>
          </div>
          {isBalanced && (
            <div style={{ marginTop: 16, padding: '12px', background: '#dcfce7', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} color="#16a34a" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Balance Sheet is Balanced</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
