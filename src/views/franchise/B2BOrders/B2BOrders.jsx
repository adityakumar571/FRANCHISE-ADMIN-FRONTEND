/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { Store, Eye, CheckCircle2, Clock, XCircle, Truck, Search, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const STATUS_CFG = {
  Delivered:   { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle2 },
  Shipped:     { bg: '#e0e7ff', color: '#0c3b73', icon: Truck },
  Confirmed:   { bg: '#f5f3ff', color: '#7c3aed', icon: CheckCircle2 },
  Pending:     { bg: '#fef3c7', color: '#d97706', icon: Clock },
  Cancelled:   { bg: '#fee2e2', color: '#dc2626', icon: XCircle },
}
const PAY_CFG = {
  Paid:    { bg: '#dcfce7', color: '#16a34a' },
  Pending: { bg: '#fef3c7', color: '#d97706' },
  Partial: { bg: '#e0f2fe', color: '#0891b2' },
  Overdue: { bg: '#fee2e2', color: '#dc2626' },
}

const Th = ({ c }) => <th style={{ padding: '9px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

export default function B2BOrders() {
  const [orders, setOrders]     = useState([])
  const [kpi, setKpi]           = useState({ total: 0, delivered: 0, inTransit: 0, pending: 0 })
  const [statusFilter, setFilter] = useState('')
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/b2b-orders?status=${statusFilter}&page=${page}&limit=10`)
      const d = res.data?.data
      setOrders(d?.orders || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
      if (d?.kpi) setKpi(d.kpi)
    } catch { toast.error('Failed to load B2B orders') }
    finally   { setLoading(false) }
  }, [statusFilter, page])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await putRequest({ url: `/franchise/b2b-orders/${id}/status`, cred: { orderStatus: newStatus } })
      toast.success('Status updated')
      fetchOrders()
      if (selected?._id === id) setSelected(p => ({ ...p, orderStatus: newStatus }))
    } catch { toast.error('Failed to update status') }
  }

  const filtered = search
    ? orders.filter(o => o.orderId?.toLowerCase().includes(search.toLowerCase()) || o.supplier?.toLowerCase().includes(search.toLowerCase()))
    : orders

  const TABS = [
    { label: 'All',       value: '' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'In Transit',value: 'Shipped' },
    { label: 'Pending',   value: 'Pending' },
    { label: 'Cancelled', value: 'Cancelled' },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Store} title="B2B Orders" subtitle="Manage orders placed with distributors and wholesalers" color="#0c3b73" />

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Orders',  value: loading ? '...' : kpi.total,     color: '#0c3b73', bg: '#e0e7ff' },
          { label: 'Delivered',     value: loading ? '...' : kpi.delivered, color: '#16a34a', bg: '#dcfce7' },
          { label: 'In Transit',    value: loading ? '...' : kpi.inTransit, color: '#0c3b73', bg: '#eff6ff' },
          { label: 'Pending',       value: loading ? '...' : kpi.pending,   color: '#d97706', bg: '#fef3c7' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', borderLeft: `4px solid ${k.color}` }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button key={t.label} onClick={() => { setFilter(t.value); setPage(1) }}
              style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${statusFilter === t.value ? '#0c3b73' : '#e5e7eb'}`, background: statusFilter === t.value ? '#0c3b73' : '#fff', color: statusFilter === t.value ? '#fff' : '#374151', fontSize: 12, fontWeight: statusFilter === t.value ? 700 : 400, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID or supplier..."
            style={{ padding: '8px 10px 8px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', width: 220 }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Order ID', 'Supplier', 'Date', 'Items', 'Total Qty', 'Amount', 'Order Status', 'Payment Status', 'Action'].map(h => <Th key={h} c={h} />)}
            </tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(9).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 14px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : filtered.length === 0
                  ? <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No orders found</td></tr>
                  : filtered.map(o => {
                    const sCfg = STATUS_CFG[o.orderStatus]   || STATUS_CFG.Pending
                    const pCfg = PAY_CFG[o.paymentStatus]    || PAY_CFG.Pending
                    const Icon = sCfg.icon
                    return (
                      <tr key={o._id}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <Td><span style={{ fontWeight: 700, color: '#0c3b73', fontFamily: 'monospace', fontSize: 12 }}>{o.orderId}</span></Td>
                        <Td style={{ fontWeight: 500 }}>{o.supplier}</Td>
                        <Td style={{ color: '#6b7280', fontSize: 12 }}>{o.date}</Td>
                        <Td style={{ textAlign: 'center' }}>{o.items}</Td>
                        <Td style={{ textAlign: 'center', fontWeight: 600 }}>{o.totalQty}</Td>
                        <Td style={{ fontWeight: 700, color: '#111827' }}>₹{Number(o.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                        <Td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: sCfg.bg, color: sCfg.color }}>
                            <Icon size={10} /> {o.orderStatus}
                          </span>
                        </Td>
                        <Td>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: pCfg.bg, color: pCfg.color }}>
                            {o.paymentStatus}
                          </span>
                        </Td>
                        <Td>
                          <button onClick={() => setSelected(o)}
                            style={{ padding: '4px 10px', border: 'none', borderRadius: 6, background: '#e0e7ff', color: '#0c3b73', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Eye size={11} /> View
                          </button>
                        </Td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {total} orders</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none' }}>←</button>
            <span style={{ padding: '5px 10px', fontSize: 12 }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none' }}>→</button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: 520, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Order: {selected.orderId}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                ['Supplier', selected.supplier], ['Date', selected.date],
                ['Order Status', selected.orderStatus], ['Payment Status', selected.paymentStatus],
                ['Total Items', selected.items], ['Total Qty', selected.totalQty],
                ['Amount', `₹${Number(selected.amount || 0).toLocaleString('en-IN')}`],
              ].map(([l, v]) => (
                <div key={l} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>{l}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>{v}</p>
                </div>
              ))}
            </div>
            {/* Status Actions */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
              <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Update Status:</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
                  <button key={st} onClick={() => handleStatusUpdate(selected._id, st)}
                    style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${STATUS_CFG[st]?.color || '#e5e7eb'}`, background: selected.orderStatus === st ? STATUS_CFG[st]?.bg : '#fff', color: STATUS_CFG[st]?.color || '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
