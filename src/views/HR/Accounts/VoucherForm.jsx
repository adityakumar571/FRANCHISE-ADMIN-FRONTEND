import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Receipt, Search, ChevronDown, X } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other']

/* ─── Searchable Account Head Dropdown ─────────────────────────── */
const HeadSelect = ({ heads, value, onChange, error, placeholder = '— Search & select —' }) => {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const ref                   = useRef(null)
  const inputRef              = useRef(null)

  const selected = heads.find((h) => h._id === value)

  const filtered = query.trim()
    ? heads.filter((h) => h.accountName.toLowerCase().includes(query.toLowerCase()))
    : heads

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen(true)
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSelect = (head) => {
    onChange(head._id)
    setOpen(false)
    setQuery('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between gap-2 border rounded-xl px-3 py-2.5 text-sm bg-slate-50 text-left transition
          ${error ? 'border-red-400' : open ? 'border-[#042954] ring-2 ring-[#042954]/20' : 'border-slate-200 hover:border-slate-300'}`}
      >
        <span className={`flex-1 truncate font-medium ${selected ? 'text-slate-700' : 'text-slate-400'}`}>
          {selected ? selected.accountName : placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selected && (
            <span onClick={handleClear} className="p-0.5 rounded hover:bg-slate-200 transition text-slate-400 hover:text-slate-600">
              <X size={12} />
            </span>
          )}
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search account head..."
              className="flex-1 text-sm outline-none bg-transparent font-medium text-slate-700 placeholder-slate-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-400 font-medium">
                No account head found
              </div>
            ) : (
              filtered.map((h) => (
                <button
                  key={h._id}
                  type="button"
                  onClick={() => handleSelect(h)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition flex items-center justify-between gap-2
                    ${value === h._id
                      ? 'bg-[#042954] text-white'
                      : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span className="truncate">{h.accountName}</span>
                  {value === h._id && (
                    <span className="text-white text-xs flex-shrink-0">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Form ─────────────────────────────────────────────────── */
const VoucherForm = () => {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const defaultType   = params.get('type') || 'Income'

  const [voucherType,     setVoucherType]     = useState(defaultType)
  const [voucherDate,     setVoucherDate]      = useState(new Date().toISOString().slice(0, 10))
  const [paymentMode,     setPaymentMode]      = useState('Cash')
  const [referenceNumber, setReferenceNumber]  = useState('')
  const [remarks,         setRemarks]          = useState('')
  const [accountHeads,    setAccountHeads]     = useState([])
  const [lines,           setLines]            = useState([{ accountHead: '', amount: '', remarks: '' }])
  const [submitting,      setSubmitting]       = useState(false)
  const [errors,          setErrors]           = useState({})

  useEffect(() => {
    getRequest(`hr/account-heads?accountType=${voucherType}&status=Active&limit=500`)
      .then((r) => setAccountHeads(r?.data?.data?.heads || []))
      .catch(() => {})
  }, [voucherType])

  const addLine    = () => setLines((l) => [...l, { accountHead: '', amount: '', remarks: '' }])
  const removeLine = (i) => {
    if (lines.length === 1) return toast.error('At least one line required')
    setLines((l) => l.filter((_, idx) => idx !== i))
  }
  const updateLine = (i, field, value) => {
    setLines((l) => l.map((ln, idx) => idx === i ? { ...ln, [field]: value } : ln))
    setErrors((e) => ({ ...e, [`line_${i}_${field}`]: '' }))
  }

  const totalAmount = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0)

  const validate = () => {
    const e = {}
    if (!voucherDate) e.voucherDate = 'Date is required'
    lines.forEach((ln, i) => {
      if (!ln.accountHead)                      e[`line_${i}_accountHead`] = 'Required'
      if (!ln.amount || Number(ln.amount) <= 0)  e[`line_${i}_amount`]     = 'Must be > 0'
    })
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    postRequest({
      url: 'hr/vouchers',
      cred: {
        voucherType, voucherDate, paymentMode, referenceNumber, remarks,
        transactions: lines.map((l) => ({ accountHead: l.accountHead, amount: Number(l.amount), remarks: l.remarks })),
      },
    })
      .then(() => { toast.success('Voucher created successfully'); navigate('/hr/accounts/vouchers') })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to create voucher'))
      .finally(() => setSubmitting(false))
  }

  const isIncome    = voucherType === 'Income'
  const activeColor = isIncome ? '#2d6a4f' : '#7a2d2d'
  const activeBg    = isIncome ? '#2d6a4f18' : '#7a2d2d18'

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-6 space-y-5">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/hr/accounts/vouchers')}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-[#042954] shadow-sm transition hover:shadow-md active:scale-95">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#042954]" /> New Voucher
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Create an income or expense voucher</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* VOUCHER TYPE TOGGLE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Voucher Type</p>
          <div className="flex gap-3">
            {['Income', 'Expense'].map((t) => {
              const active = voucherType === t
              const tc = t === 'Income' ? '#2d6a4f' : '#7a2d2d'
              return (
                <button key={t} type="button"
                  onClick={() => { setVoucherType(t); setLines([{ accountHead: '', amount: '', remarks: '' }]) }}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 border-2 active:scale-95"
                  style={active
                    ? { background: tc, color: '#fff', borderColor: tc }
                    : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}>
                  {t === 'Income' ? '↑ Income' : '↓ Expense'}
                </button>
              )
            })}
          </div>
        </div>

        {/* VOUCHER DETAILS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Voucher Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1.5 font-bold">Voucher Date <span className="text-red-500">*</span></label>
              <input type="date" value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-slate-50 font-medium text-slate-700 ${errors.voucherDate ? 'border-red-400' : 'border-slate-200'}`} />
              {errors.voucherDate && <p className="text-red-500 text-xs mt-1 font-medium">{errors.voucherDate}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5 font-bold">Payment Mode</label>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-slate-50 font-medium text-slate-700">
                {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1.5 font-bold">Reference Number</label>
              <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Cheque / UTR / Ref No."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-slate-50 font-medium text-slate-700" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs text-slate-600 mb-1.5 font-bold">Remarks</label>
              <textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional remarks..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-slate-50 font-medium text-slate-700 resize-none" />
            </div>
          </div>
        </div>

        {/* TRANSACTION LINES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isIncome ? 'Income' : 'Expense'} Lines</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {accountHeads.length} heads available · min 1 line required
              </p>
            </div>
            <button type="button" onClick={addLine}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1 active:scale-95 transition shadow-sm"
              style={{ background: activeColor }}>
              <Plus size={13} /> Add Line
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((ln, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition"
                style={{ borderLeftWidth: 3, borderLeftColor: activeColor }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">

                  {/* Account Head — searchable */}
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-bold">
                      Account Head <span className="text-red-500">*</span>
                      <span className="ml-1 text-slate-300 font-medium">({accountHeads.length})</span>
                    </label>
                    <HeadSelect
                      heads={accountHeads}
                      value={ln.accountHead}
                      onChange={(v) => updateLine(i, 'accountHead', v)}
                      error={errors[`line_${i}_accountHead`]}
                    />
                    {errors[`line_${i}_accountHead`] && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors[`line_${i}_accountHead`]}</p>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-bold">Amount (₹) <span className="text-red-500">*</span></label>
                    <input type="number" min="0.01" step="0.01" value={ln.amount}
                      onChange={(e) => updateLine(i, 'amount', e.target.value)} placeholder="0.00"
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-slate-50 font-medium text-slate-700 ${errors[`line_${i}_amount`] ? 'border-red-400' : 'border-slate-200'}`} />
                    {errors[`line_${i}_amount`] && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors[`line_${i}_amount`]}</p>
                    )}
                  </div>

                  {/* Remarks + Delete */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1.5 font-bold">Remarks</label>
                      <input type="text" value={ln.remarks}
                        onChange={(e) => updateLine(i, 'remarks', e.target.value)} placeholder="Optional"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-slate-50 font-medium text-slate-700" />
                    </div>
                    <div className="flex items-end pb-0.5">
                      <button type="button" onClick={() => removeLine(i)} disabled={lines.length === 1}
                        className="p-2.5 rounded-xl hover:bg-red-50 text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="mt-4 p-4 rounded-xl border flex items-center justify-between"
            style={{ background: activeBg, borderColor: activeColor + '40' }}>
            <span className="text-sm font-bold text-slate-700">Total Amount</span>
            <span className="text-2xl font-black" style={{ color: activeColor }}>₹{fmt(totalAmount)}</span>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end gap-3 pb-6">
          <button type="button" onClick={() => navigate('/hr/accounts/vouchers')}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-bold transition">
            Cancel
          </button>
          <button type="submit" disabled={submitting || totalAmount <= 0}
            className="px-6 py-2.5 text-sm text-white rounded-xl font-bold disabled:opacity-50 transition shadow-sm active:scale-95"
            style={{ background: activeColor }}>
            {submitting ? 'Saving...' : `Save ${voucherType} Voucher`}
          </button>
        </div>
      </form>
    </div>
  )
}

export default VoucherForm
