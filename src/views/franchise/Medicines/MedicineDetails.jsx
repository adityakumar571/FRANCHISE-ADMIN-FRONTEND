/* eslint-disable prettier/prettier */
/**
 * MedicineDetails — Tailwind UI, all fields from real API fields
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FlaskConical, ArrowLeft, Edit2, Printer,
  Info, Layers, GitCompare, MapPin, ImageIcon,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  IndianRupee, Pill,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'

/* ── helpers ── */
const Row = ({ label, value, color, mono }) => {
  // Handle objects - extract name property
  let displayValue = value
  if (value && typeof value === 'object') {
    displayValue = value.name || value._id || JSON.stringify(value).slice(0, 20)
  }
  
  // Fallback for empty strings or null-like values
  if (!displayValue || displayValue === '[object Object]' || displayValue === '{}') {
    displayValue = null
  }
  
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className={`text-sm font-semibold text-right max-w-[55%] truncate ${mono ? 'font-mono' : ''}`}
        style={{ color: color || '#374151' }}>
        {displayValue ?? '—'}
      </span>
    </div>
  )
}

const SectionCard = ({ title, icon: Icon, color = '#0c3b73', children }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
      {Icon && <Icon size={14} style={{ color }} />}
      <span className="text-sm font-bold text-gray-700">{title}</span>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
)

/* ════════════════════════════════════════════════════════ */
export default function MedicineDetails() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const [med,     setMed]     = useState(null)
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMedicine = useCallback(async () => {
    setLoading(true)
    try {
      const [medRes, batchRes] = await Promise.all([
        getRequest(`/franchise/medicines/${id}`),
        getRequest(`/franchise/medicines/${id}/batches`)
      ])
      setMed(medRes.data?.data || null)
      setBatches(batchRes.data?.data || [])
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load medicine details')
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchMedicine() }, [fetchMedicine])

  /* ── loading skeleton ── */
  if (loading) return (
    <div className="font-sans flex flex-col gap-5">
      <div className="h-16 bg-white rounded-xl border border-gray-200 animate-pulse"/>
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5">
        {[1,2].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            {Array(6).fill(0).map((_,j) => (
              <div key={j} className="flex justify-between">
                <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse"/>
                <div className="h-3 w-2/5 bg-gray-100 rounded animate-pulse"/>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )

  if (!med) return (
    <div className="font-sans text-center py-20">
      <FlaskConical size={48} className="mx-auto mb-3 text-gray-200"/>
      <p className="text-gray-400 text-sm mb-4">Medicine not found.</p>
      <button onClick={() => navigate('/franchise/medicines')}
        className="px-5 py-2 bg-blue-900 text-white text-sm font-semibold rounded-lg">
        Back to List
      </button>
    </div>
  )

  /* ── derived values from actual API field names ── */
  const stock        = med.currentStock ?? 0
  const reorder      = med.reorderLevel ?? 10
  const stockLabel   = stock === 0 ? 'Out of Stock' : stock <= reorder ? 'Low Stock' : 'In Stock'
  const stockBadge   = stock === 0
    ? 'bg-red-50 text-red-600 border-red-200'
    : stock <= reorder
    ? 'bg-amber-50 text-amber-600 border-amber-200'
    : 'bg-green-50 text-green-700 border-green-200'
  const stockIcon    = stock === 0 ? <XCircle size={12}/> : stock <= reorder ? <AlertTriangle size={12}/> : <CheckCircle2 size={12}/>

  const rackPos      = med.rackLocation?.position || '—'
  const rackId       = med.rackLocation?.rackId   || '—'
  const gstDisplay   = med.gstPercent != null ? `${med.gstPercent}%` : med.gst ? `${med.gst}%` : '—'
  const hsnDisplay   = med.hsnCode || med.hsn || '—'

  /* ── nearest expiry from batches ── */
  const now = new Date()
  const activeBatches = (batches || []).filter(b => b.isActive !== false)
  const nearestExpiry = activeBatches.length
    ? activeBatches
        .filter(b => new Date(b.expiryDate) > now)
        .sort((a,b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0]
    : null
  const nearestExpiryDays = nearestExpiry
    ? Math.ceil((new Date(nearestExpiry.expiryDate) - now) / 86400000)
    : null

  /* ════════════ RENDER ════════════ */
  return (
    <div className="font-sans flex flex-col gap-5">

      {/* Header */}
      <PageHeader icon={FlaskConical} title="Medicine Details" subtitle={med.name} color="#0c3b73">
        <button onClick={() => navigate('/franchise/medicines')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition">
          <ArrowLeft size={13}/> Back
        </button>
        <button onClick={() => navigate(`/franchise/medicines/${med._id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition shadow-lg shadow-amber-500/20">
          <Edit2 size={13}/> Edit
        </button>
        <button onClick={() => navigate(`/franchise/medicines/${med._id}/barcode`)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition">
          <Printer size={13}/> Print Label
        </button>
        <button onClick={fetchMedicine}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5 items-start">

        {/* ── LEFT COL ── */}
        <div className="flex flex-col gap-4">

          {/* Image */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            {med.imageUrl ? (
              <img src={med.imageUrl} alt={med.name}
                className="w-40 h-40 rounded-xl object-cover mx-auto mb-4 border border-gray-100"
                onError={e => { e.target.style.display='none'; e.target.parentElement.querySelector('[data-placeholder]').style.display='flex' }}/>
            ) : null}
            <div data-placeholder className={`w-40 h-40 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-100 mx-auto mb-4 items-center justify-center text-7xl ${med.imageUrl ? 'hidden' : 'flex'}`}>
              💊
            </div>
            <p className="text-base font-bold text-gray-800 mb-0.5">{med.name}</p>
            <p className="text-xs text-gray-400 mb-3">{med.salt || med.genericName || '—'} · {typeof med.company === 'object' ? (med.company?.name || '—') : (med.company || '—')}</p>
            {/* Badges */}
            <div className="flex justify-center gap-2 flex-wrap mb-4">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${med.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {med.isActive ? <CheckCircle2 size={10}/> : <XCircle size={10}/>}
                {med.isActive ? 'Active' : 'Inactive'}
              </span>
              {med.requiresPrescription && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                  Rx Required
                </span>
              )}
              {med.schedule && med.schedule !== 'None' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-red-50 text-red-600 border-red-200">
                  Schedule {med.schedule}
                </span>
              )}
            </div>
            <button onClick={() => navigate(`/franchise/medicines/${med._id}/images`)}
              className="w-full py-2 text-sm font-semibold text-cyan-700 border border-cyan-200 rounded-lg hover:bg-cyan-50 flex items-center justify-center gap-2 transition">
              <ImageIcon size={13}/> Manage Images ({med.images?.length || 0})
            </button>
          </div>

          {/* Stock & Pricing */}
          <SectionCard title="Stock & Pricing" icon={IndianRupee} color="#16a34a">
            {/* Stock status */}
            <div className={`flex items-center justify-between mb-3 px-3 py-2 rounded-lg border ${stockBadge}`}>
              <div className="flex items-center gap-1.5">
                {stockIcon}
                <span className="text-xs font-bold">{stockLabel}</span>
              </div>
              <span className="text-lg font-extrabold">{stock}</span>
            </div>
            <Row label="MRP"             value={`₹ ${Number(med.mrp || 0).toFixed(2)}`}           color="#0c3b73"/>
            <Row label="Purchase Price"  value={`₹ ${Number(med.purchasePrice || 0).toFixed(2)}`} />
            <Row label="Selling Price"   value={med.sellingPrice ? `₹ ${Number(med.sellingPrice).toFixed(2)}` : '—'} />
            <Row label="GST"             value={gstDisplay} />
            <Row label="HSN Code"        value={hsnDisplay} mono />
            <Row label="Reorder Level"   value={reorder} />
            <Row label="Min Stock"       value={med.minStock ?? '—'} />
            <Row label="Max Stock"       value={med.maxStock ?? '—'} />
            {nearestExpiry && (
              <Row
                label="Next Expiry"
                value={`${new Date(nearestExpiry.expiryDate).toLocaleDateString('en-IN')} (${nearestExpiryDays}d)`}
                color={nearestExpiryDays <= 30 ? '#dc2626' : nearestExpiryDays <= 60 ? '#d97706' : '#16a34a'}
              />
            )}
          </SectionCard>

          {/* Rack Location */}
          <SectionCard title="Rack Location & Counter" icon={MapPin} color="#7c3aed">
            {/* Counter Info */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Counter Assignment</p>
              {med.counterId && typeof med.counterId === 'object' ? (
                <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                  <p className="text-sm font-bold text-purple-700">{med.counterId.name}</p>
                  <p className="text-xs text-purple-600 font-mono mt-0.5">{med.counterId.code}</p>
                </div>
              ) : med.counterId ? (
                <div className="text-xs text-gray-500">{typeof med.counterId === 'object' ? (med.counterId?.name || med.counterId?._id || '—') : med.counterId}</div>
              ) : (
                <div className="text-xs text-gray-400">No counter assigned</div>
              )}
            </div>
            
            {/* Rack Location */}
            {rackPos !== '—' ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2.5 mb-3 flex items-center gap-2">
                <MapPin size={14} className="text-indigo-600 flex-shrink-0"/>
                <span className="text-sm font-bold text-indigo-700 font-mono">{rackPos}</span>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-2.5 mb-3 text-center text-xs text-gray-400">
                No rack assigned
              </div>
            )}
            <Row label="Rack"    value={rackId} mono/>
            <Row label="Shelf"   value={med.rackLocation?.shelf   ?? '—'}/>
            <Row label="Row"     value={med.rackLocation?.row     ?? '—'}/>
            <Row label="Column"  value={med.rackLocation?.column  ?? '—'}/>
          </SectionCard>
        </div>

        {/* ── RIGHT COL ── */}
        <div className="flex flex-col gap-4">

          {/* Basic Details */}
          <SectionCard title="Medicine Details" icon={Info} color="#0c3b73">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <Row label="Salt / Generic"  value={med.salt}        />
              <Row label="Brand"           value={med.brand}       />
              <Row label="Generic Name"    value={med.genericName} />
              <Row label="Category"        value={typeof med.category === 'object' ? (med.category?.name || '—') : (med.category || '—')}    />
              <Row label="Formulation"     value={(() => {
                if (typeof med.formulation === 'object') {
                  return med.formulation?.name || '—';
                }
                return med.formulation || '—';
              })()} />
              <Row label="Strength"        value={med.strength}    />
              <Row label="Company"         value={typeof med.company === 'object' ? (med.company?.name || '—') : (med.company || '—')}     />
              <Row label="Unit"            value={med.unit}        />
              <Row label="Pack Size"       value={med.packSize}    />
              <Row label="Schedule"        value={med.schedule}    />
              <Row label="Barcode"         value={med.barcode}     mono/>
              <Row label="SKU"             value={med.sku}         mono/>
            </div>
          </SectionCard>

          {/* Batches summary */}
          <SectionCard title={`Batches (${(batches || []).length})`} icon={Layers} color="#0891b2">
            {(batches || []).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No batches added yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      {['Batch No.','Expiry','Qty','MRP ₹','Status'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...(batches || [])]
                      .filter(b => b.isActive !== false)
                      .sort((a,b) => new Date(a.expiryDate) - new Date(b.expiryDate))
                      .slice(0,5)
                      .map((b,i) => {
                        const exp     = new Date(b.expiryDate)
                        const days    = Math.ceil((exp - now) / 86400000)
                        const isExp   = days < 0
                        const isNear  = !isExp && days <= 60
                        const badgeCls = isExp  ? 'bg-red-50 text-red-600 border-red-200'
                          : isNear ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                        return (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="px-3 py-2 font-bold text-cyan-700 font-mono">{b.batchNo}</td>
                            <td className="px-3 py-2 text-gray-600">{exp.toLocaleDateString('en-IN')}</td>
                            <td className="px-3 py-2 font-semibold">{b.qty ?? b.quantity ?? 0}</td>
                            <td className="px-3 py-2 text-blue-900 font-bold">₹{Number(b.mrp||0).toFixed(2)}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeCls}`}>
                                {isExp ? 'Expired' : isNear ? `${days}d left` : 'Active'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
                {(batches || []).length > 5 && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    +{(batches || []).length - 5} more batches
                  </p>
                )}
              </div>
            )}
            <button onClick={() => navigate(`/franchise/medicines/${med._id}/batches`)}
              className="mt-3 w-full py-2 text-xs font-bold text-cyan-700 border border-cyan-200 rounded-lg hover:bg-cyan-50 flex items-center justify-center gap-1.5 transition">
              <Layers size={12}/> View All Batches & Add New
            </button>
          </SectionCard>

          {/* Description */}
          {med.description && (
            <SectionCard title="Description" icon={Info} color="#6b7280">
              <p className="text-sm text-gray-600 leading-relaxed">{med.description}</p>
            </SectionCard>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'All Batches',     icon: Layers,      path: `/franchise/medicines/${med._id}/batches`,      cls: 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100' },
              { label: 'Edit Medicine',   icon: Edit2,       path: `/franchise/medicines/${med._id}/edit`,         cls: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
              { label: 'Generic Map',     icon: GitCompare,  path: `/franchise/medicines/${med._id}/generic`,      cls: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
              { label: 'Alternatives',    icon: Pill,        path: `/franchise/medicines/${med._id}/alternatives`, cls: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 border rounded-xl text-xs font-bold transition ${a.cls}`}>
                <a.icon size={16}/>
                {a.label}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
