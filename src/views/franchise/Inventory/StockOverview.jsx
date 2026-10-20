/* eslint-disable prettier/prettier */
/**
 * Stock Overview - Production Level
 * Comprehensive dashboard showing complete inventory health
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, TrendingUp, TrendingDown, AlertTriangle, Calendar, DollarSign, ShoppingCart, Zap, AlertCircle, CheckCircle, XCircle, BarChart3 } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const StatCard = ({ icon: Icon, label, value, subvalue, color, bg, trend }) => (
  <div style={{ 
    background: bg || '#fff', 
    border: '2px solid ' + (bg || '#e5e7eb'), 
    borderRadius: 12, 
    padding: '18px 20px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s'
  }}
  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
    <div style={{ position: 'absolute', top: -15, right: -15, width: 80, height: 80, borderRadius: '50%', background: color + '15', opacity: 0.6 }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          borderRadius: 10, 
          background: color + '22', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </p>
        </div>
      </div>
      <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: '#111827' }}>{value}</p>
      {subvalue && (
        <p style={{ margin: 0, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{subvalue}</p>
      )}
      {trend && (
        <div style={{ 
          marginTop: 8, 
          fontSize: 11, 
          fontWeight: 600, 
          color: trend > 0 ? '#16a34a' : '#dc2626',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  </div>
)

const QuickLink = ({ icon: Icon, label, count, color, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: '14px 16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = color
      e.currentTarget.style.boxShadow = `0 4px 12px ${color}22`
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = '#e5e7eb'
      e.currentTarget.style.boxShadow = 'none'
    }}>
    <div style={{ 
      width: 36, 
      height: 36, 
      borderRadius: 8, 
      background: color + '15', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>{label}</p>
      {count !== undefined && (
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
          {count} items
        </p>
      )}
    </div>
    <div style={{ fontSize: 18, color: '#9ca3af' }}>→</div>
  </div>
)

export default function StockOverview() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState({
    kpis: {
      totalSKUs: 0,
      totalQuantity: 0,
      totalValue: 0,
      lowStock: 0,
      outOfStock: 0,
      nearExpiry: 0,
      expired: 0,
      fastMoving: 0
    },
    stockLevels: {
      outOfStock: 0,
      low: 0,
      adequate: 0,
      overstock: 0
    },
    recentMovements: [],
    categoryBreakdown: [],
    alerts: []
  })

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        // Fetch overview data
        const res = await getRequest('/franchise/medicines?limit=500')
        const medicines = res.data?.data?.medicines || []
        
        // Calculate KPIs
        let totalQuantity = 0
        let totalValue = 0
        let lowStock = 0
        let outOfStock = 0
        let nearExpiry = 0
        let expired = 0
        
        const now = new Date()
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        
        // Stock level distribution
        let stockLevels = { outOfStock: 0, low: 0, adequate: 0, overstock: 0 }
        
        medicines.forEach(med => {
          const stock = med.stock || 0
          const mrp = med.mrp || 0
          const reorderLevel = med.reorderLevel || 10
          
          totalQuantity += stock
          totalValue += stock * mrp
          
          // Stock level classification
          if (stock === 0) {
            outOfStock++
            stockLevels.outOfStock++
          } else if (stock <= reorderLevel) {
            lowStock++
            stockLevels.low++
          } else if (stock <= reorderLevel * 3) {
            stockLevels.adequate++
          } else {
            stockLevels.overstock++
          }
          
          // Check expiry
          if (med.batches && Array.isArray(med.batches)) {
            med.batches.forEach(batch => {
              const expiryDate = new Date(batch.expiryDate)
              if (expiryDate <= now) {
                expired++
              } else if (expiryDate <= thirtyDaysFromNow) {
                nearExpiry++
              }
            })
          }
        })
        
        // Generate alerts
        const alerts = []
        if (outOfStock > 0) {
          alerts.push({ type: 'error', message: `${outOfStock} medicines are out of stock`, severity: 'high', count: outOfStock })
        }
        if (lowStock > 0) {
          alerts.push({ type: 'warning', message: `${lowStock} medicines are running low`, severity: 'medium', count: lowStock })
        }
        if (nearExpiry > 0) {
          alerts.push({ type: 'warning', message: `${nearExpiry} batches expiring within 30 days`, severity: 'high', count: nearExpiry })
        }
        if (expired > 0) {
          alerts.push({ type: 'error', message: `${expired} batches have expired`, severity: 'critical', count: expired })
        }
        
        setOverview({
          kpis: {
            totalSKUs: medicines.length,
            totalQuantity,
            totalValue: totalValue.toFixed(2),
            lowStock,
            outOfStock,
            nearExpiry,
            expired,
            fastMoving: 0 // TODO: Calculate from sales data
          },
          stockLevels,
          recentMovements: [], // TODO: Fetch from ledger
          categoryBreakdown: [], // TODO: Group by category
          alerts
        })
      } catch (err) {
        console.error('Error loading overview:', err)
        toast.error('Failed to load stock overview')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

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
            <BarChart3 size={28} color="#fff" />
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Stock Overview</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Complete inventory health dashboard with real-time insights
          </p>
        </div>
      </div>

      {/* Alerts Banner */}
      {overview.alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {overview.alerts.map((alert, i) => (
            <div key={i} style={{ 
              background: alert.type === 'error' ? '#fef2f2' : '#fffbeb',
              border: `2px solid ${alert.type === 'error' ? '#fca5a5' : '#fde68a'}`,
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <AlertCircle size={18} style={{ color: alert.type === 'error' ? '#dc2626' : '#d97706', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: alert.type === 'error' ? '#991b1b' : '#92400e', flex: 1 }}>
                {alert.message}
              </span>
              <span style={{ 
                fontSize: 11, 
                fontWeight: 700, 
                padding: '3px 10px', 
                borderRadius: 12,
                background: alert.type === 'error' ? '#dc2626' : '#d97706',
                color: '#fff'
              }}>
                {alert.severity.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard 
          icon={Package} 
          label="Total SKUs" 
          value={loading ? '...' : overview.kpis.totalSKUs}
          subvalue="Unique medicines"
          color="#3b82f6"
          bg="#eff6ff"
        />
        <StatCard 
          icon={ShoppingCart} 
          label="Total Quantity" 
          value={loading ? '...' : overview.kpis.totalQuantity.toLocaleString()}
          subvalue="Units in stock"
          color="#8b5cf6"
          bg="#f5f3ff"
        />
        <StatCard 
          icon={DollarSign} 
          label="Stock Value" 
          value={loading ? '...' : `₹${Number(overview.kpis.totalValue).toLocaleString('en-IN')}`}
          subvalue="Current inventory value"
          color="#16a34a"
          bg="#f0fdf4"
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Low Stock" 
          value={loading ? '...' : overview.kpis.lowStock}
          subvalue="Need reorder"
          color="#f59e0b"
          bg="#fffbeb"
        />
        <StatCard 
          icon={XCircle} 
          label="Out of Stock" 
          value={loading ? '...' : overview.kpis.outOfStock}
          subvalue="Urgent action needed"
          color="#dc2626"
          bg="#fef2f2"
        />
        <StatCard 
          icon={Calendar} 
          label="Near Expiry" 
          value={loading ? '...' : overview.kpis.nearExpiry}
          subvalue="Within 30 days"
          color="#ea580c"
          bg="#fff7ed"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Expired" 
          value={loading ? '...' : overview.kpis.expired}
          subvalue="Batches expired"
          color="#dc2626"
          bg="#fef2f2"
        />
        <StatCard 
          icon={Zap} 
          label="Fast Moving" 
          value={loading ? '...' : overview.kpis.fastMoving}
          subvalue="Top sellers"
          color="#16a34a"
          bg="#f0fdf4"
        />
      </div>

      {/* Stock Level Distribution */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={18} />
          Stock Level Distribution
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Out of Stock', value: overview.stockLevels.outOfStock, color: '#dc2626', icon: XCircle },
            { label: 'Low Stock', value: overview.stockLevels.low, color: '#f59e0b', icon: AlertTriangle },
            { label: 'Adequate', value: overview.stockLevels.adequate, color: '#16a34a', icon: CheckCircle },
            { label: 'Overstock', value: overview.stockLevels.overstock, color: '#6b7280', icon: Package }
          ].map(item => (
            <div key={item.label} style={{ 
              background: item.color + '10',
              border: `2px solid ${item.color}33`,
              borderRadius: 10,
              padding: '12px 14px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <item.icon size={24} style={{ color: item.color }} />
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: item.color }}>
                {loading ? '...' : item.value}
              </p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: '#374151' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <QuickLink 
            icon={AlertTriangle} 
            label="View Low Stock" 
            count={overview.kpis.lowStock}
            color="#f59e0b"
            onClick={() => navigate('/franchise/live-rates/low-stock-alert')}
          />
          <QuickLink 
            icon={Calendar} 
            label="View Near Expiry" 
            count={overview.kpis.nearExpiry}
            color="#ea580c"
            onClick={() => navigate('/franchise/inventory/near-expiry')}
          />
          <QuickLink 
            icon={XCircle} 
            label="View Expired Stock" 
            count={overview.kpis.expired}
            color="#dc2626"
            onClick={() => navigate('/franchise/inventory/expired')}
          />
          <QuickLink 
            icon={Zap} 
            label="View Fast Moving" 
            color="#16a34a"
            onClick={() => navigate('/franchise/inventory/fast-moving')}
          />
          <QuickLink 
            icon={TrendingDown} 
            label="View Slow Moving" 
            color="#9ca3af"
            onClick={() => navigate('/franchise/inventory/slow-moving')}
          />
          <QuickLink 
            icon={Package} 
            label="Quick Stock Entry" 
            color="#3b82f6"
            onClick={() => navigate('/franchise/inventory/quick-entry')}
          />
        </div>
      </div>
    </div>
  )
}
