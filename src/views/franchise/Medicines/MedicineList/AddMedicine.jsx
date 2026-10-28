/* eslint-disable prettier/prettier */
/**
 * AddMedicine — Tailwind UI
 * Counter → Rack → Shelf/Row/Col → Batch → Save
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FlaskConical, ArrowLeft, Save, Upload, X, ImageIcon,
  Plus, Trash2, QrCode, MapPin, Package, IndianRupee,
  ChevronDown, AlertCircle, CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { postRequest, getRequest, fileUpload } from '../../../../Helpers'
import PageHeader from '../../components/PageHeader'
import { useSuppliers } from '../../../../hooks/useSuppliers'

/* ─── constants ─────────────────────────────────────── */
const GST_OPTS = ['0', '5', '12', '18', '28']
const SCHEDULES = ['None', 'H', 'H1', 'X', 'G']
const CAT_DEFAULT = ['Analgesic', 'Antibiotic', 'Antifungal', 'Antiviral', 'Antacid', 'Vitamin', 'Supplement', 'Cardiac', 'Diabetic', 'Respiratory', 'Other']
const FORM_DEFAULT = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Cream', 'Gel', 'Drops', 'Powder', 'Sachet', 'Suspension']
const CO_DEFAULT = ['Sun Pharma', 'Cipla', 'Lupin', 'Dr. Reddy\'s', 'Alkem', 'Mankind', 'Torrent', 'Abbott', 'GSK', 'Pfizer', 'Other']
const UNIT_DEFAULT = ['Tablet', 'Capsule', 'Strip', 'Bottle', 'Sachet', 'Tube', 'Vial', 'Box', 'Piece']

const EMPTY_BATCH = () => ({ batchNo: '', mfgDate: '', expiryDate: '', quantity: '', mrp: '', purchasePrice: '', supplierName: '' })

/* ─── small UI helpers ───────────────────────────────── */
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

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white text-gray-800 transition'
const selCls = inputCls + ' cursor-pointer'

const TInput = ({ value, onChange, placeholder, type = 'text', disabled, min, step }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    disabled={disabled} min={min} step={step}
    className={inputCls + (disabled ? ' bg-gray-50 cursor-not-allowed' : '')} />
)

const TSel = ({ value, onChange, opts = [], placeholder }) => (
  <select value={value} onChange={onChange} className={selCls}>
    {placeholder && <option value="">{placeholder}</option>}
    {opts.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
)

const Card = ({ title, badge, icon: Icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
    <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
      {Icon && <Icon size={15} className="text-blue-900" />}
      <span className="text-sm font-bold text-gray-700">{title}</span>
      {badge && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{badge}</span>}
    </div>
    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
)

/* ════════════════════════════════════════════════════════ */
export default function AddMedicine() {
  const navigate = useNavigate()
  const { suppliers, loadingSuppliers } = useSuppliers()

  /* masters */
  const [categories, setCategories] = useState(CAT_DEFAULT)
  const [formulations, setFormulations] = useState(FORM_DEFAULT)
  const [companies, setCompanies] = useState(CO_DEFAULT)
  const [units, setUnits] = useState(UNIT_DEFAULT)

  /* counter/rack */
  const [counters, setCounters] = useState([])
  const [racks, setRacks] = useState([])
  const [selCounter, setSelCounter] = useState('')
  const [selRack, setSelRack] = useState(null)
  const [rackPos, setRackPos] = useState({ shelf: 1, row: 'A', column: 1 })
  const [loadingRacks, setLoadingRacks] = useState(false)
  const [occupiedSlots, setOccupiedSlots] = useState([])

  /* form */
  const [form, setForm] = useState({
    name: '', salt: '', brand: '', genericName: '', category: '',
    formulation: '', company: '', strength: '', unit: 'Strip',
    packSize: '', hsnCode: '3004', gst: '12', schedule: 'None',
    mrp: '', purchasePrice: '', sellingPrice: '',
    reorderLevel: '10', minStock: '5', maxStock: '1000', openingStock: '0',
    barcode: '', sku: '', description: '', requiresPrescription: false,
  })

  /* batches */
  const [batches, setBatches] = useState([EMPTY_BATCH()])

  /* image */
  const fileRef = useRef(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)

  const [saving, setSaving] = useState(false)

  /* ── load masters ── */
  useEffect(() => {
    getRequest('/franchise/medicines/masters/all').then(res => {
      const d = res?.data?.data
      if (d?.categories?.length) setCategories(d.categories.map(c => c.name))
      if (d?.units?.length) setUnits(d.units.map(u => u.name))
      if (d?.companies?.length) setCompanies(d.companies.map(c => c.name))
    }).catch(() => { })
    getRequest('/franchise/medicines/meta').then(res => {
      const f = res?.data?.data?.formulations
      if (f?.length) setFormulations(f)
    }).catch(() => { })
  }, [])

  /* ── load counters ── */
  useEffect(() => {
    getRequest('/franchise/master/counters')
      .then(res => setCounters(res?.data?.data || []))
      .catch(() => { })
  }, [])

  /* ── racks when counter changes ── */
  useEffect(() => {
    if (!selCounter) { setRacks([]); setSelRack(null); return }
    setLoadingRacks(true)
    getRequest(`/franchise/master/racks?counterId=${selCounter}`)
      .then(res => {
        const r = res?.data?.data || []
        setRacks(r)
        setSelRack(r[0] || null)
        setRackPos({ shelf: 1, row: 'A', column: 1 })
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
  const setCheck = k => e => setForm(p => ({ ...p, [k]: e.target.checked }))

  const rowOpts = selRack ? Array.from({ length: selRack.rowsPerShelf || 3 }, (_, i) => String.fromCharCode(65 + i)) : ['A', 'B', 'C']
  const shelfOpts = selRack ? Array.from({ length: selRack.shelves || 5 }, (_, i) => i + 1) : [1, 2, 3, 4, 5]
  const colOpts = selRack ? Array.from({ length: selRack.columnsPerRow || 4 }, (_, i) => i + 1) : [1, 2, 3, 4]

  const posLabel = selRack ? `${selRack.code}-${rackPos.shelf}-${rackPos.row}-${rackPos.column}` : '—'

  const isOccupied = useCallback((shelf, row, col) => {
    const pos = `${selRack?.code}-${shelf}-${row}-${col}`
    return occupiedSlots.find(s => s.position === pos) || null
  }, [occupiedSlots, selRack])

  const curOccupied = selRack ? isOccupied(rackPos.shelf, rackPos.row, rackPos.column) : null

  /* barcode generate */
  const genBarcode = () => {
    const bc = `MED${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    setForm(p => ({ ...p, barcode: bc }))
    toast.success('Barcode generated')
  }

  /* batch helpers */
  const addBatch = () => setBatches(p => [...p, EMPTY_BATCH()])
  const removeBatch = i => setBatches(p => p.filter((_, j) => j !== i))
  const setBF = (i, k) => e => setBatches(p => p.map((b, j) => j === i ? { ...b, [k]: e.target.value } : b))

  /* image upload */
  const handleImg = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Only images allowed'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB'); return }
    setImagePreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fileUpload({ url: 'upload/uploadImage', cred: fd, isFormData: true })
      const url = res?.data?.data?.imageUrl
      if (!url) throw new Error()
      setImageUrl(url); setImagePreview(url)
      toast.success('Image uploaded')
    } catch { toast.error('Upload failed'); setImagePreview('') }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }
  const removeImg = () => { setImageUrl(''); setImagePreview(''); if (fileRef.current) fileRef.current.value = '' }

  /* save */
  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Medicine name required'); return }
    if (!form.salt.trim()) { toast.error('Salt / generic name required'); return }
    if (!form.mrp) { toast.error('MRP required'); return }
    if (!form.category) { toast.error('Category required'); return }
    if (!form.formulation) { toast.error('Formulation required'); return }
    if (!selCounter) { toast.error('Select a counter'); return }
    if (!selRack) { toast.error('Select a rack'); return }
    if (curOccupied) { toast.error(`Position ${posLabel} is occupied`); return }

    const validBatches = batches.filter(b => b.batchNo && b.expiryDate && b.quantity)
    if (!validBatches.length) { toast.error('At least 1 complete batch required'); return }

    setSaving(true)
    try {
      await postRequest({
        url: '/franchise/medicines',
        cred: {
          name: form.name.trim(),
          salt: form.salt.trim(),
          brand: form.brand.trim(),
          genericName: form.genericName.trim(),
          category: form.category,
          formulation: form.formulation,
          company: form.company,
          strength: form.strength,
          unit: form.unit,
          packSize: form.packSize,
          hsnCode: form.hsnCode,
          gstPercent: parseFloat(form.gst) || 12,
          schedule: form.schedule,
          mrp: parseFloat(form.mrp) || 0,
          purchasePrice: parseFloat(form.purchasePrice) || 0,
          sellingPrice: parseFloat(form.sellingPrice) || parseFloat(form.mrp) || 0,
          reorderLevel: parseInt(form.reorderLevel) || 10,
          minStock: parseInt(form.minStock) || 5,
          maxStock: parseInt(form.maxStock) || 1000,
          openingStock: parseInt(form.openingStock) || 0,
          barcode: form.barcode || undefined,
          sku: form.sku || undefined,
          description: form.description,
          requiresPrescription: form.requiresPrescription,
          imageUrl: imageUrl || undefined,
          counterId: selCounter,
          rackId: selRack._id,
          rackLocation: {
            rackId: selRack.code,
            shelf: rackPos.shelf,
            row: rackPos.row,
            column: rackPos.column,
            position: posLabel,
          },
          batches: validBatches.map(b => ({
            batchNo: b.batchNo.trim(),
            mfgDate: b.mfgDate || undefined,
            expiryDate: b.expiryDate,
            quantity: parseInt(b.quantity) || 0,
            availableQty: parseInt(b.quantity) || 0,
            mrp: parseFloat(b.mrp) || parseFloat(form.mrp) || 0,
            purchasePrice: parseFloat(b.purchasePrice) || parseFloat(form.purchasePrice) || 0,
            supplierName: b.supplierName || '',
            isActive: true,
            rackLocation: { rackId: selRack.code, shelf: rackPos.shelf, row: rackPos.row, column: rackPos.column, position: posLabel },
          })),
          isBatchTracked: true,
        },
      })
      toast.success('Medicine added successfully')
      navigate('/franchise/medicines')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add medicine')
    } finally { setSaving(false) }
  }

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div className="font-sans">
      <PageHeader icon={FlaskConical} title="Add New Medicine" subtitle="Counter → Rack → Batch → Save" color="#16a34a">
        <button onClick={() => navigate('/franchise/medicines')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition">
          <ArrowLeft size={13} /> Back
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 mt-4 items-start">

        {/* ───── LEFT COL ───── */}
        <div>

          {/* Basic Info */}
          <Card title="Basic Information" icon={Package}>
            <Field label="Medicine Name" required>
              <TInput value={form.name} onChange={set('name')} placeholder="e.g. Paracetamol 500mg" />
            </Field>
            <Field label="Salt / Generic Name" required>
              <TInput value={form.salt} onChange={set('salt')} placeholder="e.g. Acetaminophen" />
            </Field>
            <Field label="Brand Name">
              <TInput value={form.brand} onChange={set('brand')} placeholder="e.g. Crocin" />
            </Field>
            <Field label="Generic Name">
              <TInput value={form.genericName} onChange={set('genericName')} placeholder="e.g. Paracetamol" />
            </Field>
            <Field label="Category" required>
              <TSel value={form.category} onChange={set('category')} opts={categories} placeholder="Select category" />
            </Field>
            <Field label="Formulation" required>
              <TSel value={form.formulation} onChange={set('formulation')} opts={formulations} placeholder="Select formulation" />
            </Field>
            <Field label="Company">
              <TSel value={form.company} onChange={set('company')} opts={companies} placeholder="Select company" />
            </Field>
            <Field label="Strength">
              <TInput value={form.strength} onChange={set('strength')} placeholder="e.g. 500mg" />
            </Field>
            <Field label="Unit" required>
              <TSel value={form.unit} onChange={set('unit')} opts={units} />
            </Field>
            <Field label="Pack Size">
              <TInput value={form.packSize} onChange={set('packSize')} placeholder="e.g. 1×10 Strip" />
            </Field>
            <Field label="HSN Code">
              <TInput value={form.hsnCode} onChange={set('hsnCode')} placeholder="3004" />
            </Field>
            <Field label="Schedule">
              <TSel value={form.schedule} onChange={set('schedule')} opts={SCHEDULES} />
            </Field>
            <div className="col-span-full">
              <Field label="Description">
                <textarea value={form.description} onChange={set('description')} rows={3}
                  placeholder="Usage, side effects, warnings…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-900 resize-y" />
              </Field>
            </div>
            <div className="col-span-full flex items-center gap-2">
              <input type="checkbox" id="rx" checked={form.requiresPrescription} onChange={setCheck('requiresPrescription')}
                className="w-4 h-4 accent-blue-900" />
              <label htmlFor="rx" className="text-sm text-gray-700 cursor-pointer font-medium">Requires Prescription (Rx)</label>
            </div>
          </Card>

          {/* Pricing */}
          <Card title="Pricing & Tax" icon={IndianRupee}>
            <Field label="MRP (₹)" required>
              <TInput type="number" value={form.mrp} onChange={set('mrp')} placeholder="0.00" step="0.01" min="0" />
            </Field>
            <Field label="Purchase Price (₹)">
              <TInput type="number" value={form.purchasePrice} onChange={set('purchasePrice')} placeholder="0.00" step="0.01" min="0" />
            </Field>
            <Field label="Selling Price (₹)">
              <TInput type="number" value={form.sellingPrice} onChange={set('sellingPrice')} placeholder="Auto from MRP" step="0.01" min="0" />
            </Field>
            <Field label="GST (%)">
              <TSel value={form.gst} onChange={set('gst')} opts={GST_OPTS.map(g => ({ value: g, label: `${g}%` }))} />
            </Field>
            <Field label="Reorder Level">
              <TInput type="number" value={form.reorderLevel} onChange={set('reorderLevel')} placeholder="10" min="0" />
            </Field>
            <Field label="Min Stock">
              <TInput type="number" value={form.minStock} onChange={set('minStock')} placeholder="5" min="0" />
            </Field>
            <Field label="Max Stock">
              <TInput type="number" value={form.maxStock} onChange={set('maxStock')} placeholder="1000" min="0" />
            </Field>
            <Field label="Opening Stock">
              <TInput type="number" value={form.openingStock} onChange={set('openingStock')} placeholder="0" min="0" />
            </Field>
          </Card>

          {/* Barcode */}
          <Card title="Barcode & SKU" icon={QrCode}>
            <Field label="Barcode">
              <div className="flex gap-2">
                <TInput value={form.barcode} onChange={set('barcode')} placeholder="Auto-generate or enter" />
                <button onClick={genBarcode}
                  className="px-3 py-2 text-xs font-bold border border-blue-900 text-blue-900 rounded-lg hover:bg-blue-50 transition whitespace-nowrap flex items-center gap-1">
                  <QrCode size={12} /> Generate
                </button>
              </div>
            </Field>
            <Field label="SKU">
              <TInput value={form.sku} onChange={set('sku')} placeholder="Stock Keeping Unit" />
            </Field>
          </Card>

          {/* Counter & Rack */}
          <Card title="Counter & Rack Assignment" icon={MapPin} badge="Required">
            <Field label="Counter" required hint="Billing counter this medicine belongs to">
              <TSel value={selCounter} onChange={e => setSelCounter(e.target.value)}
                placeholder="— Select Counter —"
                opts={counters.map(c => ({ value: c._id, label: `${c.code} — ${c.name}` }))} />
            </Field>

            <Field label="Rack" required hint={loadingRacks ? 'Loading…' : `${racks.length} racks available`}>
              <TSel
                value={selRack?._id || ''}
                onChange={e => { const r = racks.find(r => r._id === e.target.value); setSelRack(r || null); setRackPos({ shelf: 1, row: 'A', column: 1 }) }}
                placeholder="— Select Rack —"
                opts={racks.map(r => ({ value: r._id, label: `${r.code} — ${r.name}` }))} />
            </Field>

            {selRack && (<>
              <Field label="Shelf" required hint={`1–${selRack.shelves || 5}`}>
                <TSel value={rackPos.shelf} onChange={e => setRackPos(p => ({ ...p, shelf: parseInt(e.target.value) }))}
                  opts={shelfOpts.map(s => ({ value: s, label: `Shelf ${s}` }))} />
              </Field>
              <Field label="Row" required hint={`A–${String.fromCharCode(64 + (selRack.rowsPerShelf || 3))}`}>
                <TSel value={rackPos.row} onChange={e => setRackPos(p => ({ ...p, row: e.target.value }))}
                  opts={rowOpts.map(r => ({ value: r, label: `Row ${r}` }))} />
              </Field>
              <Field label="Column" required hint={`1–${selRack.columnsPerRow || 4}`}>
                <TSel value={rackPos.column} onChange={e => setRackPos(p => ({ ...p, column: parseInt(e.target.value) }))}
                  opts={colOpts.map(c => ({ value: c, label: `Col ${c}` }))} />
              </Field>

              {/* Position badge */}
              <div className="col-span-full">
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold font-mono border ${curOccupied ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-700'
                  }`}>
                  {curOccupied ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                  {posLabel}
                  <span className="font-normal text-xs ml-1">
                    {curOccupied ? `— occupied by "${curOccupied.name}"` : '— available'}
                  </span>
                </div>
              </div>

              {/* Visual slot grid */}
              <div className="col-span-full">
                <p className="text-[11px] font-bold text-gray-500 uppercase mb-2">
                  Shelf {rackPos.shelf} — Slot Map
                </p>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${selRack.columnsPerRow || 4}, minmax(0,1fr))` }}>
                  {rowOpts.map(row => colOpts.map(col => {
                    const occ = isOccupied(rackPos.shelf, row, col)
                    const isSel = rackPos.row === row && rackPos.column === col
                    return (
                      <button
                        key={`${row}-${col}`}
                        type="button"
                        disabled={!!occ}
                        onClick={() => setRackPos(p => ({ ...p, row, column: col }))}
                        title={occ ? `Occupied: ${occ.name}` : `Row ${row}, Col ${col}`}
                        className={`py-1.5 rounded text-[10px] font-bold border-2 transition
                          ${isSel ? 'bg-blue-900 border-blue-900 text-white'
                            : occ ? 'bg-red-50 border-red-200 text-red-500 cursor-not-allowed'
                              : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 cursor-pointer'}`}
                      >
                        {row}{col}
                        {occ && <div className="text-[8px] mt-0.5">🔒</div>}
                      </button>
                    )
                  }))}
                </div>
                <div className="flex gap-4 mt-2 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-900 inline-block" /> Selected</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-50 border border-red-200 inline-block" /> Occupied</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-50 border border-green-200 inline-block" /> Free</span>
                </div>
              </div>
            </>)}
          </Card>

          {/* Batches */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
              <Package size={15} className="text-blue-900" />
              <span className="text-sm font-bold text-gray-700">Batch Details</span>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">At least 1 required</span>
            </div>
            <div className="p-5 space-y-4">
              {batches.map((b, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-blue-900">Batch #{i + 1}</span>
                    {batches.length > 1 && (
                      <button onClick={() => removeBatch(i)} className="text-red-500 hover:text-red-700 p-1 rounded transition">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    <Field label="Batch Number" required>
                      <TInput value={b.batchNo} onChange={setBF(i, 'batchNo')} placeholder="e.g. BTH001" />
                    </Field>
                    <Field label="Mfg Date">
                      <TInput type="date" value={b.mfgDate} onChange={setBF(i, 'mfgDate')} />
                    </Field>
                    <Field label="Expiry Date" required>
                      <TInput type="date" value={b.expiryDate} onChange={setBF(i, 'expiryDate')} />
                    </Field>
                    <Field label="Quantity" required>
                      <TInput type="number" value={b.quantity} onChange={setBF(i, 'quantity')} placeholder="0" min="1" />
                    </Field>
                    <Field label="MRP (₹)" required>
                      <TInput type="number" value={b.mrp} onChange={setBF(i, 'mrp')} placeholder={form.mrp || '0.00'} step="0.01" />
                    </Field>
                    <Field label="Purchase Price (₹)" required>
                      <TInput type="number" value={b.purchasePrice} onChange={setBF(i, 'purchasePrice')} placeholder={form.purchasePrice || '0.00'} step="0.01" />
                    </Field>
                    <Field label="Supplier Name">
                      <TInput value={b.supplierName} onChange={setBF(i, 'supplierName')} placeholder="Supplier" />
                    </Field>
                  </div>
                </div>
              ))}
              <button onClick={addBatch}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-900 border border-dashed border-blue-900 rounded-lg hover:bg-blue-50 transition">
                <Plus size={14} /> Add Another Batch
              </button>
            </div>
          </div>

        </div>

        {/* ───── RIGHT COL ───── */}
        <div className="flex flex-col gap-4 sticky top-4">

          {/* Image Upload */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Medicine Image</p>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Medicine"
                  className="w-full h-40 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                <button onClick={removeImg}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center border-none cursor-pointer hover:bg-red-600 transition">
                  <X size={11} />
                </button>
                {uploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg text-xs text-gray-500">
                    Uploading…
                  </div>
                )}
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-900 transition group">
                <ImageIcon size={28} className="mx-auto mb-2 text-gray-300 group-hover:text-blue-900 transition" />
                <p className="text-xs font-semibold text-gray-500">Click to upload</p>
                <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG up to 2MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImg} />
            {!imagePreview && (
              <button onClick={() => fileRef.current?.click()}
                className="mt-2 w-full py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1.5 transition">
                <Upload size={12} /> Choose Image
              </button>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Summary</p>
            {[
              ['Counter', counters.find(c => c._id === selCounter)?.code || '—'],
              ['Rack', selRack?.code || '—'],
              ['Position', posLabel],
              ['MRP', form.mrp ? `₹${form.mrp}` : '—'],
              ['Batches', `${batches.filter(b => b.batchNo).length} added`],
              ['Image', imageUrl ? '✅ Uploaded' : 'Not uploaded'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-xs">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-800">{v}</span>
              </div>
            ))}
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition
              ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800 shadow-lg shadow-blue-900/25'}`}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Medicine'}
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
