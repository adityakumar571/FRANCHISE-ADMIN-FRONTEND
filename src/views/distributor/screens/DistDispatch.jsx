/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Truck, Package, CheckCircle2, MapPin, Search, Eye } from 'lucide-react'

const DISPATCH_ORDERS = [
  { id: 'ORD-4520', franchise: 'City Pharma - Andheri',   city: 'Mumbai',    items: 12, amount: 18200, acceptedAt: '22 Aug 10:00 AM', status: 'accepted'   },
  { id: 'ORD-4513', franchise: 'Ganesh Drug House',        city: 'Nagpur',    items: 35, amount: 56200, acceptedAt: '21 Aug 02:00 PM', status: 'accepted'   },
  { id: 'ORD-4519', franchise: 'HealthZone Pharmacy',      city: 'Pune',      items: 30, amount: 48600, acceptedAt: '21 Aug 09:00 AM', status: 'dispatched' },
  { id: 'ORD-4512', franchise: 'Prime Medicals',           city: 'Hyderabad', items: 6,  amount: 9800,  acceptedAt: '20 Aug 03:00 PM', status: 'dispatched' },
  { id: 'ORD-4518', franchise: 'MedPlus Store - Thane',    city: 'Thane',     items: 8,  amount: 12400, acceptedAt: '20 Aug 11:00 AM', status: 'completed'  },
  { id: 'ORD-4515', franchise: 'CureMed Pharmacy',         city: 'Bengaluru', items: 20, amount: 31200, acceptedAt: '19 Aug 10:00 AM', status: 'completed'  },
]

const STATUS_CFG = {
  accepted:   { bg: '#fef3c7', color: '#d97706', label: 'Ready to Dispatch' },
  dispatched: { bg: '#dbeafe', color: '#2563eb', label: 'In Transit'        },
  completed:  { bg: '#dcfce7', color: '#16a34a', label: 'Delivered'         },
}

const Th = ({ c }) => <th style={{ padding: '9px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

export default function DistDispatch() {
  const [orders, setOrders] = useState(DISPATCH_ORDERS)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = orders.filter(o =>
    (filter === 'All' || o.status === filter) &&
    (search === '' || o.franchise.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()))
  )

  const updateStatus = (id, status) => setOrders(p => p.map(o => o.id === id ? { ...o, status } : o))

  const ready  = orders.filter(o => o.status === 'accepted').length
  const transit = orders.filter(o => o.status === 'dispatched').length
  const done   = orders.filter(o => o.status === 'completed').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Truck size={20} color="#fabf22" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Dispatch & Fulfilment</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage order dispatch and delivery tracking</p>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Ready to Dispatch', value: ready,   color: '#d97706', icon: Package },
          { label: 'In Transit',        value: transit, color: '#2563eb', icon: Truck },
          { label: 'Delivered',         value: done,    color: '#16a34a', icon: CheckCircle2 },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={20} color={k.color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{k.label}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: k.color, margin: '2px 0 0' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order or franchise..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        {['All', 'accepted', 'dispatched', 'completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${filter === s ? '#0c3b73' : '#e5e7eb'}`, background: filter === s ? '#0c3b73' : '#fff', color: filter === s ? '#fff' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {s === 'All' ? 'All' : STATUS_CFG[s]?.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Order ID" /><Th c="Franchise" /><Th c="City" />
              <Th c="Items" /><Th c="Amount" /><Th c="Accepted At" /><Th c="Status" /><Th c="Action" />
            </tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No orders found</td></tr>
                : filtered.map(o => {
                  const s = STATUS_CFG[o.status]
                  return (
                    <tr key={o.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#0c3b73' }}>{o.id}</span></Td>
                      <Td style={{ fontWeight: 600 }}>{o.franchise}</Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} color="#9ca3af" />
                          <span style={{ fontSize: 12, color: '#6b7280' }}>{o.city}</span>
                        </div>
                      </Td>
                      <Td>{o.items} items</Td>
                      <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹{o.amount.toLocaleString('en-IN')}</Td>
                      <Td style={{ fontSize: 12, color: '#6b7280' }}>{o.acceptedAt}</Td>
                      <Td><span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span></Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          {o.status === 'accepted' && (
                            <button onClick={() => updateStatus(o.id, 'dispatched')}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: 'none', borderRadius: 7, background: '#0c3b73', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              <Truck size={12} /> Dispatch
                            </button>
                          )}
                          {o.status === 'dispatched' && (
                            <button onClick={() => updateStatus(o.id, 'completed')}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: 'none', borderRadius: 7, background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              <CheckCircle2 size={12} /> Delivered
                            </button>
                          )}
                          {o.status === 'completed' && (
                            <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, padding: '4px 8px' }}>✓ Done</span>
                          )}
                        </div>
                      </Td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
