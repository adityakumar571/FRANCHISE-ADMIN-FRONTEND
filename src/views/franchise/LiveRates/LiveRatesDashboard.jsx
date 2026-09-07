/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Zap, Search, RefreshCw, TrendingUp, TrendingDown, Users, Package, Tag } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function LiveRatesDashboard() {
  const [search, setSearch]     = useState('')
  const [strength, setStrength] = useState('')
  const [packSize, setPackSize] = useState('')
  const [medicines, setMedicines] = useState([])
  const [kpi, setKpi]           = useState({ totalMedicines: 0, ratesUpdated: 0, activeSuppliers: 0, categories: 0 })
  const [loading, setLoading]   = useState(true)
  const [refreshAt, setRefreshAt] = useState(new Date())
  const debounceRef = useRef()

  const fetchRates = useCallback(async (q = search) => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/live-rates?q=${encodeURIComponent(q)}&strength=${encodeURIComponent(strength)}&pack_size=${encodeURIComponent(packSize)}&limit=20`)
      const d = res.data?.data
      setMedicines(d?.medicines || [])
      if (d?.kpi) setKpi(d.kpi)
      setRefreshAt(new Date())
    } catch { toast.error('Failed to load live rates') }
    finally   { setLoading(false) }
  }, [strength, packSize])

  useEffect(() => { fetchRates() }, [])

  const handleSearchChange = (val) => {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchRates(val), 400)
  }

  const handleSearch = () => fetchRates(search)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Zap} title="Live Medicine Rates" subtitle="Live updated rates from verified suppliers" color="#fabf22">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
          {loading ? 'Updating...' : `Updated ${refreshAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
        </span>
        <button onClick={() => fetchRates(search)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Medicines',  value: loading ? '...' : kpi.totalMedicines,  icon: Package,   color: '#0c3b73', bg: '#e0e7ff' },
          { label: 'Rates Updated',    value: loading ? '...' : kpi.ratesUpdated,    icon: RefreshCw, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Active Suppliers', value: loading ? '...' : kpi.activeSuppliers, icon: Users,     color: '#d97706', bg: '#fef3c7' },
          { label: 'Categories',       value: loading ? '...' : kpi.categories,      icon: Tag,       color: '#7c3aed', bg: '#f5f3ff' },
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
          <input value={search} onChange={e => handleSearchChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search medicine by name / salt / brand"
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={strength} onChange={e => { setStrength(e.target.value) }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#f9fafb', cursor: 'pointer' }}>
          <option value="">All Strength</option>
          {['500mg', '650mg', '40mg', '10mg', '500mg/5ml', '60000 IU'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={packSize} onChange={e => { setPackSize(e.target.value) }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#f9fafb', cursor: 'pointer' }}>
          <option value="">All Pack Size</option>
          {['Strip of 10', 'Strip of 15', 'Strip of 3', 'Strip of 4'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={handleSearch}
          style={{ padding: '9px 16px', border: 'none', borderRadius: 8, fontSize: 12, background: '#0c3b73', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          Search
        </button>
      </div>

      {/* Live banner */}
      <div style={{ background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Rates are live and updated automatically</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Auto-refreshes every 5 minutes</span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
            Live Rates — Real Time <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 400 }}>({medicines.length} medicines)</span>
          </p>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#dcfce7', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> LIVE
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Medicine" /><Th c="Strength" /><Th c="Pack" />
              <Th c="Lowest Price" align="right" /><Th c="Highest Price" align="right" /><Th c="Avg. Price" align="right" /><Th c="Trend" align="center" /><Th c="Suppliers" align="center" />
            </tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>{Array(8).fill(0).map((_, j) => (
                    <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>
                  ))}</tr>
                ))
                : medicines.length === 0
                  ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No medicines found. Try a different search.</td></tr>
                  : medicines.map((m, i) => (
                    <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td style={{ fontWeight: 600 }}>{m.name}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{m.strength || '—'}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{m.pack || '—'}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹ {m.lowestPrice?.toFixed(2)}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 600 }}>₹ {m.highestPrice?.toFixed(2)}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 600 }}>₹ {m.avgPrice?.toFixed(2)}</Td>
                      <Td style={{ textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: m.up ? '#16a34a' : '#dc2626' }}>
                          {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {m.trend}
                        </span>
                      </Td>
                      <Td style={{ textAlign: 'center', fontWeight: 600, color: '#0c3b73' }}>{m.suppliersCount}</Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
