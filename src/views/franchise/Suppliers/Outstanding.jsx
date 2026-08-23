/* eslint-disable prettier/prettier */
/**
 * Screen 60 — Outstanding
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IndianRupee, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { OUTSTANDING_LIST } from './supplierMockData'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

const fmt = v => v > 0 ? `₹${v.toLocaleString('en-IN',{minimumFractionDigits:2})}` : '₹0.00'

export default function Outstanding() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const PER = 10

  const filtered = OUTSTANDING_LIST.filter(s =>
    search === '' || s.name.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER))
  const paged      = filtered.slice((page-1)*PER, page*PER)

  const totalPayable  = OUTSTANDING_LIST.reduce((s,x) => s + x.totalPayable, 0)
  const overdueAmt    = OUTSTANDING_LIST.reduce((s,x) => s + x.overdueAmt, 0)
  const dueToday      = OUTSTANDING_LIST.reduce((s,x) => s + x.dueToday, 0)
  const dueWeek       = OUTSTANDING_LIST.reduce((s,x) => s + x.dueWeek, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={IndianRupee} title="Outstanding" subtitle="Supplier outstanding summary" color="#dc2626" />

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total Payable',   value: totalPayable, color: '#0c3b73', bg: '#e0e7ff' },
          { label: 'Overdue Amount',  value: overdueAmt,   color: '#dc2626', bg: '#fee2e2' },
          { label: 'Due Today',       value: dueToday,     color: '#d97706', bg: '#fef3c7' },
          { label: 'Due This Week',   value: dueWeek,      color: '#7c3aed', bg: '#f5f3ff' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${k.color}` }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: k.color, margin: 0 }}>{fmt(k.value)}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search supplier..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Filter size={12} /> Filters
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Supplier Name" />
              <Th c="Total Payable (₹)" align="right" />
              <Th c="Overdue Amount (₹)" align="right" />
              <Th c="Current Due (₹)" align="right" />
              <Th c="Due Today (₹)" align="right" />
              <Th c="Due This Week (₹)" align="right" />
              <Th c="Status" />
              <Th c="Action" />
            </tr></thead>
            <tbody>
              {paged.map((s, i) => (
                <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <Td style={{ fontWeight: 600 }}>{s.name}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>{fmt(s.totalPayable)}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: s.overdueAmt > 0 ? '#dc2626' : '#374151' }}>{fmt(s.overdueAmt)}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(s.currentDue)}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: s.dueToday > 0 ? '#d97706' : '#374151' }}>{fmt(s.dueToday)}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(s.dueWeek)}</Td>
                  <Td>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: s.status==='Overdue'?'#fee2e2':'#fffbeb', color: s.status==='Overdue'?'#dc2626':'#d97706' }}>
                      {s.status}
                    </span>
                  </Td>
                  <Td>
                    <button onClick={() => navigate(`/franchise/suppliers/${i+1}/ledger`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#e0e7ff', color: '#0c3b73', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      View
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {Math.min((page-1)*PER+1,filtered.length)}–{Math.min(page*PER,filtered.length)} of {filtered.length} entries</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page===1?'default':'pointer', background: 'none', color: page===1?'#d1d5db':'#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p => (
              <button key={p} onClick={()=>setPage(p)}
                style={{ background:page===p?'#0c3b73':'none', border:`1px solid ${page===p?'#0c3b73':'#e5e7eb'}`, borderRadius:6, padding:'5px 10px', cursor:'pointer', color:page===p?'#fff':'#374151', fontSize:12 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page===totalPages?'default':'pointer', background: 'none', color: page===totalPages?'#d1d5db':'#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
