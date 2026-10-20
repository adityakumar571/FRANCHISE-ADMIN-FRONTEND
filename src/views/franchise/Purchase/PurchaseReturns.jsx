/* eslint-disable prettier/prettier */
import { useState, useEffect, useRef, useCallback } from 'react'
import { RotateCcw, Plus, Trash2, Save, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { getRequest, postRequest } from '../../../Helpers'
import PTRInput from '../../../components/PTRInput'
import MarginCalculator from '../../../components/MarginCalculator'

const LIMIT = 20

const EMPTY_ITEM = { medicineId: '', medicineName: '', batchNo: '', qty: 1, ptr: '', mrp: '', reason: 'damaged', note: '' }
function MedicineCell({ value, onSelect, cellStyle }) {
  const [query, setQuery]   = useState(value || '')
  const [results, setResults] = useState([])
  const [open, setOpen]     = useState(false)
  const debounce            = useRef()
  const wrapRef             = useRef()

  useEffect(() => {
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
    onSelect({ medicineId: med.id || med._id, medicineName: med.name })
  }

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      <input value={query} onChange={e=>handleChange(e.target.value)} placeholder="Search medicine..."
        onFocus={() => query.length >= 2 && setOpen(true)} style={cellStyle} />
      {open && results.length > 0 && (
        <div style={{ position:'absolute', top:'100%', left:0, zIndex:100, background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', minWidth:260, maxHeight:180, overflowY:'auto' }}>
          {results.map(m => (
            <div key={m.id||m._id} onMouseDown={()=>handleSelect(m)}
              style={{ padding:'7px 12px', cursor:'pointer', fontSize:12, borderBottom:'1px solid #f3f4f6' }}
              onMouseEnter={e=>e.currentTarget.style.background='#f0f4ff'}
              onMouseLeave={e=>e.currentTarget.style.background=''}>
              <p style={{ margin:0, fontWeight:600, color:'#111827' }}>{m.name}</p>
              <p style={{ margin:0, fontSize:10, color:'#9ca3af' }}>{m.company} · Stock: {m.stock}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const PurchaseReturns = () => {
  const [tab, setTab]         = useState('list')
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [supplierId, setSupplierId] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [grnRef, setGrn]      = useState('')
  const [items, setItems]     = useState([{ ...EMPTY_ITEM }])

  const fetchReturns = async () => {
    setLoading(true)
    try {
      const res = await getRequest('/franchise/purchase/returns')
      setReturns(res.data?.data?.returns || [])
    } catch { toast.error('Failed to load purchase returns') }
    finally   { setLoading(false) }
  }

  useEffect(() => {
    fetchReturns()
    // Use correct endpoint for suppliers
    const fetchSuppliers = async () => {
      try {
        const res = await getRequest('/franchise-suppliers/suppliers')
        let suppliersList = []
        if (Array.isArray(res?.data)) {
          suppliersList = res.data
        } else if (Array.isArray(res?.data?.data)) {
          suppliersList = res.data.data
        } else if (Array.isArray(res?.data?.suppliers)) {
          suppliersList = res.data.suppliers
        }
        setSuppliers(suppliersList)
      } catch (err) {
        console.error('Failed to fetch suppliers:', err)
      }
    }
    fetchSuppliers()
  }, [])

  const addItem  = () => setItems(p => [...p, { ...EMPTY_ITEM }])
  const delItem  = (i) => setItems(p => p.filter((_, idx) => idx !== i))
  const setItem  = (i, f, v) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [f]: v } : it))
  const setMedForRow = (i, medData) => setItems(p => p.map((it, idx) => idx === i ? { ...it, ...medData } : it))

  const handleSave = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!supplierId) { 
      toast.error('Please select a supplier'); 
      return 
    }
    
    const validItems = items.filter(it => it.medicineName || it.medicineId)
    if (!validItems.length) { 
      toast.error('Add at least one medicine to return'); 
      return 
    }
    
    // Check if all items have required fields
    const invalidItems = validItems.filter(it => !it.qty || it.qty < 1)
    if (invalidItems.length > 0) {
      toast.error('All items must have valid quantity (> 0)')
      return
    }
    
    // Confirm return action
    const totalQty = validItems.reduce((sum, it) => sum + Number(it.qty || 0), 0)
    const confirm = window.confirm(
      `⚠️ Confirm Purchase Return\n\n` +
      `Supplier: ${supplierName}\n` +
      `Items: ${validItems.length}\n` +
      `Total Qty: ${totalQty}\n\n` +
      `This will reduce your stock. Continue?`
    )
    
    if (!confirm) return
    
    setSaving(true)
    try {
      await postRequest({ url: '/franchise/purchase/returns', cred: {
        supplierId, 
        supplier: supplierName, 
        grnRef,
        items: validItems.map(it => ({
          medicineId:   it.medicineId,
          medicineName: it.medicineName,
          batchNo:      it.batchNo,
          qty:          Number(it.qty),
          ptr:          Number(it.ptr || 0),
          mrp:          Number(it.mrp || 0),
          reason:       it.reason,
          note:         it.note || '',
        })),
      }})
      toast.success('✅ Purchase return submitted successfully')
      setTab('list')
      setSupplierId(''); setSupplierName(''); setGrn('')
      setItems([{ ...EMPTY_ITEM }])
      fetchReturns()
    } catch (err) {
      console.error('Return submission error:', err)
      toast.error(err?.response?.data?.message || 'Failed to submit return')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { title: 'Return No.', key: 'returnNo', render: (v) => <span style={{ fontWeight: 700, color: '#d97706' }}>{v}</span> },
    { title: 'GRN Ref.', key: 'grnRef' },
    { title: 'Supplier', key: 'supplier' },
    { title: 'Reason', key: 'reason' },
    { title: 'Items', key: 'items', align: 'center' },
    { title: 'Date', key: 'date' },
    { title: 'Status', key: 'status', render: (v) => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      <PageHeader icon={RotateCcw} title="Purchase Returns" subtitle="Return damaged, incorrect or expired stock to suppliers" color="#d97706">
        <button onClick={() => setTab(tab === 'list' ? 'new' : 'list')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: tab === 'new' ? '#e5e7eb' : '#0c3b73', color: tab === 'new' ? '#374151' : '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          {tab === 'new' ? '← Back to List' : <><Plus size={14} /> New Return</>}
        </button>
      </PageHeader>

      {tab === 'list' ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {columns.map(c => (
                    <th key={c.key} style={{ padding: '10px 14px', textAlign: c.align || 'left', fontWeight: 600, color: '#374151', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {c.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      {columns.map((_, j) => (
                        <td key={j} style={{ padding: '10px 14px' }}>
                          <div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : returns.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                      No purchase returns found
                    </td>
                  </tr>
                ) : (
                  returns.map((row, i) => (
                    <tr
                      key={row._id || i}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      {columns.map((c) => (
                        <td key={c.key} style={{ padding: '10px 14px', textAlign: c.align || 'left', color: '#374151', verticalAlign: 'middle' }}>
                          {c.render ? c.render(row[c.key], row, i) : row[c.key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 20px' }}>New Purchase Return</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={lbl}>Supplier *</label>
                <select value={supplierId} onChange={e => {
                  setSupplierId(e.target.value)
                  const s = suppliers.find(x => x._id === e.target.value)
                  setSupplierName(s?.companyName || s?.name || '')
                }} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName || s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>GRN Reference</label>
                <input value={grnRef} onChange={e => setGrn(e.target.value)} placeholder="GRN No." style={inp} />
              </div>
            </div>

            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Medicine *', 'Batch No.', 'Qty *', 'PTR (₹)', 'MRP (₹)', 'Reason *', 'Note', ''].map((h) => (
                      <th key={h} style={{ padding: '8px 10px', fontWeight: 600, color: '#374151', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '6px 8px', minWidth: 200 }}>
                        <MedicineCell
                          value={item.medicineName}
                          onSelect={(med) => setMedForRow(i, med)}
                          cellStyle={cell}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input 
                          value={item.batchNo} 
                          onChange={(e) => setItem(i, 'batchNo', e.target.value)} 
                          placeholder="Batch" 
                          style={{ ...cell, width: 100 }} 
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input 
                          type="number" 
                          min={1} 
                          value={item.qty} 
                          onChange={(e) => setItem(i, 'qty', e.target.value)} 
                          style={{ ...cell, width: 60 }} 
                          required
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={item.ptr} 
                          onChange={(e) => setItem(i, 'ptr', e.target.value)} 
                          placeholder="0.00" 
                          style={{ ...cell, width: 80 }} 
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={item.mrp} 
                          onChange={(e) => setItem(i, 'mrp', e.target.value)} 
                          placeholder="0.00" 
                          style={{ ...cell, width: 80 }} 
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <select 
                          value={item.reason} 
                          onChange={(e) => setItem(i, 'reason', e.target.value)} 
                          style={{ ...cell, background: '#fff', width: 120 }}
                        >
                          <option value="damaged">Damaged</option>
                          <option value="expired">Expired</option>
                          <option value="near_expiry">Near Expiry</option>
                          <option value="incorrect">Incorrect Item</option>
                          <option value="quality">Quality Issue</option>
                          <option value="other">Other</option>
                        </select>
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input 
                          value={item.note || ''} 
                          onChange={(e) => setItem(i, 'note', e.target.value)} 
                          placeholder="Optional note" 
                          style={{ ...cell, width: 140 }} 
                        />
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        {items.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => delItem(i)} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: '1px solid #d9780640', background: '#d9780610', color: '#d97706', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}>
              <Plus size={13} /> Add Item
            </button>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setTab('list')} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 8, border: 'none', background: saving ? '#fde68a' : '#d97706', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <Save size={14} /> {saving ? 'Submitting...' : 'Submit Return'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const lbl  = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }
const inp  = { width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 7, padding: '0 11px', fontSize: 13, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }
const cell = { width: '100%', height: 30, border: '1px solid #e5e7eb', borderRadius: 5, padding: '0 7px', fontSize: 12, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }

export default PurchaseReturns
