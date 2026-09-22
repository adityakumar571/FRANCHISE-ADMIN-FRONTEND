/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align='left' }) => <th style={{ padding:'9px 12px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:align, whiteSpace:'nowrap' }}>{c}</th>
const Td = ({ children, style={} }) => <td style={{ padding:'9px 12px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', ...style }}>{children}</td>
const fmt = (n) => n!=null ? `₹${Number(n).toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—'
const LIMIT = 20

export default function CashBook() {
  const [entries, setEntries]           = useState([])
  const [currentBalance, setBalance]    = useState(0)
  const [openingBalance, setOpening]    = useState(0)
  const [total, setTotal]               = useState(0)
  const [totalPages, setTotalPages]     = useState(1)
  const [loading, setLoading]           = useState(true)
  const [from, setFrom]                 = useState('')
  const [to, setTo]                     = useState('')
  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/accounts/cash-book?from=${from}&to=${to}&page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}`)
      const d = res.data?.data
      setEntries(d?.entries || [])
      setBalance(d?.currentBalance || 0)
      setOpening(d?.openingBalance || 0)
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
    } catch { toast.error('Failed to load cash book') }
    finally   { setLoading(false) }
  }, [from, to, page, search])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = (val) => { setSearch(val); setPage(1) }

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>
      <PageHeader icon={BookOpen} title="Cash Book" subtitle="Track all cash inflows and outflows" color="#16a34a">
        <button onClick={() => {
          const rows = entries.map(e=>`"${e.date}","${e.voucher}","${e.particulars}",${e.cashIn||''},${e.cashOut||''},${e.balance||''}`)
          const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([`Date,Voucher,Particulars,Cash In,Cash Out,Balance\n${rows.join('\n')}`],{type:'text/csv'})); a.download='cashbook.csv'; a.click()
          toast.success(`Exported ${entries.length} entries`)
        }} style={{ padding:'7px 14px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:12 }}>
          <Download size={12} /> Export CSV
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { label:'Opening Balance', value:fmt(openingBalance), color:'#0c3b73' },
          { label:'Current Balance', value:fmt(currentBalance), color:currentBalance>=0?'#16a34a':'#dc2626' },
          { label:'Total Entries',   value:total,               color:'#374151' },
        ].map(k=>(
          <div key={k.label} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'14px 18px' }}>
            <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize:22, fontWeight:800, color:k.color, margin:0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'12px 16px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:180 }}>
          <Search size={12} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search voucher / particulars..."
            style={{ width:'100%', padding:'8px 10px 8px 28px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none', background:'#f9fafb', boxSizing:'border-box' }} />
        </div>
        <span style={{ fontSize:13, color:'#374151', fontWeight:500 }}>From:</span>
        <input type="date" value={from} onChange={e=>{ setFrom(e.target.value); setPage(1) }} style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none' }} />
        <span style={{ fontSize:13, color:'#374151', fontWeight:500 }}>To:</span>
        <input type="date" value={to} onChange={e=>{ setTo(e.target.value); setPage(1) }} style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none' }} />
        <button onClick={() => fetchData()} style={{ padding:'7px 16px', border:'none', borderRadius:7, background:'#0c3b73', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Apply</button>
        {(from||to||search) && <button onClick={() => { setFrom(''); setTo(''); setSearch(''); setPage(1) }} style={{ padding:'7px 14px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, cursor:'pointer' }}>Clear</button>}
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              <Th c="Date" /><Th c="Voucher No." /><Th c="Particulars" />
              <Th c="Cash In (₹)" align="right" /><Th c="Cash Out (₹)" align="right" /><Th c="Balance (₹)" align="right" />
            </tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_,i)=><tr key={i}>{Array(6).fill(0).map((_,j)=><td key={j} style={{ padding:'9px 12px' }}><div style={{ height:12, background:'#f3f4f6', borderRadius:4 }} /></td>)}</tr>)
                : entries.length===0
                  ? <tr><td colSpan={6} style={{ padding:28, textAlign:'center', color:'#9ca3af' }}>No entries found</td></tr>
                  : entries.map((e,i)=>(
                    <tr key={e._id||i} style={{ background:i%2===0?'#fff':'#fafafa' }} onMouseEnter={x=>x.currentTarget.style.background='#f0f4ff'} onMouseLeave={x=>x.currentTarget.style.background=i%2===0?'#fff':'#fafafa'}>
                      <Td style={{ color:'#6b7280' }}>{e.date}</Td>
                      <Td><span style={{ fontFamily:'monospace', fontSize:11, color:'#0c3b73' }}>{e.voucher}</span></Td>
                      <Td style={{ fontWeight:500 }}>{e.particulars}</Td>
                      <Td style={{ textAlign:'right', fontWeight:600, color:'#16a34a' }}>{e.cashIn ? fmt(e.cashIn) : '—'}</Td>
                      <Td style={{ textAlign:'right', fontWeight:600, color:'#dc2626' }}>{e.cashOut ? fmt(e.cashOut) : '—'}</Td>
                      <Td style={{ textAlign:'right', fontWeight:700, color:'#0c3b73' }}>{fmt(e.balance)}</Td>
                    </tr>
                  ))
              }
            </tbody>
            {entries.length>0 && (
              <tfoot>
                <tr style={{ background:'#f9fafb', borderTop:'2px solid #e5e7eb' }}>
                  <td colSpan={3} style={{ padding:'9px 12px', fontSize:13, fontWeight:700 }}>Closing Balance</td>
                  <td colSpan={3} style={{ padding:'9px 12px', textAlign:'right', fontSize:14, fontWeight:800, color:'#0c3b73' }}>{fmt(currentBalance)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding:'10px 16px', borderTop:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:12, color:'#6b7280' }}>
            {total===0 ? 'No records' : `Showing ${(page-1)*LIMIT+1}–${Math.min(page*LIMIT,total)} of ${total}`}
          </span>
          {totalPages > 1 && (
            <div style={{ display:'flex', gap:4, alignItems:'center' }}>
              <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
                style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:6, padding:'4px 8px', cursor:page===1?'not-allowed':'pointer', color:page===1?'#d1d5db':'#374151' }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1).map((p,i,arr)=>(
                <span key={p}>
                  {i>0&&arr[i-1]!==p-1&&<span style={{ color:'#9ca3af', padding:'0 4px', fontSize:12 }}>…</span>}
                  <button onClick={()=>setPage(p)} style={{ minWidth:30, height:30, borderRadius:6, border:'1px solid', fontSize:12, fontWeight:p===page?700:400, cursor:'pointer',
                    background:p===page?'#0c3b73':'#fff', color:p===page?'#fff':'#374151', borderColor:p===page?'#0c3b73':'#e5e7eb' }}>{p}</button>
                </span>
              ))}
              <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}
                style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:6, padding:'4px 8px', cursor:page>=totalPages?'not-allowed':'pointer', color:page>=totalPages?'#d1d5db':'#374151' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Th = ({ c, align = 'left' }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '9px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'

export default function CashBook() {
  const [entries, setEntries]       = useState([])
  const [currentBalance, setBalance] = useState(0)
  const [openingBalance, setOpening] = useState(0)
  const [loading, setLoading]        = useState(true)
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/accounts/cash-book?from=${from}&to=${to}`)
      const d = res.data?.data
      setEntries(d?.entries || [])
      setBalance(d?.currentBalance || 0)
      setOpening(d?.openingBalance || 0)
    } catch { toast.error('Failed to load cash book') }
    finally   { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [from, to])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={BookOpen} title="Cash Book" subtitle="Track all cash inflows and outflows" color="#16a34a">
        <button onClick={() => {
          const rows = entries.map(e => `"${e.date}","${e.voucher}","${e.particulars}",${e.cashIn||''},${e.cashOut||''},${e.balance||''}`)
          const csv = `Date,Voucher,Particulars,Cash In,Cash Out,Balance\n${rows.join('\n')}`
          const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=`cashbook_${from||'all'}.csv`; a.click()
          toast.success(`Exported ${entries.length} entries`)
        }} style={{ padding:'7px 14px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:12 }}>
          <Download size={12} /> Export CSV
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Opening Balance',  value: fmt(openingBalance),  color: '#0c3b73' },
          { label: 'Current Balance',  value: fmt(currentBalance),  color: currentBalance >= 0 ? '#16a34a' : '#dc2626' },
          { label: 'Total Entries',    value: entries.length,       color: '#374151' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Date Filter */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>From:</span>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>To:</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        <button onClick={fetchData} style={{ padding: '7px 16px', border: 'none', borderRadius: 7, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Apply</button>
        {(from || to) && <button onClick={() => { setFrom(''); setTo('') }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Clear</button>}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Date" /><Th c="Voucher No." /><Th c="Particulars" />
              <Th c="Cash In (₹)" align="right" /><Th c="Cash Out (₹)" align="right" /><Th c="Balance (₹)" align="right" />
            </tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j} style={{ padding: '9px 12px' }}><div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : entries.length === 0
                  ? <tr><td colSpan={6} style={{ padding: 28, textAlign: 'center', color: '#9ca3af' }}>No entries found</td></tr>
                  : entries.map((e, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <Td style={{ color: '#6b7280' }}>{e.date}</Td>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#0c3b73' }}>{e.voucher}</span></Td>
                      <Td style={{ fontWeight: 500 }}>{e.particulars}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{e.cashIn ? fmt(e.cashIn) : '—'}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>{e.cashOut ? fmt(e.cashOut) : '—'}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>{fmt(e.balance)}</Td>
                    </tr>
                  ))
              }
            </tbody>
            {entries.length > 0 && (
              <tfoot>
                <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                  <td colSpan={3} style={{ padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>Closing Balance</td>
                  <td colSpan={3} style={{ padding: '9px 12px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#0c3b73' }}>{fmt(currentBalance)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
