/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Scale } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'

export default function TrialBalance() {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/accounts/trial-balance')
        setData(res.data?.data)
      } catch { toast.error('Failed to load trial balance') }
      finally   { setLoading(false) }
    })()
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Scale} title="Trial Balance" subtitle="Verify that total debits equal total credits" color="#0c3b73" />
      {!loading && data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Total Debit',  value: fmt(data.totalDebit),  color: '#dc2626' },
            { label: 'Total Credit', value: fmt(data.totalCredit), color: '#16a34a' },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
            </div>
          ))}
        </div>
      )}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Particulars', 'Debit (₹)', 'Credit (₹)'].map((h, i) => (
              <th key={h} style={{ padding: '9px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: i > 0 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading
              ? Array(8).fill(0).map((_, i) => <tr key={i}><td colSpan={3} style={{ padding: '9px 14px' }}><div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} /></td></tr>)
              : (data?.entries || []).map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '9px 14px', fontSize: 13, fontWeight: 500, borderBottom: '1px solid #f3f4f6' }}>{r.particulars}</td>
                  <td style={{ padding: '9px 14px', fontSize: 13, textAlign: 'right', fontWeight: 600, color: r.debit ? '#dc2626' : '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>{r.debit ? fmt(r.debit) : '—'}</td>
                  <td style={{ padding: '9px 14px', fontSize: 13, textAlign: 'right', fontWeight: 600, color: r.credit ? '#16a34a' : '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>{r.credit ? fmt(r.credit) : '—'}</td>
                </tr>
              ))
            }
          </tbody>
          {data && (
            <tfoot>
              <tr style={{ background: '#f9fafb', borderTop: '2px solid #0c3b73' }}>
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 800, color: '#0c3b73' }}>TOTAL</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#dc2626', fontSize: 14 }}>{fmt(data.totalDebit)}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: 14 }}>{fmt(data.totalCredit)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
