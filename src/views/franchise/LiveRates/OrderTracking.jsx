/* eslint-disable prettier/prettier */
/**
 * Screen 54 — Order Tracking
 */
import { useState } from 'react'
import { Truck, Search, CheckCircle, Clock, Package, MapPin, ExternalLink } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { ORDERS } from './liveRatesMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

const STATUS_CFG = {
  'In Transit': { bg: '#e0e7ff', color: '#0c3b73', icon: Truck    },
  'Delivered':  { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  'Pending':    { bg: '#fef3c7', color: '#d97706', icon: Clock    },
  'Confirmed':  { bg: '#f5f3ff', color: '#7c3aed', icon: Package  },
}

const TRACKING_STEPS = [
  { label: 'Order Placed',    date: '20 May 2025, 10:00 AM', done: true  },
  { label: 'Confirmed',       date: '20 May 2025, 11:30 AM', done: true  },
  { label: 'Packed',          date: '20 May 2025, 02:00 PM', done: true  },
  { label: 'In Transit',      date: '21 May 2025, 09:00 AM', done: true  },
  { label: 'Out for Delivery', date: 'Expected 22 May 2025', done: false },
  { label: 'Delivered',       date: 'Expected 22 May 2025', done: false },
]

export default function OrderTracking() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(ORDERS[0])

  const filtered = ORDERS.filter(o =>
    search === '' ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.supplier.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Truck} title="Order Tracking" subtitle="Track all your purchase orders in real time" color="#0c3b73" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Search */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or supplier..."
                style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
            {/* Orders Table */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>All Orders ({filtered.length})</p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <Th c="Order ID" /><Th c="Supplier" /><Th c="Date" />
                    <Th c="Items" align="center" /><Th c="Amount (₹)" align="right" /><Th c="Status" />
                  </tr></thead>
                  <tbody>
                    {filtered.map((o, i) => {
                      const cfg = STATUS_CFG[o.status] || STATUS_CFG['Pending']
                      const Icon = cfg.icon
                      return (
                        <tr key={i} onClick={() => setSelected(o)}
                          style={{ cursor: 'pointer', background: selected?.id === o.id ? '#f0f9ff' : '' }}
                          onMouseEnter={e => { if (selected?.id !== o.id) e.currentTarget.style.background = '#fafafa' }}
                          onMouseLeave={e => { if (selected?.id !== o.id) e.currentTarget.style.background = '' }}>
                          <Td><span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: '#0c3b73' }}>{o.id}</span></Td>
                          <Td style={{ fontWeight: 600 }}>{o.supplier}</Td>
                          <Td style={{ color: '#6b7280', fontSize: 12 }}>{o.date}</Td>
                          <Td style={{ textAlign: 'center' }}>{o.items}</Td>
                          <Td style={{ textAlign: 'right', fontWeight: 700 }}>₹ {o.amount.toLocaleString('en-IN')}</Td>
                          <Td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>
                              <Icon size={10} /> {o.status}
                            </span>
                          </Td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tracking Details */}
            {selected && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', background: '#0c3b73', color: '#fff' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Tracking — {selected.id}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 11, opacity: 0.8 }}>{selected.supplier}</p>
                </div>

                {/* Order Meta */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['Order Date',  selected.date],
                    ['Items',       selected.items],
                    ['Total (₹)',   `₹ ${selected.total.toLocaleString('en-IN')}`],
                    ['Discount',   `₹ ${selected.discount.toLocaleString('en-IN')}`],
                    ['Amount',     `₹ ${selected.amount.toLocaleString('en-IN')}`],
                    ['Status',     selected.status],
                  ].map(([l, v]) => (
                    <div key={l} style={{ background: '#f9fafb', borderRadius: 7, padding: '8px 10px' }}>
                      <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{l}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 700, color: '#374151' }}>{v}</p>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>Order Timeline</p>
                  {TRACKING_STEPS.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: step.done ? '#16a34a' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {step.done ? <CheckCircle size={13} color="#fff" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9ca3af' }} />}
                        </div>
                        {i < TRACKING_STEPS.length - 1 && (
                          <div style={{ width: 2, flex: 1, background: step.done ? '#16a34a' : '#e5e7eb', minHeight: 20, marginTop: 2 }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: 4 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: step.done ? 700 : 500, color: step.done ? '#111827' : '#9ca3af' }}>{step.label}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 10, color: '#9ca3af' }}>{step.date}</p>
                      </div>
                    </div>
                  ))}

                  {/* Tracking number */}
                  <div style={{ padding: '10px 12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11, color: '#9ca3af' }}>Tracking Number</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>TRK123456789O</span>
                      <button style={{ fontSize: 11, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ExternalLink size={10} /> Track on Website
                      </button>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6b7280' }}>Blue Dart Express</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}
