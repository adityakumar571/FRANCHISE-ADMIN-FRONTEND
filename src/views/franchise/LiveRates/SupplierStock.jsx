/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Warehouse, Search, Package, AlertCircle, CheckCircle, Filter, TrendingUp } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c }) => <th style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', borderBottom: '2px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function SupplierStock() {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // all, inStock, lowStock, outOfStock

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/live-rates/supplier-stock')
        setStock(res.data?.data || [])
      } catch { toast.error('Failed to load supplier stock') }
      finally { setLoading(false) }
    })()
  }, [])

  const getStockStatus = (stockQty) => {
    if (stockQty === 0) return 'outOfStock'
    if (stockQty <= 20) return 'lowStock'
    return 'inStock'
  }

  const filtered = stock.filter(s => {
    const matchesSearch = !search || 
      s.medicine?.toLowerCase().includes(search.toLowerCase()) ||
      s.strength?.toLowerCase().includes(search.toLowerCase())
    
    if (stockFilter === 'all') return matchesSearch
    
    const status = getStockStatus(s.stock || 0)
    return matchesSearch && status === stockFilter
  })

  const stats = {
    total: stock.length,
    inStock: stock.filter(s => (s.stock || 0) > 20).length,
    lowStock: stock.filter(s => (s.stock || 0) > 0 && (s.stock || 0) <= 20).length,
    outOfStock: stock.filter(s => (s.stock || 0) === 0).length
  }

  const StockBadge = ({ quantity }) => {
    const status = getStockStatus(quantity)
    const configs = {
      inStock: { 
        bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', 
        color: '#166534', 
        border: '#22c55e',
        icon: CheckCircle,
        text: `${quantity} In Stock`
      },
      lowStock: { 
        bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
        color: '#92400e', 
        border: '#fbbf24',
        icon: AlertCircle,
        text: `${quantity} Low Stock`
      },
      outOfStock: { 
        bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 
        color: '#991b1b', 
        border: '#ef4444',
        icon: AlertCircle,
        text: 'Out of Stock'
      }
    }
    const config = configs[status]
    const Icon = config.icon
    
    return (
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 6,
        padding: '6px 12px',
        background: config.bg,
        border: `1.5px solid ${config.border}`,
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 12,
        color: config.color
      }}>
        <Icon size={14} />
        {config.text}
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header with gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
        borderRadius: 16, 
        padding: '28px 32px',
        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 180, height: 180, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Warehouse size={28} color="#fff" />
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Supplier Stock</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Live stock availability from all suppliers</p>
        </div>
      </div>

      {/* Stock Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
          border: '2px solid #3b82f6',
          borderRadius: 12, 
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <Package size={24} style={{ color: '#1e40af' }} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1e3a8a' }}>{stats.total}</div>
            <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 600 }}>Total Items</div>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', 
          border: '2px solid #22c55e',
          borderRadius: 12, 
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <CheckCircle size={24} style={{ color: '#166534' }} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#14532d' }}>{stats.inStock}</div>
            <div style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>In Stock</div>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
          border: '2px solid #fbbf24',
          borderRadius: 12, 
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <AlertCircle size={24} style={{ color: '#92400e' }} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#78350f' }}>{stats.lowStock}</div>
            <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>Low Stock</div>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 
          border: '2px solid #ef4444',
          borderRadius: 12, 
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <AlertCircle size={24} style={{ color: '#991b1b' }} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#7f1d1d' }}>{stats.outOfStock}</div>
            <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600 }}>Out of Stock</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 320px', minWidth: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search medicine or strength..."
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
              onFocus={e => e.target.style.borderColor = '#f59e0b'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Filter size={16} style={{ color: '#6b7280' }} />
            <select 
              value={stockFilter} 
              onChange={e => setStockFilter(e.target.value)}
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
              <option value="all">All Stock ({stats.total})</option>
              <option value="inStock">In Stock ({stats.inStock})</option>
              <option value="lowStock">Low Stock ({stats.lowStock})</option>
              <option value="outOfStock">Out of Stock ({stats.outOfStock})</option>
            </select>
          </div>

          {filtered.length > 0 && (
            <div style={{ 
              padding: '8px 16px', 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: '#92400e'
            }}>
              {filtered.length} Items
            </div>
          )}
        </div>
      </div>

      {/* Stock Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Medicine', 'Strength', 'Pack Size', 'Rate', 'Stock Status', 'Scheme'].map(h => <Th key={h} c={h} />)}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 16, background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4 }} />
                      </td>
                    ))}
                  </tr>
                ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                        <Warehouse size={48} style={{ color: '#d1d5db', marginBottom: 12 }} />
                        <div style={{ fontSize: 15, color: '#6b7280', fontWeight: 600 }}>No stock data found</div>
                        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Try adjusting your search or filters</div>
                      </td>
                    </tr>
                  )
                  : filtered.map((s, i) => {
                    const status = getStockStatus(s.stock || 0)
                    return (
                      <tr 
                        key={i} 
                        style={{ transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Td style={{ fontWeight: 700, color: '#0c3b73' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Package size={16} style={{ color: '#6b7280' }} />
                            {s.medicine}
                          </div>
                        </Td>
                        <Td style={{ color: '#6b7280', fontWeight: 500 }}>{s.strength || '—'}</Td>
                        <Td style={{ color: '#6b7280' }}>{s.packSize || '—'}</Td>
                        <Td>
                          <div style={{ 
                            fontWeight: 800, 
                            color: '#0c3b73', 
                            fontSize: 15,
                            padding: '4px 10px',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                            borderRadius: 6,
                            display: 'inline-block'
                          }}>
                            ₹ {s.rate?.toFixed(2)}
                          </div>
                        </Td>
                        <Td>
                          <StockBadge quantity={s.stock || 0} />
                        </Td>
                        <Td>
                          {s.scheme ? (
                            <span style={{ 
                              fontSize: 12, 
                              fontWeight: 700, 
                              padding: '4px 10px', 
                              borderRadius: 6, 
                              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                              color: '#92400e',
                              border: '1px solid #fbbf24',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <TrendingUp size={12} />
                              {s.scheme}
                            </span>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: 12 }}>No scheme</span>
                          )}
                        </Td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
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
