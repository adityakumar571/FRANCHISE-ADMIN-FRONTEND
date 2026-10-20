/* eslint-disable prettier/prettier */
import { useState, useCallback, useRef } from 'react'
import { History, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Calendar, BarChart3 } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const PERIODS = [{ v: '7', l: '7 Days' }, { v: '30', l: '30 Days' }, { v: '60', l: '60 Days' }, { v: '90', l: '90 Days' }]

export default function PriceHistory() {
  const [medicine, setMedicineInput] = useState('Paracetamol 650mg')
  const [days, setDays] = useState('30')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef()

  const fetch = useCallback(async (med, d) => {
    if (!med) return
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/live-rates/price-history?medicine=${encodeURIComponent(med)}&days=${d}`)
      setData(res.data?.data)
    } catch { toast.error('Failed to load price history') }
    finally { setLoading(false) }
  }, [])

  const handleSearch = () => fetch(medicine, days)
  const handleMedChange = (val) => {
    setMedicineInput(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetch(val, days), 600)
  }

  const minP = data?.minPrice
  const maxP = data?.maxPrice
  const avgP = data?.avgPrice
  
  // Calculate trend
  const history = data?.history || []
  const firstPrice = history[0]?.price || 0
  const lastPrice = history[history.length - 1]?.price || 0
  const priceChange = lastPrice - firstPrice
  const priceChangePercent = firstPrice ? ((priceChange / firstPrice) * 100).toFixed(1) : 0
  const isIncreasing = priceChange > 0

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header with gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', 
        borderRadius: 16, 
        padding: '28px 32px',
        boxShadow: '0 4px 20px rgba(8, 145, 178, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 180, height: 180, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <History size={28} color="#fff" />
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Price History</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Track historical price trends and analyze market movements</p>
        </div>
      </div>

      {/* Search Controls */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input 
            value={medicine} 
            onChange={e => handleMedChange(e.target.value)}
            placeholder="Enter medicine name..."
            style={{ 
              flex: '1 1 280px', 
              padding: '11px 14px', 
              border: '2px solid #e5e7eb', 
              borderRadius: 10, 
              fontSize: 14, 
              outline: 'none', 
              background: '#f9fafb',
              transition: 'all 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#0891b2'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
          
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PERIODS.map(p => (
              <button
                key={p.v}
                onClick={() => { setDays(p.v); fetch(medicine, p.v) }}
                style={{
                  padding: '10px 16px',
                  border: days === p.v ? '2px solid #0891b2' : '1px solid #e5e7eb',
                  borderRadius: 8,
                  background: days === p.v ? '#cffafe' : '#fff',
                  color: days === p.v ? '#0e7490' : '#6b7280',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {p.l}
              </button>
            ))}
          </div>

          <button 
            onClick={handleSearch}
            style={{ 
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: 10, 
              background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', 
              color: '#fff', 
              fontSize: 14, 
              fontWeight: 700, 
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(8, 145, 178, 0.2)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            Load History
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!data && !loading && (
        <div style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
          border: '2px dashed #0891b2', 
          borderRadius: 12, 
          padding: 48, 
          textAlign: 'center' 
        }}>
          <History size={56} style={{ color: '#0891b2', margin: '0 auto 16px', display: 'block' }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>
            Search for a Medicine
          </div>
          <div style={{ fontSize: 13, color: '#0e7490' }}>
            Enter medicine name above to view historical price trends
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ 
          background: '#fff', 
          border: '1px solid #e5e7eb', 
          borderRadius: 12, 
          padding: 48, 
          textAlign: 'center' 
        }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            margin: '0 auto 16px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #0891b2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 600 }}>Loading price history...</div>
        </div>
      )}

      {/* Price Data */}
      {data && !loading && (
        <>
          {/* Statistics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', 
              border: '2px solid #22c55e',
              borderRadius: 12, 
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: 14
            }}>
              <ArrowDownCircle size={32} style={{ color: '#166534' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#166534', fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' }}>LOWEST PRICE</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#14532d' }}>₹{minP?.toFixed(2)}</div>
              </div>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 
              border: '2px solid #ef4444',
              borderRadius: 12, 
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: 14
            }}>
              <ArrowUpCircle size={32} style={{ color: '#991b1b' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' }}>HIGHEST PRICE</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#7f1d1d' }}>₹{maxP?.toFixed(2)}</div>
              </div>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
              border: '2px solid #3b82f6',
              borderRadius: 12, 
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: 14
            }}>
              <BarChart3 size={32} style={{ color: '#1e40af' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' }}>AVERAGE PRICE</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#1e3a8a' }}>₹{avgP?.toFixed(2)}</div>
              </div>
            </div>

            <div style={{ 
              background: isIncreasing 
                ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' 
                : 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', 
              border: isIncreasing ? '2px solid #ef4444' : '2px solid #22c55e',
              borderRadius: 12, 
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: 14
            }}>
              {isIncreasing ? (
                <TrendingUp size={32} style={{ color: '#991b1b' }} />
              ) : (
                <TrendingDown size={32} style={{ color: '#166534' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: 11, 
                  color: isIncreasing ? '#991b1b' : '#166534', 
                  fontWeight: 700, 
                  marginBottom: 4, 
                  letterSpacing: '0.5px' 
                }}>
                  PRICE TREND
                </div>
                <div style={{ 
                  fontSize: 26, 
                  fontWeight: 800, 
                  color: isIncreasing ? '#7f1d1d' : '#14532d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {isIncreasing ? '+' : ''}{priceChangePercent}%
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div style={{ 
            background: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: 12, 
            padding: '24px 28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0c3b73' }}>
                  {data.medicine}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <Calendar size={14} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                    Price trend over last {days} days
                  </span>
                </div>
              </div>
              <div style={{ 
                padding: '8px 16px',
                background: isIncreasing 
                  ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                  : 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                borderRadius: 8,
                border: isIncreasing ? '1px solid #ef4444' : '1px solid #22c55e',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                {isIncreasing ? (
                  <TrendingUp size={16} style={{ color: '#991b1b' }} />
                ) : (
                  <TrendingDown size={16} style={{ color: '#166534' }} />
                )}
                <span style={{ 
                  fontSize: 13, 
                  fontWeight: 700, 
                  color: isIncreasing ? '#991b1b' : '#166534' 
                }}>
                  {isIncreasing ? 'Increasing' : 'Decreasing'}
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} 
                  axisLine={{ stroke: '#e5e7eb' }} 
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} 
                  axisLine={{ stroke: '#e5e7eb' }} 
                  tickLine={false}
                  tickFormatter={v => `₹${v}`}
                  domain={['auto', 'auto']}
                  width={50}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 10, 
                    border: 'none', 
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontWeight: 600
                  }} 
                  formatter={v => [`₹${v}`, 'Price']}
                  labelStyle={{ fontWeight: 700, color: '#0c3b73' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#0891b2" 
                  strokeWidth={3}
                  fill="url(#priceGradient)"
                  dot={{ r: 4, fill: '#0891b2', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#0891b2', strokeWidth: 3, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
}
