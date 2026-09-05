/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { BookOpen, Download } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '9px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'

export default function CashBook() {
  const [entries, setEntries]       = useState([])
  const [currentBalance, setBalance] = useState(0)
  const [openingBalance, setOpening] = useState(0)
  const [loading, setLoading]        = useState(true)
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/accounts/cash-book?from=${from}&to=${to}`)
      const d = res.data?.data
      setEntries(d?.entries || [])
      setBalance(d?.currentBalance || 0)
      setOpening(d?.openingBalance || 0)
    } catch { toast.error('Failed to load cash book') }
    finally   { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [from, to])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={BookOpen} title="Cash Book" subtitle="Track all cash inflows and outflows" color="#16a34a">
        <button style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <Download size={12} /> Export
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Opening Balance',  value: fmt(openingBalance),  color: '#0c3b73' },
          { label: 'Current Balance',  value: fmt(currentBalance),  color: currentBalance >= 0 ? '#16a34a' : '#dc2626' },
          { label: 'Total Entries',    value: entries.length,       color: '#374151' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Date Filter */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>From:</span>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>To:</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        <button onClick={fetchData} style={{ padding: '7px 16px', border: 'none', borderRadius: 7, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Apply</button>
        {(from || to) && <button onClick={() => { setFrom(''); setTo('') }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Clear</button>}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Date" /><Th c="Voucher No." /><Th c="Particulars" />
              <Th c="Cash In (₹)" align="right" /><Th c="Cash Out (₹)" align="right" /><Th c="Balance (₹)" align="right" />
            </tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j} style={{ padding: '9px 12px' }}><div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : entries.length === 0
                  ? <tr><td colSpan={6} style={{ padding: 28, textAlign: 'center', color: '#9ca3af' }}>No entries found</td></tr>
                  : entries.map((e, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <Td style={{ color: '#6b7280' }}>{e.date}</Td>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#0c3b73' }}>{e.voucher}</span></Td>
                      <Td style={{ fontWeight: 500 }}>{e.particulars}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{e.cashIn ? fmt(e.cashIn) : '—'}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>{e.cashOut ? fmt(e.cashOut) : '—'}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>{fmt(e.balance)}</Td>
                    </tr>
                  ))
              }
            </tbody>
            {entries.length > 0 && (
              <tfoot>
                <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                  <td colSpan={3} style={{ padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>Closing Balance</td>
                  <td colSpan={3} style={{ padding: '9px 12px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#0c3b73' }}>{fmt(currentBalance)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
