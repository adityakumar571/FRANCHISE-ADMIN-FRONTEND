/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Package, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c }) => <th style={{ padding:'10px 12px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{c}</th>
const Td = ({ children, style={} }) => <td style={{ padding:'11px 12px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', ...style }}>{children}</td>
const Skel = () => <div style={{ height:12, background:'#f3f4f6', borderRadius:4 }} />

export default function PurchaseHistory() {
  const navigate = useNavigate()
  const { id }   = useParams()

  const [loading, setLoading]       = useState(true)
  const [purchases, setPurchases]   = useState([])
  const [summary, setSummary]       = useState({ totalOrders:0, totalPurchase:0, totalPaid:0, totalDue:0, avgValue:0 })
  const [customerName, setName]     = useState('')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]           = useState(0)
  const PER = 8

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [purRes, custRes] = await Promise.allSettled([
        getRequest(`/franchise/customers/${id}/purchases?page=${page}&limit=${PER}`),
        getRequest(`/franchise/customers/${id}`),
      ])
      if (purRes.status === 'fulfilled') {
        const d = purRes.value.data?.data
        const list = d?.purchases || d?.invoices || (Array.isArray(d) ? d : [])
        setPurchases(list)
        setTotal(d?.total || list.length)
        setTotalPages(d?.totalPages || Math.ceil((d?.total || list.length) / PER) || 1)
        if (d?.summary) setSummary(d.summary)
        else {
          const tot = list.reduce((s,p)=>s+(p.netAmount||p.net||p.amount||0),0)
          setSummary({ totalOrders:list.length, totalPurchase:tot, totalPaid:tot, totalDue:0, avgValue: list.length ? tot/list.length : 0 })
        }
      }
      if (custRes.status === 'fulfilled') {
        const d = custRes.value.data?.data
        setName(d?.name || d?.customer?.name || '')
      }
    } catch { toast.error('Failed to load purchase history') }
    finally   { setLoading(false) }
  }, [id, page])

  useEffect(() => { fetchData() }, [fetchData])

  const displayed = search
    ? purchases.filter(p => (p.invoiceNo||p.no||'').toLowerCase().includes(search.toLowerCase()))
    : purchases

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>
      <PageHeader icon={Package} title="Purchase History" subtitle="All purchase history of this customer" color="#0c3b73">
        <button onClick={() => navigate(`/franchise/customers/${id}`)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:'#fff', color:'#374151' }}>
          <ArrowLeft size={14}/> Back
        </button>
        <button style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, background:'#fff', cursor:'pointer', color:'#374151' }}>
          <Download size={13}/> Export
        </button>
      </PageHeader>

      {customerName && (
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#0c3b73,#1a6fd4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:800, color:'#fff', flexShrink:0 }}>
            {customerName[0]?.toUpperCase()}
          </div>
          <p style={{ fontSize:14, fontWeight:700, color:'#111827', margin:0 }}>{customerName}</p>
        </div>
      )}

      {/* KPI */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12 }}>
        {[
          { l:'Total Orders',    v: loading ? '...' : summary.totalOrders,                                    c:'#0c3b73', bg:'#e0e7ff' },
          { l:'Total Purchase',  v: loading ? '...' : `₹${Number(summary.totalPurchase||0).toLocaleString('en-IN')}`, c:'#7c3aed', bg:'#f5f3ff' },
          { l:'Total Paid',      v: loading ? '...' : `₹${Number(summary.totalPaid||0).toLocaleString('en-IN')}`,     c:'#16a34a', bg:'#dcfce7' },
          { l:'Total Due',       v: loading ? '...' : `₹${Number(summary.totalDue||0).toLocaleString('en-IN')}`,      c:'#dc2626', bg:'#fee2e2' },
          { l:'Avg Order Value', v: loading ? '...' : `₹${Number(summary.avgValue||0).toFixed(2)}`,           c:'#d97706', bg:'#fef3c7' },
        ].map(s => (
          <div key={s.l} style={{ background:'#fff', borderRadius:10, padding:'16px', border:'1px solid #e5e7eb' }}>
            <p style={{ fontSize:11, color:'#6b7280', margin:'0 0 6px' }}>{s.l}</p>
            <p style={{ fontSize:18, fontWeight:700, color:s.c, margin:0 }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'12px 16px', display:'flex', gap:10, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search by invoice no..."
            style={{ width:'100%', padding:'9px 12px 9px 30px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', background:'#f9fafb', boxSizing:'border-box' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr><Th c="Invoice No."/><Th c="Date"/><Th c="Items"/><Th c="Amount (₹)"/><Th c="Paid (₹)"/><Th c="Due (₹)"/><Th c="Mode"/><Th c="Status"/></tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_,i) => <tr key={i}>{Array(8).fill(0).map((_,j) => <td key={j} style={{ padding:'11px 12px' }}><Skel/></td>)}</tr>)
                : displayed.length === 0
                  ? <tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:'#9ca3af' }}>No purchase history found</td></tr>
                  : displayed.map((o,i) => (
                    <tr key={o._id||i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <Td><span style={{ fontSize:12, fontFamily:'monospace', color:'#0c3b73', fontWeight:600 }}>{o.invoiceNo||o.no||`INV-${i+1}`}</span></Td>
                      <Td style={{fontSize:12,color:'#6b7280'}}>{o.date||o.createdAt?.split('T')[0]}</Td>
                      <Td>{o.itemCount||o.items||'—'}</Td>
                      <Td style={{fontWeight:700}}>₹{Number(o.netAmount||o.net||o.amount||0).toLocaleString('en-IN')}</Td>
                      <Td style={{fontWeight:700,color:'#16a34a'}}>₹{Number(o.paid||o.netAmount||o.net||o.amount||0).toLocaleString('en-IN')}</Td>
                      <Td style={{fontWeight:700,color:(o.due||0)>0?'#dc2626':'#16a34a'}}>₹{Number(o.due||0).toLocaleString('en-IN')}</Td>
                      <Td>
                        <span style={{ fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:20, background:'#f3f4f6', color:'#374151' }}>
                          {o.paymentMode||o.mode||'—'}
                        </span>
                      </Td>
                      <Td>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 9px', borderRadius:20, background:(o.status||'Paid')==='Paid'?'#f0fdf4':'#fffbeb', color:(o.status||'Paid')==='Paid'?'#16a34a':'#d97706', border:`1px solid ${(o.status||'Paid')==='Paid'?'#bbf7d0':'#fde68a'}` }}>
                          {o.status||'Paid'}
                        </span>
                      </Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderTop:'1px solid #f3f4f6' }}>
          <span style={{ fontSize:12, color:'#6b7280' }}>Showing {displayed.length} of {total} entries</span>
          <div style={{ display:'flex', gap:4 }}>
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page<=1} style={{ border:'1px solid #e5e7eb', borderRadius:6, padding:'5px 10px', cursor:'pointer', background:'none' }}><ChevronLeft size={14}/></button>
            <span style={{ padding:'5px 10px', fontSize:12 }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages} style={{ border:'1px solid #e5e7eb', borderRadius:6, padding:'5px 10px', cursor:'pointer', background:'none' }}><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  )
}
