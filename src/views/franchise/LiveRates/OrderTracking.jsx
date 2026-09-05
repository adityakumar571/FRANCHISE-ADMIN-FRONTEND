/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Truck, Search, CheckCircle, Clock, Package } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const STATUS_CFG = {
  'In Transit':       { bg: '#e0e7ff', color: '#0c3b73', icon: Truck },
  'Delivered':        { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  'Pending':          { bg: '#fef3c7', color: '#d97706', icon: Clock },
  'Confirmed':        { bg: '#f5f3ff', color: '#7c3aed', icon: Package },
  'Packed':           { bg: '#e0f2fe', color: '#0891b2', icon: Package },
  'Out for Delivery': { bg: '#fff7ed', color: '#f97316', icon: Truck },
  'Cancelled':        { bg: '#fee2e2', color: '#dc2626', icon: Clock },
}

export default function OrderTracking() {
  const [orders, setOrders]     = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/live-rates/order-tracking/all')
        const list = res.data?.data?.orders || []
        setOrders(list)
        if (list.length > 0) setSelected(list[0])
      } catch { toast.error('Failed to load orders') }
      finally   { setLoading(false) }
    })()
  }, [])

  const filtered = orders.filter(o =>
    !search ||
    o.id?.toLowerCase().includes(search.toLowerCase()) ||
    o.supplier?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Truck} title="Order Tracking" subtitle="Track all your purchase orders in real time" color="#0c3b73" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Search */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Order ID or Supplier..."
              style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
          {/* Orders List */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Orders ({filtered.length})</p>
            </div>
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              {loading
                ? Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ height: 14, background: '#f3f4f6', borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ height: 11, width: '60%', background: '#f3f4f6', borderRadius: 4 }} />
                  </div>
                ))
                : filtered.map((o) => {
                  const cfg = STATUS_CFG[o.status] || STATUS_CFG['Pending']
                  return (
                    <div key={o.id} onClick={() => setSelected(o)}
                      style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: selected?.id === o.id ? '#f0f4ff' : '#fff' }}
                      onMouseEnter={e => { if (selected?.id !== o.id) e.currentTarget.style.background = '#fafafa' }}
                      onMouseLeave={e => { if (selected?.id !== o.id) e.currentTarget.style.background = '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0c3b73', fontFamily: 'monospace' }}>{o.id}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{o.status}</span>
                      </div>
                      <p style={{ margin: '0 0 2px', fontSize: 12, color: '#374151', fontWeight: 500 }}>{o.supplier}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{o.date} · {o.items} items · ₹{Number(o.amount || 0).toLocaleString('en-IN')}</p>
                    </div>
                  )
                })
              }
            </div>
          </div>

          {/* Tracking Detail */}
          {selected && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 800, color: '#111827' }}>{selected.id}</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{selected.supplier} · {selected.date}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: STATUS_CFG[selected.status]?.bg || '#f3f4f6', color: STATUS_CFG[selected.status]?.color || '#6b7280' }}>
                    {selected.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 24, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, fontSize: 12 }}>
                  {[
                    { l: 'Items', v: selected.items },
                    { l: 'Total MRP', v: `₹${Number(selected.total || 0).toLocaleString('en-IN')}` },
                    { l: 'Discount', v: `₹${Number(selected.discount || 0).toLocaleString('en-IN')}` },
                    { l: 'Amount Paid', v: `₹${Number(selected.amount || 0).toLocaleString('en-IN')}` },
                  ].map(({ l, v }) => (
                    <div key={l}>
                      <p style={{ margin: '0 0 2px', color: '#9ca3af' }}>{l}</p>
                      <p style={{ margin: 0, fontWeight: 700, color: '#111827' }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Steps */}
              <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#374151' }}>Tracking Timeline</h4>
              <div style={{ position: 'relative', paddingLeft: 32 }}>
                <div style={{ position: 'absolute', left: 10, top: 10, bottom: 10, width: 2, background: '#e5e7eb' }} />
                {(selected.trackingSteps || []).map((step, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: 20 }}>
                    <div style={{
                      position: 'absolute', left: -32, top: 2, width: 20, height: 20, borderRadius: '50%',
                      background: step.done ? '#0c3b73' : '#f3f4f6',
                      border: `2px solid ${step.done ? '#0c3b73' : '#e5e7eb'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {step.done && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: step.active ? 700 : 500, color: step.done ? '#111827' : '#9ca3af' }}>{step.label}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
