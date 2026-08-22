/* eslint-disable prettier/prettier */
import { BarChart2, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const REVENUE_DATA = [
  { m: '1 May', income: 42000, expense: 18000 },
  { m: '5 May', income: 65000, expense: 22000 },
  { m: '10 May', income: 55000, expense: 19000 },
  { m: '13 May', income: 78000, expense: 25000 },
  { m: '16 May', income: 70000, expense: 21000 },
  { m: '19 May', income: 92000, expense: 28000 },
  { m: '20 May', income: 86500, expense: 26000 },
]

const EXPENSE_BREAKDOWN = [
  { name: 'Purchase',   value: 82400, color: '#0c3b73' },
  { name: 'Salary',     value: 15000, color: '#7c3aed' },
  { name: 'Rent',       value: 8000,  color: '#d97706' },
  { name: 'Electricity',value: 3200,  color: '#16a34a' },
  { name: 'Others',     value: 4180,  color: '#9ca3af' },
]

const INCOME_ROWS = [
  { label: 'Sales Income',      amount: 545380, pct: '92.4%', color: '#16a34a' },
  { label: 'Other Income',      amount: 28500,  pct: '4.8%',  color: '#0c3b73' },
  { label: 'Discount Received', amount: 12560,  pct: '2.1%',  color: '#7c3aed' },
  { label: 'Interest Received', amount: 6240,   pct: '1.1%',  color: '#d97706' },
]
const EXPENSE_ROWS = [
  { label: 'Cost of Goods Sold', amount: 328240 },
  { label: 'Purchase Expenses',  amount: 18450 },
  { label: 'Salary Expense',     amount: 102400 },
  { label: 'Rent Expense',       amount: 97800 },
  { label: 'Electricity Expense',amount: 36240 },
  { label: 'Transport Expense',  amount: 28650 },
  { label: 'Other Expenses',     amount: 61250 },
]

const totalIncome   = INCOME_ROWS.reduce((a, r) => a + r.amount, 0)
const totalExpenses = EXPENSE_ROWS.reduce((a, r) => a + r.amount, 0)
const netProfit     = totalIncome - totalExpenses

const Card = ({ label, value, color, icon: Icon, bg }) => (
  <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 700, color, margin: 0 }}>{value}</p>
    </div>
  </div>
)

export default function FinancialReport() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 size={20} color="#0c3b73" /> Financial Report
        </h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Financial performance and profit/loss statement</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        <Card label="Total Income"   value={`₹${totalIncome.toLocaleString('en-IN')}`}   color="#16a34a" bg="#f0fdf4" icon={TrendingUp} />
        <Card label="Total Expenses" value={`₹${totalExpenses.toLocaleString('en-IN')}`} color="#dc2626" bg="#fff1f2" icon={TrendingDown} />
        <Card label="Net Profit"     value={`₹${netProfit.toLocaleString('en-IN')}`}     color={netProfit >= 0 ? '#16a34a' : '#dc2626'} bg={netProfit >= 0 ? '#f0fdf4' : '#fff1f2'} icon={IndianRupee} />
        <Card label="Profit Margin"  value={`${((netProfit / totalIncome) * 100).toFixed(2)}%`} color="#0c3b73" bg="#e0e7ff" icon={BarChart2} />
      </div>

      {/* Income vs Expenses chart */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 18px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Income vs Expenses (Daily)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={REVENUE_DATA} margin={{ left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="m" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11 }} formatter={v => `₹${v.toLocaleString('en-IN')}`} />
            <Bar dataKey="income"  fill="#16a34a" radius={[3,3,0,0]} name="Income" />
            <Bar dataKey="expense" fill="#dc2626" radius={[3,3,0,0]} name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* P&L + Expense breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>
        {/* P&L Statement */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 18px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Profit &amp; Loss Statement</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {/* Income */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', margin: '0 0 8px' }}>Income</p>
              {INCOME_ROWS.map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ fontSize: 12, color: '#374151' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: r.color }}>₹{r.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #e5e7eb', marginTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Total Income</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>₹{totalIncome.toLocaleString('en-IN')}</span>
              </div>
            </div>
            {/* Expenses */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', margin: '0 0 8px' }}>Expenses</p>
              {EXPENSE_ROWS.map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ fontSize: 12, color: '#374151' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>₹{r.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #e5e7eb', marginTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Total Expenses</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          {/* Net Profit row */}
          <div style={{ marginTop: 12, padding: '12px 16px', background: netProfit >= 0 ? '#f0fdf4' : '#fff1f2', borderRadius: 8, display: 'flex', justifyContent: 'space-between', border: `1px solid ${netProfit >= 0 ? '#bbf7d0' : '#fecdd3'}` }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Net Profit / (Loss)</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: netProfit >= 0 ? '#16a34a' : '#dc2626' }}>₹{netProfit.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Expense Breakdown Pie */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 18px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Expense Breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={EXPENSE_BREAKDOWN} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={2} strokeWidth={0}>
                {EXPENSE_BREAKDOWN.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 11 }} formatter={v => `₹${v.toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
            {EXPENSE_BREAKDOWN.map(e => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: e.color, display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: '#374151' }}>{e.name}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>₹{e.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
