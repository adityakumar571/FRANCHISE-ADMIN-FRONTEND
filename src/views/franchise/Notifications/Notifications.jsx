/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { Bell, Package, ShoppingCart, AlertTriangle, Info, Trash2, CheckCheck, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, putRequest, deleteRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = {
  stock:        { icon: Package,       color: '#d97706', bg: '#fef3c7' },
  expiry:       { icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2' },
  order:        { icon: ShoppingCart,  color: '#0c3b73', bg: '#e0e7ff' },
  subscription: { icon: Info,          color: '#7c3aed', bg: '#f5f3ff' },
  staff:        { icon: Bell,          color: '#0891b2', bg: '#e0f2fe' },
  system:       { icon: Info,          color: '#6b7280', bg: '#f3f4f6' },
}

const TABS = ['All', 'Stock', 'Expiry', 'Order', 'Subscription', 'Staff', 'System']

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread]   = useState(0)
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [readFilter, setReadFilter] = useState('')
  const [page, setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(
        `/franchise/notifications?category=${category.toLowerCase()}&read=${readFilter}&page=${page}&limit=15`
      )
      const d = res.data?.data
      setNotifications(d?.notifications || [])
      setUnread(d?.unread || 0)
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
    } catch { toast.error('Failed to load notifications') }
    finally   { setLoading(false) }
  }, [category, readFilter, page])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const markRead = async (id) => {
    try {
      await putRequest({ url: `/franchise/notifications/${id}/read`, cred: {} })
      setNotifications(p => p.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnread(u => Math.max(0, u - 1))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await putRequest({ url: '/franchise/notifications/read-all', cred: {} })
      setNotifications(p => p.map(n => ({ ...n, isRead: true })))
      setUnread(0)
      toast.success('All marked as read')
    } catch { toast.error('Failed') }
  }

  const deleteNotif = async (id) => {
    try {
      await deleteRequest(`/franchise/notifications/${id}`)
      setNotifications(p => p.filter(n => n._id !== id))
      setTotal(t => t - 1)
    } catch {}
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Bell} title="Notifications" subtitle="All system alerts and updates" color="#0c3b73">
        <button onClick={fetchNotifications} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <RefreshCw size={12} /> Refresh
        </button>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ padding: '7px 14px', border: 'none', borderRadius: 8, background: '#0c3b73', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}>
            <CheckCheck size={13} /> Mark All Read ({unread})
          </button>
        )}
      </PageHeader>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'All',    value: total,  onClick: () => { setCategory(''); setReadFilter('') } },
          { label: 'Unread', value: unread, onClick: () => setReadFilter('unread'), color: '#dc2626' },
          { label: 'Stock',  value: notifications.filter(n => n.category === 'stock').length, onClick: () => setCategory('Stock') },
          { label: 'Orders', value: notifications.filter(n => n.category === 'order').length, onClick: () => setCategory('Order') },
        ].map(k => (
          <button key={k.label} onClick={k.onClick}
            style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#0c3b73'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: k.color || '#111827', margin: 0 }}>{k.value}</p>
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setCategory(t === 'All' ? '' : t); setPage(1) }}
            style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${category === (t === 'All' ? '' : t) ? '#0c3b73' : '#e5e7eb'}`, background: category === (t === 'All' ? '' : t) ? '#0c3b73' : '#fff', color: category === (t === 'All' ? '' : t) ? '#fff' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {t}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {[{ label: 'All', value: '' }, { label: 'Unread', value: 'unread' }, { label: 'Read', value: 'read' }].map(f => (
            <button key={f.label} onClick={() => setReadFilter(f.value)}
              style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${readFilter === f.value ? '#0c3b73' : '#e5e7eb'}`, background: readFilter === f.value ? '#0c3b73' : '#fff', color: readFilter === f.value ? '#fff' : '#374151', fontSize: 11, cursor: 'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading
          ? Array(5).fill(0).map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 16px' }}>
              <div style={{ height: 14, background: '#f3f4f6', borderRadius: 4, width: '50%', marginBottom: 6 }} />
              <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, width: '80%' }} />
            </div>
          ))
          : notifications.length === 0
            ? (
              <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                <Bell size={36} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ margin: 0 }}>No notifications found</p>
              </div>
            )
            : notifications.map(n => {
              const catKey = n.category?.toLowerCase() || 'system'
              const cfg = CATEGORY_ICONS[catKey] || CATEGORY_ICONS.system
              const Icon = cfg.icon
              return (
                <div key={n._id}
                  style={{ background: n.isRead ? '#fff' : '#f0f4ff', borderRadius: 10, border: `1px solid ${n.isRead ? '#e5e7eb' : '#c7d2fe'}`, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }}
                  onClick={() => !n.isRead && markRead(n._id)}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: n.isRead ? 600 : 700, color: '#111827' }}>{n.title}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{n.category}</span>
                      {!n.isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0c3b73', flexShrink: 0 }} />}
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6b7280' }}>{n.message}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{n.date} · {n.time}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteNotif(n._id) }}
                    style={{ padding: '5px', border: 'none', borderRadius: 6, background: 'none', cursor: 'pointer', color: '#9ca3af', flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })
        }
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', background: 'none' }}>← Prev</button>
          <span style={{ padding: '6px 12px', fontSize: 12, color: '#374151' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', background: 'none' }}>Next →</button>
        </div>
      )}
    </div>
  )
}
