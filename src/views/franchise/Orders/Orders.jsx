/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { ShoppingCart, Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { getRequest } from '../../../Helpers'

const statusColors = {
  Delivered:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Pending:    { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Processing: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  Cancelled:  { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
}
const paymentColors = {
  UPI: '#7c3aed', Cash: '#16a34a', Card: '#2563eb', Credit: '#d97706',
}

const Badge = ({ val, colorMap }) => {
  const c = colorMap[val]
  return c
    ? <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{val}</span>
    : <span style={{ fontSize: 11, color: '#374151' }}>{val}</span>
}
const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

const STATUSES = ['All', 'Delivered', 'Pending', 'Processing', 'Cancelled']

export default function Orders() {
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('All')
  const [tab, setTab]         = useState('Today')
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [summary, setSummary] = useState({ total: 0, delivered: 0, pending: 0, totalSales: 0 })

  useEffect(() => { fetchOrders() }, [tab, status, page])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const periodMap = { Today: 'today', 'This Week': 'week', 'This Month': 'month' }
      const period = periodMap[tab] || 'today'
      const res = await getRequest(`franchise/pos/orders?period=${period}&page=${page}&limit=20${status !== 'All' ? `&status=${status}` : ''}`)
      setData(res?.data || [])
      setTotal(res?.total || 0)
      if (res?.summary) setSummary(res.summary)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = data.filter(o =>
    search === '' ||
    (o.orderId || o._id || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.customerName || o.customer || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(total / 20))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Orders</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>View and manage all sales orders</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {['Today','This Week','This Month'].map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1) }}
            style={{ padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: tab===t?'#fff':'transparent', color: tab===t?'#0c3b73':'#6b7280', boxShadow: tab===t?'0 1px 3px rgba(0,0,0,0.08)':'none', transition: 'all 0.15s' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Orders', value: String(summary.total || total || data.length), color: '#0c3b73' },
          { label: 'Delivered',    value: String(summary.delivered || data.filter(o=>o.status==='Delivered').length), color: '#16a34a' },
          { label: 'Pending',      value: String(summary.pending || data.filter(o=>o.status==='Pending').length),   color: '#d97706' },
          { label: 'Total Sales',  value: summary.totalSales ? `₹${Number(summary.totalSales).toLocaleString('en-IN')}` : '—', color: '#7c3aed' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>{c.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or customer..."
            style={{ width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Order ID','Customer','Time','Items','Amount','Payment','Status','Actions'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No orders found</td></tr>
              ) : filtered.map(o => (
                <tr key={o._id} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0c3b73', fontWeight: 600 }}>{o.orderId || o.invoiceNo || o._id?.slice(-8)}</span></Td>
                  <Td style={{ fontWeight: 500 }}>{o.customerName || o.customer || 'Walk-in'}</Td>
                  <Td style={{ color: '#6b7280' }}>{o.createdAt ? new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : o.time || '—'}</Td>
                  <Td>{Array.isArray(o.items) ? o.items.length : o.itemCount || 0}</Td>
                  <Td style={{ fontWeight: 700 }}>₹{(o.totalAmount || o.total || 0).toLocaleString('en-IN')}</Td>
                  <Td>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: (paymentColors[o.paymentMode||o.payment] || '#6b7280') + '18', color: paymentColors[o.paymentMode||o.payment] || '#6b7280' }}>
                      {o.paymentMode || o.payment || 'Cash'}
                    </span>
                  </Td>
                  <Td><Badge val={o.status} colorMap={statusColors} /></Td>
                  <Td>
                    <button title="View" style={{ background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#0c3b73' }}><Eye size={13} /></button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {total || data.length} orders</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronLeft size={14} /></button>
            {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{ background:page===p?'#0c3b73':'none', border:`1px solid ${page===p?'#0c3b73':'#e5e7eb'}`, borderRadius:6, padding:'4px 10px', cursor:'pointer', color:page===p?'#fff':'#374151', fontSize:12 }}>{p}</button>
            ))}
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
