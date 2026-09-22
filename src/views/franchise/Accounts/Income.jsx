/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`
const LIMIT = 20
const CATS  = ['Sales','Other','Discount','Interest','Commission']

export default function Income() {
  const [income, setIncome]         = useState([])
  const [grandTotal, setGrandTotal] = useState(0)
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [from, setFrom]             = useState('')
  const [to, setTo]                 = useState('')
  const [category, setCategory]     = useState('')
  const [page, setPage]             = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/accounts/income?from=${from}&to=${to}&category=${category}&page=${page}&limit=${LIMIT}`)
      const d = res.data?.data
      setIncome(d?.income || [])
      setGrandTotal(d?.grandTotal || 0)
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
    } catch { toast.error('Failed to load income') }
    finally   { setLoading(false) }
  }, [from, to, category, page])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>
      <PageHeader icon={TrendingUp} title="Income" subtitle="All income entries" color="#16a34a" />

      {/* Filters */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 2px' }}>Total Income</p>
          <p style={{ fontSize:24, fontWeight:800, color:'#16a34a', margin:0 }}>{fmt(grandTotal)}</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontSize:13 }}>From:</span>
          <input type="date" value={from} onChange={e=>{ setFrom(e.target.value); setPage(1) }} style={{ padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, outline:'none' }} />
          <span style={{ fontSize:13 }}>To:</span>
          <input type="date" value={to} onChange={e=>{ setTo(e.target.value); setPage(1) }} style={{ padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, outline:'none' }} />
          <select value={category} onChange={e=>{ setCategory(e.target.value); setPage(1) }}
            style={{ padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, background:'#f9fafb', cursor:'pointer' }}>
            <option value="">All Categories</option>
            {CATS.map(c=><option key={c}>{c}</option>)}
          </select>
          {(from||to||category) && (
            <button onClick={() => { setFrom(''); setTo(''); setCategory(''); setPage(1) }}
              style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, cursor:'pointer', color:'#6b7280' }}>Clear</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>
            {['Date','Particulars','Category','Amount (₹)'].map(h=>(
              <th key={h} style={{ padding:'9px 12px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading
              ? Array(4).fill(0).map((_,i)=><tr key={i}>{Array(4).fill(0).map((_,j)=><td key={j} style={{ padding:'9px 12px' }}><div style={{ height:12, background:'#f3f4f6', borderRadius:4 }} /></td>)}</tr>)
              : income.length===0
                ? <tr><td colSpan={4} style={{ padding:28, textAlign:'center', color:'#9ca3af' }}>No income records found</td></tr>
                : income.map((e,i)=>(
                  <tr key={e._id||i} onMouseEnter={x=>x.currentTarget.style.background='#fafafa'} onMouseLeave={x=>x.currentTarget.style.background=''}>
                    <td style={{ padding:'9px 12px', fontSize:13, color:'#6b7280', borderBottom:'1px solid #f3f4f6' }}>{e.date}</td>
                    <td style={{ padding:'9px 12px', fontSize:13, borderBottom:'1px solid #f3f4f6', fontWeight:500 }}>{e.particulars}</td>
                    <td style={{ padding:'9px 12px', fontSize:13, borderBottom:'1px solid #f3f4f6' }}>
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#f0fdf4', color:'#16a34a' }}>{e.category}</span>
                    </td>
                    <td style={{ padding:'9px 12px', fontSize:13, borderBottom:'1px solid #f3f4f6', textAlign:'right', fontWeight:700, color:'#16a34a' }}>{fmt(e.amount)}</td>
                  </tr>
                ))
            }
          </tbody>
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
                    background:p===page?'#16a34a':'#fff', color:p===page?'#fff':'#374151', borderColor:p===page?'#16a34a':'#e5e7eb' }}>{p}</button>
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
