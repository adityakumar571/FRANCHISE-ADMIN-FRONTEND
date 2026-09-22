/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { FileText, Plus, X, Save, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const fmt = (n) => n!=null ? `₹${Number(n).toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—'
const EMPTY_LINE = { account:'', debit:'', credit:'', narration:'' }
const LIMIT = 20

function AddJournalModal({ onClose, onSaved }) {
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const [narration, setNarration] = useState('')
  const [lines, setLines]     = useState([{...EMPTY_LINE},{...EMPTY_LINE}])
  const [saving, setSaving]   = useState(false)

  const setLine  = (i,k,v) => setLines(p=>p.map((l,idx)=>idx===i?{...l,[k]:v}:l))
  const addLine  = () => setLines(p=>[...p,{...EMPTY_LINE}])
  const delLine  = (i) => setLines(p=>p.filter((_,idx)=>idx!==i))
  const totalDebit  = lines.reduce((s,l)=>s+Number(l.debit||0),0)
  const totalCredit = lines.reduce((s,l)=>s+Number(l.credit||0),0)
  const balanced    = Math.abs(totalDebit-totalCredit)<0.01
  const inp = { width:'100%', padding:'7px 9px', border:'1px solid #e5e7eb', borderRadius:6, fontSize:12, outline:'none', background:'#f9fafb', boxSizing:'border-box' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!balanced)        { toast.error('Debit and Credit must be equal'); return }
    if (totalDebit===0)   { toast.error('Amount cannot be zero'); return }
    const validLines = lines.filter(l=>l.account.trim())
    if (validLines.length<2) { toast.error('At least 2 account lines required'); return }
    setSaving(true)
    try {
      await postRequest({ url:'/franchise/accounts/journal', cred:{ date, narration, lines:validLines.map(l=>({...l,debit:Number(l.debit||0),credit:Number(l.credit||0)})) } })
      toast.success('Journal entry added')
      onSaved(); onClose()
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to add entry') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:680, maxHeight:'92vh', overflow:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid #f3f4f6' }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>New Journal Entry</h3>
          <button onClick={onClose} style={{ background:'#f3f4f6', border:'none', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={15} color="#6b7280" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:12 }}>
              <div><label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Date *</label>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ width:'100%', padding:'9px 12px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', background:'#f9fafb', boxSizing:'border-box' }} />
              </div>
              <div><label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Narration</label>
                <input value={narration} onChange={e=>setNarration(e.target.value)} placeholder="Description" style={{ width:'100%', padding:'9px 12px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', background:'#f9fafb', boxSizing:'border-box' }} />
              </div>
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label style={{ fontSize:13, fontWeight:700, color:'#374151' }}>Journal Lines</label>
                <button type="button" onClick={addLine} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 12px', borderRadius:6, border:'1px solid #0c3b7340', background:'#0c3b7310', color:'#0c3b73', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  <Plus size={13} /> Add Line
                </button>
              </div>
              <div style={{ border:'1px solid #e5e7eb', borderRadius:8, overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead><tr style={{ background:'#f9fafb' }}>
                    {['Account Name','Debit (₹)','Credit (₹)','Narration',''].map(h=>(
                      <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontWeight:600, color:'#374151', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {lines.map((line,i)=>(
                      <tr key={i} style={{ borderTop:'1px solid #f3f4f6' }}>
                        <td style={{ padding:'5px 8px' }}><input value={line.account} onChange={e=>setLine(i,'account',e.target.value)} placeholder="Account name" style={inp} /></td>
                        <td style={{ padding:'5px 8px' }}><input type="number" step="0.01" min="0" value={line.debit} onChange={e=>setLine(i,'debit',e.target.value)} placeholder="0.00" style={{...inp,width:90}} /></td>
                        <td style={{ padding:'5px 8px' }}><input type="number" step="0.01" min="0" value={line.credit} onChange={e=>setLine(i,'credit',e.target.value)} placeholder="0.00" style={{...inp,width:90}} /></td>
                        <td style={{ padding:'5px 8px' }}><input value={line.narration} onChange={e=>setLine(i,'narration',e.target.value)} placeholder="Line narration" style={inp} /></td>
                        <td style={{ padding:'5px 8px', textAlign:'center' }}>
                          {lines.length>2 && <button type="button" onClick={()=>delLine(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'#dc2626' }}><Trash2 size={13} /></button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background:'#f9fafb', borderTop:'2px solid #e5e7eb' }}>
                      <td style={{ padding:'8px 10px', fontWeight:700, fontSize:12 }}>Totals</td>
                      <td style={{ padding:'8px 10px', fontWeight:800, color:'#dc2626', fontSize:13 }}>{fmt(totalDebit)}</td>
                      <td style={{ padding:'8px 10px', fontWeight:800, color:'#16a34a', fontSize:13 }}>{fmt(totalCredit)}</td>
                      <td colSpan={2} style={{ padding:'8px 10px' }}>
                        {balanced
                          ? <span style={{ fontSize:11, fontWeight:700, color:'#16a34a', background:'#dcfce7', padding:'2px 8px', borderRadius:10 }}>✓ Balanced</span>
                          : <span style={{ fontSize:11, fontWeight:700, color:'#dc2626', background:'#fee2e2', padding:'2px 8px', borderRadius:10 }}>✗ Diff: {fmt(Math.abs(totalDebit-totalCredit))}</span>
                        }
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', padding:'14px 22px', borderTop:'1px solid #f3f4f6' }}>
            <button type="button" onClick={onClose} style={{ padding:'9px 20px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving||!balanced} style={{ padding:'9px 20px', borderRadius:8, border:'none', background:saving||!balanced?'#94a3b8':'#0c3b73', fontSize:13, fontWeight:600, cursor:saving||!balanced?'not-allowed':'pointer', color:'#fff', display:'flex', alignItems:'center', gap:6 }}>
              <Save size={13} /> {saving ? 'Saving…' : 'Post Journal Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Journal() {
  const [entries, setEntries]       = useState([])
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [from, setFrom]             = useState('')
  const [to, setTo]                 = useState('')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [showAdd, setShowAdd]       = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/accounts/journal?from=${from}&to=${to}&page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}`)
      const d = res.data?.data
      setEntries(d?.entries || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
    } catch { toast.error('Failed to load journal') }
    finally   { setLoading(false) }
  }, [from, to, page, search])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = (val) => { setSearch(val); setPage(1) }

  const exportCSV = () => {
    const rows = entries.map(e=>`${e.date},"${e.jvNo}","${e.particulars}",${e.debit||''},${e.credit||''}`)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([`Date,JV No.,Particulars,Debit,Credit\n${rows.join('\n')}`],{type:'text/csv'}))
    a.download = `journal.csv`; a.click()
  }

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>
      {showAdd && <AddJournalModal onClose={() => setShowAdd(false)} onSaved={() => { setPage(1); fetchData() }} />}

      <PageHeader icon={FileText} title="Journal Entries" subtitle="Double-entry journal vouchers" color="#0c3b73">
        <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:12, background:'#fff', cursor:'pointer' }}>⬇ Export</button>
        <button onClick={() => setShowAdd(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#0c3b73', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>
          <Plus size={14} /> New Journal Entry
        </button>
      </PageHeader>

      {/* Filters */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'12px 16px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:180 }}>
          <Search size={12} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search JV no. or particulars..."
            style={{ width:'100%', padding:'8px 10px 8px 28px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none', background:'#f9fafb', boxSizing:'border-box' }} />
        </div>
        <span style={{ fontSize:13 }}>From:</span>
        <input type="date" value={from} onChange={e=>{ setFrom(e.target.value); setPage(1) }} style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none' }} />
        <span style={{ fontSize:13 }}>To:</span>
        <input type="date" value={to} onChange={e=>{ setTo(e.target.value); setPage(1) }} style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none' }} />
        <button onClick={() => fetchData()} style={{ padding:'7px 16px', border:'none', borderRadius:7, background:'#0c3b73', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Apply</button>
        {(from||to||search) && <button onClick={() => { setFrom(''); setTo(''); setSearch(''); setPage(1) }} style={{ padding:'7px 14px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, cursor:'pointer' }}>Clear</button>}
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>
            {['Date','JV No.','Particulars','Debit (₹)','Credit (₹)'].map(h=>(
              <th key={h} style={{ padding:'9px 12px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading
              ? Array(5).fill(0).map((_,i)=><tr key={i}>{Array(5).fill(0).map((_,j)=><td key={j} style={{ padding:'9px 12px' }}><div style={{ height:12, background:'#f3f4f6', borderRadius:4 }} /></td>)}</tr>)
              : entries.length===0
                ? <tr><td colSpan={5} style={{ padding:28, textAlign:'center', color:'#9ca3af' }}>No journal entries found</td></tr>
                : entries.map((e,i)=>(
                  <tr key={e._id||i} onMouseEnter={x=>x.currentTarget.style.background='#fafafa'} onMouseLeave={x=>x.currentTarget.style.background=''}>
                    <td style={{ padding:'9px 12px', fontSize:13, color:'#6b7280', borderBottom:'1px solid #f3f4f6' }}>{e.date}</td>
                    <td style={{ padding:'9px 12px', fontSize:13, fontFamily:'monospace', color:'#0c3b73', borderBottom:'1px solid #f3f4f6' }}>{e.jvNo}</td>
                    <td style={{ padding:'9px 12px', fontSize:13, fontWeight:500, borderBottom:'1px solid #f3f4f6' }}>{e.particulars}</td>
                    <td style={{ padding:'9px 12px', fontSize:13, textAlign:'right', fontWeight:600, color:'#dc2626', borderBottom:'1px solid #f3f4f6' }}>{fmt(e.debit)}</td>
                    <td style={{ padding:'9px 12px', fontSize:13, textAlign:'right', fontWeight:600, color:'#16a34a', borderBottom:'1px solid #f3f4f6' }}>{fmt(e.credit)}</td>
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
