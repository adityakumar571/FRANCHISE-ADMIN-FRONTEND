/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { TrendingDown, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS  = ['#0c3b73','#7c3aed','#d97706','#dc2626','#0891b2','#16a34a','#6b7280']
const CATS    = ['Rent','Salary','Utilities','Transport','Office','Marketing','Maintenance','Other']
const LIMIT   = 20
const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`

function AddExpenseModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ date:new Date().toISOString().split('T')[0], particulars:'', category:'Rent', amount:'', paymentMode:'Cash', reference:'', notes:'' })
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
      await postRequest({ url:'/franchise/accounts/expenses', cred:{...form, amount:Number(form.amount)} })
      toast.success('Expense added successfully')
      onSaved(); onClose()
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to add expense') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:520, maxHeight:'90vh', overflow:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid #f3f4f6' }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Add Expense</h3>
          <button onClick={onClose} style={{ background:'#f3f4f6', border:'none', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={lbl}>Date *</label><input type="date" value={form.date} onChange={e=>set('date',e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Category *</label>
                <select value={form.category} onChange={e=>set('category',e.target.value)} style={{...inp,cursor:'pointer'}}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div><label style={lbl}>Particulars *</label><input value={form.particulars} onChange={e=>set('particulars',e.target.value)} placeholder="Description" style={inp} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={lbl}>Amount (₹) *</label><input type="number" step="0.01" min="0" value={form.amount} onChange={e=>set('amount',e.target.value)} placeholder="0.00" style={inp} /></div>
              <div><label style={lbl}>Payment Mode</label>
                <select value={form.paymentMode} onChange={e=>set('paymentMode',e.target.value)} style={{...inp,cursor:'pointer'}}>
                  {['Cash','Bank','UPI','Cheque','Card'].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div><label style={lbl}>Reference No.</label><input value={form.reference} onChange={e=>set('reference',e.target.value)} placeholder="Voucher / Reference" style={inp} /></div>
            <div><label style={lbl}>Notes</label><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={2} style={{...inp,resize:'vertical'}} /></div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', padding:'14px 22px', borderTop:'1px solid #f3f4f6' }}>
            <button type="button" onClick={onClose} style={{ padding:'9px 20px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding:'9px 20px', borderRadius:8, border:'none', background:saving?'#94a3b8':'#dc2626', fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer', color:'#fff', display:'flex', alignItems:'center', gap:6 }}>
              {saving ? 'Saving…' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Expenses() {
  const [expenses, setExpenses]     = useState([])
  const [grandTotal, setGrandTotal] = useState(0)
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [category, setCategory]     = useState('')
  const [from, setFrom]             = useState('')
  const [to, setTo]                 = useState('')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [showAdd, setShowAdd]       = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(
        `/franchise/accounts/expenses?from=${from}&to=${to}&category=${category}&page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}`
      )
      const d = res.data?.data
      setExpenses(d?.expenses || [])
      setGrandTotal(d?.grandTotal || 0)
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
    } catch { toast.error('Failed to load expenses') }
    finally   { setLoading(false) }
  }, [from, to, category, page, search])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch   = (val) => { setSearch(val); setPage(1) }
  const handleCategory = (val) => { setCategory(val); setPage(1) }

  const exportCSV = () => {
    const rows = expenses.map(e => `${e.date},"${e.particulars}",${e.category},${e.amount}`)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([`Date,Particulars,Category,Amount\n${rows.join('\n')}`],{type:'text/csv'}))
    a.download = `expenses.csv`; a.click()
  }

  const catTotals = expenses.reduce((acc,e) => { acc[e.category] = (acc[e.category]||0)+e.amount; return acc }, {})
  const pieData   = Object.entries(catTotals).map(([name, value]) => ({ name, value }))

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>
      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} onSaved={() => { setPage(1); fetchData() }} />}

      <PageHeader icon={TrendingDown} title="Expenses" subtitle="All expense entries" color="#dc2626">
        <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:12, background:'#fff', cursor:'pointer' }}>⬇ Export CSV</button>
        <button onClick={() => setShowAdd(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#dc2626', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>
          <Plus size={14} /> Add Expense
        </button>
      </PageHeader>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:16 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Filters */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 2px' }}>Total Expenses</p>
              <p style={{ fontSize:24, fontWeight:800, color:'#dc2626', margin:0 }}>{fmt(grandTotal)}</p>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              <div style={{ position:'relative' }}>
                <Search size={12} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
                <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search..."
                  style={{ padding:'7px 10px 7px 26px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, outline:'none', width:160 }} />
              </div>
              <input type="date" value={from} onChange={e=>{ setFrom(e.target.value); setPage(1) }} style={{ padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, outline:'none' }} />
              <input type="date" value={to} onChange={e=>{ setTo(e.target.value); setPage(1) }} style={{ padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, outline:'none' }} />
              <select value={category} onChange={e => handleCategory(e.target.value)}
                style={{ padding:'7px 10px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, background:'#f9fafb', cursor:'pointer' }}>
                <option value="">All Categories</option>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
              {(from||to||category||search) && (
                <button onClick={() => { setFrom(''); setTo(''); setCategory(''); setSearch(''); setPage(1) }}
                  style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, cursor:'pointer', color:'#6b7280' }}>Clear</button>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>
                {['Date','Particulars','Category','Mode','Amount (₹)'].map(h=>(
                  <th key={h} style={{ padding:'9px 12px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_,i)=><tr key={i}>{Array(5).fill(0).map((_,j)=><td key={j} style={{ padding:'9px 12px' }}><div style={{ height:12, background:'#f3f4f6', borderRadius:4 }} /></td>)}</tr>)
                  : expenses.length===0
                    ? <tr><td colSpan={5} style={{ padding:28, textAlign:'center', color:'#9ca3af' }}>No expenses found</td></tr>
                    : expenses.map((e,i)=>(
                      <tr key={e._id||i} onMouseEnter={x=>x.currentTarget.style.background='#fafafa'} onMouseLeave={x=>x.currentTarget.style.background=''}>
                        <td style={{ padding:'9px 12px', fontSize:13, color:'#6b7280', borderBottom:'1px solid #f3f4f6' }}>{e.date}</td>
                        <td style={{ padding:'9px 12px', fontSize:13, borderBottom:'1px solid #f3f4f6', fontWeight:500 }}>{e.particulars}</td>
                        <td style={{ padding:'9px 12px', fontSize:13, borderBottom:'1px solid #f3f4f6' }}>
                          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#f3f4f6', color:'#374151' }}>{e.category}</span>
                        </td>
                        <td style={{ padding:'9px 12px', fontSize:12, color:'#6b7280', borderBottom:'1px solid #f3f4f6' }}>{e.paymentMode||'—'}</td>
                        <td style={{ padding:'9px 12px', fontSize:13, borderBottom:'1px solid #f3f4f6', textAlign:'right', fontWeight:700, color:'#dc2626' }}>{fmt(e.amount)}</td>
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

        {/* Pie chart */}
        {!loading && pieData.length > 0 && (
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16 }}>
            <p style={{ fontSize:13, fontWeight:700, margin:'0 0 12px' }}>By Category</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v=>[fmt(v),'']} contentStyle={{ borderRadius:8, border:'none', fontSize:11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
              {pieData.map((d,i)=>(
                <div key={d.name} style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:10, height:10, borderRadius:'50%', background:COLORS[i%COLORS.length], display:'inline-block' }} />
                    <span style={{ color:'#374151' }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight:600 }}>{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
