/* eslint-disable prettier/prettier */
/**
 * Screen 50 — Scheme Comparison
 */
import { useState } from 'react'
import { Tag, Search, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { SCHEMES } from './liveRatesMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function SchemeComparison() {
  const [search, setSearch] = useState('Paracetamol 650mg Tablet')

  const bestScheme = SCHEMES[0]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Tag} title="Scheme Comparison" subtitle="Compare schemes offered by all suppliers" color="#d97706">
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Plus size={12} /> Add More Items
        </button>
      </PageHeader>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Search */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicine..."
                style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Scheme Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <Th c="Supplier" /><Th c="Discount" align="center" /><Th c="Scheme" />
                  <Th c="Free Items" /><Th c="Target" /><Th c="Validity" /><Th c="Net Price (₹)" align="right" />
                </tr></thead>
                <tbody>
                  {SCHEMES.map((s, i) => (
                    <tr key={i}
                      style={{ background: i === 0 ? '#fffbeb' : '' }}
                      onMouseEnter={e => { if (i !== 0) e.currentTarget.style.background = '#fafafa' }}
                      onMouseLeave={e => { if (i !== 0) e.currentTarget.style.background = '' }}>
                      <Td>
                        <span style={{ fontWeight: 600 }}>{s.supplier}</span>
                        {i === 0 && <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>BEST</span>}
                      </Td>
                      <Td style={{ textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{s.discount}</Td>
                      <Td style={{ fontWeight: 500 }}>{s.scheme}</Td>
                      <Td style={{ color: '#0c3b73', fontWeight: 600 }}>{s.freeItems}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.target || 'No Target'}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.validity}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700, color: i === 0 ? '#16a34a' : '#111827' }}>₹ {s.netPrice.toFixed(2)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Best Scheme Banner */}
          <div style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)', borderRadius: 12, padding: '16px 20px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>🏆</span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>Best Scheme</p>
                <p style={{ margin: '3px 0 0', fontSize: 12, opacity: 0.9 }}>{bestScheme.supplier} — {bestScheme.scheme}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>You will save extra</p>
              <p style={{ margin: '3px 0 0', fontSize: 20, fontWeight: 900 }}>₹ 1,320.00</p>
            </div>
          </div>
        </div>
      </div>
  )
}
