/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Search } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function StockLedger() {
  const [entries, setEntries]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [medicine, setMedicine] = useState('')
  const [medicineInput, setMedicineInput] = useState('')

  const fetchLedger = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/inventory/ledger?medicineId=${medicine}&page=1&limit=20`)
      const d = res.data?.data
      setEntries(d?.entries || [])
    } catch { toast.error('Failed to load stock ledger') }
    finally { setLoading(false) }
  }, [medicine])

  useEffect(() => { fetchLedger() }, [fetchLedger])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={20} color="#0891b2" /> Stock Ledger
        </h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Item-wise stock movement history</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={medicineInput} onChange={e => setMedicineInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setMedicine(medicineInput) }}
            placeholder="Search medicine name and press Enter..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <button onClick={() => setMedicine(medicineInput)}
          style={{ padding: '8px 16px', border: 'none', borderRadius: 7, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Search
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Date" /><Th c="Type" /><Th c="Voucher" /><Th c="In (+)" align="center" /><Th c="Out (-)" align="center" /><Th c="Balance" align="center" /><Th c="Remark" />
            </tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : entries.length === 0
                  ? <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Search a medicine to see stock movements</td></tr>
                  : entries.map((r, i) => (
                    <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td style={{ color: '#6b7280' }}>{r.date}</Td>
                      <Td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: r.type === 'Sale' ? '#fff1f2' : '#f0fdf4',
                          color: r.type === 'Sale' ? '#dc2626' : '#16a34a' }}>
                          {r.type}
                        </span>
                      </Td>
                      <Td style={{ fontFamily: 'monospace', fontSize: 11, color: '#0c3b73' }}>{r.voucher}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{r.qty > 0 ? r.qty : '—'}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>{r.qty < 0 ? Math.abs(r.qty) : '—'}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 700 }}>{r.balance}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.remark}</Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{entries.length} entries</span>
        </div>
      </div>
    </div>
  )
}
