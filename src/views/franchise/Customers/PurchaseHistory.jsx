/* eslint-disable prettier/prettier */
/**
 * Screen 66 — Purchase History
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Package, Search, Filter, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { CUSTOMERS, ORDERS } from './mockData'
import PageHeader from '../components/PageHeader'

const Th = ({ c }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '11px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function PurchaseHistory() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const cust     = CUSTOMERS.find(c => c.id === id) || CUSTOMERS[0]
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const PER_PAGE = 5

  const filtered = ORDERS.filter(o =>
    search === '' || o.id.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paged      = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const totalAmt  = ORDERS.reduce((a, o) => a + o.amount, 0)
  const totalPaid = ORDERS.reduce((a, o) => a + o.paid, 0)
  const totalDue  = ORDERS.reduce((a, o) => a + o.due, 0)
  const avgVal    = totalAmt / ORDERS.length

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      <PageHeader icon={Package} title="Purchase History" subtitle="View all purchase history of customer" color="#0c3b73">
        <button onClick={() => navigate(`/franchise/customers/${cust.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#374151' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer', color: '#374151' }}>
          <Download size={13} /> Export
        </button>
      </PageHeader>

      {/* Customer Strip */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {cust.name[0]}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{cust.name}</p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{cust.id} · {cust.phone}</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        {[
          { l: 'Total Orders',    v: ORDERS.length,                                          c: '#0c3b73', bg: '#e0e7ff' },
          { l: 'Total Purchase',  v: `₹${totalAmt.toLocaleString('en-IN')}`,                 c: '#7c3aed', bg: '#f5f3ff' },
          { l: 'Total Paid',      v: `₹${totalPaid.toLocaleString('en-IN')}`,                c: '#16a34a', bg: '#dcfce7' },
          { l: 'Total Due',       v: `₹${totalDue.toLocaleString('en-IN')}`,                 c: '#dc2626', bg: '#fee2e2' },
          { l: 'Avg Order Value', v: `₹${avgVal.toFixed(2)}`,                                c: '#d97706', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.l} style={{ background: '#fff', borderRadius: 10, padding: '16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 6px' }}>{s.l}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: s.c, margin: 0 }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by invoice no., medicine or date..."
            style={{ width: '100%', padding: '9px 12px 9px 30px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer', color: '#374151' }}>
          <Filter size={13} /> Filters
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer', color: '#374151' }}>
          <Download size={13} /> Export
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Invoice No.','Date','Items','Amount (₹)','Discount (₹)','Paid (₹)','Due (₹)','Status','Action'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No orders found</td></tr>
              ) : paged.map((o, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                  <Td><span style={{ fontSize: 12, fontFamily: 'monospace', color: '#0c3b73', fontWeight: 600 }}>{o.id}</span></Td>
                  <Td style={{ fontSize: 12, color: '#6b7280' }}>{o.date}</Td>
                  <Td>{o.items}</Td>
                  <Td style={{ fontWeight: 700 }}>₹{o.amount.toLocaleString('en-IN')}</Td>
                  <Td style={{ color: '#d97706' }}>₹{o.discount.toFixed(2)}</Td>
                  <Td style={{ fontWeight: 700, color: '#16a34a' }}>₹{o.paid.toLocaleString('en-IN')}</Td>
                  <Td style={{ fontWeight: 700, color: o.due > 0 ? '#dc2626' : '#16a34a' }}>₹{o.due.toFixed(2)}</Td>
                  <Td>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: o.status === 'Paid' ? '#f0fdf4' : '#fffbeb', color: o.status === 'Paid' ? '#16a34a' : '#d97706', border: `1px solid ${o.status === 'Paid' ? '#bbf7d0' : '#fde68a'}` }}>{o.status}</span>
                  </Td>
                  <Td>
                    <button style={{ background: '#e0e7ff', border: 'none', borderRadius: 5, padding: '5px 10px', cursor: 'pointer', color: '#0c3b73', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Eye size={11} /> View
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {Math.min((page-1)*PER_PAGE+1, filtered.length)}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} entries</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page===1?'default':'pointer', background: 'none', color: page===1?'#d1d5db':'#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ background: page===p?'#0c3b73':'none', border: `1px solid ${page===p?'#0c3b73':'#e5e7eb'}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: page===p?'#fff':'#374151', fontSize: 12, fontWeight: page===p?700:400 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page===totalPages?'default':'pointer', background: 'none', color: page===totalPages?'#d1d5db':'#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
