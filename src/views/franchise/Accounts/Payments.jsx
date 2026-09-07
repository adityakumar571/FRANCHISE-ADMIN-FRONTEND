/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { ArrowUpCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '9px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/accounts/payments?from=${from}&to=${to}`)
      setPayments(res.data?.data?.payments || [])
    } catch { toast.error('Failed to load payments') }
    finally   { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [from, to])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={ArrowUpCircle} title="Payments" subtitle="All payment vouchers" color="#dc2626" />
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 13 }}>From:</span>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        <span style={{ fontSize: 13 }}>To:</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        <button onClick={fetchData} style={{ padding: '7px 16px', border: 'none', borderRadius: 7, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Apply</button>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><Th c="Date" /><Th c="Voucher" /><Th c="Particulars" /><Th c="Mode" /><Th c="Amount (₹)" align="right" /></tr></thead>
          <tbody>
            {loading
              ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j} style={{ padding: '9px 12px' }}><div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
              : payments.length === 0
                ? <tr><td colSpan={5} style={{ padding: 28, textAlign: 'center', color: '#9ca3af' }}>No payments found</td></tr>
                : payments.map((p, i) => (
                  <tr key={i}>
                    <Td style={{ color: '#6b7280' }}>{p.date}</Td>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#0c3b73' }}>{p.voucher}</span></Td>
                    <Td style={{ fontWeight: 500 }}>{p.particulars}</Td>
                    <Td style={{ color: '#6b7280' }}>{p.mode}</Td>
                    <Td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{fmt(p.amount)}</Td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
