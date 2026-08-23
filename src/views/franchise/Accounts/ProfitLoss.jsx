/* eslint-disable prettier/prettier */
/**
 * Screen 94 — Profit & Loss Statement
 */
import { BarChart2, Download } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const INCOME_ROWS = [
  { particulars: 'Sales Income',      amount: 585320.00 },
  { particulars: 'Other Income',      amount: 15970.00  },
  { particulars: 'Discount Received', amount: 12540.00  },
  { particulars: 'Interest Received', amount: 6340.00   },
]
const EXPENSE_ROWS = [
  { particulars: 'Cost of Goods Sold', amount: 329241.00 },
  { particulars: 'Salary Expense',     amount: 102460.00 },
  { particulars: 'Rent Expense',       amount: 93000.00  },
  { particulars: 'Electricity Expense',amount: 38280.00  },
  { particulars: 'Other Expenses',     amount: 61260.00  },
]

const Row = ({ label, value, bold, color, indent }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: indent ? '5px 0 5px 16px' : '6px 0', fontSize: 13, borderBottom: '1px solid #f9fafb' }}>
    <span style={{ color: bold ? '#111827' : '#374151', fontWeight: bold ? 700 : 400 }}>{label}</span>
    <span style={{ fontWeight: bold ? 800 : 600, color: color || '#111827' }}>₹ {value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
  </div>
)

export default function ProfitLoss() {
  const totalIncome   = INCOME_ROWS.reduce((s, r) => s + r.amount, 0)
  const totalExpenses = EXPENSE_ROWS.reduce((s, r) => s + r.amount, 0)
  const netProfit     = totalIncome - totalExpenses
  const tax           = netProfit > 0 ? netProfit * 0 : 0
  const netProfitAfterTax = netProfit - tax

  const barMax = Math.max(totalIncome, totalExpenses)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={BarChart2} title="Profit & Loss Statement" subtitle={`For the period 01 Apr 2025 to 20 May 2025`} color="#0c3b73">
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
      </PageHeader>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Income',    value: totalIncome,        color: '#16a34a', bg: '#dcfce7' },
          { label: 'Total Expenses',  value: totalExpenses,      color: '#dc2626', bg: '#fee2e2' },
          { label: 'Net Profit/Loss', value: netProfit,          color: netProfit >= 0 ? '#16a34a' : '#dc2626', bg: netProfit >= 0 ? '#dcfce7' : '#fee2e2' },
          { label: 'Tax (0%)',        value: tax,                color: '#d97706', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px', borderLeft: `4px solid ${s.color}` }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: s.color, margin: 0 }}>₹ {s.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Income */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#16a34a' }}>Income</p>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase' }}>Particulars</p>
            {INCOME_ROWS.map(r => <Row key={r.particulars} label={r.particulars} value={r.amount} indent />)}
            <div style={{ borderTop: '2px solid #16a34a', marginTop: 8, paddingTop: 8 }}>
              <Row label="Total Income" value={totalIncome} bold color="#16a34a" />
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#fff1f2', borderBottom: '1px solid #fecdd3' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#dc2626' }}>Expenses</p>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase' }}>Particulars</p>
            {EXPENSE_ROWS.map(r => <Row key={r.particulars} label={r.particulars} value={r.amount} indent />)}
            <div style={{ borderTop: '2px solid #dc2626', marginTop: 8, paddingTop: 8 }}>
              <Row label="Total Expenses" value={totalExpenses} bold color="#dc2626" />
            </div>
          </div>
        </div>

        {/* Summary + Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Summary Box */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Summary</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280' }}>Total Income</span>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>₹ {totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280' }}>Total Expenses</span>
              <span style={{ fontWeight: 700, color: '#dc2626' }}>₹ {totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontWeight: 700 }}>Net Profit / (Loss)</span>
              <span style={{ fontWeight: 800, color: netProfit >= 0 ? '#16a34a' : '#dc2626' }}>
                {netProfit < 0 ? '(' : ''}₹ {Math.abs(netProfit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}{netProfit < 0 ? ')' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
              <span style={{ color: '#6b7280' }}>Tax (0%)</span>
              <span style={{ fontWeight: 600 }}>₹ 0.00</span>
            </div>
            <div style={{ borderTop: '2px solid #0c3b73', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ fontWeight: 800 }}>Net Profit / (Loss)</span>
              <span style={{ fontWeight: 900, color: netProfitAfterTax >= 0 ? '#16a34a' : '#dc2626' }}>
                {netProfitAfterTax < 0 ? '(' : ''}₹ {Math.abs(netProfitAfterTax).toLocaleString('en-IN', { minimumFractionDigits: 2 })}{netProfitAfterTax < 0 ? ')' : ''}
              </span>
            </div>
          </div>

          {/* Bar Chart */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>Chart</p>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', height: 120, justifyContent: 'center' }}>
              {[
                { label: 'Total Income',   value: totalIncome,   color: '#16a34a' },
                { label: 'Total Expenses', value: totalExpenses, color: '#dc2626' },
              ].map(b => (
                <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: b.color, fontWeight: 700 }}>₹{(b.value/100000).toFixed(1)}L</span>
                  <div style={{ width: 40, height: Math.round((b.value / barMax) * 90), background: b.color, borderRadius: '4px 4px 0 0', minHeight: 8 }} />
                  <span style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', maxWidth: 50 }}>{b.label.replace('Total ', '')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
