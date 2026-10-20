/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Truck, Search, CheckCircle, Clock, Package, XCircle, Filter, Calendar, MapPin, Phone, Mail } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const STATUS_CFG = {
  'Pending':          { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#92400e', border: '#fbbf24', icon: Clock },
  'Confirmed':        { bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', color: '#6b21a8', border: '#a855f7', icon: CheckCircle },
  'Packed':           { bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', color: '#075985', border: '#0ea5e9', icon: Package },
  'In Transit':       { bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', color: '#1e40af', border: '#3b82f6', icon: Truck },
  'Out for Delivery': { bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', color: '#9a3412', border: '#f97316', icon: Truck },
  'Delivered':        { bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', color: '#166534', border: '#22c55e', icon: CheckCircle },
  'Cancelled':        { bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', color: '#991b1b', border: '#ef4444', icon: XCircle },
}

export default function OrderTracking() {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/live-rates/order-tracking/all')
        const list = res.data?.data?.orders || []
        setOrders(list)
        if (list.length > 0) setSelected(list[0])
      } catch (err) { 
        console.error('Order tracking error:', err)
        toast.error('Failed to load orders') 
      } finally { 
        setLoading(false) 
      }
    })()
  }, [])

  const filtered = orders.filter(o => {
    const matchesSearch = !search ||
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.supplier?.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: orders.length,
    Pending: orders.filter(o => o.status === 'Pending').length,
    'In Transit': orders.filter(o => o.status === 'In Transit').length,
    Delivered: orders.filter(o => o.status === 'Delivered').length,
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header with gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
        borderRadius: 16, 
        padding: '28px 32px',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 180, height: 180, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Truck size={28} color="#fff" />
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Order Tracking</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Track all your wholesale orders in real-time</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Orders', count: statusCounts.all, color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Pending', count: statusCounts.Pending, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'In Transit', count: statusCounts['In Transit'], color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Delivered', count: statusCounts.Delivered, color: '#22c55e', bg: '#dcfce7' },
        ].map(({ label, count, color, bg }) => (
          <div 
            key={label}
            style={{ 
              background: '#fff',
              border: `2px solid ${bg}`,
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{ 
              width: 48, 
              height: 48, 
              borderRadius: 10, 
              background: bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: 24, fontWeight: 800, color }}>{count}</span>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Orders</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 240 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by Order ID or Supplier..."
              style={{ 
                width: '100%', 
                padding: '11px 14px 11px 42px', 
                border: '2px solid #e5e7eb', 
                borderRadius: 10, 
                fontSize: 14, 
                outline: 'none', 
                background: '#f9fafb',
                transition: 'all 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Filter size={16} style={{ color: '#6b7280' }} />
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              style={{ 
                padding: '10px 14px', 
                border: '1px solid #e5e7eb', 
                borderRadius: 8, 
                fontSize: 13, 
                fontWeight: 600,
                color: '#374151',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">All Orders ({statusCounts.all})</option>
              <option value="Pending">Pending ({statusCounts.Pending})</option>
              <option value="In Transit">In Transit ({statusCounts['In Transit']})</option>
              <option value="Delivered">Delivered ({statusCounts.Delivered})</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Orders List */}
        <div style={{ 
          background: '#fff', 
          border: '1px solid #e5e7eb', 
          borderRadius: 12, 
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ 
            padding: '16px 20px', 
            borderBottom: '2px solid #f3f4f6',
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
          }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#374151' }}>
              Orders ({filtered.length})
            </p>
          </div>
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {loading
              ? Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ height: 16, background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 14, width: '70%', background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ height: 12, width: '50%', background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4 }} />
                </div>
              ))
              : filtered.length === 0
                ? (
                  <div style={{ padding: 48, textAlign: 'center' }}>
                    <Package size={48} style={{ color: '#d1d5db', marginBottom: 12 }} />
                    <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 600 }}>No orders found</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Try adjusting your search or filters</div>
                  </div>
                )
                : filtered.map((o) => {
                  const cfg = STATUS_CFG[o.status] || STATUS_CFG['Pending']
                  const Icon = cfg.icon
                  const isSelected = selected?.id === o.id
                  return (
                    <div 
                      key={o.id} 
                      onClick={() => setSelected(o)}
                      style={{ 
                        padding: '16px 20px', 
                        borderBottom: '1px solid #f3f4f6', 
                        cursor: 'pointer', 
                        background: isSelected ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : '#fff',
                        borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f9fafb' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                        <span style={{ 
                          fontSize: 13, 
                          fontWeight: 800, 
                          color: '#0c3b73', 
                          fontFamily: 'monospace',
                          letterSpacing: '0.5px'
                        }}>
                          {o.id}
                        </span>
                        <span style={{ 
                          fontSize: 10, 
                          fontWeight: 700, 
                          padding: '3px 10px', 
                          borderRadius: 12, 
                          background: cfg.bg,
                          color: cfg.color,
                          border: `1.5px solid ${cfg.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <Icon size={10} />
                          {o.status}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 6px', fontSize: 13, color: '#374151', fontWeight: 600 }}>{o.supplier}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#6b7280' }}>
                        <Calendar size={11} />
                        {o.date}
                      </div>
                      <div style={{ 
                        marginTop: 8, 
                        padding: '8px 12px', 
                        background: '#f9fafb', 
                        borderRadius: 6,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 11
                      }}>
                        <span style={{ color: '#6b7280' }}>{o.items} items</span>
                        <span style={{ fontWeight: 800, color: '#0c3b73' }}>₹{Number(o.amount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>

        {/* Tracking Detail */}
        {selected ? (
          <div style={{ 
            background: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: 12, 
            padding: '24px 28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#111827', fontFamily: 'monospace' }}>{selected.id}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Package size={14} style={{ color: '#6b7280' }} />
                    <p style={{ margin: 0, fontSize: 14, color: '#6b7280', fontWeight: 600 }}>{selected.supplier}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={14} style={{ color: '#6b7280' }} />
                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{selected.date}</p>
                  </div>
                </div>
                <span style={{ 
                  fontSize: 12, 
                  fontWeight: 700, 
                  padding: '6px 16px', 
                  borderRadius: 20, 
                  background: STATUS_CFG[selected.status]?.bg || '#f3f4f6',
                  color: STATUS_CFG[selected.status]?.color || '#6b7280',
                  border: `2px solid ${STATUS_CFG[selected.status]?.border || '#e5e7eb'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {STATUS_CFG[selected.status] && <>{React.createElement(STATUS_CFG[selected.status].icon, { size: 14 })}</>}
                  {selected.status}
                </span>
              </div>

              {/* Order Summary */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: 12, 
                padding: '16px', 
                background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', 
                borderRadius: 10,
                border: '1px solid #e5e7eb'
              }}>
                {[
                  { l: 'Items', v: selected.items, color: '#3b82f6' },
                  { l: 'Total MRP', v: `₹${Number(selected.total || 0).toLocaleString('en-IN')}`, color: '#6b7280' },
                  { l: 'Discount', v: `₹${Number(selected.discount || 0).toLocaleString('en-IN')}`, color: '#22c55e' },
                  { l: 'Amount Paid', v: `₹${Number(selected.amount || 0).toLocaleString('en-IN')}`, color: '#0c3b73' },
                ].map(({ l, v, color }) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>{l}</p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Timeline */}
            <h4 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📦 Tracking Timeline
            </h4>
            <div style={{ position: 'relative', paddingLeft: 40 }}>
              <div style={{ 
                position: 'absolute', 
                left: 14, 
                top: 16, 
                bottom: 16, 
                width: 3, 
                background: 'linear-gradient(180deg, #3b82f6 0%, #e5e7eb 100%)',
                borderRadius: 3
              }} />
              {(selected.trackingSteps || []).map((step, i) => {
                const StepIcon = STATUS_CFG[step.label]?.icon || Clock
                return (
                  <div key={i} style={{ position: 'relative', marginBottom: i === selected.trackingSteps.length - 1 ? 0 : 28 }}>
                    <div style={{
                      position: 'absolute', 
                      left: -40, 
                      top: 0, 
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%',
                      background: step.done 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                        : '#fff',
                      border: `3px solid ${step.done ? '#3b82f6' : '#e5e7eb'}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: step.done ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
                    }}>
                      {step.done && <StepIcon size={14} color="#fff" />}
                    </div>
                    <div style={{ 
                      padding: '6px 16px',
                      background: step.active ? '#eff6ff' : 'transparent',
                      borderRadius: 8,
                      border: step.active ? '1px solid #3b82f6' : 'none'
                    }}>
                      <p style={{ 
                        margin: '0 0 4px', 
                        fontSize: 14, 
                        fontWeight: step.active ? 800 : 600, 
                        color: step.done ? '#111827' : '#9ca3af' 
                      }}>
                        {step.label}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{step.date}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ 
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', 
            border: '2px dashed #d1d5db', 
            borderRadius: 12, 
            padding: 64, 
            textAlign: 'center' 
          }}>
            <Package size={64} style={{ color: '#d1d5db', margin: '0 auto 16px', display: 'block' }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>
              Select an Order
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              Click on any order to view tracking details
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}} />
    </div>
  )
}
