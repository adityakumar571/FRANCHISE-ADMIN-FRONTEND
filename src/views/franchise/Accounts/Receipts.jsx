/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { ArrowDownCircle, Plus, X, Save, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align = 'left' }) => <th style={{ padding:'9px 12px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:align, whiteSpace:'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding:'9px 12px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', ...style }}>{children}</td>
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
const LIMIT = 20

const MODES = ['All Modes', 'Cash', 'Bank', 'UPI', 'Cheque']

export default function Receipts() {
  const [receipts, setReceipts] = useState([])
  const [total, setTotal]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]   = useState(true)
  const [addOpen, setAddOpen]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [from, setFrom]   = useState('')
  const [to, setTo]       = useState('')
  const [search, setSearch]     = useState('')
  const [mode, setMode]         = useState('')
  const [page, setPage]         = useState(1)
  const [form, setForm] = useState({ date: '', voucher: '', particulars: '', mode: 'Cash', amount: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(
        `/franchise/accounts/receipts?from=${from}&to=${to}&page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}&mode=${mode === 'All Modes' ? '' : mode}`
      )
      const d = res.data?.data
      setReceipts(d?.receipts || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
    } catch { toast.error('Failed to load receipts') }
    finally   { setLoading(false) }
  }, [from, to, page, search, mode])

  useEffect(() => { fetchData() }, [fetchData])

  const applyFilter = () => { setPage(1); fetchData() }
  const handleSearch = (val) => { setSearch(val); setPage(1) }
  const handleMode   = (val) => { setMode(val); setPage(1) }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.particulars) { toast.error('Fill required fields'); return }
    setSaving(true)
    try {
      await postRequest({ url: '/franchise/accounts/receipts', cred: form })
      toast.success('Receipt added')
      setAddOpen(false)
      setForm({ date: '', voucher: '', particulars: '', mode: 'Cash', amount: '' })
      setPage(1); fetchData()
    } catch { toast.error('Failed to add') }
    finally   { setSaving(false) }
  }

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>
      <PageHeader icon={ArrowDownCircle} title="Receipts" subtitle="All receipt vouchers" color="#16a34a">
        <button onClick={() => setAddOpen(true)}
          style={{ padding:'8px 16px', border:'none', borderRadius:8, background:'#16a34a', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
          <Plus size={13} /> New Receipt
        </button>
      </PageHeader>

      {/* Filters */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'12px 16px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:180 }}>
          <Search size={12} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search voucher / particulars..."
            style={{ width:'100%', padding:'8px 10px 8px 28px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none', background:'#f9fafb', boxSizing:'border-box' }} />
        </div>
        <select value={mode} onChange={e => handleMode(e.target.value)}
          style={{ padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, background:'#f9fafb', cursor:'pointer' }}>
          {MODES.map(m => <option key={m} value={m === 'All Modes' ? '' : m}>{m}</option>)}
        </select>
        <span style={{ fontSize:13 }}>From:</span>
        <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1) }}
          style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none' }} />
        <span style={{ fontSize:13 }}>To:</span>
        <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1) }}
          style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none' }} />
        <button onClick={applyFilter}
          style={{ padding:'7px 16px', border:'none', borderRadius:7, background:'#0c3b73', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Apply</button>
        {(from || to || search || mode) && (
          <button onClick={() => { setFrom(''); setTo(''); setSearch(''); setMode(''); setPage(1) }}
            style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, cursor:'pointer', color:'#6b7280' }}>Clear</button>
        )}
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr><Th c="Date" /><Th c="Voucher" /><Th c="Particulars" /><Th c="Mode" /><Th c="Amount (₹)" align="right" /></tr></thead>
          <tbody>
            {loading
              ? Array(5).fill(0).map((_,i) => <tr key={i}>{Array(5).fill(0).map((_,j) => <td key={j} style={{ padding:'9px 12px' }}><div style={{ height:12, background:'#f3f4f6', borderRadius:4 }} /></td>)}</tr>)
              : receipts.length === 0
                ? <tr><td colSpan={5} style={{ padding:28, textAlign:'center', color:'#9ca3af' }}>No receipts found</td></tr>
                : receipts.map((r, i) => (
                  <tr key={r._id || i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td style={{ color:'#6b7280' }}>{r.date}</Td>
                    <Td><span style={{ fontFamily:'monospace', fontSize:11, color:'#0c3b73' }}>{r.voucher}</span></Td>
                    <Td style={{ fontWeight:500 }}>{r.particulars}</Td>
                    <Td style={{ color:'#6b7280' }}>{r.mode}</Td>
                    <Td style={{ textAlign:'right', fontWeight:700, color:'#16a34a' }}>{fmt(r.amount)}</Td>
                  </tr>
                ))
            }
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding:'10px 16px', borderTop:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:12, color:'#6b7280' }}>
            {total === 0 ? 'No records' : `Showing ${(page-1)*LIMIT+1}–${Math.min(page*LIMIT, total)} of ${total}`}
          </span>
          <div style={{ display:'flex', gap:4, alignItems:'center' }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:6, padding:'4px 8px', cursor:page===1?'not-allowed':'pointer', color:page===1?'#d1d5db':'#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length:totalPages }, (_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1).map((p,i,arr) => (
              <span key={p}>
                {i>0 && arr[i-1]!==p-1 && <span style={{ color:'#9ca3af', padding:'0 4px', fontSize:12 }}>…</span>}
                <button onClick={() => setPage(p)} style={{ minWidth:30, height:30, borderRadius:6, border:'1px solid', fontSize:12, fontWeight:p===page?700:400, cursor:'pointer',
                  background:p===page?'#16a34a':'#fff', color:p===page?'#fff':'#374151', borderColor:p===page?'#16a34a':'#e5e7eb' }}>{p}</button>
              </span>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page>=totalPages}
              style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:6, padding:'4px 8px', cursor:page>=totalPages?'not-allowed':'pointer', color:page>=totalPages?'#d1d5db':'#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {addOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:12, padding:24, width:420 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>New Receipt</h3>
              <button onClick={() => setAddOpen(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd}>
              {[
                { label:'Date',          key:'date',         type:'date'                    },
                { label:'Voucher No.',   key:'voucher',      placeholder:'RC-001'           },
                { label:'Particulars *', key:'particulars',  placeholder:'Description'      },
                { label:'Amount (₹) *',  key:'amount',       type:'number', placeholder:'0' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:4 }}>{f.label}</label>
                  <input type={f.type||'text'} value={form[f.key]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                    style={{ width:'100%', padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none', boxSizing:'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:4 }}>Mode</label>
                <select value={form.mode} onChange={e => setForm(p=>({...p,mode:e.target.value}))}
                  style={{ width:'100%', padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none', background:'#fff' }}>
                  {['Cash','Bank','UPI','Cheque'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setAddOpen(false)} style={{ padding:'8px 18px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, cursor:'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving}
                  style={{ padding:'8px 20px', border:'none', borderRadius:7, background:saving?'#9ca3af':'#16a34a', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                  <Save size={13} /> {saving ? 'Saving...' : 'Add Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
