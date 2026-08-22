/* eslint-disable prettier/prettier */
/**
 * Notifications — Franchise Notification Center
 * Subscription alerts, stock alerts, order updates, system messages
 */
import { useState } from 'react'
import { Bell, AlertTriangle, CheckCircle2, Info, Package, ShoppingCart, Users, Settings, Clock, Trash2, CheckCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'warning', category: 'Stock', title: 'Low Stock Alert', message: 'Amoxicillin 500mg has only 38 strips remaining. Reorder level is 50.', time: '10 min ago', read: false, icon: Package, color: '#d97706' },
  { id: 2, type: 'danger', category: 'Expiry', title: 'Medicine Expiring Soon', message: 'Vitamin C 500mg (Batch B-2023-12-01) expires in 3 days on 25 Aug 2026.', time: '45 min ago', read: false, icon: AlertTriangle, color: '#dc2626' },
  { id: 3, type: 'success', category: 'Order', title: 'B2B Order Delivered', message: 'Purchase Order PO-0031 from Medico Agency has been delivered. Create GRN to update stock.', time: '2 hours ago', read: false, icon: ShoppingCart, color: '#16a34a' },
  { id: 4, type: 'warning', category: 'Subscription', title: 'Subscription Expiry Reminder', message: 'Your franchise subscription plan expires in 15 days. Please renew to avoid service interruption.', time: '1 day ago', read: true, icon: Bell, color: '#d97706' },
  { id: 5, type: 'info', category: 'Staff', title: 'New Staff Login', message: 'Amit Kumar (Pharmacist) logged in from a new device.', time: '1 day ago', read: true, icon: Users, color: '#0891b2' },
  { id: 6, type: 'danger', category: 'Stock', title: 'Out of Stock', message: 'Omeprazole 20mg (Omez) is now out of stock. 12 pending sales requests.', time: '2 days ago', read: true, icon: Package, color: '#dc2626' },
  { id: 7, type: 'success', category: 'Order', title: 'Purchase Order Confirmed', message: 'Supplier PharmaNexus has confirmed PO-0029. Expected delivery: 24 Aug 2026.', time: '2 days ago', read: true, icon: CheckCircle2, color: '#16a34a' },
  { id: 8, type: 'info', category: 'System', title: 'System Update', message: 'Platform will undergo maintenance on 25 Aug 2026 from 2:00 AM to 4:00 AM IST.', time: '3 days ago', read: true, icon: Settings, color: '#0c3b73' },
]

const categories = ['All', 'Stock', 'Expiry', 'Order', 'Subscription', 'Staff', 'System']

const Notifications = () => {
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS)
  const [filter, setFilter] = useState('All')
  const [readFilter, setReadFilter] = useState('All')

  const filtered = notifs.filter(n =>
    (filter === 'All' || n.category === filter) &&
    (readFilter === 'All' || (readFilter === 'Unread' ? !n.read : n.read))
  )

  const unreadCount = notifs.filter(n => !n.read).length

  const markAll = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const deleteNotif = (id) => setNotifs(prev => prev.filter(n => n.id !== id))

  const typeBg = { warning: '#fffbeb', danger: '#fff1f2', success: '#f0fdf4', info: '#f0f9ff' }
  const typeBorder = { warning: '#fde68a', danger: '#fecdd3', success: '#bbf7d0', info: '#bae6fd' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={Bell} title="Notifications" subtitle={`${unreadCount} unread notifications`} color="#0c3b73">
        {unreadCount > 0 && (
          <button onClick={markAll} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
            <CheckCheck size={14} /> Mark All Read
          </button>
        )}
      </PageHeader>

      {/* Summary Counts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {[
          { label: 'All', count: notifs.length, color: '#0c3b73' },
          { label: 'Unread', count: unreadCount, color: '#dc2626' },
          { label: 'Stock', count: notifs.filter(n => n.category === 'Stock').length, color: '#d97706' },
          { label: 'Orders', count: notifs.filter(n => n.category === 'Order').length, color: '#16a34a' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              borderColor: filter === c ? '#0c3b73' : '#e5e7eb',
              background: filter === c ? '#0c3b73' : '#fff',
              color: filter === c ? '#fff' : '#374151',
            }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Unread', 'Read'].map(r => (
            <button key={r} onClick={() => setReadFilter(r)} style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid', fontSize: 12, cursor: 'pointer',
              borderColor: readFilter === r ? '#7c3aed' : '#e5e7eb',
              background: readFilter === r ? '#7c3aed18' : '#fff',
              color: readFilter === r ? '#7c3aed' : '#374151',
              fontWeight: readFilter === r ? 600 : 400,
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 40, textAlign: 'center' }}>
            <Bell size={32} color="#d1d5db" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>No notifications found</p>
          </div>
        )}
        {filtered.map(n => {
          const NIcon = n.icon
          return (
            <div key={n.id} style={{
              background: n.read ? '#fff' : (typeBg[n.type] || '#fff'),
              borderRadius: 10,
              border: `1px solid ${n.read ? '#e5e7eb' : (typeBorder[n.type] || '#e5e7eb')}`,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              position: 'relative',
            }}>
              {/* Unread dot */}
              {!n.read && (
                <div style={{ position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
              )}

              {/* Icon */}
              <div style={{ width: 40, height: 40, borderRadius: 10, background: n.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <NIcon size={18} color={n.color} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: n.color + '18', color: n.color }}>
                    {n.category}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#9ca3af' }}>
                    <Clock size={10} /> {n.time}
                  </span>
                </div>
                <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{n.title}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{n.message}</p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {!n.read && (
                  <button onClick={() => markRead(n.id)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 11, color: '#374151' }}>
                    Mark Read
                  </button>
                )}
                <button onClick={() => deleteNotif(n.id)} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #fecdd3', background: '#fff1f2', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={12} color="#dc2626" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Notifications
