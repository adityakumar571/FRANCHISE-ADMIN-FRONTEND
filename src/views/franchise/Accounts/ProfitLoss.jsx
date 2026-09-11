/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { BarChart2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

export default function ProfitLoss() {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/accounts/profit-loss?from=${from}&to=${to}`)
      setData(res.data?.data)
    } catch { toast.error('Failed to load P&L') }
    finally   { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [from, to])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={BarChart2} title="Profit & Loss" subtitle="Income vs Expense analysis" color="#0c3b73" />

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
              { label: 'Total Income',  value: fmt(data.totalIncome),    color: '#16a34a' },
              { label: 'Total Expenses',value: fmt(data.totalExpenses),  color: '#dc2626' },
              { label: 'Net Profit',    value: fmt(data.netProfit),      color: data.netProfit >= 0 ? '#0c3b73' : '#dc2626' },
            ].map(k => (
              <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
              </div>
            ))}
          </div>

          {data.monthlyData && data.monthlyData.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>Monthly Income vs Expenses</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.monthlyData} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} width={46} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 11 }} formatter={v => [fmt(v), '']} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="income"  name="Income"   fill="#16a34a" radius={[3,3,0,0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#dc2626" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#16a34a' }}>Income</p>
              </div>
              {(data.income || []).map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                  <span style={{ color: '#374151' }}>{r.label}</span>
                  <span style={{ fontWeight: 700, color: '#16a34a' }}>{fmt(r.amount)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderTop: '2px solid #16a34a', fontSize: 14, fontWeight: 800 }}>
                <span>Total Income</span>
                <span style={{ color: '#16a34a' }}>{fmt(data.totalIncome)}</span>
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#fff1f2', borderBottom: '1px solid #fecdd3' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#dc2626' }}>Expenses</p>
              </div>
              {(data.expenses || []).map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                  <span style={{ color: '#374151' }}>{r.label}</span>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}>{fmt(r.amount)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderTop: '2px solid #dc2626', fontSize: 14, fontWeight: 800 }}>
                <span>Total Expenses</span>
                <span style={{ color: '#dc2626' }}>{fmt(data.totalExpenses)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
