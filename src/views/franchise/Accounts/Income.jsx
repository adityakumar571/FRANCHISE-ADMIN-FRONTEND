/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

export default function Income() {
  const [income, setIncome] = useState([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/accounts/income')
        setIncome(res.data?.data?.income || [])
        setTotal(res.data?.data?.total || 0)
      } catch { toast.error('Failed to load income') }
      finally   { setLoading(false) }
    })()
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={TrendingUp} title="Income" subtitle="All income entries" color="#16a34a" />
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', display: 'inline-flex', gap: 24 }}>
        <div>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Total Income</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', margin: '2px 0 0' }}>{fmt(total)}</p>
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
              ? Array(4).fill(0).map((_, i) => <tr key={i}>{Array(4).fill(0).map((_, j) => <td key={j} style={{ padding: '9px 12px' }}><div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
              : income.map((e, i) => (
                <tr key={i}>
                  <td style={{ padding: '9px 12px', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{e.date}</td>
                  <td style={{ padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6', fontWeight: 500 }}>{e.particulars}</td>
                  <td style={{ padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a' }}>{e.category}</span>
                  </td>
                  <td style={{ padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{fmt(e.amount)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
