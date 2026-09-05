/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { TrendingDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#0c3b73', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#16a34a', '#6b7280']
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/accounts/expenses?from=${from}&to=${to}&category=${category}`)
      const d = res.data?.data
      setExpenses(d?.expenses || [])
      setTotal(d?.total || 0)
    } catch { toast.error('Failed to load expenses') }
    finally   { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [from, to, category])

  const catTotals = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc }, {})
  const pieData = Object.entries(catTotals).map(([name, value]) => ({ name, value }))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={TrendingDown} title="Expenses" subtitle="All expense entries" color="#dc2626" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px' }}>Total Expenses</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#dc2626', margin: 0 }}>{fmt(total)}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
              <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
              <select value={category} onChange={e => setCategory(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#f9fafb', cursor: 'pointer' }}>
                <option value="">All Categories</option>
                {['Rent', 'Salary', 'Utilities', 'Transport', 'Office', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Date', 'Particulars', 'Category', 'Amount (₹)'].map(h => (
                  <th key={h} style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(4).fill(0).map((_, j) => <td key={j} style={{ padding: '9px 12px' }}><div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                  : expenses.map((e, i) => (
                    <tr key={i}>
                      <td style={{ padding: '9px 12px', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{e.date}</td>
                      <td style={{ padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6', fontWeight: 500 }}>{e.particulars}</td>
                      <td style={{ padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#f3f4f6', color: '#374151' }}>{e.category}</span>
                      </td>
                      <td style={{ padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{fmt(e.amount)}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Pie */}
        {!loading && pieData.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>By Category</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [fmt(v), '']} contentStyle={{ borderRadius: 8, border: 'none', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {pieData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                    <span style={{ color: '#374151' }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
