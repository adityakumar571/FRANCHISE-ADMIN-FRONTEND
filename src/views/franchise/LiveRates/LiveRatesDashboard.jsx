/* eslint-disable prettier/prettier */
/**
 * Screen 47 — Live Medicine Rates Dashboard
 */
import { useState } from 'react'
import { Zap, Search, RefreshCw, TrendingUp, TrendingDown, Users, Package, Tag } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { MEDICINES } from './liveRatesMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function LiveRatesDashboard() {
  const [search, setSearch]     = useState('Paracetamol')
  const [strength, setStrength] = useState('All Strength')
  const [packSize, setPackSize] = useState('All Pack Size')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Zap} title="Live Medicine Rates" subtitle="Live updated rates from verified suppliers" color="#fabf22">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
          Rates auto-updated just now
        </span>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Medicines',  value: '12,458',  icon: Package,   color: '#0c3b73', bg: '#e0e7ff' },
          { label: 'Rates Updated',    value: '289',     icon: RefreshCw, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Active Suppliers', value: '24',      icon: Users,     color: '#d97706', bg: '#fef3c7' },
          { label: 'Categories',       value: '24',      icon: Tag,       color: '#7c3aed', bg: '#f5f3ff' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={18} color={k.color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{k.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '2px 0 0' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicine by name / salt / brand"
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={strength} onChange={e => setStrength(e.target.value)} style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#f9fafb', cursor: 'pointer' }}>
          <option>All Strength</option><option>500mg</option><option>650mg</option>
        </select>
        <select value={packSize} onChange={e => setPackSize(e.target.value)} style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#f9fafb', cursor: 'pointer' }}>
          <option>All Pack Size</option><option>10x10</option><option>10x15</option>
        </select>
        <button style={{ padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer', color: '#374151' }}>Filters</button>
        <button style={{ padding: '9px 16px', border: 'none', borderRadius: 8, fontSize: 12, background: '#0c3b73', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Search</button>
      </div>

      {/* Live Status Banner */}
      <div style={{ background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Rates are updated just now</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Auto-refreshes every 5 minutes</span>
      </div>

      {/* Live Rates Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Live Rates — Real Time</p>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#dcfce7', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> LIVE
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Medicine" /><Th c="Strength" /><Th c="Pack" />
              <Th c="Lowest Price" align="right" /><Th c="Highest Price" align="right" /><Th c="Avg. Price" align="right" /><Th c="Trend" align="center" />
            </tr></thead>
            <tbody>
              {MEDICINES.map((m, i) => (
                <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <Td style={{ fontWeight: 600 }}>{m.name}</Td>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{m.strength}</Td>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{m.pack}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹ {m.lowestPrice.toFixed(2)}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600 }}>₹ {m.highestPrice.toFixed(2)}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600 }}>₹ {m.avgPrice.toFixed(2)}</Td>
                  <Td style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: m.up ? '#16a34a' : '#dc2626' }}>
                      {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {m.trend}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
