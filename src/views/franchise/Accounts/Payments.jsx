/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { ArrowUpCircle, Plus, X, Save, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align='left' }) => <th style={{ padding:'9px 12px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:align, whiteSpace:'nowrap' }}>{c}</th>
const Td = ({ children, style={} }) => <td style={{ padding:'9px 12px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', ...style }}>{children}</td>
const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`
const LIMIT = 20
const MODES = ['All Modes','Cash','Bank Transfer','UPI','Cheque','NEFT','RTGS']

function AddPaymentModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ date:new Date().toISOString().split('T')[0], particulars:'', mode:'Cash', amount:'', partyName:'', reference:'', notes:'' })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', background:'#f9fafb', boxSizing:'border-box' }
  const lbl = { display:'block', fontSize:11, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.4px' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.particulars.trim()) { toast.error('Particulars required'); return }
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Valid amount required'); return }
    setSaving(true)
    try {
      await postRequest({ url:'/franchise/accounts/payments', cred:{...form, amount:Number(form.amount)} })
      toast.success('Payment added')
      onSaved(); onClose()
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to add payment') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:520, maxHeight:'90vh', overflow:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid #f3f4f6' }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Add Payment Voucher</h3>
          <button onClick={onClose} style={{ background:'#f3f4f6', border:'none', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={15} color="#6b7280" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={lbl}>Date *</label><input type="date" value={form.date} onChange={e=>set('date',e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Payment Mode *</label>
                <select value={form.mode} onChange={e=>set('mode',e.target.value)} style={{...inp,cursor:'pointer'}}>
                  {['Cash','Bank Transfer','UPI','Cheque','Card','NEFT','RTGS'].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div><label style={lbl}>Particulars *</label><input value={form.particulars} onChange={e=>set('particulars',e.target.value)} placeholder="Description of payment" style={inp} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={lbl}>Amount (₹) *</label><input type="number" step="0.01" min="0" value={form.amount} onChange={e=>set('amount',e.target.value)} placeholder="0.00" style={inp} /></div>
              <div><label style={lbl}>Party / Payee</label><input value={form.partyName} onChange={e=>set('partyName',e.target.value)} placeholder="To whom" style={inp} /></div>
            </div>
            <div><label style={lbl}>Reference / Txn No.</label><input value={form.reference} onChange={e=>set('reference',e.target.value)} placeholder="Cheque / UTR / Ref." style={inp} /></div>
            <div><label style={lbl}>Notes</label><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={2} style={{...inp,resize:'vertical'}} /></div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', padding:'14px 22px', borderTop:'1px solid #f3f4f6' }}>
            <button type="button" onClick={onClose} style={{ padding:'9px 20px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding:'9px 20px', borderRadius:8, border:'none', background:saving?'#94a3b8':'#dc2626', fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer', color:'#fff', display:'flex', alignItems:'center', gap:6 }}>
              <Save size={13} /> {saving ? 'Saving…' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [total, setTotal]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [grandTotal, setGrandTotal] = useState(0)
  const [loading, setLoading]   = useState(true)
  const [from, setFrom]   = useState('')
  const [to, setTo]       = useState('')
  const [search, setSearch]   = useState('')
  const [mode, setMode]       = useState('')
  const [page, setPage]       = useState(1)
  const [showAdd, setShowAdd] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(
        `/franchise/accounts/payments?from=${from}&to=${to}&page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}&mode=${mode === 'All Modes' ? '' : mode}`
      )
      const d = res.data?.data
      setPayments(d?.payments || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
      setGrandTotal(d?.grandTotal || 0)
    } catch { toast.error('Failed to load payments') }
    finally   { setLoading(false) }
  }, [from, to, page, search, mode])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = (val) => { setSearch(val); setPage(1) }
  const handleMode   = (val) => { setMode(val);   setPage(1) }

  const exportCSV = () => {
    const rows = payments.map(p => `${p.date},"${p.voucher}","${p.particulars}",${p.mode},${p.amount}`)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([`Date,Voucher,Particulars,Mode,Amount\n${rows.join('\n')}`], {type:'text/csv'}))
    a.download = `payments.csv`; a.click()
    toast.success(`Exported ${payments.length} records`)
  }

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>
      {showAdd && <AddPaymentModal onClose={() => setShowAdd(false)} onSaved={() => { setPage(1); fetchData() }} />}

      <PageHeader icon={ArrowUpCircle} title="Payments" subtitle="All payment vouchers" color="#dc2626">
        <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:12, background:'#fff', cursor:'pointer' }}>⬇ Export CSV</button>
        <button onClick={() => setShowAdd(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#dc2626', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>
          <Plus size={14} /> Add Payment
        </button>
      </PageHeader>

      {/* Summary + Filters */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 2px' }}>Total Payments</p>
          <p style={{ fontSize:24, fontWeight:800, color:'#dc2626', margin:0 }}>{fmt(grandTotal)}</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ position:'relative' }}>
            <Search size={12} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
            <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search..."
              style={{ padding:'7px 10px 7px 26px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, outline:'none', width:180 }} />
          </div>
          <select value={mode} onChange={e => handleMode(e.target.value)}
            style={{ padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, background:'#f9fafb', cursor:'pointer' }}>
            {MODES.map(m => <option key={m} value={m==='All Modes'?'':m}>{m}</option>)}
          </select>
          <span style={{ fontSize:13 }}>From:</span>
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1) }} style={{ padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, outline:'none' }} />
          <span style={{ fontSize:13 }}>To:</span>
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1) }} style={{ padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, outline:'none' }} />
          <button onClick={() => { setFrom(''); setTo(''); setSearch(''); setMode(''); setPage(1) }}
            style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, cursor:'pointer', color:'#6b7280' }}>Clear</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr><Th c="Date" /><Th c="Voucher" /><Th c="Particulars" /><Th c="Party" /><Th c="Mode" /><Th c="Amount (₹)" align="right" /></tr></thead>
          <tbody>
            {loading
              ? Array(5).fill(0).map((_,i)=><tr key={i}>{Array(6).fill(0).map((_,j)=><td key={j} style={{ padding:'9px 12px' }}><div style={{ height:12, background:'#f3f4f6', borderRadius:4 }} /></td>)}</tr>)
              : payments.length===0
                ? <tr><td colSpan={6} style={{ padding:28, textAlign:'center', color:'#9ca3af' }}>No payments found</td></tr>
                : payments.map((p,i)=>(
                  <tr key={p._id||i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td style={{ color:'#6b7280' }}>{p.date}</Td>
                    <Td><span style={{ fontFamily:'monospace', fontSize:11, color:'#0c3b73' }}>{p.voucher}</span></Td>
                    <Td style={{ fontWeight:500 }}>{p.particulars}</Td>
                    <Td style={{ fontSize:12, color:'#6b7280' }}>{p.partyName||'—'}</Td>
                    <Td style={{ color:'#6b7280' }}>{p.mode}</Td>
                    <Td style={{ textAlign:'right', fontWeight:700, color:'#dc2626' }}>{fmt(p.amount)}</Td>
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
          <div style={{ display:'flex', gap:4, alignItems:'center' }}>
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:6, padding:'4px 8px', cursor:page===1?'not-allowed':'pointer', color:page===1?'#d1d5db':'#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1).map((p,i,arr)=>(
              <span key={p}>
                {i>0&&arr[i-1]!==p-1&&<span style={{ color:'#9ca3af', padding:'0 4px', fontSize:12 }}>…</span>}
                <button onClick={()=>setPage(p)} style={{ minWidth:30, height:30, borderRadius:6, border:'1px solid', fontSize:12, fontWeight:p===page?700:400, cursor:'pointer',
                  background:p===page?'#dc2626':'#fff', color:p===page?'#fff':'#374151', borderColor:p===page?'#dc2626':'#e5e7eb' }}>{p}</button>
              </span>
            ))}
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}
              style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:6, padding:'4px 8px', cursor:page>=totalPages?'not-allowed':'pointer', color:page>=totalPages?'#d1d5db':'#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
