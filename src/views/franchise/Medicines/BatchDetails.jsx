/* eslint-disable prettier/prettier */
/**
 * BatchDetails — Tailwind UI
 * Shows all batches for a medicine (from embedded Medicine.batches[])
 * + Add New Batch modal → POST /franchise/medicines/:id/batch
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Package, ArrowLeft, Plus, AlertTriangle, Calendar,
  CheckCircle2, XCircle, Clock, RefreshCw, X, Save,
  Layers,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest } from '../../../Helpers'

/* ── status config ── */
const STATUS = {
  'Active':        { cls: 'bg-green-50 text-green-700 border-green-200',  icon: <CheckCircle2 size={11}/> },
  'Expiring Soon': { cls: 'bg-amber-50 text-amber-700 border-amber-200',  icon: <Clock size={11}/> },
  'Out of Stock':  { cls: 'bg-gray-50  text-gray-500  border-gray-200',   icon: <XCircle size={11}/> },
  'Expired':       { cls: 'bg-red-50   text-red-600   border-red-200',    icon: <XCircle size={11}/> },
}

const EMPTY_BATCH = {
  batchNo: '', mfgDate: '', expiryDate: '',
  quantity: '', mrp: '', purchasePrice: '', supplierName: '',
}

/* ── small field ── */
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
)
const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white transition'

/* ════════════════════════════════════════════════════════ */
export default function BatchDetails() {
  const navigate  = useNavigate()
  const { id }    = useParams()

  const [med,     setMed]     = useState(null)
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  /* add modal */
  const [modalOpen, setModalOpen] = useState(false)
  const [form,      setForm]      = useState(EMPTY_BATCH)
  const [saving,    setSaving]    = useState(false)

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [medRes, batchRes] = await Promise.allSettled([
        getRequest(`/franchise/medicines/${id}`),
        getRequest(`/franchise/medicines/${id}/batches`),
      ])
      if (medRes.status   === 'fulfilled') setMed(medRes.value.data?.data)
      if (batchRes.status === 'fulfilled') setBatches(batchRes.value.data?.data || [])
    } catch { toast.error('Failed to load batch details') }
    finally  { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  /* ── kpis ── */
  const totalStock  = batches.reduce((s, b) => s + (b.stock ?? b.qty ?? 0), 0)
  const nearExpiry  = batches.filter(b => b.status === 'Expiring Soon').length
  const expired     = batches.filter(b => b.status === 'Expired').length
  const active      = batches.filter(b => b.status === 'Active').length

  /* ── add batch ── */
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleAdd = async () => {
    if (!form.batchNo.trim())   { toast.error('Batch number required'); return }
    if (!form.expiryDate)       { toast.error('Expiry date required'); return }
    if (!form.quantity)         { toast.error('Quantity required'); return }
    if (!form.mrp)              { toast.error('MRP required'); return }
    if (!form.purchasePrice)    { toast.error('Purchase price required'); return }

    setSaving(true)
    try {
      await postRequest({
        url: `/franchise/medicines/${id}/batch`,
        cred: {
          batchNo:       form.batchNo.trim(),
          mfgDate:       form.mfgDate     || undefined,
          expiryDate:    form.expiryDate,
          quantity:      parseInt(form.quantity)       || 0,
          mrp:           parseFloat(form.mrp)          || 0,
          purchasePrice: parseFloat(form.purchasePrice)|| 0,
          supplierName:  form.supplierName.trim(),
        },
      })
      toast.success('Batch added successfully')
      setModalOpen(false)
      setForm(EMPTY_BATCH)
      fetchData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add batch')
    } finally { setSaving(false) }
  }

  /* ════════════ RENDER ════════════ */
  return (
    <div className="font-sans flex flex-col gap-5">

      {/* Header */}
      <PageHeader icon={Layers} title="Batch Details" subtitle="Track all batches, expiry dates and FIFO stock" color="#0891b2">
        <button onClick={() => navigate(`/franchise/medicines/${id}`)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition">
          <ArrowLeft size={13}/> Back to Medicine
        </button>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg transition shadow-lg shadow-cyan-700/20">
          <Plus size={14}/> Add New Batch
        </button>
      </PageHeader>

      {/* Medicine identity */}
      {med && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
            💊
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{med.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{med.salt} · {med.company} · MRP ₹{med.mrp}</p>
          </div>
          {/* KPIs */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Total Stock',   value: loading ? '…' : totalStock, color: 'text-cyan-700',  bg: 'bg-cyan-50'  },
              { label: 'Active',        value: loading ? '…' : active,     color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Near Expiry',   value: loading ? '…' : nearExpiry, color: 'text-amber-700', bg: 'bg-amber-50' },
              { label: 'Expired',       value: loading ? '…' : expired,    color: 'text-red-600',   bg: 'bg-red-50'   },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl px-4 py-2.5 text-center min-w-[80px]`}>
                <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">{s.label}</p>
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {nearExpiry > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm font-semibold text-amber-700">
          <AlertTriangle size={16} className="flex-shrink-0"/>
          {nearExpiry} batch{nearExpiry > 1 ? 'es' : ''} expiring within 60 days — plan reorder soon.
        </div>
      )}
      {expired > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-600">
          <XCircle size={16} className="flex-shrink-0"/>
          {expired} batch{expired > 1 ? 'es' : ''} have expired — remove from stock.
        </div>
      )}

      {/* Batch Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-700">
            {loading ? 'Loading…' : `${batches.length} batch${batches.length !== 1 ? 'es' : ''}`}
          </span>
          <span className="text-xs text-gray-400">Sorted by expiry date (FIFO)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['#','Batch No.','Mfg Date','Expiry Date','Days Left','Stock','Purchase ₹','MRP ₹','Supplier','Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(4).fill(0).map((_,i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array(10).fill(0).map((_,j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-gray-100 rounded animate-pulse"/>
                      </td>
                    ))}
                  </tr>
                ))
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <Package size={36} className="mx-auto mb-3 text-gray-200"/>
                    <p className="text-sm text-gray-400">No batches found</p>
                    <button onClick={() => setModalOpen(true)}
                      className="mt-3 px-4 py-2 text-xs font-semibold bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition">
                      Add First Batch
                    </button>
                  </td>
                </tr>
              ) : batches.map((b, i) => {
                const cfg     = STATUS[b.status] || STATUS['Active']
                const daysLeft = b.daysLeft ?? 0
                const daysColor = daysLeft < 0 ? 'text-red-600 font-bold' : daysLeft <= 30 ? 'text-amber-600 font-bold' : daysLeft <= 60 ? 'text-amber-500' : 'text-green-700'
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-cyan-700 font-mono text-sm">{b.batchNo}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{b.mfgDate || '—'}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700">{b.expiryDate}</td>
                    <td className={`px-4 py-3 text-xs ${daysColor}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${(b.stock ?? b.qty ?? 0) === 0 ? 'text-red-500' : 'text-gray-800'}`}>
                        {b.stock ?? b.qty ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">₹{Number(b.purchasePrice || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs font-bold text-blue-900">₹{Number(b.mrp || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{b.supplierName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                        {cfg.icon} {b.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add Batch Modal ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <Plus size={15} className="text-cyan-700"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Add New Batch</p>
                  <p className="text-[11px] text-gray-400">{med?.name}</p>
                </div>
              </div>
              <button onClick={() => { setModalOpen(false); setForm(EMPTY_BATCH) }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400">
                <X size={16}/>
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 grid grid-cols-2 gap-4">
              <Field label="Batch Number" required>
                <input value={form.batchNo} onChange={set('batchNo')} placeholder="e.g. BTH001"
                  className={inputCls}/>
              </Field>
              <Field label="Mfg Date">
                <input type="date" value={form.mfgDate} onChange={set('mfgDate')} className={inputCls}/>
              </Field>
              <Field label="Expiry Date" required>
                <input type="date" value={form.expiryDate} onChange={set('expiryDate')} className={inputCls}/>
              </Field>
              <Field label="Quantity" required>
                <input type="number" value={form.quantity} onChange={set('quantity')} placeholder="0" min="1"
                  className={inputCls}/>
              </Field>
              <Field label="MRP (₹)" required>
                <input type="number" value={form.mrp} onChange={set('mrp')}
                  placeholder={String(med?.mrp || '0.00')} step="0.01"
                  className={inputCls}/>
              </Field>
              <Field label="Purchase Price (₹)" required>
                <input type="number" value={form.purchasePrice} onChange={set('purchasePrice')}
                  placeholder={String(med?.purchasePrice || '0.00')} step="0.01"
                  className={inputCls}/>
              </Field>
              <div className="col-span-2">
                <Field label="Supplier Name">
                  <input value={form.supplierName} onChange={set('supplierName')} placeholder="e.g. Sun Pharma"
                    className={inputCls}/>
                </Field>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-6 pb-5">
              <button onClick={() => { setModalOpen(false); setForm(EMPTY_BATCH) }}
                className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={saving}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-xl transition
                  ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-cyan-700 hover:bg-cyan-800 shadow-lg shadow-cyan-700/20'}`}>
                {saving ? <RefreshCw size={13} className="animate-spin"/> : <Save size={13}/>}
                {saving ? 'Adding…' : 'Add Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
