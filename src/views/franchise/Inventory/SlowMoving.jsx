/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { TrendingDown, Search, Download } from 'lucide-react'
import TablePagination from '../components/TablePagination'

const ALL_MOCK = [
  { name: 'Amlodipine 5mg Tablet',    cat: 'Cardiac',    totalSold: 12, avgMonthly: 4, stockQty: 960, valueNum: 3000  },
  { name: 'Multivitamin Syrup',        cat: 'Vitamins',   totalSold: 15, avgMonthly: 5, stockQty: 200, valueNum: 4000  },
  { name: 'Calcium + Vit D3 Tablet',   cat: 'Vitamins',   totalSold: 18, avgMonthly: 6, stockQty: 180, valueNum: 3600  },
  { name: 'Magaldrate Suspension',     cat: 'Gastro',     totalSold: 20, avgMonthly: 6, stockQty: 228, valueNum: 4840  },
  { name: 'Ferrous Ascorbate Tablet',  cat: 'Iron',       totalSold: 14, avgMonthly: 4, stockQty: 200, valueNum: 3800  },
  { name: 'Methylcobalamin 500mcg',    cat: 'Vitamins',   totalSold: 10, avgMonthly: 3, stockQty: 140, valueNum: 2800  },
  { name: 'Selenium + Zinc Tablet',    cat: 'Minerals',   totalSold: 8,  avgMonthly: 2, stockQty: 320, valueNum: 6400  },
  { name: 'Cod Liver Oil Capsule',     cat: 'Vitamins',   totalSold: 11, avgMonthly: 3, stockQty: 100, valueNum: 2500  },
]

const CATS = ['All Categories', 'Cardiac', 'Vitamins', 'Gastro', 'Iron', 'Minerals']

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function SlowMoving() {
  const [search, setSearch]   = useState('')
  const [cat, setCat]         = useState('All Categories')
  const [period, setPeriod]   = useState('Last 3 Months')
  const [page, setPage]       = useState(1)
  const [limit, setLimit]     = useState(10)

  const filtered = ALL_MOCK.filter(r =>
    (cat === 'All Categories' || r.cat === cat) &&
    (search === '' || r.name.toLowerCase().includes(search.toLowerCase()))
  )
  const paged      = filtered.slice((page - 1) * limit, page * limit)
  const totalQty   = ALL_MOCK.reduce((a, r) => a + r.stockQty, 0)
  const totalValue = ALL_MOCK.reduce((a, r) => a + r.valueNum, 0)

  const handleSearch = (val) => { setSearch(val); setPage(1) }
  const handleCat    = (val) => { setCat(val); setPage(1) }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={20} color="#9ca3af" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Slow Moving Items</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Items with very low movement — {period}</p>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 12 }}>
        {[
          { label: 'Slow Moving Items', value: String(ALL_MOCK.length), color: '#9ca3af' },
          { label: 'Total Quantity',    value: totalQty.toLocaleString('en-IN'), color: '#0c3b73' },
          { label: 'Total Value',       value: `₹${totalValue.toLocaleString('en-IN')}`, color: '#d97706' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search slow moving items..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={cat} onChange={e => handleCat(e.target.value)} style={selSt}>
          {CATS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={period} onChange={e => setPeriod(e.target.value)} style={selSt}>
          {['Last 3 Months', 'Last 1 Month', 'Last 6 Months'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['#', 'Medicine Name', 'Category', 'Total Sold', 'Avg Monthly', 'Stock Qty', 'Value (₹)', 'Action'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {paged.length === 0
                ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No records found</td></tr>
                : paged.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td style={{ color: '#9ca3af', fontWeight: 700 }}>{(page - 1) * limit + i + 1}</Td>
                  <Td style={{ fontWeight: 600, color: '#111827' }}>{r.name}</Td>
                  <Td><span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.cat}</span></Td>
                  <Td style={{ fontWeight: 700, color: '#d97706' }}>{r.totalSold}</Td>
                  <Td>{r.avgMonthly}/mo</Td>
                  <Td style={{ fontWeight: 600 }}>{r.stockQty.toLocaleString('en-IN')}</Td>
                  <Td style={{ fontWeight: 700, color: '#374151' }}>₹{r.valueNum.toLocaleString('en-IN')}</Td>
                  <Td>
                    <button style={{ fontSize: 11, fontWeight: 600, background: '#d97706', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer' }}>Offer</button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} total={filtered.length} limit={limit} onPageChange={setPage} onLimitChange={setLimit} />
      </div>
    </div>
  )
}

const selSt = { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer', outline: 'none' }
