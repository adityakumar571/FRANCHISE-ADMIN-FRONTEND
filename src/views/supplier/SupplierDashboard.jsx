import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Package, TrendingUp, AlertCircle, ShoppingCart, 
  Eye, ArrowUp, ArrowDown, CheckCircle, Clock, 
  Truck, XCircle, DollarSign, BarChart3, PackageCheck,
  PackageX, PackageOpen, Boxes
} from 'lucide-react'
import { getRequest } from '../../Helpers'

const SupplierDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
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
  }, [])

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
      const response = await getRequest(`/suppliers/dashboard/stats`)  // No /api/ prefix
      
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
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      dispatched: '#10b981',
      delivered: '#059669',
      cancelled: '#ef4444',
    }
    return colors[status] || '#6b7280'
  }

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #f3f4f6', 
            borderTop: '4px solid #d97706', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280', margin: 0 }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const totalOrders = stats.pending + stats.confirmed + stats.processing + stats.dispatched + stats.delivered
  const completionRate = totalOrders > 0 ? ((stats.delivered / totalOrders) * 100).toFixed(1) : 0

  const supplierName = localStorage.getItem('supplierName') || 'Supplier'
  const supplierEmail = localStorage.getItem('supplierEmail') || ''

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px', background: '#f9fafb', minHeight: '100vh' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Top Header */}
      <div style={{ 
        background: '#fff', 
        borderRadius: '12px', 
        padding: '24px 28px', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>
              {supplierName}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              {supplierEmail}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => navigate('/supplier/orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                background: '#d97706',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#b45309'}
              onMouseOut={e => e.currentTarget.style.background = '#d97706'}
            >
              <ShoppingCart size={16} />
              View All Orders
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Pending Orders', value: stats.pending, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Processing', value: stats.processing, icon: Package, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Dispatched', value: stats.dispatched, icon: Truck, color: '#10b981', bg: '#d1fae5' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: '#059669', bg: '#a7f3d0' },
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderLeft: `4px solid ${stat.color}`,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '10px', 
                background: stat.bg, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <stat.icon size={22} color={stat.color} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue & Orders Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Monthly Revenue Card */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '28px',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.15 }}>
            <DollarSign size={120} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: 500 }}>
              Monthly Revenue
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
              {formatCurrency(stats.currentMonth.revenue)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {stats.growth.revenue >= 0 ? (
                <>
                  <div style={{ 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    background: 'rgba(255,255,255,0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    <ArrowUp size={14} />
                    {stats.growth.revenue}%
                  </div>
                  <span style={{ fontSize: '13px', opacity: 0.9 }}>vs last month</span>
                </>
              ) : (
                <>
                  <div style={{ 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    background: 'rgba(255,255,255,0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    <ArrowDown size={14} />
                    {Math.abs(stats.growth.revenue)}%
                  </div>
                  <span style={{ fontSize: '13px', opacity: 0.9 }}>vs last month</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Orders & Completion */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>
                This Month Orders
              </div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#111827' }}>
                {stats.currentMonth.orders}
              </div>
            </div>
            <div style={{ 
              padding: '6px 12px', 
              borderRadius: '8px', 
              background: stats.growth.orders >= 0 ? '#d1fae5' : '#fee2e2',
              color: stats.growth.orders >= 0 ? '#059669' : '#dc2626',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {stats.growth.orders >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {Math.abs(stats.growth.orders)}%
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Completion Rate</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#059669' }}>
                {completionRate}%
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: '#f3f4f6', 
              borderRadius: '4px', 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                width: `${completionRate}%`, 
                height: '100%', 
                background: '#059669',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 600, 
          color: '#111827', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <BarChart3 size={20} color="#d97706" />
          Quick Actions
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {[
            { label: 'Manage Inventory', icon: Package, color: '#3b82f6', path: '/supplier/inventory' },
            { label: 'View Reports', icon: TrendingUp, color: '#059669', path: '/supplier/reports' },
            { label: 'Low Stock Items', icon: AlertCircle, color: '#f59e0b', path: '/supplier/inventory?filter=low-stock' },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#fff',
                color: action.color,
                border: `1px solid ${action.color}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = action.color
                e.currentTarget.style.color = '#fff'
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.color = action.color
              }}
            >
              <action.icon size={16} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 600, 
            color: '#111827', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShoppingCart size={20} color="#d97706" />
            Recent Orders
          </h3>
          <button
            onClick={() => navigate('/supplier/orders')}
            style={{
              padding: '6px 14px',
              background: '#d97706',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            View All
          </button>
        </div>
        
        {stats.recentOrders && stats.recentOrders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Order ID', 'Franchise', 'Date', 'Items', 'Amount', 'Status', 'Action'].map((header) => (
                    <th key={header} style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order, idx) => (
                  <tr 
                    key={order._id} 
                    style={{ 
                      borderBottom: idx < stats.recentOrders.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseOut={e => e.currentTarget.style.background = '#fff'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '13px', 
                        fontWeight: 600,
                        color: '#d97706',
                        background: '#fef3c7',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {order.orderId}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
                        {order.franchiseName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {order.franchiseCode}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 600,
                        color: '#374151',
                        background: '#f3f4f6',
                        padding: '4px 10px',
                        borderRadius: '12px'
                      }}>
                        {order.products?.length || 0} items
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, color: '#059669' }}>
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 700,
                        padding: '5px 12px',
                        borderRadius: '12px',
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status),
                        textTransform: 'capitalize'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => navigate(`/supplier/orders/${order._id}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          background: '#eff6ff',
                          color: '#3b82f6',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = '#3b82f6'
                          e.currentTarget.style.color = '#fff'
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = '#eff6ff'
                          e.currentTarget.style.color = '#3b82f6'
                        }}
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ marginBottom: '16px' }}>
              <ShoppingCart size={64} style={{ opacity: 0.2, color: '#6b7280' }} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
              No recent orders
            </h4>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>
              Orders from franchises will appear here
            </p>
            <button
              onClick={() => navigate('/supplier/orders')}
              style={{
                padding: '10px 24px',
                background: '#d97706',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View All Orders
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SupplierDashboard
