/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Bell, ShoppingCart, IndianRupee, AlertTriangle, CheckCircle2, Package, X } from 'lucide-react'

const MOCK = [
  { id: 1, type: 'order',   title: 'New Order Received',         desc: 'ORD-4521 from Sharma Medical Store — ₹24,500',      time: '2 min ago',   read: false },
  { id: 2, type: 'payment', title: 'Payment Received',           desc: 'City Pharma paid ₹18,200 via NEFT (ORD-4520)',       time: '1 hr ago',    read: false },
  { id: 3, type: 'order',   title: 'Order Accepted by Franchise',desc: 'HealthZone Pharmacy accepted ORD-4519',              time: '3 hrs ago',   read: false },
  { id: 4, type: 'stock',   title: 'Low Stock Alert',            desc: 'Azithromycin 500mg — only 42 units remaining',       time: '5 hrs ago',   read: true  },
  { id: 5, type: 'payment', title: 'Payment Overdue',            desc: 'Apollo Pharma — ₹38,000 overdue (ORD-4517)',        time: '1 day ago',   read: true  },
  { id: 6, type: 'order',   title: 'Order Delivered',            desc: 'ORD-4518 delivered to MedPlus Store - Thane',        time: '2 days ago',  read: true  },
  { id: 7, type: 'stock',   title: 'Out of Stock',               desc: 'Ceftriaxone 1g Injection is now out of stock',       time: '2 days ago',  read: true  },
  { id: 8, type: 'payment', title: 'Partial Payment Received',   desc: 'MedPlus Store paid ₹10,000 of ₹12,400 (ORD-4518)', time: '3 days ago',  read: true  },
]

const TYPE_CFG = {
  order:   { icon: ShoppingCart, color: '#0c3b73', bg: '#e0e7ff' },
  payment: { icon: IndianRupee,  color: '#16a34a', bg: '#dcfce7' },
  stock:   { icon: Package,      color: '#d97706', bg: '#fef3c7' },
}

export default function DistNotifications() {
  const [notifs, setNotifs] = useState(MOCK)
  const [filter, setFilter] = useState('All')

  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })))
  const dismiss = (id) => setNotifs(p => p.filter(n => n.id !== id))
  const markRead = (id) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n))

  const filtered = notifs.filter(n => filter === 'All' || (filter === 'Unread' ? !n.read : n.type === filter))
  const unread = notifs.filter(n => !n.read).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Bell size={20} color="#fabf22" />
            {unread > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{unread}</span>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Notifications</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{unread} unread notification{unread !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
            <CheckCircle2 size={14} color="#16a34a" /> Mark All Read
          </button>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['All', 'Unread', 'order', 'payment', 'stock'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 16px', borderRadius: 20, border: `1px solid ${filter === f ? '#0c3b73' : '#e5e7eb'}`, background: filter === f ? '#0c3b73' : '#fff', color: filter === f ? '#fff' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
            {f === 'Unread' ? `Unread (${unread})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 48, textAlign: 'center', color: '#9ca3af' }}>
            <Bell size={36} color="#e5e7eb" style={{ marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 14 }}>No notifications here</p>
          </div>
        ) : (
          filtered.map(n => {
            const cfg = TYPE_CFG[n.type] || TYPE_CFG.order
            const Icon = cfg.icon
            return (
              <div key={n.id} onClick={() => markRead(n.id)}
                style={{ background: n.read ? '#fff' : '#f0f7ff', border: `1px solid ${n.read ? '#e5e7eb' : '#bfdbfe'}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', transition: 'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = n.read ? '#fafafa' : '#e8f2ff'}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? '#fff' : '#f0f7ff'}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: n.read ? 500 : 700, color: '#111827' }}>{n.title}</p>
                    <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, whiteSpace: 'nowrap' }}>{n.time}</span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6b7280' }}>{n.desc}</p>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0c3b73', flexShrink: 0, marginTop: 6 }} />}
                <button onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, flexShrink: 0, display: 'flex' }}>
                  <X size={14} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
