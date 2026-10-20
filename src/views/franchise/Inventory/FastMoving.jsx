/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { Zap, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

const PERIODS = [{ v: 'week', l: 'This Week' }, { v: 'month', l: 'This Month' }, { v: 'year', l: 'This Year' }]
const LIMIT = 20

export default function FastMoving() {
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [period, setPeriod]       = useState('month')
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [kpis, setKpis]           = useState({ topSeller: '', totalSales: 0, revenue: 0, growth: 0 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/inventory/fast-moving?period=${period}&page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}`)
      const d = res.data?.data
      const allItems = d?.items || []
      setItems(allItems)
      setTotal(d?.total || allItems.length)
      setTotalPages(Math.ceil((d?.total || allItems.length) / LIMIT) || 1)
      setKpis(d?.kpis || { topSeller: allItems[0]?.name || 'N/A', totalSales: 0, revenue: 0, growth: 0 })
    } catch { toast.error('Failed to load fast moving items') }
    finally { setLoading(false) }
  }, [period, page, search])

  useEffect(() => { fetchData() }, [fetchData])

  const handlePeriodChange = (val) => { setPeriod(val); setPage(1) }
  const handleSearch       = (val) => { setSearch(val); setPage(1) }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header with gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', 
        borderRadius: 16, 
        padding: '28px 32px',
        boxShadow: '0 4px 20px rgba(22, 163, 74, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 180, height: 180, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Zap size={28} color="#fff" />
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Fast Moving Items</h1>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
              Top selling medicines by quantity — {total} items
            </p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Top Seller', value: loading ? '...' : (kpis.topSeller?.substring(0, 20) || 'N/A'), color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Total Sales', value: loading ? '...' : `${kpis.totalSales || 0} units`, color: '#15803d', bg: '#dcfce7' },
          { label: 'Revenue', value: loading ? '...' : `₹${Number(kpis.revenue || 0).toLocaleString('en-IN')}`, color: '#166534', bg: '#bbf7d0' },
          { label: 'Growth Rate', value: loading ? '...' : `${kpis.growth || 0}%`, color: '#14532d', bg: '#86efac' },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, border: '2px solid ' + c.bg, borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: c.color, margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{c.label}</p>
            <p style={{ fontSize: c.label === 'Top Seller' ? 16 : 24, fontWeight: 800, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={20} color="#16a34a" /> Fast Moving Items
        </h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Top selling medicines by quantity — {total} items</p>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search medicine..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={period} onChange={e => handlePeriodChange(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {PERIODS.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="#" /><Th c="Medicine Name" /><Th c="Qty Sold" align="center" /><Th c="Total Sales" align="right" /><Th c="Status" />
            </tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : items.length === 0
                  ? <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No data for selected period</td></tr>
                  : items.map((r, i) => (
                    <tr key={r.medicineId || i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td style={{ color: '#9ca3af', fontSize: 11 }}>{r.rank || (page - 1) * LIMIT + i + 1}</Td>
                      <Td style={{ fontWeight: 600 }}>{r.name}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 700 }}>{r.qty}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>{r.sales}</Td>
                      <Td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>Fast Moving</span>
                      </Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {total === 0 ? 'No records' : `Showing ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}`}
          </span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#d1d5db' : '#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, i, arr) => (
              <span key={p}>
                {i > 0 && arr[i - 1] !== p - 1 && <span style={{ color: '#9ca3af', padding: '0 4px', fontSize: 12 }}>…</span>}
                <button onClick={() => setPage(p)} style={{ minWidth: 30, height: 30, borderRadius: 6, border: '1px solid', fontSize: 12, fontWeight: p === page ? 700 : 400, cursor: 'pointer',
                  background: p === page ? '#0c3b73' : '#fff', color: p === page ? '#fff' : '#374151', borderColor: p === page ? '#0c3b73' : '#e5e7eb' }}>{p}</button>
              </span>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#d1d5db' : '#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
