/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { BookMarked, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const fmt = (n) => n!=null ? `₹${Number(n).toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—'
const LIMIT = 20

export default function Ledger() {
  const [entries, setEntries]       = useState([])
  const [closing, setClosing]       = useState(0)
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [account, setAccount]       = useState('')
  const [inputVal, setInputVal]     = useState('')
  const [from, setFrom]             = useState('')
  const [to, setTo]                 = useState('')
  const [page, setPage]             = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(
        `/franchise/accounts/ledger?account=${encodeURIComponent(account)}&from=${from}&to=${to}&page=${page}&limit=${LIMIT}`
      )
      const d = res.data?.data
      setEntries(d?.entries || [])
      setClosing(d?.closingBalance || 0)
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
    } catch { toast.error('Failed to load ledger') }
    finally   { setLoading(false) }
  }, [account, from, to, page])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => { setAccount(inputVal); setPage(1) }

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>
      <PageHeader icon={BookMarked} title="Ledger" subtitle="Account-wise transaction ledger" color="#0891b2" />

      {/* Search + Filters */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'12px 16px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
          <input value={inputVal} onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter') handleSearch() }}
            placeholder="Search account name and press Enter..."
            style={{ width:'100%', padding:'8px 10px 8px 28px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', background:'#f9fafb', boxSizing:'border-box' }} />
        </div>
        <span style={{ fontSize:13 }}>From:</span>
        <input type="date" value={from} onChange={e=>{ setFrom(e.target.value); setPage(1) }} style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none' }} />
        <span style={{ fontSize:13 }}>To:</span>
        <input type="date" value={to} onChange={e=>{ setTo(e.target.value); setPage(1) }} style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none' }} />
        <button onClick={handleSearch} style={{ padding:'8px 16px', border:'none', borderRadius:7, background:'#0c3b73', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Search</button>
        {(account||from||to) && (
          <button onClick={() => { setAccount(''); setInputVal(''); setFrom(''); setTo(''); setPage(1) }}
            style={{ padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, cursor:'pointer' }}>Clear</button>
        )}
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>
            {['Date','Particulars','Debit (₹)','Credit (₹)','Balance (₹)'].map((h,i)=>(
              <th key={h} style={{ padding:'9px 12px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:i>1?'right':'left', whiteSpace:'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading
              ? Array(5).fill(0).map((_,i)=><tr key={i}>{Array(5).fill(0).map((_,j)=><td key={j} style={{ padding:'9px 12px' }}><div style={{ height:12, background:'#f3f4f6', borderRadius:4 }} /></td>)}</tr>)
              : entries.length===0
                ? <tr><td colSpan={5} style={{ padding:28, textAlign:'center', color:'#9ca3af' }}>No entries found</td></tr>
                : entries.map((e,i)=>(
                  <tr key={e._id||i} onMouseEnter={x=>x.currentTarget.style.background='#fafafa'} onMouseLeave={x=>x.currentTarget.style.background=''}>
                    <td style={{ padding:'9px 12px', fontSize:13, color:'#6b7280', borderBottom:'1px solid #f3f4f6' }}>{e.date}</td>
                    <td style={{ padding:'9px 12px', fontSize:13, fontWeight:500, borderBottom:'1px solid #f3f4f6' }}>{e.particular}</td>
                    <td style={{ padding:'9px 12px', fontSize:13, textAlign:'right', fontWeight:600, color:'#dc2626', borderBottom:'1px solid #f3f4f6' }}>{e.debit ? fmt(e.debit) : '—'}</td>
                    <td style={{ padding:'9px 12px', fontSize:13, textAlign:'right', fontWeight:600, color:'#16a34a', borderBottom:'1px solid #f3f4f6' }}>{e.credit ? fmt(e.credit) : '—'}</td>
                    <td style={{ padding:'9px 12px', fontSize:13, textAlign:'right', fontWeight:700, color:'#0c3b73', borderBottom:'1px solid #f3f4f6' }}>{fmt(e.balance)}</td>
                  </tr>
                ))
            }
          </tbody>
          {entries.length>0 && (
            <tfoot>
              <tr style={{ background:'#f9fafb', borderTop:'2px solid #e5e7eb' }}>
                <td colSpan={4} style={{ padding:'9px 12px', fontSize:13, fontWeight:700 }}>Closing Balance</td>
                <td style={{ padding:'9px 12px', textAlign:'right', fontSize:14, fontWeight:800, color:'#0c3b73' }}>{fmt(closing)}</td>
              </tr>
            </tfoot>
          )}
        </table>

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
