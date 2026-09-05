/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { BarChart2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
const COLORS = ['#0c3b73', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#16a34a', '#6b7280']

export default function FinancialReport() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/reports/financial?from=${from}&to=${to}`)
      setData(res.data?.data)
    } catch { toast.error('Failed to load financial report') }
    finally   { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [from, to])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={BarChart2} title="Financial Report" subtitle="Income vs Expense overview" color="#0c3b73" />

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 13 }}>From:</span>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        <span style={{ fontSize: 13 }}>To:</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        <button onClick={fetchData} style={{ padding: '7px 16px', border: 'none', borderRadius: 7, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Apply</button>
      </div>

      {!loading && data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Total Income',   value: fmt(data.income),     color: '#16a34a' },
              { label: 'Total Expenses', value: fmt(data.expenses),   color: '#dc2626' },
              { label: 'Net Profit',     value: fmt(data.netProfit),  color: data.netProfit >= 0 ? '#0c3b73' : '#dc2626' },
            ].map(k => (
              <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
            {data.monthlyData?.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>Monthly Trend</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} width={42} />
                    <Tooltip formatter={v => [fmt(v), '']} contentStyle={{ borderRadius: 8, border: 'none', fontSize: 11 }} />
                    <Bar dataKey="income"  name="Income"   fill="#16a34a" radius={[3,3,0,0]} />
                    <Bar dataKey="expense" name="Expenses" fill="#dc2626" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {data.expenseBreakdown?.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>Expense Breakdown</p>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={data.expenseBreakdown} cx="50%" cy="50%" outerRadius={60} dataKey="amount" nameKey="category" paddingAngle={3} strokeWidth={0}>
                      {data.expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => [fmt(v), '']} contentStyle={{ borderRadius: 8, border: 'none', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                  {data.expenseBreakdown.map((d, i) => (
                    <div key={d.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                        {d.category}
                      </div>
                      <span style={{ fontWeight: 600 }}>{fmt(d.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
