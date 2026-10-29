/* eslint-disable prettier/prettier */
/**
 * EditMedicine — mirrors AddMedicine structure
 * Same fields: Name, Salt, Brand, Category, Formulation, Strength,
 *              MRP, GST%, ReorderLevel, Counter, Rack, Image
 *
 * NOT editable here: purchasePrice, sellingPrice, batches (per-batch in GRN)
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Edit2, ArrowLeft, Save, Eye, Upload, X, ImageIcon,
  QrCode, MapPin, Package, IndianRupee, AlertCircle, CheckCircle2, RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getRequest, putRequest, fileUpload } from '../../../../Helpers'
import PageHeader from '../../components/PageHeader'

/* ─── constants ─────────────────────────────────── */
const GST_OPTS     = ['0','5','12','18','28']

/* ─── UI helpers ──────────────────────────────── */
const Label = ({ text, req }) => (
  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
    {text}{req && <span className="text-red-500 ml-0.5">*</span>}
  </label>
)
const Field = ({ label, required, hint, children }) => (
  <div>
    <Label text={label} req={required} />
    {hint && <p className="text-[10px] text-gray-400 mb-1">{hint}</p>}
    {children}
  </div>
)
const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white text-gray-800 transition'
const TInput = ({ value, onChange, placeholder, type='text', min, step }) => (
  <input type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder}
    min={min} step={step} className={inputCls} />
)
const TSel = ({ value, onChange, opts=[], placeholder }) => (
  <select value={value ?? ''} onChange={onChange} className={inputCls + ' cursor-pointer'}>
    {placeholder && <option value="">{placeholder}</option>}
    {opts.map(o => <option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
  </select>
)
const Card = ({ title, icon: Icon, hint, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
    <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
      {Icon && <Icon size={15} className="text-amber-600" />}
      <span className="text-sm font-bold text-gray-700">{title}</span>
      {hint && <span className="ml-auto text-[10px] text-gray-400">{hint}</span>}
    </div>
    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
)

/* ══════════════════════════════════════════════════════════ */
export default function EditMedicine() {
  const navigate = useNavigate()
  const { id }   = useParams()

  /* masters */
  const [categories,   setCategories]   = useState([])
  const [formulations, setFormulations] = useState([])

  /* counter / rack */
  const [counters,      setCounters]      = useState([])
  const [racks,         setRacks]         = useState([])
  const [selCounter,    setSelCounter]    = useState('')
  const [selRack,       setSelRack]       = useState(null)
  const [rackPos,       setRackPos]       = useState({ shelf:1, row:'A', column:1 })
  const [loadingRacks,  setLoadingRacks]  = useState(false)
  const [occupiedSlots, setOccupiedSlots] = useState([])

  /* form */
  const [form,    setForm]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  /* image */
  const fileRef    = useRef(null)
  const savedRackCodeRef = useRef(null)   // replaces window.__editMedRackCode hack
  const [imageUrl,     setImageUrl]     = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [uploading,    setUploading]    = useState(false)

  /* ── load masters ── */
  useEffect(() => {
    getRequest('/franchise/medicines/masters/all').then(res => {
      const d = res?.data?.data
      if (d?.categories?.length)   setCategories(d.categories.filter(c => c.isActive))
      if (d?.units?.length)        setFormulations(d.units.filter(u => u.isActive))  // Map units as formulations
    }).catch(err => console.error('Failed to load masters:', err))
  }, [])

  /* ── load counters ── */
  useEffect(() => {
    getRequest('/franchise/master/counters')
      .then(res => setCounters(res?.data?.data || []))
      .catch(() => {})
  }, [])

  /* ── load medicine ── */
  const fetchMed = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/medicines/${id}`)
      const d   = res?.data?.data
      if (!d) { toast.error('Medicine not found'); navigate('/franchise/medicines'); return }

      setForm({
        name:         d.name        || '',
        salt:         d.salt        || '',
        brand:        d.brand       || '',
        category:     d.category    || '',
        formulation:  d.formulation || '',
        strength:     d.strength    || '',
        mrp:          d.mrp         ?? '',
        gst:          String(d.gstPercent ?? 12),
        reorderLevel: d.reorderLevel ?? 10,
        barcode:      d.barcode     || '',
      })

      if (d.imageUrl) { setImageUrl(d.imageUrl); setImagePreview(d.imageUrl) }

      if (d.counterId) {
        const cId = d.counterId?._id || d.counterId
        setSelCounter(String(cId))
        if (d.rackLocation?.rackId) {
          savedRackCodeRef.current = d.rackLocation.rackId
          setRackPos({
            shelf:  d.rackLocation.shelf  || 1,
            row:    d.rackLocation.row    || 'A',
            column: d.rackLocation.column || 1,
          })
        }
      }
    } catch { toast.error('Failed to load medicine') }
    finally  { setLoading(false) }
  }, [id, navigate])

  useEffect(() => { fetchMed() }, [fetchMed])

  /* ── racks when counter changes ── */
  useEffect(() => {
    if (!selCounter) { setRacks([]); setSelRack(null); return }
    setLoadingRacks(true)
    getRequest(`/franchise/master/racks?counterId=${selCounter}`)
      .then(res => {
        const r = res?.data?.data || []
        setRacks(r)
        const savedCode = savedRackCodeRef.current
        if (savedCode) {
          const match = r.find(rack => rack.code === savedCode)
          setSelRack(match || r[0] || null)
          savedRackCodeRef.current = null
        } else {
          setSelRack(prev => prev || r[0] || null)
        }
      })
      .catch(() => setRacks([]))
      .finally(() => setLoadingRacks(false))
  }, [selCounter])

  /* ── occupied slots when rack changes ── */
  useEffect(() => {
    if (!selRack) { setOccupiedSlots([]); return }
    getRequest(`/franchise/medicines/occupied-slots?rackId=${selRack.code}`)
      .then(res => setOccupiedSlots(res?.data?.data || []))
      .catch(() => setOccupiedSlots([]))
  }, [selRack])

  /* helpers */
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const rowOpts   = selRack ? Array.from({ length: selRack.rowsPerShelf  || 3 }, (_,i) => String.fromCharCode(65+i)) : ['A','B','C']
  const shelfOpts = selRack ? Array.from({ length: selRack.shelves       || 5 }, (_,i) => i+1)                       : [1,2,3,4,5]
  const colOpts   = selRack ? Array.from({ length: selRack.columnsPerRow || 4 }, (_,i) => i+1)                       : [1,2,3,4]
  const posLabel  = selRack ? `${selRack.code}-${rackPos.shelf}-${rackPos.row}-${rackPos.column}` : '—'

  const isOccupied  = useCallback((shelf, row, col) => {
    const pos = `${selRack?.code}-${shelf}-${row}-${col}`
    return occupiedSlots.find(s => s.position === pos) || null
  }, [occupiedSlots, selRack])
  const curOccupied = selRack ? isOccupied(rackPos.shelf, rackPos.row, rackPos.column) : null

  /* barcode */
  const genBarcode = () => {
    const bc = `MED${Date.now().toString().slice(-8)}${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`
    setForm(p => ({ ...p, barcode: bc }))
    toast.success('Barcode generated')
  }

  /* image */
  const handleImg = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Only images allowed'); return }
    if (file.size > 2*1024*1024)         { toast.error('Max 2MB'); return }
    setImagePreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fileUpload({ url:'upload/uploadImage', cred:fd, isFormData:true })
      const url = res?.data?.data?.imageUrl
      if (!url) throw new Error()
      setImageUrl(url); setImagePreview(url)
      toast.success('Image uploaded')
    } catch { toast.error('Upload failed'); setImagePreview(imageUrl || '') }
    finally  { setUploading(false); if (fileRef.current) fileRef.current.value='' }
  }
  const removeImg = () => { setImageUrl(''); setImagePreview(''); if (fileRef.current) fileRef.current.value='' }

  /* save */
  const handleUpdate = async () => {
    if (!form?.name?.trim())  { toast.error('Medicine name required'); return }
    if (!form?.salt?.trim())  { toast.error('Salt required'); return }
    if (!form?.category)      { toast.error('Category required'); return }
    if (!form?.formulation)   { toast.error('Formulation required'); return }
    if (!form?.mrp)           { toast.error('MRP required'); return }
    if (!selCounter)          { toast.error('Select a counter'); return }
    if (!selRack)             { toast.error('Select a rack'); return }

    setSaving(true)
    try {
      await putRequest({
        url: `/franchise/medicines/${id}`,
        cred: {
          name:         form.name.trim(),
          salt:         form.salt.trim(),
          brand:        form.brand.trim(),
          category:     form.category,
          formulation:  form.formulation,
          strength:     form.strength.trim(),
          mrp:          parseFloat(form.mrp) || 0,
          gstPercent:   parseFloat(form.gst) || 12,
          reorderLevel: parseInt(form.reorderLevel) || 10,
          barcode:      form.barcode || undefined,
          imageUrl:     imageUrl || undefined,
          counterId:    selCounter,
          rackId:       selRack._id,
          rackLocation: {
            rackId:   selRack.code,
            shelf:    rackPos.shelf,
            row:      rackPos.row,
            column:   rackPos.column,
            position: posLabel,
          },
          // purchasePrice, sellingPrice, batches — NOT updated here
        },
      })
      toast.success('Medicine updated')
      navigate(`/franchise/medicines/${id}`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update medicine')
    } finally { setSaving(false) }
  }

  /* ── loading / error ── */
  if (loading) return (
    <div className="flex items-center justify-center min-h-64 text-gray-400 text-sm gap-2">
      <RefreshCw size={16} className="animate-spin" /> Loading medicine…
    </div>
  )
  if (!form) return (
    <div className="flex items-center justify-center min-h-64 text-gray-400 text-sm">Medicine not found.</div>
  )

  /* ══════════════════════ RENDER ══════════════════════════ */
  return (
    <div className="font-sans">
      <PageHeader icon={Edit2} title="Edit Medicine" subtitle={`Editing: ${form.name}`} color="#d97706">
        <button onClick={() => navigate(`/franchise/medicines/${id}`)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition">
          <Eye size={13} /> View
        </button>
        <button onClick={() => navigate('/franchise/medicines')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition">
          <ArrowLeft size={13} /> Back
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 mt-4 items-start">

        {/* ── LEFT ── */}
        <div>

          {/* 1. Medicine Details */}
          <Card title="Medicine Details" icon={Package}>
            <Field label="Medicine Name" required>
              <TInput value={form.name} onChange={set('name')} placeholder="Full medicine name" />
            </Field>
            <Field label="Salt / Generic Name" required>
              <TInput value={form.salt} onChange={set('salt')} placeholder="Active ingredient" />
            </Field>
            <Field label="Brand">
              <TInput value={form.brand} onChange={set('brand')} placeholder="Brand name (optional)" />
            </Field>
            <Field label="Category" required>
              <TSel value={form.category} onChange={set('category')} 
                opts={categories.map(c => ({ value: c._id, label: c.name }))} 
                placeholder="Select category" />
            </Field>
            <Field label="Formulation / Dosage Form" required hint="e.g. Tablet, Capsule, Syrup, Injection">
              <TSel value={form.formulation} onChange={set('formulation')} 
                opts={formulations.map(f => ({ value: f._id, label: f.name }))} 
                placeholder="Select formulation" />
            </Field>
            <Field label="Strength" hint="e.g. 500mg, 10ml">
              <TInput value={form.strength} onChange={set('strength')} placeholder="Strength / dose" />
            </Field>
          </Card>

          {/* 2. Pricing & Tax (master defaults only) */}
          <Card title="Pricing & Tax" icon={IndianRupee}
            hint="Purchase price goes in GRN / Stock Entry">
            <Field label="MRP (₹)" required hint="Printed on pack — same for all batches">
              <TInput type="number" value={form.mrp} onChange={set('mrp')} placeholder="0.00" step="0.01" min="0" />
            </Field>
            <Field label="GST %" hint="Default — can override per batch in GRN">
              <TSel value={form.gst} onChange={set('gst')}
                opts={GST_OPTS.map(g => ({ value:g, label:`${g}%` }))} />
            </Field>
            <Field label="Reorder Level" hint="Alert threshold">
              <TInput type="number" value={form.reorderLevel} onChange={set('reorderLevel')} placeholder="10" min="0" />
            </Field>
          </Card>

          {/* 3. Location */}
          <Card title="Location" icon={MapPin} hint="Required">
            <Field label="Counter" required>
              <TSel value={selCounter} onChange={e => setSelCounter(e.target.value)}
                placeholder="— Select Counter —"
                opts={counters.map(c => ({ value:c._id, label:`${c.code} — ${c.name}` }))} />
            </Field>

            <Field label="Rack" required hint={loadingRacks ? 'Loading…' : `${racks.length} racks`}>
              <TSel
                value={selRack?._id || ''}
                onChange={e => {
                  const r = racks.find(r => r._id === e.target.value)
                  setSelRack(r || null)
                  setRackPos({ shelf:1, row:'A', column:1 })
                }}
                placeholder="— Select Rack —"
                opts={racks.map(r => ({ value:r._id, label:`${r.code} — ${r.name}` }))} />
            </Field>

            {selRack && (<>
              <Field label="Shelf">
                <TSel value={rackPos.shelf}
                  onChange={e => setRackPos(p => ({ ...p, shelf:parseInt(e.target.value) }))}
                  opts={shelfOpts.map(s => ({ value:s, label:`Shelf ${s}` }))} />
              </Field>
              <Field label="Row">
                <TSel value={rackPos.row}
                  onChange={e => setRackPos(p => ({ ...p, row:e.target.value }))}
                  opts={rowOpts.map(r => ({ value:r, label:`Row ${r}` }))} />
              </Field>
              <Field label="Column">
                <TSel value={rackPos.column}
                  onChange={e => setRackPos(p => ({ ...p, column:parseInt(e.target.value) }))}
                  opts={colOpts.map(c => ({ value:c, label:`Col ${c}` }))} />
              </Field>

              <div className="col-span-full">
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold font-mono border ${
                  curOccupied ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                  {curOccupied ? <AlertCircle size={15}/> : <CheckCircle2 size={15}/>}
                  {posLabel}
                  <span className="font-normal text-xs ml-1">
                    {curOccupied ? `— occupied by "${curOccupied.name}"` : '— available'}
                  </span>
                </div>
              </div>

              <div className="col-span-full">
                <p className="text-[11px] font-bold text-gray-500 uppercase mb-2">
                  Shelf {rackPos.shelf} — Slot Map
                </p>
                <div className="grid gap-1.5"
                  style={{ gridTemplateColumns:`repeat(${selRack.columnsPerRow||4}, minmax(0,1fr))` }}>
                  {rowOpts.map(row => colOpts.map(col => {
                    const occ   = isOccupied(rackPos.shelf, row, col)
                    const isSel = rackPos.row===row && rackPos.column===col
                    return (
                      <button key={`${row}-${col}`} type="button" disabled={!!occ}
                        onClick={() => setRackPos(p => ({ ...p, row, column:col }))}
                        title={occ ? `Occupied: ${occ.name}` : `Row ${row}, Col ${col}`}
                        className={`py-1.5 rounded text-[10px] font-bold border-2 transition
                          ${isSel ? 'bg-amber-500 border-amber-500 text-white'
                          : occ   ? 'bg-red-50 border-red-200 text-red-500 cursor-not-allowed'
                          :         'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'}`}>
                        {row}{col}
                        {occ && <div className="text-[8px] mt-0.5">🔒</div>}
                      </button>
                    )
                  }))}
                </div>
                <div className="flex gap-4 mt-2 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"/> Selected</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-200 inline-block"/> Occupied</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-50 border border-green-200 inline-block"/> Free</span>
                </div>
              </div>
            </>)}
          </Card>

        </div>

        {/* ── RIGHT ── */}
        <div className="flex flex-col gap-4 sticky top-4">

          {/* Image */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Medicine Image</p>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Medicine"
                  className="w-full h-40 object-contain rounded-lg border border-gray-200 bg-gray-50"/>
                <button onClick={removeImg}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition">
                  <X size={11}/>
                </button>
                {uploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg text-xs text-gray-500">
                    Uploading…
                  </div>
                )}
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-500 transition group">
                <ImageIcon size={28} className="mx-auto mb-2 text-gray-300 group-hover:text-amber-500 transition"/>
                <p className="text-xs font-semibold text-gray-500">Click to upload</p>
                <p className="text-[10px] text-gray-400 mt-0.5">PNG / JPG — max 2MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImg}/>
            {!imagePreview && (
              <button onClick={() => fileRef.current?.click()}
                className="mt-2 w-full py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1.5 transition">
                <Upload size={12}/> Choose Image
              </button>
            )}
          </div>

          {/* Barcode */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Barcode</p>
            <div className="flex gap-2">
              <input type="text" value={form.barcode || ''} onChange={set('barcode')}
                placeholder="Enter or generate"
                className={inputCls + ' font-mono text-sm'} />
              <button onClick={genBarcode}
                className="px-3 py-2 text-xs font-bold border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition flex items-center gap-1 whitespace-nowrap">
                <QrCode size={12}/> Gen
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Summary</p>
            {[
              ['Name',     form.name || '—'],
              ['Category', categories.find(c => c._id === form.category)?.name || '—'],
              ['Formulation', formulations.find(f => f._id === form.formulation)?.name || '—'],
              ['MRP',      form.mrp ? `₹${form.mrp}` : '—'],
              ['GST',      `${form.gst}%`],
              ['Counter',  counters.find(c=>c._id===selCounter)?.code || '—'],
              ['Rack',     selRack?.code || '—'],
              ['Position', posLabel],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-xs">
                <span className="text-gray-400">{k}</span>
                <span className="font-semibold text-gray-800 text-right max-w-[60%] truncate">{v}</span>
              </div>
            ))}
            <p className="mt-3 text-[10px] text-amber-600 font-semibold leading-relaxed">
              💡 Purchase price &amp; batch details go in GRN / Quick Stock Entry
            </p>
          </div>

          {/* Actions */}
          <button onClick={handleUpdate} disabled={saving}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition
              ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25'}`}>
            <Save size={15}/> {saving ? 'Saving…' : 'Update Medicine'}
          </button>
          <button onClick={() => navigate('/franchise/medicines')}
            className="py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            Cancel
          </button>

        </div>
      </div>
    </div>
  )
}
