import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Package, TrendingUp, AlertCircle, ShoppingCart, 
  Eye, ArrowUpRight, ArrowDownRight, CheckCircle, Clock, 
  Truck, IndianRupee, BarChart2, Activity,
  RefreshCw, Calendar, Loader2, Store
} from 'lucide-react'
import { getRequest } from '../../Helpers'

const SupplierDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [stats, setStats] = useState({
    currentMonth: { orders: 0, revenue: 0 },
    growth: { orders: 0, revenue: 0 },
    pending: 0,
    confirmed: 0,
    processing: 0,
    dispatched: 0,
    delivered: 0,
    recentOrders: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [refreshKey])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const supplierId = localStorage.getItem('supplierId')
      
      if (!supplierId) {
        console.error('No supplierId found in localStorage')
        setLoading(false)
        return
      }
      
      console.log('Fetching dashboard data for supplierId:', supplierId)
      const response = await getRequest(`/suppliers/dashboard/stats`)
      
      console.log('Dashboard response:', response)
      
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#0c3b73',
      processing: '#7c3aed',
      dispatched: '#16a34a',
      delivered: '#059669',
      cancelled: '#dc2626',
    }
    return colors[status] || '#6b7280'
  }

  const fmt = (amount) => {
    if (amount == null) return '₹0'
    return '₹' + Number(amount).toLocaleString('en-IN')
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const totalOrders = stats.pending + stats.confirmed + stats.processing + stats.dispatched + stats.delivered
  const completionRate = totalOrders > 0 ? ((stats.delivered / totalOrders) * 100).toFixed(1) : 0

  const supplierName = localStorage.getItem('supplierName') || 'Supplier'
  const supplierEmail = localStorage.getItem('supplierEmail') || ''

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  /* ─── Reusable Card Component ─── */
  const Card = ({ children, style = {} }) => (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', ...style }}>{children}</div>
  )

  const CardHeader = ({ title, action, onAction, badge }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{title}</span>
        {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#e11d4818', color: '#e11d48', border: '1px solid #fecdd3' }}>{badge}</span>}
      </div>
      {action && <button onClick={onAction} style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>{action}</button>}
    </div>
  )

  /* ─── KPI Card ─── */
  const KpiCard = ({ icon: Icon, label, value, change, up, color, loading }) => (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 16px', flex: '1 1 150px', minWidth: 140 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      {loading
        ? <div style={{ height: 28, background: '#f3f4f6', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
        : <p style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{value}</p>
      }
      {!loading && change != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {up ? <ArrowUpRight size={11} color="#16a34a" /> : <ArrowDownRight size={11} color="#dc2626" />}
          <span style={{ fontSize: 11, color: up ? '#16a34a' : '#dc2626', fontWeight: 500 }}>{Math.abs(change)}%</span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>vs Last Month</span>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13 }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* ─── Page heading ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Supplier Dashboard</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
            {supplierName} &nbsp;&bull;&nbsp; {supplierEmail || 'Supplier Portal'} &nbsp;&bull;&nbsp; {dateStr}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'long' })}
          </span>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}
          >
            {loading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={12} />} Refresh
          </button>
        </div>
      </div>

      {/* ─── KPI Strip ─── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {[
          { icon: IndianRupee, label: "Month's Revenue",   value: fmt(stats.currentMonth.revenue), change: stats.growth.revenue, up: stats.growth.revenue >= 0, color: '#0c3b73' },
          { icon: ShoppingCart, label: "Month's Orders",    value: stats.currentMonth.orders,       change: stats.growth.orders,  up: stats.growth.orders >= 0,  color: '#d97706' },
          { icon: TrendingUp,   label: 'Completion Rate',   value: `${completionRate}%`,            change: null,                 up: null,                       color: '#16a34a' },
          { icon: Clock,        label: 'Pending Orders',    value: stats.pending,                   change: null,                 up: null,                       color: '#f59e0b' },
          { icon: Activity,     label: 'Processing',        value: stats.processing,                change: null,                 up: null,                       color: '#7c3aed' },
          { icon: CheckCircle,  label: 'Delivered',         value: stats.delivered,                 change: null,                 up: null,                       color: '#059669' },
        ].map((k) => <KpiCard key={k.label} {...k} loading={loading} />)}
      </div>

      {/* ─── ROW 2: Order Status Cards + Quick Actions ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        
        {/* Order Status Breakdown */}
        <Card>
          <CardHeader title="Order Status Overview" />
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Pending', value: stats.pending, icon: Clock, color: '#f59e0b' },
                { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: '#0c3b73' },
                { label: 'Processing', value: stats.processing, icon: Activity, color: '#7c3aed' },
                { label: 'Dispatched', value: stats.dispatched, icon: Truck, color: '#16a34a' },
              ].map((item) => (
                <div key={item.label} style={{ background: '#fafafa', borderRadius: 8, padding: '12px 14px', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: item.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <item.icon size={14} color={item.color} />
                    </div>
                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{item.label}</span>
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: '12px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #dcfce7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>Total Orders</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>{totalOrders}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Manage Inventory', desc: 'Add or update medicines', icon: Package, color: '#0c3b73', path: '/supplier/inventory' },
              { label: 'View All Orders', desc: 'Track and manage orders', icon: ShoppingCart, color: '#d97706', path: '/supplier/orders' },
              { label: 'Sales Reports', desc: 'View performance analytics', icon: BarChart2, color: '#16a34a', path: '/supplier/reports' },
              { label: 'Low Stock Alert', desc: 'Check inventory levels', icon: AlertCircle, color: '#dc2626', path: '/supplier/inventory?filter=low-stock' },
            ].map((action) => (
              <div
                key={action.label}
                onClick={() => navigate(action.path)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: '12px 14px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: '#fff'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#fafafa'
                  e.currentTarget.style.borderColor = action.color
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.borderColor = '#e5e7eb'
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: action.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <action.icon size={18} color={action.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{action.label}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{action.desc}</p>
                </div>
                <ArrowUpRight size={16} color="#9ca3af" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ─── Recent Orders Table ─── */}
      <Card>
        <CardHeader title="Recent Orders" action="View All" onAction={() => navigate('/supplier/orders')} badge={stats.recentOrders?.length ? `${stats.recentOrders.length} orders` : null} />
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              border: '4px solid #f3f4f6', 
              borderTop: '4px solid #0c3b73', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#6b7280', margin: 0, fontSize: 12 }}>Loading orders...</p>
          </div>
        ) : stats.recentOrders && stats.recentOrders.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Order ID', 'Franchise', 'Date', 'Items', 'Amount', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order, idx) => (
                    <tr 
                      key={order._id} 
                      style={{ 
                        background: '#fff',
                        borderBottom: idx < stats.recentOrders.length - 1 ? '1px solid #f3f4f6' : 'none'
                      }}
                    >
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontSize: 11, 
                          fontWeight: 600,
                          color: '#d97706',
                          background: '#fef3c7',
                          padding: '3px 7px',
                          borderRadius: 4,
                          border: '1px solid #fde68a'
                        }}>
                          {order.orderId}
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                          {order.franchiseName}
                        </div>
                        <div style={{ fontSize: 10, color: '#6b7280' }}>
                          {order.franchiseCode}
                        </div>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#6b7280' }}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{ 
                          fontSize: 11, 
                          fontWeight: 600,
                          color: '#374151',
                          background: '#f3f4f6',
                          padding: '3px 8px',
                          borderRadius: 10
                        }}>
                          {order.products?.length || 0} items
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 13, fontWeight: 700, color: '#0c3b73' }}>
                        {fmt(order.totalAmount)}
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{ 
                          fontSize: 10, 
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 10,
                          background: `${getStatusColor(order.status)}18`,
                          color: getStatusColor(order.status),
                          textTransform: 'capitalize',
                          border: `1px solid ${getStatusColor(order.status)}30`
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <button
                          onClick={() => navigate(`/supplier/orders/${order._id}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 10px',
                            background: '#0c3b73',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 5,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={12} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 16px', background: '#fafafa', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#6b7280' }}>Showing {stats.recentOrders.length} recent orders</span>
              <button
                onClick={() => navigate('/supplier/orders')}
                style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                View All Orders <ArrowUpRight size={12} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: '50px 24px', textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}>
              <ShoppingCart size={48} style={{ opacity: 0.2, color: '#6b7280' }} />
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>
              No orders yet
            </h4>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
              Orders from franchises will appear here
            </p>
            <button
              onClick={() => navigate('/supplier/inventory')}
              style={{
                padding: '8px 18px',
                background: '#0c3b73',
                color: '#fff',
                border: 'none',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Manage Inventory
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default SupplierDashboard
