/* eslint-disable prettier/prettier */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Package, Plus, Trash2, Save, Search, ChevronLeft, ChevronRight, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { getRequest, postRequest } from '../../../Helpers'
import PTRInput from '../../../components/PTRInput'
import MarginCalculator from '../../../components/MarginCalculator'
import { calculateStandardPTR, batchValidatePTR } from '../../../utils/ptrValidation'

const LIMIT = 20

let uidSeq = 0
const newItem = () => ({
  uid: ++uidSeq,
  medicineId: '',
  medicineName: '',
  category: '',
  batchNo: '',
  expiry: '',
  qty: 1,
  freeQty: 0,
  ptr: '',
  mrp: '',
})

/* ───────── helpers ───────── */
const useDebounce = (value, delay) => {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

const fmtExpiry = (v) => {
  if (!v) return '—'
  if (/^\d{4}-\d{2}$/.test(v)) return `${v.slice(5)}/${v.slice(0, 4)}`
  const d = new Date(v)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('en-IN', { month: '2-digit', year: 'numeric' })
}

const money = (v) => (v === undefined || v === null || v === '' ? '—' : `₹${Number(v).toLocaleString('en-IN')}`)

/* ───────── tailwind class presets ───────── */
const cellInput =
  'w-full h-[30px] border border-gray-200 rounded-md px-2 text-xs outline-none bg-gray-50 focus:border-blue-400 focus:bg-white'
const fieldInput =
  'w-full h-[38px] border border-gray-200 rounded-lg px-3 text-[13px] outline-none bg-gray-50 focus:border-blue-400 focus:bg-white'
const fieldLabel = 'block text-xs font-semibold text-gray-700 mb-1'
const th = 'px-3.5 py-2.5 text-xs font-semibold text-gray-700 whitespace-nowrap'

/* ───────── MEDICINE SEARCH CELL ───────── */
function MedicineCell({ value, onSelect, onType }) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 280 })
  const debounce = useRef()
  const reqId = useRef(0)
  const wrapRef = useRef()
  const inputRef = useRef()

  const place = () => {
    const r = inputRef.current?.getBoundingClientRect()
    if (r) setPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 280) })
  }

  // bahar click par band
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // scroll / resize par band (dropdown ke apne scroll par nahi)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (wrapRef.current && e?.target instanceof Node && wrapRef.current.contains(e.target)) return; setOpen(false) }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close) }
  }, [open])

  useEffect(() => () => clearTimeout(debounce.current), [])

  const handleChange = (val) => {
    setQuery(val)
    onType() // purani selection hata do
    place()
    setOpen(true)
    clearTimeout(debounce.current)
    if (val.trim().length < 2) { setResults([]); return }
    debounce.current = setTimeout(async () => {
      const id = ++reqId.current
      try {
        const res = await getRequest(`/franchise/pos/medicines/search?q=${encodeURIComponent(val.trim())}&limit=8`)
        if (id !== reqId.current) return // purana response ignore
        setResults(res.data?.data?.medicines || [])
      } catch {
        if (id === reqId.current) setResults([])
      }
    }, 300)
  }

  const handleSelect = (med) => {
    setQuery(med.name)
    setResults([])
    setOpen(false)
    const category = med.category || 'Generic'
    const suggestedPTR = med.mrp ? calculateStandardPTR(med.mrp, category) : ''
    onSelect({
      medicineId: med.id || med._id,
      medicineName: med.name,
      category,
      mrp: med.mrp || '',
      ptr: suggestedPTR,
    })
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => { if (query.trim().length >= 2 && results.length) { place(); setOpen(true) } }}
        placeholder="Search medicine..."
        className={cellInput}
      />
      {open && results.length > 0 && (
        <div
          className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-y-auto"
          style={{ top: pos.top, left: pos.left, minWidth: pos.width }}
        >
          {results.map((m) => (
            <div
              key={m.id || m._id}
              onMouseDown={() => handleSelect(m)}
              className="px-3 py-2 cursor-pointer text-xs border-b border-gray-100 last:border-b-0 hover:bg-indigo-50"
            >
              <p className="m-0 font-semibold text-gray-900">{m.name}</p>
              <p className="m-0 text-[10px] text-gray-400">{m.company} · Stock: {m.stock} · MRP: ₹{m.mrp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ───────── ITEMS MODAL ───────── */
function ItemsModal({ grn, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!grn) return null
  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="m-0 text-base font-bold text-gray-800">📦 {grn.grnNo} — Items</h3>
            <p className="m-0 mt-0.5 text-xs text-gray-500">
              {grn.supplier} • Invoice: {grn.invoiceNo || '—'} • PO: {grn.poRef || '—'} • {grn.date}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-500"><X size={18} /></button>
        </div>
        <div className="overflow-auto p-4">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                {['Medicine', 'Batch', 'Expiry', 'Qty', 'Free', 'PTR', 'MRP', 'Amount'].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold text-gray-700 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(grn.items || []).map((it, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-3 py-2 font-semibold text-gray-800">{it.medicineName}</td>
                  <td className="px-3 py-2 text-gray-600">{it.batchNo || '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{fmtExpiry(it.expiry || it.expiryDate)}</td>
                  <td className="px-3 py-2 text-gray-600">{it.qty}</td>
                  <td className="px-3 py-2 text-gray-600">{it.freeQty || 0}</td>
                  <td className="px-3 py-2 text-gray-600">{money(it.ptr)}</td>
                  <td className="px-3 py-2 text-gray-600">{it.mrp ? money(it.mrp) : '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{it.amount ? money(it.amount) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">Close</button>
        </div>
      </div>
    </div>
  )
}

/* ───────── MAIN ───────── */
const GRNInward = () => {
  const [tab, setTab] = useState('list')
  const [grns, setGrns] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [viewGrn, setViewGrn] = useState(null)

  // list filters & pagination
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const [statusFilter, setStatusFilter] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const listReq = useRef(0)

  // new GRN form
  const [poRef, setPoRef] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [invoiceNo, setInvoice] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [items, setItems] = useState(() => [newItem()])

  const fetchGRNs = useCallback(async () => {
    const id = ++listReq.current
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(from && { from }),
        ...(to && { to }),
      })
      const res = await getRequest(`/franchise/purchase/grn?${params}`)
      if (id !== listReq.current) return
      const d = res.data?.data
      setGrns(d?.grns || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
    } catch {
      if (id === listReq.current) toast.error('Failed to load GRNs')
    } finally {
      if (id === listReq.current) setLoading(false)
    }
  }, [page, search, statusFilter, from, to])

  useEffect(() => { fetchGRNs() }, [fetchGRNs])

  // search badalne par page 1
  useEffect(() => { setPage(1) }, [search])

  useEffect(() => {
    ; (async () => {
      try {
        const res = await getRequest('/franchise-suppliers/suppliers')
        const d = res?.data
        const list = Array.isArray(d) ? d
          : Array.isArray(d?.data) ? d.data
            : Array.isArray(d?.suppliers) ? d.suppliers
              : Array.isArray(d?.data?.suppliers) ? d.data.suppliers
                : []
        setSuppliers(list)
      } catch (err) {
        console.error('Failed to fetch suppliers:', err)
        toast.error('Failed to load suppliers')
      }
    })()
  }, [])

  /* ── item helpers ── */
  const addItem = () => setItems((p) => [...p, newItem()])
  const delItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i))
  const setItem = (i, field, val) => setItems((p) => p.map((it, idx) => (idx === i ? { ...it, [field]: val } : it)))
  const setMedForRow = (i, med) => setItems((p) => p.map((it, idx) => (idx === i ? { ...it, ...med } : it)))
  const clearMedForRow = (i) =>
    setItems((p) => p.map((it, idx) => (idx === i && it.medicineId ? { ...it, medicineId: '', medicineName: '', category: '' } : it)))

  const resetForm = () => {
    setPoRef(''); setSupplierId(''); setSupplierName(''); setInvoice(''); setInvoiceDate('')
    setItems([newItem()])
  }

  /* ── save ── */
  const handleSave = async (e) => {
    e.preventDefault()
    if (!supplierId) return toast.error('Supplier is required')
    if (!invoiceNo.trim()) return toast.error('Invoice number is required')
    if (!invoiceDate) return toast.error('Invoice date is required')

    const validItems = items.filter((it) => it.medicineName && it.medicineId)
    if (!validItems.length) return toast.error('Add at least one medicine')

    const missing = validItems.filter(
      (it) => !it.batchNo.trim() || !(Number(it.qty) > 0) || !(Number(it.ptr) > 0) || !(Number(it.mrp) > 0) || !it.expiry
    )
    if (missing.length) {
      return toast.error(`${missing.length} item(s) missing required fields (Batch, Expiry, Qty, PTR, MRP)`)
    }

    const validation = batchValidatePTR(
      validItems.map((it) => ({
        name: it.medicineName,
        ptr: Number(it.ptr),
        mrp: Number(it.mrp),
        category: it.category || 'Generic',
      }))
    )
    if (!validation.allValid && validation.critical > 0) {
      return toast.error(`${validation.critical} items have critical PTR issues. Please review.`)
    }
    if (validation.warnings > 0) {
      const proceed = window.confirm(
        `⚠️ PTR Validation Warning\n\n` +
        `${validation.warnings} item(s) have low margins.\n\n` +
        `Summary:\n• Critical issues: ${validation.critical}\n• Warnings: ${validation.warnings}\n• Valid: ${validation.valid}\n\n` +
        `Do you want to proceed anyway?`
      )
      if (!proceed) return
    }

    setSaving(true)
    try {
      await postRequest({
        url: '/franchise/purchase/grn',
        cred: {
          supplierId,
          supplier: supplierName,
          poRef,
          invoiceNo: invoiceNo.trim(),
          invoiceDate,
          items: validItems.map((it) => ({
            medicineId: it.medicineId,
            medicineName: it.medicineName,
            batchNo: it.batchNo.trim(),
            expiry: it.expiry,
            qty: Number(it.qty),
            freeQty: Number(it.freeQty) || 0,
            ptr: Number(it.ptr),
            mrp: Number(it.mrp),
          })),
        },
      })
      toast.success('GRN created and stock updated')
      resetForm()
      setTab('list')
      if (page !== 1) setPage(1)
      else fetchGRNs()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create GRN')
    } finally {
      setSaving(false)
    }
  }

  const hasFilters = searchInput || statusFilter || from || to
  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  )

  return (
    <div>
      <PageHeader icon={Package} title="GRN / Inward Entry" subtitle="Record goods received and update stock" color="#16a34a">
        <button
          onClick={() => setTab(tab === 'list' ? 'new' : 'list')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border-0 text-[13px] font-semibold cursor-pointer ${tab === 'new' ? 'bg-gray-200 text-gray-700' : 'bg-[#0c3b73] text-white hover:bg-[#0a3161]'
            }`}
        >
          {tab === 'new' ? '← Back to List' : <><Plus size={14} /> New GRN</>}
        </button>
      </PageHeader>

      {tab === 'list' ? (
        <>
          {/* FILTER BAR */}
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-2.5 mb-3.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search GRN no., supplier, invoice..."
                className="w-full py-2 pl-[30px] pr-2.5 border border-gray-200 rounded-lg text-[13px] outline-none bg-gray-50 focus:border-blue-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-gray-50 cursor-pointer outline-none"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => { setFrom(e.target.value); setPage(1) }}
              className="px-3 py-[7px] border border-gray-200 rounded-lg text-[13px] outline-none"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => { setTo(e.target.value); setPage(1) }}
              className="px-3 py-[7px] border border-gray-200 rounded-lg text-[13px] outline-none"
            />
            {hasFilters && (
              <button
                onClick={() => { setSearchInput(''); setStatusFilter(''); setFrom(''); setTo(''); setPage(1) }}
                className="px-3.5 py-[7px] border border-gray-200 rounded-lg text-xs cursor-pointer text-gray-500 bg-white hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>

          {/* TABLE */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-400">Loading GRNs...</div>
            ) : grns.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className={`${th} text-left`}>GRN No.</th>
                        <th className={`${th} text-left`}>PO Ref.</th>
                        <th className={`${th} text-left`}>Invoice</th>
                        <th className={`${th} text-left`}>Supplier</th>
                        <th className={`${th} text-center`}>Items</th>
                        <th className={`${th} text-left`}>Date</th>
                        <th className={`${th} text-left`}>Status</th>
                        <th className={`${th} text-left`}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grns.map((row) => (
                        <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-3.5 py-2.5 font-bold text-[#0c3b73]">{row.grnNo}</td>
                          <td className="px-3.5 py-2.5 text-gray-700">{row.poRef || '—'}</td>
                          <td className="px-3.5 py-2.5 text-gray-700">{row.invoiceNo || '—'}</td>
                          <td className="px-3.5 py-2.5 text-xs text-gray-700">{row.supplier}</td>
                          <td className="px-3.5 py-2.5 text-center font-semibold">{row.itemCount || 0}</td>
                          <td className="px-3.5 py-2.5 text-xs text-gray-700">{row.date}</td>
                          <td className="px-3.5 py-2.5"><StatusBadge status={row.status} /></td>
                          <td className="px-3.5 py-2.5">
                            <button
                              onClick={() => (row.items?.length ? setViewGrn(row) : toast.error('No items in this GRN'))}
                              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-0 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
                            >
                              View Items
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-gray-500">
                    {total === 0 ? 'No records' : `Showing ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}`}
                  </span>
                  <div className="flex gap-1 items-center">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border border-gray-200 rounded-md px-2 py-1 text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {pageNums.map((p, i) => (
                      <span key={p} className="flex items-center">
                        {i > 0 && pageNums[i - 1] !== p - 1 && <span className="text-gray-400 px-1 text-xs">…</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={`min-w-[30px] h-[30px] rounded-md border text-xs ${p === page ? 'bg-green-600 border-green-600 text-white font-bold' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="border border-gray-200 rounded-md px-2 py-1 text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-10 text-center text-gray-400">No GRNs found</div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-[15px] font-bold m-0 mb-5">New Goods Receipt Note (GRN)</h3>

          <div className="bg-blue-100 border border-blue-300 rounded-lg px-3.5 py-2.5 mb-5 text-xs text-blue-800 flex gap-2">
            <AlertCircle size={14} className="shrink-0 mt-px" />
            <div>
              <strong>GRN Flow:</strong> Select Supplier → Add Invoice details → Fill items with batch, qty, pricing → Submit to create GRN and update inventory
            </div>
          </div>

          <form onSubmit={handleSave} noValidate>
            {/* STEP 1 */}
            <div className="bg-gray-50 rounded-lg p-3.5 mb-5 border-l-[3px] border-[#0c3b73]">
              <h4 className="text-xs font-bold text-gray-700 m-0 mb-3">Step 1: Supplier & Invoice Details</h4>
              <div className="grid gap-3.5 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
                <div>
                  <label className={fieldLabel}>Supplier *</label>
                  <select
                    value={supplierId}
                    onChange={(e) => {
                      setSupplierId(e.target.value)
                      const sup = suppliers.find((s) => s._id === e.target.value)
                      setSupplierName(sup?.companyName || sup?.name || '')
                    }}
                    className={`${fieldInput} cursor-pointer`}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>{s.companyName || s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={fieldLabel}>Invoice Number *</label>
                  <input value={invoiceNo} onChange={(e) => setInvoice(e.target.value)} placeholder="INV-123456" className={fieldInput} />
                </div>
                <div>
                  <label className={fieldLabel}>Invoice Date *</label>
                  <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className={fieldInput} />
                </div>
                <div>
                  <label className={fieldLabel}>PO Reference (Optional)</label>
                  <input value={poRef} onChange={(e) => setPoRef(e.target.value)} placeholder="e.g. PO-2401" className={fieldInput} />
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="bg-gray-50 rounded-lg p-3.5 border-l-[3px] border-green-600">
              <div className="flex justify-between items-center mb-2.5">
                <h4 className="text-xs font-bold text-gray-700 m-0">
                  Step 2: Received Items ({items.filter((it) => it.medicineId).length} added)
                </h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-green-600/25 bg-green-600/10 hover:bg-green-600/20 text-green-600 text-xs font-semibold cursor-pointer"
                >
                  <Plus size={13} /> Add Item
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white">
                <table className="w-full border-collapse text-xs min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-50">
                      {['Medicine *', 'Batch No. *', 'Expiry *', 'Qty *', 'Free', 'PTR (₹) *', 'MRP (₹) *', 'Margin', ''].map((h) => (
                        <th key={h} className="px-2.5 py-2 text-left font-semibold text-gray-700 whitespace-nowrap text-[11px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={item.uid} className={`border-t border-gray-100 ${!item.medicineId ? 'bg-amber-50' : ''}`}>
                        <td className="px-2 py-1.5 min-w-[200px]">
                          <MedicineCell
                            value={item.medicineName}
                            onSelect={(med) => setMedForRow(i, med)}
                            onType={() => clearMedForRow(i)}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input value={item.batchNo} onChange={(e) => setItem(i, 'batchNo', e.target.value)} placeholder="Batch" className={cellInput} />
                        </td>
                        <td className="px-2 py-1.5">
                          <input type="month" value={item.expiry} onChange={(e) => setItem(i, 'expiry', e.target.value)} className={`${cellInput} !w-[120px]`} />
                        </td>
                        <td className="px-2 py-1.5">
                          <input type="number" min={1} value={item.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} className={`${cellInput} !w-[60px]`} />
                        </td>
                        <td className="px-2 py-1.5">
                          <input type="number" min={0} value={item.freeQty} onChange={(e) => setItem(i, 'freeQty', e.target.value)} className={`${cellInput} !w-[50px]`} />
                        </td>
                        <td className="px-2 py-1.5 w-[100px]">
                          <PTRInput
                            value={item.ptr}
                            onChange={(val) => setItem(i, 'ptr', val)}
                            mrp={item.mrp}
                            medicineName={item.medicineName}
                            showMargin={false}
                            showComparison={false}
                            style={{ fontSize: 12 }}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input type="number" step="0.01" min={0} value={item.mrp} onChange={(e) => setItem(i, 'mrp', e.target.value)} placeholder="0.00" className={`${cellInput} !w-[80px]`} />
                        </td>
                        <td className="px-2 py-1.5 w-[100px]">
                          {item.ptr && item.mrp ? (
                            <MarginCalculator ptr={item.ptr} mrp={item.mrp} compact={true} />
                          ) : (
                            <span className="text-[11px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          {items.length > 1 && (
                            <button type="button" onClick={() => delItem(i)} className="bg-transparent border-0 cursor-pointer text-rose-600 hover:text-rose-800">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-gray-500 mt-2 mb-0">
                * Required fields. Medicine search list se select karna zaroori hai (yellow row = medicine select nahi hui).
              </p>
            </div>

            <div className="flex gap-2.5 justify-end mt-5">
              <button
                type="button"
                onClick={() => { resetForm(); setTab('list') }}
                className="px-5 py-[9px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 font-semibold text-[13px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-[22px] py-[9px] rounded-lg border-0 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-bold text-[13px] cursor-pointer"
              >
                <Save size={14} /> {saving ? 'Saving…' : 'Create GRN & Update Stock'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ItemsModal grn={viewGrn} onClose={() => setViewGrn(null)} />
    </div>
  )
}

export default GRNInward