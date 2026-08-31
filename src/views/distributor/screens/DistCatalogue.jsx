/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Package, Search, Plus, Edit2, Eye, Download, Filter, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react'

const MOCK = [
  { id:'SKU-001', name:'Paracetamol 650mg Tablet', salt:'Paracetamol', brand:'Crocin', company:'GSK', pack:'10x15 Strip', hsn:'3004', gst:12, mrp:28.00, ptr:20.20, pts:18.50, stock:4200, minOrder:10, status:true  },
  { id:'SKU-002', name:'Azithromycin 500mg Tablet', salt:'Azithromycin', brand:'Azithral', company:'Alkem', pack:'3 Strip', hsn:'3004', gst:12, mrp:98.50, ptr:72.00, pts:68.00, stock:1840, minOrder:5, status:true  },
  { id:'SKU-003', name:'Amoxicillin 500mg Capsule', salt:'Amoxicillin', brand:'Novamox', company:'Cipla', pack:'10x10 Strip', hsn:'3004', gst:5, mrp:65.00, ptr:47.50, pts:44.00, stock:320, minOrder:20, status:true  },
  { id:'SKU-004', name:'Pantoprazole 40mg + Domperidone', salt:'Pantoprazole+Domperidone', brand:'Pantop DSR', company:'Aristo', pack:'10x10 Strip', hsn:'3004', gst:12, mrp:125.00, ptr:91.00, pts:86.50, stock:980, minOrder:5, status:true  },
  { id:'SKU-005', name:'Metformin 500mg Tablet', salt:'Metformin HCL', brand:'Glycomet', company:'USV', pack:'10x15 Strip', hsn:'3004', gst:5, mrp:42.00, ptr:30.00, pts:28.50, stock:2100, minOrder:10, status:true  },
  { id:'SKU-006', name:'Atorvastatin 10mg Tablet', salt:'Atorvastatin', brand:'Storvas', company:'Sun Pharma', pack:'10x15 Strip', hsn:'3004', gst:12, mrp:88.00, ptr:64.00, pts:61.00, stock:1560, minOrder:5, status:true  },
  { id:'SKU-007', name:'Cetirizine 10mg Tablet', salt:'Cetirizine HCL', brand:'Cetzine', company:'GSK', pack:'10x10 Strip', hsn:'3004', gst:12, mrp:22.00, ptr:16.00, pts:15.00, stock:3200, minOrder:20, status:true  },
  { id:'SKU-008', name:'Omeprazole 20mg Capsule', salt:'Omeprazole', brand:'Omez', company:'Dr Reddy', pack:'10x10 Strip', hsn:'3004', gst:12, mrp:38.00, ptr:27.50, pts:26.00, stock:0, minOrder:10, status:false },
  { id:'SKU-009', name:'Ceftriaxone 1g Injection', salt:'Ceftriaxone Sodium', brand:'Monocef', company:'Aristo', pack:'1 Vial', hsn:'3004', gst:12, mrp:85.00, ptr:62.00, pts:58.00, stock:42, minOrder:1, status:true  },
  { id:'SKU-010', name:'Dolo 650 Tablet', salt:'Paracetamol', brand:'Dolo', company:'Micro Labs', pack:'15 Tab', hsn:'3004', gst:12, mrp:30.00, ptr:21.80, pts:20.50, stock:6800, minOrder:10, status:true  },
]

const PER = 8
const Th = ({c,a='left'}) => <th style={{ padding:'9px 14px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:a, whiteSpace:'nowrap' }}>{c}</th>
const Td = ({children,style={}}) => <td style={{ padding:'10px 14px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', verticalAlign:'middle', ...style }}>{children}</td>

export default function DistCatalogue() {
  const [data, setData]   = useState(MOCK)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage]     = useState(1)
  const [showAdd, setShowAdd] = useState(false)

  const filtered = data.filter(m =>
    (status === 'All' || (status === 'Active' ? m.status : !m.status)) &&
    (search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.salt.toLowerCase().includes(search.toLowerCase()))
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER))
  const paged = filtered.slice((page-1)*PER, page*PER)

  const toggleStatus = id => setData(p => p.map(m => m.id===id ? {...m,status:!m.status} : m))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

      {/* Header */}
      <div style={{ background:'#fff', borderRadius:12, padding:'16px 20px', border:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'#e0e7ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Package size={20} color="#0c3b73"/>
          </div>
          <div>
            <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:0 }}>Medicine Catalogue</h2>
            <p style={{ fontSize:12, color:'#9ca3af', margin:'2px 0 0' }}>Manage your medicine SKUs, pricing & availability</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:12, background:'#fff', cursor:'pointer' }}>
            <Download size={13}/> Export
          </button>
          <button onClick={()=>setShowAdd(true)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#0c3b73', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>
            <Plus size={14}/> Add Medicine
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total SKUs',   value:data.length,                           color:'#0c3b73', bg:'#e0e7ff' },
          { label:'Active',       value:data.filter(m=>m.status).length,       color:'#16a34a', bg:'#dcfce7' },
          { label:'Out of Stock', value:data.filter(m=>m.stock===0).length,    color:'#dc2626', bg:'#fee2e2' },
          { label:'Low Stock',    value:data.filter(m=>m.stock>0&&m.stock<100).length, color:'#d97706', bg:'#fef3c7' },
        ].map(k=>(
          <div key={k.label} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'16px 18px', borderLeft:`4px solid ${k.color}` }}>
            <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize:26, fontWeight:800, color:k.color, margin:0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'12px 16px', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:'1 1 260px' }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }}/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
            placeholder="Search by name, salt, brand..."
            style={{ width:'100%', padding:'8px 10px 8px 28px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', background:'#f9fafb', boxSizing:'border-box' }}/>
        </div>
        {['All','Active','Inactive'].map(s=>(
          <button key={s} onClick={()=>{setStatus(s);setPage(1)}}
            style={{ padding:'8px 14px', borderRadius:8, border:'1px solid', fontSize:12, fontWeight:600, cursor:'pointer', borderColor:status===s?'#0c3b73':'#e5e7eb', background:status===s?'#0c3b73':'#fff', color:status===s?'#fff':'#374151' }}>{s}</button>
        ))}
        <button style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:12, background:'#fff', cursor:'pointer' }}>
          <Filter size={12}/> Filters
        </button>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              <Th c="SKU"/><Th c="Medicine Name"/><Th c="Company"/><Th c="Pack"/><Th c="MRP (₹)" a="right"/><Th c="PTR (₹)" a="right"/><Th c="PTS (₹)" a="right"/><Th c="Stock" a="center"/><Th c="Status" a="center"/><Th c="Action"/>
            </tr></thead>
            <tbody>
              {paged.length===0 ? (
                <tr><td colSpan={10} style={{ padding:40, textAlign:'center', color:'#9ca3af' }}>No medicines found</td></tr>
              ) : paged.map(m=>(
                <tr key={m.id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <Td><span style={{ fontFamily:'monospace', fontSize:11, background:'#f3f4f6', padding:'2px 7px', borderRadius:4 }}>{m.id}</span></Td>
                  <Td>
                    <p style={{ margin:0, fontWeight:600, color:'#111827', fontSize:13 }}>{m.name}</p>
                    <p style={{ margin:0, fontSize:10, color:'#9ca3af' }}>{m.salt}</p>
                  </Td>
                  <Td style={{ fontSize:12, color:'#6b7280' }}>{m.company}</Td>
                  <Td style={{ fontSize:12 }}>{m.pack}</Td>
                  <Td style={{ textAlign:'right', fontWeight:600 }}>₹{m.mrp.toFixed(2)}</Td>
                  <Td style={{ textAlign:'right', fontWeight:700, color:'#0c3b73' }}>₹{m.ptr.toFixed(2)}</Td>
                  <Td style={{ textAlign:'right', fontWeight:600, color:'#6b7280' }}>₹{m.pts.toFixed(2)}</Td>
                  <Td style={{ textAlign:'center', fontWeight:700, color:m.stock===0?'#dc2626':m.stock<100?'#d97706':'#16a34a' }}>{m.stock}</Td>
                  <Td style={{ textAlign:'center' }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20, background:m.status?'#dcfce7':'#fee2e2', color:m.status?'#16a34a':'#dc2626' }}>
                      {m.status?'Active':'Inactive'}
                    </span>
                  </Td>
                  <Td>
                    <div style={{ display:'flex', gap:5 }}>
                      <button style={{ display:'flex', alignItems:'center', gap:3, padding:'5px 9px', border:'none', borderRadius:6, background:'#e0e7ff', color:'#0c3b73', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                        <Edit2 size={11}/> Edit
                      </button>
                      <button onClick={()=>toggleStatus(m.id)} style={{ padding:'5px 7px', border:'none', borderRadius:6, background:m.status?'#fee2e2':'#dcfce7', cursor:'pointer' }}>
                        {m.status ? <ToggleRight size={14} color="#16a34a"/> : <ToggleLeft size={14} color="#dc2626"/>}
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderTop:'1px solid #f3f4f6' }}>
          <span style={{ fontSize:12, color:'#6b7280' }}>Showing {Math.min((page-1)*PER+1,filtered.length)}–{Math.min(page*PER,filtered.length)} of {filtered.length}</span>
          <div style={{ display:'flex', gap:4 }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ border:'1px solid #e5e7eb', borderRadius:6, padding:'5px 10px', cursor:page===1?'default':'pointer', background:'none', color:page===1?'#d1d5db':'#374151' }}><ChevronLeft size={14}/></button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{ background:page===p?'#0c3b73':'none', border:`1px solid ${page===p?'#0c3b73':'#e5e7eb'}`, borderRadius:6, padding:'5px 10px', cursor:'pointer', color:page===p?'#fff':'#374151', fontSize:12 }}>{p}</button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ border:'1px solid #e5e7eb', borderRadius:6, padding:'5px 10px', cursor:page===totalPages?'default':'pointer', background:'none', color:page===totalPages?'#d1d5db':'#374151' }}><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>

      {/* Add medicine modal */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:560, padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Add New Medicine to Catalogue</h3>
              <button onClick={()=>setShowAdd(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#6b7280' }}>×</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[['Medicine Name *',''],['Salt / Generic *',''],['Brand',''],['Company *',''],['Pack Size *','e.g. 10x10'],['HSN Code','3004'],['GST %','12'],['MRP (₹) *',''],['PTR (₹) *',''],['PTS (₹)',''],['Opening Stock',''],['Min Order Qty','1']].map(([l,ph])=>(
                <div key={l}>
                  <label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:5, textTransform:'uppercase' }}>{l}</label>
                  <input placeholder={ph} style={{ width:'100%', padding:'9px 12px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box' }}/>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:22 }}>
              <button onClick={()=>setShowAdd(false)} style={{ padding:'9px 20px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:'#fff' }}>Cancel</button>
              <button onClick={()=>setShowAdd(false)} style={{ padding:'9px 22px', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', background:'#0c3b73', color:'#fff' }}>Save Medicine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
