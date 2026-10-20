/* eslint-disable prettier/prettier */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Package, Plus, Trash2, Save, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { getRequest, postRequest } from '../../../Helpers'

const LIMIT = 20

const EMPTY_ITEM = { medicineId: '', medicineName: '', batchNo: '', expiry: '', qty: 1, freeQty: 0, ptr: '', rack: '' }
function MedicineCell({ value, onSelect, cellStyle }) {
  const [query, setQuery]   = useState(value || '')
  const [results, setResults] = useState([])
  const [open, setOpen]     = useState(false)
  const debounce            = useRef()
  const wrapRef             = useRef()

  useEffect(() => {
    // Close dropdown on outside click
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (val) => {
    setQuery(val)
    setOpen(true)
    clearTimeout(debounce.current)
    if (val.length < 2) { setResults([]); return }
    debounce.current = setTimeout(async () => {
      try {
        const res = await getRequest(`/franchise/pos/medicines/search?q=${encodeURIComponent(val)}&limit=8`)
        setResults(res.data?.data?.medicines || [])
      } catch { setResults([]) }
    }, 300)
  }

  const handleSelect = (med) => {
    setQuery(med.name)
    setResults([])
    setOpen(false)
    onSelect({ medicineId: med.id || med._id, medicineName: med.name, ptr: med.mrp ? (med.mrp * 0.7).toFixed(2) : '' })
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input value={query} onChange={e => handleChange(e.target.value)} placeholder="Search medicine..."
        onFocus={() => query.length >= 2 && setOpen(true)}
        style={cellStyle} />
      {open && results.length > 0 && (
        <div style={{ position:'absolute', top:'100%', left:0, zIndex:100, background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', minWidth:280, maxHeight:200, overflowY:'auto' }}>
          {results.map(m => (
            <div key={m.id || m._id} onMouseDown={() => handleSelect(m)}
              style={{ padding:'8px 12px', cursor:'pointer', fontSize:12, borderBottom:'1px solid #f3f4f6' }}
              onMouseEnter={e=>e.currentTarget.style.background='#f0f4ff'}
              onMouseLeave={e=>e.currentTarget.style.background=''}>
              <p style={{ margin:0, fontWeight:600, color:'#111827' }}>{m.name}</p>
              <p style={{ margin:0, fontSize:10, color:'#9ca3af' }}>{m.company} · Stock: {m.stock} · MRP: ₹{m.mrp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const GRNInward = () => {
  const [tab, setTab]             = useState('list')
  const [grns, setGrns]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [suppliers, setSuppliers] = useState([])
  // ── List filters & pagination ──
  const [search, setSearch]           = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [statusFilter, setStatusFilter]     = useState('')
  const [from, setFrom]               = useState('')
  const [to, setTo]                   = useState('')
  const [page, setPage]               = useState(1)
  const [total, setTotal]             = useState(0)
  const [totalPages, setTotalPages]   = useState(1)
  const debounceRef = useRef()
  // ── New GRN form state ──
  const [poRef, setPoRef]         = useState('')
  const [supplierId, setSupplierId]   = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [invoiceNo, setInvoice]   = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [items, setItems]         = useState([{ ...EMPTY_ITEM }])

  const fetchGRNs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT,
        search, supplier: supplierFilter, status: statusFilter,
        ...(from && { from }),
        ...(to   && { to }),
      })
      const res = await getRequest(`/franchise/purchase/grn?${params}`)
      const d = res.data?.data
      setGrns(d?.grns || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
    } catch { toast.error('Failed to load GRNs') }
    finally   { setLoading(false) }
  }, [page, search, supplierFilter, statusFilter, from, to])

  useEffect(() => { fetchGRNs() }, [fetchGRNs])

  useEffect(() => {
    getRequest('/franchise/suppliers?status=Active&limit=200')
      .then(res => setSuppliers(res.data?.data?.suppliers || []))
      .catch(() => {})
  }, [])

  const handleSearch = (val) => {
    setSearch(val); setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchGRNs(), 400)
  }

  const addItem  = () => setItems(p => [...p, { ...EMPTY_ITEM }])
  const delItem  = (i) => setItems(p => p.filter((_, idx) => idx !== i))
  const setItem  = (i, field, val) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [field]: val } : it))
  const setMedForRow = (i, medData) => setItems(p => p.map((it, idx) => idx === i ? { ...it, ...medData } : it))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!supplierId) { toast.error('Supplier is required'); return }
    if (!items.some(it => it.medicineName || it.medicineId)) { toast.error('Add at least one medicine'); return }
    setSaving(true)
    try {
      await postRequest({ url: '/franchise/purchase/grn', cred: {
        supplierId, supplier: supplierName, poRef, invoiceNo, invoiceDate,
        items: items.filter(it => it.medicineName || it.medicineId).map(it => ({
          medicineId:   it.medicineId,
          medicineName: it.medicineName,
          batchNo:      it.batchNo,
          expiry:       it.expiry,
          qty:          Number(it.qty),
          freeQty:      Number(it.freeQty),
          ptr:          Number(it.ptr),
          rack:         it.rack,
        })),
      }})
      toast.success('GRN created and stock updated')
      setTab('list')
      setPoRef(''); setSupplierId(''); setSupplierName(''); setInvoice(''); setInvoiceDate('')
      setItems([{ ...EMPTY_ITEM }])
      fetchGRNs()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create GRN')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { title: 'GRN No.',   key: 'grnNo',     render: (v) => <span style={{ fontWeight:700, color:'#0c3b73' }}>{v}</span> },
    { title: 'PO Ref.',   key: 'poRef',     render: (v) => v || '—' },
    { title: 'Invoice',   key: 'invoiceNo', render: (v) => v || '—' },
    { title: 'Supplier',  key: 'supplier' },
    { title: 'Items',     key: 'items',     align: 'center' },
    { title: 'Date',      key: 'date' },
    { title: 'Status',    key: 'status',    render: (v) => <StatusBadge status={v} /> },
  ]

  const cellInput = { width:'100%', height:30, border:'1px solid #e5e7eb', borderRadius:5, padding:'0 7px', fontSize:12, outline:'none', background:'#fafafa', boxSizing:'border-box' }

  return (
    <div>
      <PageHeader icon={Package} title="GRN / Inward Entry" subtitle="Record goods received and update stock" color="#16a34a">
        <button onClick={() => setTab(tab === 'list' ? 'new' : 'list')}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8, border:'none', background:tab==='new'?'#e5e7eb':'#0c3b73', color:tab==='new'?'#374151':'#fff', fontWeight:600, fontSize:13, cursor:'pointer' }}>
          {tab === 'new' ? '← Back to List' : <><Plus size={14} /> New GRN</>}
        </button>
      </PageHeader>

      {tab === 'list' ? (
        <>
          {/* ── Filter bar ── */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'12px 16px', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:14 }}>
            <div style={{ position:'relative', flex:1, minWidth:200 }}>
              <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
              <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search GRN no., supplier, invoice..."
                style={{ width:'100%', padding:'8px 10px 8px 30px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none', background:'#f9fafb', boxSizing:'border-box' }} />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              style={{ padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, background:'#f9fafb', cursor:'pointer' }}>
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
            <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1) }}
              style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none' }} />
            <span style={{ fontSize:12, color:'#9ca3af' }}>to</span>
            <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1) }}
              style={{ padding:'7px 12px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, outline:'none' }} />
            {(search || statusFilter || from || to) && (
              <button onClick={() => { setSearch(''); setStatusFilter(''); setFrom(''); setTo(''); setPage(1) }}
                style={{ padding:'7px 14px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:12, cursor:'pointer', color:'#6b7280', background:'#fff' }}>Clear</button>
            )}
          </div>

          {/* ── Table ── */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                    {columns.map(c => (
                      <th key={c.key} style={{ padding:'10px 14px', textAlign:c.align||'left', fontWeight:600, color:'#374151', fontSize:12, whiteSpace:'nowrap' }}>{c.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array(5).fill(0).map((_,i) => (
                      <tr key={i}>{columns.map((_,j) => <td key={j} style={{ padding:'10px 14px' }}><div style={{ height:13, background:'#f3f4f6', borderRadius:4 }} /></td>)}</tr>
                    ))
                    : grns.length === 0
                      ? <tr><td colSpan={columns.length} style={{ padding:40, textAlign:'center', color:'#9ca3af' }}>No GRNs found</td></tr>
                      : grns.map((row, i) => (
                        <tr key={row._id || i}
                          onMouseEnter={e => e.currentTarget.style.background='#fafafa'}
                          onMouseLeave={e => e.currentTarget.style.background=''}>
                          {columns.map(c => (
                            <td key={c.key} style={{ padding:'10px 14px', textAlign:c.align||'left', color:'#374151', verticalAlign:'middle' }}>
                              {c.render ? c.render(row[c.key], row, i) : (row[c.key] ?? '—')}
                            </td>
                          ))}
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
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
                {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1).map((p,i,arr)=>(
                  <span key={p}>
                    {i>0&&arr[i-1]!==p-1&&<span style={{ color:'#9ca3af', padding:'0 4px', fontSize:12 }}>…</span>}
                    <button onClick={()=>setPage(p)} style={{ minWidth:30, height:30, borderRadius:6, border:'1px solid', fontSize:12, fontWeight:p===page?700:400, cursor:'pointer',
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
        </>
      ) : (
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', padding:24 }}>
          <h3 style={{ fontSize:15, fontWeight:700, margin:'0 0 20px' }}>New Goods Receipt Note</h3>
          <form onSubmit={handleSave}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:14, marginBottom:24 }}>
              {/* Supplier dropdown */}
              <div>
                <label style={lbl}>Supplier *</label>
                <select value={supplierId} onChange={e => {
                  setSupplierId(e.target.value)
                  const sup = suppliers.find(s => s._id === e.target.value)
                  setSupplierName(sup?.name || '')
                }} style={{ ...inp, cursor:'pointer' }}>
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div><label style={lbl}>PO Reference</label><input value={poRef} onChange={e=>setPoRef(e.target.value)} placeholder="e.g. PO-2401" style={inp} /></div>
              <div><label style={lbl}>Invoice Number</label><input value={invoiceNo} onChange={e=>setInvoice(e.target.value)} placeholder="Invoice No." style={inp} /></div>
              <div><label style={lbl}>Invoice Date</label><input type="date" value={invoiceDate} onChange={e=>setInvoiceDate(e.target.value)} style={inp} /></div>
            </div>

            {/* Items */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <label style={{ fontSize:13, fontWeight:700, color:'#374151' }}>Received Items</label>
                <button type="button" onClick={addItem} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 12px', borderRadius:6, border:'1px solid #16a34a40', background:'#16a34a10', color:'#16a34a', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  <Plus size={13} /> Add Item
                </button>
              </div>
              <div style={{ border:'1px solid #e5e7eb', borderRadius:8, overflow:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, minWidth:800 }}>
                  <thead>
                    <tr style={{ background:'#f9fafb' }}>
                      {['Medicine *','Batch No.','Expiry','Qty','Free Qty','PTR (₹)','Rack',''].map(h => (
                        <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontWeight:600, color:'#374151', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} style={{ borderTop:'1px solid #f3f4f6' }}>
                        <td style={{ padding:'5px 8px', minWidth:200 }}>
                          <MedicineCell
                            value={item.medicineName}
                            onSelect={(med) => setMedForRow(i, med)}
                            cellStyle={cellInput}
                          />
                        </td>
                        <td style={{ padding:'5px 8px' }}><input value={item.batchNo} onChange={e=>setItem(i,'batchNo',e.target.value)} placeholder="Batch" style={cellInput} /></td>
                        <td style={{ padding:'5px 8px' }}><input type="month" value={item.expiry} onChange={e=>setItem(i,'expiry',e.target.value)} style={{ ...cellInput, width:120 }} /></td>
                        <td style={{ padding:'5px 8px' }}><input type="number" min={1} value={item.qty} onChange={e=>setItem(i,'qty',e.target.value)} style={{ ...cellInput, width:60 }} /></td>
                        <td style={{ padding:'5px 8px' }}><input type="number" min={0} value={item.freeQty} onChange={e=>setItem(i,'freeQty',e.target.value)} style={{ ...cellInput, width:60 }} /></td>
                        <td style={{ padding:'5px 8px' }}><input type="number" step="0.01" value={item.ptr} onChange={e=>setItem(i,'ptr',e.target.value)} placeholder="0.00" style={{ ...cellInput, width:80 }} /></td>
                        <td style={{ padding:'5px 8px' }}><input value={item.rack} onChange={e=>setItem(i,'rack',e.target.value)} placeholder="A01" style={{ ...cellInput, width:70 }} /></td>
                        <td style={{ padding:'5px 8px', textAlign:'center' }}>
                          {items.length > 1 && (
                            <button type="button" onClick={()=>delItem(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'#e11d48' }}><Trash2 size={13} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button type="button" onClick={() => setTab('list')} style={{ padding:'9px 20px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontWeight:600, fontSize:13, cursor:'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 22px', borderRadius:8, border:'none', background:saving?'#86efac':'#16a34a', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                <Save size={14} /> {saving ? 'Saving…' : 'Create GRN & Update Stock'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const lbl  = { display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }
const inp  = { width:'100%', height:38, border:'1px solid #e5e7eb', borderRadius:7, padding:'0 11px', fontSize:13, outline:'none', background:'#fafafa', boxSizing:'border-box' }

export default GRNInward
