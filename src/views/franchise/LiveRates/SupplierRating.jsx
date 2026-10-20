/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Star, Search, TrendingUp, Package, Clock, ThumbsUp, Filter, Award } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

export default function SupplierRating() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('rating') // rating, deliveryTime, priceCompetitiveness

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/live-rates/supplier-ratings')
        setSuppliers(res.data?.data || [])
      } catch { toast.error('Failed to load supplier ratings') }
      finally { setLoading(false) }
    })()
  }, [])

  const filtered = suppliers
    .filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.supplier?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return ((b.rating || 0) - (a.rating || 0))
      if (sortBy === 'deliveryTime') return ((a.avgDeliveryTime || 0) - (b.avgDeliveryTime || 0))
      if (sortBy === 'orders') return ((b.orders || b.totalOrders || 0) - (a.orders || a.totalOrders || 0))
      return 0
    })

  const StarRating = ({ rating = 0, size = 18 }) => {
    return (
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={size} 
            fill={star <= rating ? '#fbbf24' : 'none'} 
            color={star <= rating ? '#fbbf24' : '#d1d5db'}
          />
        ))}
        <span style={{ fontSize: size, fontWeight: 800, color: '#78350f', marginLeft: 4 }}>
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  const getRatingBadge = (rating) => {
    if (rating >= 4.5) return { text: 'Excellent', color: '#166534', bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', border: '#22c55e' }
    if (rating >= 4.0) return { text: 'Very Good', color: '#15803d', bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: '#34d399' }
    if (rating >= 3.5) return { text: 'Good', color: '#ca8a04', bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '#fbbf24' }
    if (rating >= 3.0) return { text: 'Average', color: '#ea580c', bg: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)', border: '#fb923c' }
    return { text: 'Below Average', color: '#991b1b', bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', border: '#ef4444' }
  }

  const topSupplier = filtered.length > 0 ? filtered[0] : null

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header with gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', 
        borderRadius: 16, 
        padding: '28px 32px',
        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, background: 'rgba(255,255,255,0.15)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 180, height: 180, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Star size={28} color="#fff" fill="#fff" />
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Supplier Ratings</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.95)', margin: 0 }}>Performance metrics and ratings from all suppliers</p>
        </div>
      </div>

      {/* Search and Sort */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 320px', minWidth: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search supplier..."
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
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
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
              <option value="rating">Sort by Rating</option>
              <option value="orders">Sort by Orders</option>
              <option value="deliveryTime">Sort by Delivery Time</option>
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
              {filtered.length} Suppliers
            </div>
          )}
        </div>
      </div>

      {/* Top Supplier Highlight */}
      {topSupplier && !loading && (
        <div style={{ 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
          border: '2px solid #fbbf24',
          borderRadius: 12, 
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 4px 12px rgba(251, 191, 36, 0.25)'
        }}>
          <Award size={32} color="#d97706" fill="#d97706" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 6, letterSpacing: '0.5px' }}>🏆 TOP RATED SUPPLIER</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#78350f' }}>{topSupplier.name || topSupplier.supplier}</span>
              <StarRating rating={topSupplier.rating || 0} size={16} />
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>
                {topSupplier.orders || topSupplier.totalOrders || 0} orders
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
        {loading
          ? Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ 
              background: '#fff', 
              border: '1px solid #e5e7eb', 
              borderRadius: 12, 
              padding: '20px 24px',
              height: 200
            }}>
              <div style={{ height: 20, background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4, marginBottom: 16 }} />
              <div style={{ height: 16, background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4, marginBottom: 12, width: '60%' }} />
              <div style={{ height: 14, background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 14, background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4 }} />
            </div>
          ))
          : filtered.length === 0
            ? (
              <div style={{ 
                gridColumn: '1 / -1',
                background: '#fff', 
                border: '1px solid #e5e7eb', 
                borderRadius: 12, 
                padding: 48,
                textAlign: 'center'
              }}>
                <Star size={48} style={{ color: '#d1d5db', marginBottom: 12 }} />
                <div style={{ fontSize: 15, color: '#6b7280', fontWeight: 600 }}>No suppliers found</div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Try adjusting your search</div>
              </div>
            )
            : filtered.map((supplier, i) => {
              const badge = getRatingBadge(supplier.rating || 0)
              const isTop = i === 0
              return (
                <div 
                  key={i} 
                  style={{ 
                    background: '#fff', 
                    border: isTop ? '2px solid #fbbf24' : '1px solid #e5e7eb',
                    borderRadius: 12, 
                    padding: '20px 24px',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isTop ? '0 4px 12px rgba(251, 191, 36, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = isTop ? '0 4px 12px rgba(251, 191, 36, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  {isTop && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 12, 
                      right: 12,
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Award size={12} />
                      #1
                    </div>
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0c3b73', margin: 0, marginBottom: 8 }}>
                      {supplier.name || supplier.supplier}
                    </h3>
                    <div style={{ marginBottom: 12 }}>
                      <StarRating rating={supplier.rating || 0} />
                    </div>
                    <div style={{ display: 'inline-block' }}>
                      <span style={{ 
                        fontSize: 11, 
                        fontWeight: 700, 
                        padding: '4px 12px', 
                        borderRadius: 20, 
                        background: badge.bg,
                        color: badge.color,
                        border: `1.5px solid ${badge.border}`
                      }}>
                        {badge.text}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12,
                      padding: '10px 12px',
                      background: '#f9fafb',
                      borderRadius: 8
                    }}>
                      <Package size={18} style={{ color: '#3b82f6' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>Total Orders</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#1e3a8a' }}>{supplier.orders || supplier.totalOrders || 0}</div>
                      </div>
                    </div>

                    {supplier.onTime && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12,
                        padding: '10px 12px',
                        background: '#f9fafb',
                        borderRadius: 8
                      }}>
                        <Clock size={18} style={{ color: '#8b5cf6' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>On-Time Delivery</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#6b21a8' }}>{supplier.onTime}</div>
                        </div>
                      </div>
                    )}

                    {supplier.quality && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12,
                        padding: '10px 12px',
                        background: '#f9fafb',
                        borderRadius: 8
                      }}>
                        <TrendingUp size={18} style={{ color: '#10b981' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>Quality Score</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#065f46' }}>{supplier.quality}</div>
                        </div>
                      </div>
                    )}

                    {supplier.service && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8,
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                        borderRadius: 8,
                        border: '1px solid #22c55e'
                      }}>
                        <ThumbsUp size={16} style={{ color: '#166534' }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
                          Service: {supplier.service}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
        }
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
