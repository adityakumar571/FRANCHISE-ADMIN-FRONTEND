/* eslint-disable prettier/prettier */
/**
 * Screen 56 — Supplier Rating
 */
import { Star } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { SUPPLIER_RATINGS } from './liveRatesMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

const StarBar = ({ value, max = 5 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {Array.from({ length: max }, (_, i) => (
      <span key={i} style={{ fontSize: 13, color: i < Math.round(value) ? '#f59e0b' : '#e5e7eb' }}>★</span>
    ))}
  </div>
)

const RatingBar = ({ label, count, total, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
    <span style={{ fontSize: 12, color: '#6b7280', minWidth: 30 }}>{label}</span>
    <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${(count / total) * 100}%`, height: '100%', background: color, borderRadius: 4 }} />
    </div>
    <span style={{ fontSize: 12, color: '#6b7280', minWidth: 24, textAlign: 'right' }}>{count}</span>
  </div>
)

const OVERALL = { avg: 4.6, total: 164, breakdown: [
  { label: '5 Star', count: 82, color: '#16a34a' },
  { label: '4 Star', count: 50, color: '#84cc16' },
  { label: '3 Star', count: 20, color: '#d97706' },
  { label: '2 Star', count: 8,  color: '#f97316' },
  { label: '1 Star', count: 4,  color: '#dc2626' },
]}

export default function SupplierRating() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Star} title="Supplier Rating" subtitle="Rate and review your suppliers" color="#f59e0b" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Overall Summary Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 600 }}>Grand Summary</p>
              <p style={{ fontSize: 52, fontWeight: 900, color: '#f59e0b', margin: '0 0 4px', lineHeight: 1 }}>{OVERALL.avg}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 6 }}>
                {Array.from({length:5},(_,i)=>(
                  <span key={i} style={{ fontSize: 18, color: i < Math.round(OVERALL.avg) ? '#f59e0b' : '#e5e7eb' }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Based on {OVERALL.total} reviews</p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>Rating Breakdown</p>
              {OVERALL.breakdown.map(b => (
                <RatingBar key={b.label} label={b.label} count={b.count} total={OVERALL.total} color={b.color} />
              ))}
            </div>
          </div>

          {/* Supplier Rating Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Top Suppliers</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <Th c="Supplier" />
                  <Th c="Rating" align="center" />
                  <Th c="On-Time Delivery" align="center" />
                  <Th c="Quality" align="center" />
                  <Th c="Service" align="center" />
                  <Th c="Total Reviews" align="center" />
                </tr></thead>
                <tbody>
                  {SUPPLIER_RATINGS.map((s, i) => (
                    <tr key={i}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: `hsl(${i * 60},60%,92%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: `hsl(${i*60},60%,35%)`, flexShrink: 0 }}>
                            {s.supplier[0]}
                          </div>
                          <span style={{ fontWeight: 600 }}>{s.supplier}</span>
                        </div>
                      </Td>
                      <Td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#f59e0b' }}>{s.rating}</span>
                          <StarBar value={s.rating} />
                        </div>
                      </Td>
                      <Td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: parseFloat(s.onTime) >= 90 ? '#16a34a' : '#d97706' }}>{s.onTime}</span>
                      </Td>
                      <Td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{s.quality}</span>
                      </Td>
                      <Td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{s.service}</span>
                      </Td>
                      <Td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>{s.returns}</span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>
  )
}
