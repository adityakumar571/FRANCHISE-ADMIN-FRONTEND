/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { TrendingDown, Search, Download } from 'lucide-react'
import TablePagination from '../components/TablePagination'

const ALL_MOCK = [
  { name: 'Nimusulide 100 mg',       batch: 'NIM2581',  lastSold: '12/11/2024', daysInactive: 191, qty: 150, mrp: 10.00, value: 1500 },
  { name: 'Ofloxacin OT Eye Drop',   batch: 'OFL2045',  lastSold: '16/10/2024', daysInactive: 217, qty: 100, mrp: 13.50, value: 1350 },
  { name: 'Clotrimazole 1% Tube',    batch: 'CLO7345',  lastSold: '05/10/2024', daysInactive: 228, qty: 180, mrp: 15.20, value: 2736 },
  { name: 'Ketoconazole Shampoo',    batch: 'KET4523',  lastSold: '11/09/2024', daysInactive: 252, qty: 120, mrp: 11.20, value: 1344 },
  { name: 'Brocoli-D Tablet',        batch: 'BRO0812',  lastSold: '01/08/2024', daysInactive: 292, qty: 80,  mrp: 22.50, value: 1800 },
  { name: 'Diphenhydramine 25mg',    batch: 'DIP1234',  lastSold: '15/07/2024', daysInactive: 309, qty: 60,  mrp: 8.00,  value: 480  },
  { name: 'Ranitidine 150mg',        batch: 'RAN9901',  lastSold: '20/06/2024', daysInactive: 334, qty: 200, mrp: 5.00,  value: 1000 },
]

const PER_PAGE = 10
const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function DeadStock() {
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const [limit, setLimit]   = useState(PER_PAGE)

  const filtered   = ALL_MOCK.filter(r => search === '' || r.name.toLowerCase().includes(search.toLowerCase()))
  const paged      = filtered.slice((page - 1) * limit, page * limit)
  const totalQty   = ALL_MOCK.reduce((a, r) => a + r.qty, 0)
  const totalVal   = ALL_MOCK.reduce((a, r) => a + r.value, 0)

  const handleSearch = (val) => { setSearch(val); setPage(1) }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={20} color="#6b7280" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Dead Stock</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Items with no sale movement for 90+ days</p>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Dead Items', value: String(ALL_MOCK.length), color: '#6b7280' },
          { label: 'Total Quantity',   value: totalQty.toLocaleString('en-IN'), color: '#0c3b73' },
          { label: 'Total Value',      value: `₹${totalVal.toLocaleString('en-IN')}`, color: '#dc2626' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search dead stock by medicine name..."
            style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Medicine Name', 'Batch No.', 'Last Sold Date', 'Days Inactive', 'Qty', 'MRP (₹)', 'Value (₹)', 'Action'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {paged.length === 0
                ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No records found</td></tr>
                : paged.map((r, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td style={{ fontWeight: 600 }}>{r.name}</Td>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{r.batch}</span></Td>
                  <Td style={{ color: '#6b7280' }}>{r.lastSold}</Td>
                  <Td><span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{r.daysInactive} days</span></Td>
                  <Td style={{ fontWeight: 600 }}>{r.qty}</Td>
                  <Td>₹{r.mrp.toFixed(2)}</Td>
                  <Td style={{ fontWeight: 600, color: '#dc2626' }}>₹{r.value.toLocaleString('en-IN')}</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button style={{ fontSize: 11, fontWeight: 600, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 8px', cursor: 'pointer' }}>Promote</button>
                      <button style={{ fontSize: 11, fontWeight: 600, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 8px', cursor: 'pointer' }}>Return</button>
                    </div>
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
