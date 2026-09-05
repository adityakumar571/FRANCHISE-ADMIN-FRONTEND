/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { BookMarked, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'

export default function Ledger() {
  const [entries, setEntries]   = useState([])
  const [closing, setClosing]   = useState(0)
  const [loading, setLoading]   = useState(true)
  const [account, setAccount]   = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/accounts/ledger?account=${encodeURIComponent(account)}`)
      setEntries(res.data?.data?.entries || [])
      setClosing(res.data?.data?.closingBalance || 0)
    } catch { toast.error('Failed to load ledger') }
    finally   { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [account])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={BookMarked} title="Ledger" subtitle="Account-wise transaction ledger" color="#0891b2" />
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={account} onChange={e => setAccount(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData()}
            placeholder="Search account name and press Enter..."
            style={{ width: '100%', padding: '8px 10px 8px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <button onClick={fetchData} style={{ padding: '8px 16px', border: 'none', borderRadius: 7, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Search</button>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Date', 'Particulars', 'Debit (₹)', 'Credit (₹)', 'Balance (₹)'].map((h, i) => (
              <th key={h} style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: i > 1 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading
              ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j} style={{ padding: '9px 12px' }}><div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
              : entries.map((e, i) => (
                <tr key={i}>
                  <td style={{ padding: '9px 12px', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{e.date}</td>
                  <td style={{ padding: '9px 12px', fontSize: 13, fontWeight: 500, borderBottom: '1px solid #f3f4f6' }}>{e.particular}</td>
                  <td style={{ padding: '9px 12px', fontSize: 13, textAlign: 'right', fontWeight: 600, color: '#dc2626', borderBottom: '1px solid #f3f4f6' }}>{e.debit ? fmt(e.debit) : '—'}</td>
                  <td style={{ padding: '9px 12px', fontSize: 13, textAlign: 'right', fontWeight: 600, color: '#16a34a', borderBottom: '1px solid #f3f4f6' }}>{e.credit ? fmt(e.credit) : '—'}</td>
                  <td style={{ padding: '9px 12px', fontSize: 13, textAlign: 'right', fontWeight: 700, color: '#0c3b73', borderBottom: '1px solid #f3f4f6' }}>{fmt(e.balance)}</td>
                </tr>
              ))
            }
          </tbody>
          {entries.length > 0 && (
            <tfoot>
              <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                <td colSpan={4} style={{ padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>Closing Balance</td>
                <td style={{ padding: '9px 12px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#0c3b73' }}>{fmt(closing)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
