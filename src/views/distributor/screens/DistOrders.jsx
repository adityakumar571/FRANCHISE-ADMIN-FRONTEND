/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { ShoppingCart, Search, Eye, Check, X, Truck, Clock, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react'

const STATUS_CFG = {
  pending:    { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Pending'    },
  accepted:   { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', label: 'Accepted'   },
  dispatched: { bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe', label: 'Dispatched' },
  completed:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Completed'  },
  cancelled:  { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', label: 'Cancelled'  },
  rejected:   { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', label: 'Rejected'   },
}

const MOCK_ORDERS = [
  { id: 'ORD-4521', franchise: 'Sharma Medical Store',    city: 'Mumbai',    items: 18, amount: 24500, status: 'pending',    date: '22 Aug 2026', payment: 'Due'  },
  { id: 'ORD-4520', franchise: 'City Pharma - Andheri',   city: 'Mumbai',    items: 12, amount: 18200, status: 'accepted',   date: '22 Aug 2026', payment: 'Paid' },
  { id: 'ORD-4519', franchise: 'HealthZone Pharmacy',     city: 'Pune',      items: 30, amount: 48600, status: 'dispatched', date: '21 Aug 2026', payment: 'Paid' },
  { id: 'ORD-4518', franchise: 'MedPlus Store - Thane',   city: 'Thane',     items: 8,  amount: 12400, status: 'completed',  date: '20 Aug 2026', payment: 'Paid' },
  { id: 'ORD-4517', franchise: 'Apollo Pharma - Kothrud', city: 'Pune',      items: 24, amount: 38000, status: 'completed',  date: '19 Aug 2026', payment: 'Due'  },
  { id: 'ORD-4516', franchise: 'Lifeline Medical',        city: 'Nashik',    items: 15, amount: 21500, status: 'cancelled',  date: '18 Aug 2026', payment: '—'    },
  { id: 'ORD-4515', franchise: 'CureMed Pharmacy',        city: 'Bengaluru', items: 20, amount: 31200, status: 'completed',  date: '17 Aug 2026', payment: 'Paid' },
  { id: 'ORD-4514', franchise: 'Shree Ram Medicals',      city: 'Jaipur',    items: 9,  amount: 14800, status: 'pending',    date: '17 Aug 2026', payment: 'Due'  },
  { id: 'ORD-4513', franchise: 'Ganesh Drug House',       city: 'Nagpur',    items: 35, amount: 56200, status: 'accepted',   date: '16 Aug 2026', payment: 'Paid' },
  { id: 'ORD-4512', franchise: 'Prime Medicals',          city: 'Hyderabad', items: 6,  amount: 9800,  status: 'dispatched', date: '16 Aug 2026', payment: 'Paid' },
]

const MOCK_ITEMS = [
  { name: 'Paracetamol 650mg', qty: 50, ptr: 20.20, total: 1010 },
  { name: 'Azithromycin 500mg', qty: 20, ptr: 72.00, total: 1440 },
  { name: 'Metformin 500mg', qty: 100, ptr: 30.00, total: 3000 },
]

const PER = 8
const Th = ({ c, a = 'left' }) => <th style={{ padding: '9px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: a, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

export default function DistOrders() {
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [viewOrder, setViewOrder] = useState(null)

  const filtered = orders.filter(o =>
    (statusFilter === 'All' || o.status === statusFilter) &&
    (search === '' || o.id.toLowerCase().includes(search.toLowerCase()) || o.franchise.toLowerCase().includes(search.toLowerCase()))
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER))
  const paged = filtered.slice((page - 1) * PER, page * PER)

  const updateStatus = (id, status) => {
    setOrders(p => p.map(o => o.id === id ? { ...o, status } : o))
    setViewOrder(null)
  }

  const kpis = [
    { label: 'Total Orders',   value: orders.length,                             color: '#0c3b73', bg: '#e0e7ff' },
    { label: 'Pending',        value: orders.filter(o => o.status === 'pending').length,    color: '#d97706', bg: '#fef3c7' },
    { label: 'Dispatched',     value: orders.filter(o => o.status === 'dispatched').length, color: '#2563eb', bg: '#dbeafe' },
    { label: 'Completed',      value: orders.filter(o => o.status === 'completed').length,  color: '#16a34a', bg: '#dcfce7' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={20} color="#fabf22" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>B2B Orders</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage franchise purchase orders</p>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${k.color}` }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by Order ID or franchise..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer', outline: 'none' }}>
          <option value="All">All Status</option>
          {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Order ID" /><Th c="Franchise" /><Th c="City" /><Th c="Items" a="center" />
              <Th c="Amount" a="right" /><Th c="Status" /><Th c="Date" /><Th c="Payment" /><Th c="Actions" />
            </tr></thead>
            <tbody>
              {paged.length === 0
                ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No orders found</td></tr>
                : paged.map(o => {
                  const s = STATUS_CFG[o.status]
                  return (
                    <tr key={o.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#0c3b73' }}>{o.id}</span></Td>
                      <Td style={{ fontWeight: 600 }}>{o.franchise}</Td>
                      <Td style={{ fontSize: 12, color: '#6b7280' }}>{o.city}</Td>
                      <Td style={{ textAlign: 'center' }}>{o.items}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>₹{o.amount.toLocaleString('en-IN')}</Td>
                      <Td><span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span></Td>
                      <Td style={{ fontSize: 12, color: '#6b7280' }}>{o.date}</Td>
                      <Td>
                        <span style={{ fontSize: 11, fontWeight: 700, color: o.payment === 'Paid' ? '#16a34a' : o.payment === 'Due' ? '#dc2626' : '#9ca3af' }}>{o.payment}</span>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={() => setViewOrder(o)}
                            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#e0e7ff', color: '#0c3b73', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <Eye size={11} /> View
                          </button>
                          {o.status === 'pending' && (
                            <button onClick={() => updateStatus(o.id, 'accepted')}
                              style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                              <Check size={11} /> Accept
                            </button>
                          )}
                          {o.status === 'accepted' && (
                            <button onClick={() => updateStatus(o.id, 'dispatched')}
                              style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#dbeafe', color: '#2563eb', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                              <Truck size={11} /> Dispatch
                            </button>
                          )}
                        </div>
                      </Td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {paged.length} of {filtered.length} orders</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none', color: page === 1 ? '#d1d5db' : '#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ background: page === p ? '#0c3b73' : 'none', border: `1px solid ${page === p ? '#0c3b73' : '#e5e7eb'}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: page === p ? '#fff' : '#374151', fontSize: 12 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none', color: page === totalPages ? '#d1d5db' : '#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {viewOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Order — {viewOrder.id}</h3>
              <button onClick={() => setViewOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b7280' }}>×</button>
            </div>
            <div style={{ padding: '20px 22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                {[['Franchise', viewOrder.franchise], ['City', viewOrder.city], ['Date', viewOrder.date], ['Status', STATUS_CFG[viewOrder.status]?.label], ['Amount', `₹${viewOrder.amount.toLocaleString('en-IN')}`], ['Payment', viewOrder.payment]].map(([l, v]) => (
                  <div key={l} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase' }}>{l}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase' }}>Order Items</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18 }}>
                <thead><tr>
                  {['Medicine', 'Qty', 'PTR', 'Total'].map(h => <th key={h} style={{ padding: '8px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {MOCK_ITEMS.map((it, i) => (
                    <tr key={i}>
                      <td style={{ padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>{it.name}</td>
                      <td style={{ padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>{it.qty}</td>
                      <td style={{ padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>₹{it.ptr}</td>
                      <td style={{ padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #f3f4f6', fontWeight: 700 }}>₹{it.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                {viewOrder.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(viewOrder.id, 'rejected')}
                      style={{ padding: '9px 18px', border: '1px solid #fecaca', borderRadius: 8, background: '#fee2e2', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Reject
                    </button>
                    <button onClick={() => updateStatus(viewOrder.id, 'accepted')}
                      style={{ padding: '9px 22px', border: 'none', borderRadius: 8, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      Accept Order
                    </button>
                  </>
                )}
                {viewOrder.status === 'accepted' && (
                  <button onClick={() => updateStatus(viewOrder.id, 'dispatched')}
                    style={{ padding: '9px 22px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={14} /> Mark Dispatched
                  </button>
                )}
                {viewOrder.status === 'dispatched' && (
                  <button onClick={() => updateStatus(viewOrder.id, 'completed')}
                    style={{ padding: '9px 22px', border: 'none', borderRadius: 8, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
