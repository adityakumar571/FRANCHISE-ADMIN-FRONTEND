/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Tag, Search, TrendingDown, Gift, Target, Calendar, Star, Filter } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c }) => <th style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', borderBottom: '2px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function SchemeComparison() {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('discount') // discount, netPrice, validity
  const [filterBy, setFilterBy] = useState('all') // all, active, expiring

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/live-rates/schemes')
        setSchemes(res.data?.data || [])
      } catch { toast.error('Failed to load schemes') }
      finally { setLoading(false) }
    })()
  }, [])

  const filtered = schemes
    .filter(s => {
      const matchesSearch = !search ||
        s.supplier?.toLowerCase().includes(search.toLowerCase()) ||
        s.medicine?.toLowerCase().includes(search.toLowerCase())
      
      if (filterBy === 'all') return matchesSearch
      
      // Add date filtering logic when validity date is available
      return matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'discount') {
        const aDisc = parseFloat(a.discount) || 0
        const bDisc = parseFloat(b.discount) || 0
        return bDisc - aDisc
      }
      if (sortBy === 'netPrice') return (a.netPrice || 0) - (b.netPrice || 0)
      return 0
    })

  const getBestValue = () => {
    if (filtered.length === 0) return null
    return filtered.reduce((best, curr) => {
      const currDisc = parseFloat(curr.discount) || 0
      const bestDisc = parseFloat(best.discount) || 0
      return currDisc > bestDisc ? curr : best
    }, filtered[0])
  }

  const bestScheme = getBestValue()

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header with gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', 
        borderRadius: 16, 
        padding: '28px 32px',
        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 180, height: 180, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Tag size={28} color="#fff" />
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Scheme Comparison</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Compare supplier schemes, discounts and special offers</p>
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
              placeholder="Search supplier or medicine..."
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
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
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
              <option value="discount">Sort by Discount</option>
              <option value="netPrice">Sort by Price</option>
              <option value="validity">Sort by Validity</option>
            </select>
          </div>

          {schemes.length > 0 && (
            <div style={{ 
              padding: '8px 16px', 
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: '#166534'
            }}>
              {filtered.length} Schemes Found
            </div>
          )}
        </div>
      </div>

      {/* Best Scheme Highlight */}
      {bestScheme && !loading && (
        <div style={{ 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
          border: '2px solid #fbbf24',
          borderRadius: 12, 
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)'
        }}>
          <Star size={24} color="#d97706" fill="#d97706" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>🏆 BEST VALUE SCHEME</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#78350f' }}>
              {bestScheme.supplier} • {bestScheme.medicine} • {bestScheme.discount} OFF • ₹{bestScheme.netPrice?.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Schemes Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Supplier', 'Medicine', 'Discount', 'Scheme Details', 'Free Items', 'Target', 'Valid Till', 'Net Price'].map(h => <Th key={h} c={h} />)}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 16, background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4 }} />
                      </td>
                    ))}
                  </tr>
                ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} style={{ padding: 48, textAlign: 'center' }}>
                        <Tag size={48} style={{ color: '#d1d5db', marginBottom: 12 }} />
                        <div style={{ fontSize: 15, color: '#6b7280', fontWeight: 600 }}>No schemes found</div>
                        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Try adjusting your search or filters</div>
                      </td>
                    </tr>
                  )
                  : filtered.map((s, i) => {
                    const isBest = s === bestScheme
                    return (
                      <tr 
                        key={i} 
                        style={{ 
                          transition: 'all 0.2s',
                          background: isBest ? 'linear-gradient(90deg, #fef9e7 0%, #fefce8 100%)' : 'transparent'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = isBest ? 'linear-gradient(90deg, #fef3c7 0%, #fef9e7 100%)' : '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = isBest ? 'linear-gradient(90deg, #fef9e7 0%, #fefce8 100%)' : 'transparent'}
                      >
                        <Td style={{ fontWeight: 700, color: '#0c3b73' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isBest && <Star size={14} color="#d97706" fill="#d97706" />}
                            {s.supplier}
                          </div>
                        </Td>
                        <Td style={{ fontWeight: 500 }}>{s.medicine}</Td>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <TrendingDown size={16} style={{ color: '#16a34a' }} />
                            <span style={{ fontWeight: 800, color: '#16a34a', fontSize: 15 }}>{s.discount}</span>
                          </div>
                        </Td>
                        <Td>
                          <span style={{ 
                            fontSize: 12, 
                            fontWeight: 700, 
                            padding: '4px 12px', 
                            borderRadius: 20, 
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                            color: '#92400e',
                            border: '1px solid #fbbf24'
                          }}>
                            {s.scheme}
                          </span>
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Gift size={14} style={{ color: '#7c3aed' }} />
                            <span style={{ fontWeight: 600, color: '#6b7280' }}>{s.freeItems || '—'}</span>
                          </div>
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Target size={14} style={{ color: '#2563eb' }} />
                            <span style={{ color: '#6b7280' }}>{s.target || '—'}</span>
                          </div>
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={14} style={{ color: '#dc2626' }} />
                            <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 500 }}>{s.validity}</span>
                          </div>
                        </Td>
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
                            ₹ {s.netPrice?.toFixed(2)}
                          </div>
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
