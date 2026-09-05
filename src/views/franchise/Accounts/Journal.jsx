/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/accounts/journal')
        setEntries(res.data?.data?.entries || [])
      } catch { toast.error('Failed to load journal') }
      finally   { setLoading(false) }
    })()
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={FileText} title="Journal Entries" subtitle="Double-entry journal vouchers" color="#0c3b73" />
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Date', 'JV No.', 'Particulars', 'Debit (₹)', 'Credit (₹)'].map(h => (
              <th key={h} style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading
              ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j} style={{ padding: '9px 12px' }}><div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
              : entries.map((e, i) => (
                <tr key={i}>
                  <td style={{ padding: '9px 12px', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{e.date}</td>
                  <td style={{ padding: '9px 12px', fontSize: 13, fontFamily: 'monospace', color: '#0c3b73', borderBottom: '1px solid #f3f4f6' }}>{e.jvNo}</td>
                  <td style={{ padding: '9px 12px', fontSize: 13, fontWeight: 500, borderBottom: '1px solid #f3f4f6' }}>{e.particulars}</td>
                  <td style={{ padding: '9px 12px', fontSize: 13, textAlign: 'right', fontWeight: 600, color: '#dc2626', borderBottom: '1px solid #f3f4f6' }}>{fmt(e.debit)}</td>
                  <td style={{ padding: '9px 12px', fontSize: 13, textAlign: 'right', fontWeight: 600, color: '#16a34a', borderBottom: '1px solid #f3f4f6' }}>{fmt(e.credit)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
