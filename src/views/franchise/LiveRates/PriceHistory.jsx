/* eslint-disable prettier/prettier */
/**
 * Screen 55 — Price History
 */
import { useState } from 'react'
import { History, TrendingUp, TrendingDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { MEDICINES, PRICE_HISTORY } from './liveRatesMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

const HISTORY_TABLE = [
  { date: 'May 2025', price: 13.19, change: '+4.9%', up: true  },
  { date: 'Apr 2025', price: 12.58, change: '+1.1%', up: true  },
  { date: 'Mar 2025', price: 13.15, change: '+3.2%', up: true  },
  { date: 'Feb 2025', price: 11.60, change: '-2.0%', up: false },
  { date: 'Jan 2025', price: 11.12, change: '-3.1%', up: false },
  { date: 'Dec 2024', price: 11.40, change: '+2.3%', up: true  },
  { date: 'Nov 2024', price: 11.40, change: '-0.5%', up: false },
  { date: 'Oct 2024', price: 12.00, change: '-',     up: null  },
]

export default function PriceHistory() {
  const [medicine, setMedicine] = useState('Paracetamol 650mg Tablet')
  const [period, setPeriod]     = useState('Last 6 Months')

  const currentPrice = PRICE_HISTORY[PRICE_HISTORY.length - 1].price
  const lowestPrice  = Math.min(...PRICE_HISTORY.map(p => p.price))
  const highestPrice = Math.max(...PRICE_HISTORY.map(p => p.price))

  // Simple line chart using SVG
  const chartW = 400, chartH = 100
  const minP = lowestPrice - 0.5, maxP = highestPrice + 0.5
  const points = PRICE_HISTORY.map((p, i) => {
    const x = (i / (PRICE_HISTORY.length - 1)) * chartW
    const y = chartH - ((p.price - minP) / (maxP - minP)) * chartH
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={History} title="Price History" subtitle="Track price trends of medicines over time" color="#7c3aed" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Filters */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={medicine} onChange={e => setMedicine(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer', outline: 'none' }}>
              {MEDICINES.map(m => <option key={m.id}>{m.name}</option>)}
            </select>
            <select value={period} onChange={e => setPeriod(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer', outline: 'none' }}>
              {['Last 3 Months','Last 6 Months','Last 12 Months'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
            {/* Chart + History Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Price KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {[
                  { label: 'Current Price',  value: `₹ ${currentPrice.toFixed(2)}`,  color: '#0c3b73', bg: '#e0e7ff' },
                  { label: 'Lowest Price',   value: `₹ ${lowestPrice.toFixed(2)}`,   color: '#16a34a', bg: '#dcfce7' },
                  { label: 'Highest Price',  value: `₹ ${highestPrice.toFixed(2)}`,  color: '#dc2626', bg: '#fee2e2' },
                ].map(k => (
                  <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', borderLeft: `4px solid ${k.color}` }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: k.color, margin: 0 }}>{k.value}</p>
                  </div>
                ))}
              </div>

              {/* Line Chart */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 16px' }}>Price Trend — {medicine}</p>
                <div style={{ overflowX: 'auto' }}>
                  <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + 20}`} style={{ minWidth: 300 }}>
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(y => (
                      <line key={y} x1={0} y1={y} x2={chartW} y2={y} stroke="#f3f4f6" strokeWidth={1} />
                    ))}
                    {/* Line */}
                    <polyline points={points} fill="none" stroke="#0c3b73" strokeWidth={2.5} strokeLinejoin="round" />
                    {/* Area fill */}
                    <polygon points={`0,${chartH} ${points} ${chartW},${chartH}`} fill="rgba(12,59,115,0.06)" />
                    {/* Dots */}
                    {PRICE_HISTORY.map((p, i) => {
                      const x = (i / (PRICE_HISTORY.length - 1)) * chartW
                      const y = chartH - ((p.price - minP) / (maxP - minP)) * chartH
                      return <circle key={i} cx={x} cy={y} r={4} fill="#0c3b73" stroke="#fff" strokeWidth={2} />
                    })}
                    {/* X labels */}
                    {PRICE_HISTORY.map((p, i) => {
                      const x = (i / (PRICE_HISTORY.length - 1)) * chartW
                      return <text key={i} x={x} y={chartH + 16} fontSize={9} fill="#9ca3af" textAnchor="middle">{p.month.split(' ')[0]}</text>
                    })}
                  </svg>
                </div>
              </div>

              {/* History Table */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Price History Table</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><Th c="Month" /><Th c="Price (₹)" align="right" /><Th c="Change" align="center" /></tr></thead>
                  <tbody>
                    {HISTORY_TABLE.map((r, i) => (
                      <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <Td style={{ fontWeight: 500 }}>{r.date}</Td>
                        <Td style={{ textAlign: 'right', fontWeight: 700 }}>₹ {r.price.toFixed(2)}</Td>
                        <Td style={{ textAlign: 'center' }}>
                          {r.up !== null ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: r.up ? '#16a34a' : '#dc2626' }}>
                              {r.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {r.change}
                            </span>
                          ) : <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Supplier Price Comparison */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 14px' }}>Supplier Price Comparison</p>
              {[
                { name: 'Medico Agency',           price: 12.50, best: true  },
                { name: 'Life Care Distributors',  price: 13.60, best: false },
                { name: 'Apollo Pharma',           price: 14.26, best: false },
                { name: 'Sunrise Pharma',          price: 15.00, best: false },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                  <div>
                    <span style={{ fontWeight: s.best ? 700 : 500 }}>{s.name}</span>
                    {s.best && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: '#dcfce7', color: '#16a34a' }}>BEST</span>}
                  </div>
                  <span style={{ fontWeight: 700, color: s.best ? '#16a34a' : '#374151' }}>₹ {s.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  )
}
