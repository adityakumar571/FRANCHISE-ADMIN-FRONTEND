/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Zap, Search, Download } from 'lucide-react'
import TablePagination from '../components/TablePagination'

const ALL_MOCK = [
  { name: 'Crocin 650 Tablet',        cat: 'Pain Relief', totalSold: 1250, avgMonthly: 416, stockQty: 512, salesValue: 18760 },
  { name: 'Paracetamol 650mg',         cat: 'Pain Relief', totalSold: 1160, avgMonthly: 386, stockQty: 380, salesValue: 11550 },
  { name: 'Amoxicillin 500mg',         cat: 'Antibiotics', totalSold: 980,  avgMonthly: 326, stockQty: 200, salesValue: 24990 },
  { name: 'Pantop DSR Capsule',        cat: 'Gastro',      totalSold: 875,  avgMonthly: 291, stockQty: 300, salesValue: 18250 },
  { name: 'Dolo 650 Tablet',           cat: 'Pain Relief', totalSold: 760,  avgMonthly: 253, stockQty: 140, salesValue: 11400 },
  { name: 'Azithromycin 500mg',        cat: 'Antibiotics', totalSold: 680,  avgMonthly: 226, stockQty: 90,  salesValue: 17000 },
  { name: 'Cetirizine 10mg Tablet',    cat: 'Antihistamine',totalSold: 620, avgMonthly: 206, stockQty: 450, salesValue: 9300  },
  { name: 'Metformin 500mg Tablet',    cat: 'Antidiabetic', totalSold: 580, avgMonthly: 193, stockQty: 320, salesValue: 7540  },
  { name: 'Omeprazole 20mg Capsule',   cat: 'Gastro',      totalSold: 540,  avgMonthly: 180, stockQty: 260, salesValue: 10800 },
  { name: 'Atorvastatin 10mg Tablet',  cat: 'Cardiac',     totalSold: 490,  avgMonthly: 163, stockQty: 180, salesValue: 13720 },
]

const CATS = ['All Categories', 'Pain Relief', 'Antibiotics', 'Gastro', 'Antihistamine', 'Antidiabetic', 'Cardiac']

const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function FastMoving() {
  const [search, setSearch] = useState('')
  const [cat, setCat]       = useState('All Categories')
  const [period, setPeriod] = useState('Last 3 Months')
  const [page, setPage]     = useState(1)
  const [limit, setLimit]   = useState(10)

  const filtered = ALL_MOCK.filter(r =>
    (cat === 'All Categories' || r.cat === cat) &&
    (search === '' || r.name.toLowerCase().includes(search.toLowerCase()))
  )
  const paged      = filtered.slice((page - 1) * limit, page * limit)
  const totalSold  = ALL_MOCK.reduce((a, r) => a + r.totalSold, 0)
  const totalValue = ALL_MOCK.reduce((a, r) => a + r.salesValue, 0)

  const handleSearch = (val) => { setSearch(val); setPage(1) }
  const handleCat    = (val) => { setCat(val); setPage(1) }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="#16a34a" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Fast Moving Items</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Top selling items — {period}</p>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 12 }}>
        {[
          { label: 'Fast Moving Items', value: String(ALL_MOCK.length), color: '#16a34a' },
          { label: 'Total Qty Sold',    value: totalSold.toLocaleString('en-IN'), color: '#0c3b73' },
          { label: 'Total Sales Value', value: `₹${totalValue.toLocaleString('en-IN')}`, color: '#7c3aed' },
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
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search fast moving items..."
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
              <tr>{['#', 'Medicine Name', 'Category', 'Total Sold', 'Avg Monthly', 'Stock Qty', 'Sales Value (₹)', 'Action'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {paged.length === 0
                ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No records found</td></tr>
                : paged.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td style={{ color: '#9ca3af', fontWeight: 700 }}>{(page - 1) * limit + i + 1}</Td>
                  <Td style={{ fontWeight: 600, color: '#111827' }}>{r.name}</Td>
                  <Td><span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.cat}</span></Td>
                  <Td style={{ fontWeight: 700, color: '#16a34a' }}>{r.totalSold.toLocaleString('en-IN')}</Td>
                  <Td>{r.avgMonthly}/mo</Td>
                  <Td style={{ fontWeight: 600, color: r.stockQty < 150 ? '#d97706' : '#374151' }}>{r.stockQty.toLocaleString('en-IN')}</Td>
                  <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹{r.salesValue.toLocaleString('en-IN')}</Td>
                  <Td>
                    <button style={{ fontSize: 11, fontWeight: 600, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer' }}>Reorder</button>
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
