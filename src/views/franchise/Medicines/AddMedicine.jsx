/* eslint-disable prettier/prettier */
/**
 * AddMedicine — Production-Level Medicine Entry
 * Complete with validation, batch tracking, and rack location
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, ArrowLeft, Save, Plus, Trash2, QrCode, MapPin, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { postRequest, getRequest } from '../../../Helpers'

// Reusable Components
const FL = ({ label, required, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>
      {label}{required && <span style={{ color: '#dc2626' }}>*</span>}
    </label>
    {children}
  </div>
)

const Input = ({ value, onChange, placeholder, type = 'text', disabled, min, max, step }) => (
  <input 
    type={type} value={value} onChange={onChange} placeholder={placeholder} 
    disabled={disabled} min={min} max={max} step={step}
    style={{ 
      width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', 
      borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' 
    }}
  />
)

const Sel = ({ value, onChange, opts, placeholder }) => (
  <select value={value} onChange={onChange} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
    {placeholder && <option value="">{placeholder}</option>}
    {opts.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
)

const Section = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 16 }}>
    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0c3b73', margin: '0 0 16px' }}>{title}</h3>
    {children}
  </div>
)

// Constants
const GST_RATES = ['0%', '5%', '12%', '18%', '28%']
const RACKS = ['RACK-A', 'RACK-B', 'RACK-C', 'RACK-D', 'RACK-E', 'RACK-F']
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

export default function AddMedicine() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [categories, setCategories] = useState([])
  const [formulations, setFormulations] = useState([])
  const [companies, setCompanies] = useState([])
  const [counters, setCounters] = useState([])
  const [racks, setRacks] = useState([])
  const [filteredRacks, setFilteredRacks] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  
  const [form, setForm] = useState({
    name: '',
    salt: '',
    genericName: '',
    category: '',
    formulation: '',
    company: '',
    strength: '',
    packSize: '',
    mrp: '',
    purchasePrice: '',
    gstPercent: 12,
    reorderLevel: '20',
    sku: '',                // ← Unique medicine code
    barcode: '',
    counterId: '',        // ← Counter selection
    rackId: '',           // ← Rack selection
    batches: [{ batchNo: '', expiryDate: '', quantity: '', mrp: '', purchasePrice: '' }]
  })

  // Auto-generate short unique SKU for medicine
  const generateSKU = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let sku = 'M'
    for (let i = 0; i < 6; i++) {
      sku += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return sku  // e.g., "MA7K9B5", "MB2M3X9"
  }

  // Fetch master data dynamically from API
  const fetchMasters = useCallback(async () => {
    try {
      setLoadingMeta(true)
      
      // Fetch counters using Helpers
      const countersRes = await getRequest('/franchise/master/counters')
      console.log('📍 [AddMedicine API] Counters response:', countersRes.data)
      if (countersRes.data?.success) {
        setCounters(countersRes.data.data || [])
        console.log('✅ [AddMedicine] Counters set:', countersRes.data.data)
      }

      // Fetch racks using Helpers
      const racksRes = await getRequest('/franchise/master/racks')
      console.log('📦 [AddMedicine API] Racks response:', racksRes.data)
      if (racksRes.data?.success) {
        setRacks(racksRes.data.data || [])
        setFilteredRacks(racksRes.data.data || [])
        console.log('✅ [AddMedicine] Racks set:', racksRes.data.data)
      }

      // Fetch medicine masters (categories, formulations, companies)
      const res = await getRequest('/franchise/medicines/meta')
      if (res.data?.data) {
        const { categories: cats, formulations: forms, companies: comps } = res.data.data
        setCategories(cats || [])
        setFormulations(forms || [])
        setCompanies(comps || [])
      }
    } catch (err) {
      console.error('❌ [AddMedicine] Failed to fetch masters:', err)
      toast.error('Failed to load dropdown data')
      // Fallback values
      setCategories(['Analgesic', 'Antibiotic', 'Antacid', 'Antipyretic', 'Vitamin'])
      setFormulations(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment'])
      setCompanies(['Cipla', 'Sun Pharma', 'Dr. Reddy\'s', 'Lupin', 'Other'])
    } finally {
      setLoadingMeta(false)
    }
  }, [])

  useEffect(() => { 
    fetchMasters() 
    // Generate initial SKU on component mount
    setForm(p => ({ ...p, sku: generateSKU() }))
  }, [fetchMasters])

  // When counter is selected, filter racks by that counter
  useEffect(() => {
    console.log('🔍 [AddMedicine] Counter selected:', form.counterId)
    
    if (form.counterId) {
      const filtered = racks.filter(r => {
        // counterId can be:
        // 1. String ID: "6ae1aef94bf667257b418aba"
        // 2. Object: { _id: "6ae1aef94bf667257b418aba", code: "...", name: "..." }
        
        const rCounterId = typeof r.counterId === 'object' && r.counterId?._id 
          ? r.counterId._id 
          : r.counterId
        
        const isMatch = rCounterId === form.counterId
        console.log(`  📊 Rack: ${r.code} | rCounterId: ${rCounterId} | selectedCounterId: ${form.counterId} | Match: ${isMatch}`)
        return isMatch
      })
      
      console.log(`✅ Filtered: ${filtered.length} racks match counter ${form.counterId}`)
      setFilteredRacks(filtered)
      
      // Reset rack selection if not in filtered list
      if (form.rackId && !filtered.find(r => r._id === form.rackId)) {
        setForm(p => ({ ...p, rackId: '' }))
      }
    } else {
      console.log('⚠️ No counter selected')
      setFilteredRacks([])
    }
  }, [form.counterId, racks])

  const set = (field) => (e) => {
    const value = e.target.value
    console.log(`🎯 [AddMedicine] Field "${field}" changed to:`, value)
    setForm(p => ({ ...p, [field]: value }))
  }

  const updateBatch = (index, field, value) => {
    setForm(p => ({
      ...p,
      batches: p.batches.map((b, i) => i === index ? { ...b, [field]: value } : b)
    }))
  }

  const addBatch = () => {
    setForm(p => ({
      ...p,
      batches: [...p.batches, { batchNo: '', expiryDate: '', quantity: '', mrp: '', purchasePrice: '' }]
    }))
  }

  const removeBatch = (index) => {
    if (form.batches.length > 1) {
      setForm(p => ({ ...p, batches: p.batches.filter((_, i) => i !== index) }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    setImageFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const generateBarcode = async () => {
    try {
      const res = await postRequest({ url: '/franchise/medicines/barcode/generate', cred: {} })
      const barcode = res.data?.data?.barcode
      if (barcode) {
        setForm(p => ({ ...p, barcode }))
        toast.success('Barcode generated!')
      }
    } catch (err) {
      toast.error('Failed to generate barcode')
    }
  }

  const handleSave = async () => {
    // Validation
    if (!form.name) { toast.error('Name is required'); return }
    if (!form.salt) { toast.error('Salt is required'); return }
    if (!form.mrp) { toast.error('MRP is required'); return }
    
    // Rack validation - simplified
    if (!form.counterId) { toast.error('Counter is required'); return }
    if (!form.rackId) { toast.error('Rack is required'); return }
    
    // Batch validation
    const validBatches = form.batches.filter(b => b.batchNo && b.expiryDate && b.quantity)
    if (validBatches.length === 0) {
      toast.error('At least one complete batch is required')
      return
    }

    setSaving(true)
    try {
      const response = await postRequest({
        url: '/franchise/medicines',
        cred: {
          name: form.name,
          salt: form.salt,
          genericName: form.genericName,
          category: form.category,
          formulation: form.formulation,
          company: form.company,
          strength: form.strength,
          packSize: form.packSize,
          mrp: parseFloat(form.mrp),
          purchasePrice: parseFloat(form.purchasePrice) || 0,
          gstPercent: form.gstPercent,
          reorderLevel: parseInt(form.reorderLevel) || 10,
          sku: form.sku || generateSKU(),  // Auto-generate if empty
          barcode: form.barcode,
          counterId: form.counterId,      // ← Counter ID
          rackId: form.rackId,            // ← Rack ID
          batches: validBatches.map(b => ({
            batchNo: b.batchNo,
            expiryDate: b.expiryDate,
            quantity: parseInt(b.quantity),
            mrp: parseFloat(b.mrp) || parseFloat(form.mrp),
            purchasePrice: parseFloat(b.purchasePrice) || parseFloat(form.purchasePrice) || 0
          })),
          isBatchTracked: true
        }
      })
      
      const medicineId = response.data?.data?._id
      
      // Upload image if provided
      if (imageFile && medicineId) {
        try {
          const formData = new FormData()
          formData.append('image', imageFile)
          
          const { fileUpload } = await import('../../../Helpers')
          await fileUpload({
            url: `/franchise/medicines/${medicineId}/images`,
            cred: formData
          })
          toast.success('Medicine added with image!')
        } catch (imgErr) {
          console.error('Image upload failed:', imgErr)
          toast.warning('Medicine added but image upload failed')
        }
      } else {
        toast.success('Medicine added successfully!')
      }
      
      navigate('/franchise/medicines')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add medicine')
    } finally {
      setSaving(false)
    }
  }



  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '0 0 40px' }}>
      <PageHeader
        icon={FlaskConical}
        title="Add New Medicine"
        subtitle="Complete medicine entry with rack location and batch details"
        color="#16a34a"
      >
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}
        >
          <ArrowLeft size={14} /> Back
        </button>
      </PageHeader>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        
        {loadingMeta && (
          <div style={{ padding: 20, textAlign: 'center', background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 8, marginBottom: 20, color: '#1e40af', fontSize: 13 }}>
            Loading dropdown data...
          </div>
        )}
        
        {/* Section 1: Basic Information */}
        <Section title="📋 Basic Information">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              onClick={fetchMasters}
              disabled={loadingMeta}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', fontSize: 11, fontWeight: 600, color: '#6b7280', cursor: loadingMeta ? 'not-allowed' : 'pointer', opacity: loadingMeta ? 0.6 : 1 }}
              title="Refresh dropdown data from database"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: loadingMeta ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s' }}>
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              {loadingMeta ? 'Refreshing...' : 'Refresh Dropdowns'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <FL label="Medicine Name" required>
              <Input value={form.name} onChange={set('name')} placeholder="e.g. Dolo 650" />
            </FL>
            <FL label="Salt / Generic Name" required>
              <Input value={form.salt} onChange={set('salt')} placeholder="e.g. Paracetamol" />
            </FL>
            <FL label="Generic Name">
              <Input value={form.genericName} onChange={set('genericName')} placeholder="Generic name" />
            </FL>
            <FL label="Category">
              <Sel value={form.category} onChange={set('category')} opts={categories} placeholder="Select category" />
            </FL>
            <FL label="Formulation">
              <Sel value={form.formulation} onChange={set('formulation')} opts={formulations} placeholder="Select formulation" />
            </FL>
            <FL label="Company">
              <Sel value={form.company} onChange={set('company')} opts={companies} placeholder="Select company" />
            </FL>
            <FL label="Strength">
              <Input value={form.strength} onChange={set('strength')} placeholder="e.g. 650mg" />
            </FL>
            <FL label="Pack Size">
              <Input value={form.packSize} onChange={set('packSize')} placeholder="e.g. 15 tablets" />
            </FL>
          </div>
        </Section>

        {/* Section 2: Pricing & Tax */}
        <Section title="💰 Pricing & Tax">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <FL label="MRP (₹)" required>
              <Input type="number" value={form.mrp} onChange={set('mrp')} placeholder="0.00" step="0.01" min="0" />
            </FL>
            <FL label="Purchase Price (₹)">
              <Input type="number" value={form.purchasePrice} onChange={set('purchasePrice')} placeholder="0.00" step="0.01" min="0" />
            </FL>
            <FL label="GST %">
              <Sel value={form.gstPercent + '%'} onChange={e => setForm(p => ({ ...p, gstPercent: parseFloat(e.target.value) }))} opts={GST_RATES} />
            </FL>
          </div>
        </Section>

        {/* Section 3: Counter & Rack Assignment with Space Info */}
        <Section title="🏪 Counter & Rack Assignment">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <FL label="Counter" required>
              <select 
                value={form.counterId} 
                onChange={set('counterId')}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', cursor: 'pointer' }}
              >
                <option value="">Select Counter</option>
                {counters.map(c => (
                  <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </FL>
            <FL label="Rack" required>
              <select 
                value={form.rackId} 
                onChange={set('rackId')}
                disabled={!form.counterId}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: form.counterId ? '#f9fafb' : '#f3f4f6', cursor: form.counterId ? 'pointer' : 'not-allowed' }}
              >
                <option value="">Select Rack</option>
                {filteredRacks.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.code} - {r.name} ({r.shelves || 5} shelves)
                  </option>
                ))}
              </select>
            </FL>
          </div>

          {/* Rack Space Information */}
          {form.rackId && (
            <div style={{
              marginTop: 16,
              padding: 14,
              background: '#f0fdf4',
              border: '2px solid #16a34a',
              borderRadius: 8,
              fontSize: 13
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ fontSize: 20 }}>�</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 12px', fontWeight: 700, color: '#15803d', fontSize: 14 }}>Rack Space & Auto-Assignment</p>
                  {(() => {
                    const selectedRack = filteredRacks.find(r => r._id === form.rackId)
                    if (!selectedRack) return <p style={{ margin: 0, color: '#6b7280' }}>Loading rack details...</p>
                    
                    const capacity = selectedRack.capacity || 200
                    const shelves = selectedRack.shelves || 5
                    const rowsPerShelf = selectedRack.rowsPerShelf || 3
                    const columnsPerRow = selectedRack.columnsPerRow || 4
                    const totalSlots = shelves * rowsPerShelf * columnsPerRow
                    
                    return (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                          <div style={{ background: '#fff', padding: 10, borderRadius: 6, border: '1px solid #bbf7d0' }}>
                            <p style={{ margin: '0 0 6px', fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Physical Structure</p>
                            <p style={{ margin: '4px 0', fontSize: 13, color: '#0c3b73', fontWeight: 600 }}>
                              🎯 {shelves} Shelves
                            </p>
                            <p style={{ margin: '4px 0', fontSize: 13, color: '#0c3b73' }}>
                              ↳ {rowsPerShelf} Rows per Shelf (A, B, C...)
                            </p>
                            <p style={{ margin: '4px 0', fontSize: 13, color: '#0c3b73' }}>
                              ↳ {columnsPerRow} Columns per Row (1, 2, 3...)
                            </p>
                            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#059669', fontWeight: 700 }}>
                              Total Slots: {totalSlots}
                            </p>
                          </div>
                          <div style={{ background: '#fff', padding: 10, borderRadius: 6, border: '1px solid #bbf7d0' }}>
                            <p style={{ margin: '0 0 6px', fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Auto-Assignment</p>
                            <p style={{ margin: '4px 0', fontSize: 13, color: '#0c3b73' }}>
                              ✅ Medicine will be placed at:
                            </p>
                            <p style={{ margin: '6px 0', fontSize: 12, background: '#ecfdf5', padding: 8, borderRadius: 4, fontFamily: 'monospace', fontWeight: 600, color: '#15803d' }}>
                              Shelf-1, Row-A, Column-1
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6b7280' }}>
                              (Next available slot if occupied)
                            </p>
                          </div>
                        </div>
                        <div style={{ background: '#fff', padding: 10, borderRadius: 6, border: '1px solid #bbf7d0' }}>
                          <p style={{ margin: '0 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Capacity</p>
                          <p style={{ margin: '4px 0', fontSize: 13, color: '#0c3b73' }}>
                            💼 Max Items per Rack: <span style={{ fontWeight: 700 }}>{capacity}</span>
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* Section 4: Batch Details */}
        <Section title="📦 Batch Details (MANDATORY)">
          {form.batches.map((batch, index) => (
            <div key={index} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0c3b73' }}>Batch #{index + 1}</p>
                {form.batches.length > 1 && (
                  <button onClick={() => removeBatch(index)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <FL label="Batch Number" required>
                  <Input value={batch.batchNo} onChange={e => updateBatch(index, 'batchNo', e.target.value)} placeholder="BTH001" />
                </FL>
                <FL label="Expiry Date" required>
                  <Input type="date" value={batch.expiryDate} onChange={e => updateBatch(index, 'expiryDate', e.target.value)} />
                </FL>
                <FL label="Quantity" required>
                  <Input type="number" value={batch.quantity} onChange={e => updateBatch(index, 'quantity', e.target.value)} placeholder="0" min="1" />
                </FL>
              </div>
            </div>
          ))}
          <button onClick={addBatch} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px dashed #0c3b73', borderRadius: 8, background: '#fff', color: '#0c3b73', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} /> Add Another Batch
          </button>
        </Section>

        {/* Section 5: SKU & Barcode */}
        <Section title="🏷️ SKU & Barcode">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <FL label="SKU (Stock Keeping Unit)">
                <div style={{ display: 'flex', gap: 6 }}>
                  <Input 
                    value={form.sku} 
                    onChange={set('sku')} 
                    placeholder="e.g., MA7K9B5"
                    style={{ flex: 1 }}
                  />
                  <button 
                    onClick={() => setForm(p => ({ ...p, sku: generateSKU() }))}
                    title="Generate new SKU"
                    style={{ padding: '9px 12px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    🔄 New
                  </button>
                </div>
                <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>Auto-generated or manual</p>
              </FL>
            </div>
            <div>
              <FL label="Barcode (EAN/UPC)">
                <div style={{ display: 'flex', gap: 6 }}>
                  <Input 
                    value={form.barcode} 
                    onChange={set('barcode')} 
                    placeholder="Auto-generated or manual"
                    style={{ flex: 1 }}
                  />
                  <button 
                    onClick={generateBarcode}
                    title="Generate barcode"
                    style={{ padding: '9px 12px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <QrCode size={12} /> Gen
                  </button>
                </div>
              </FL>
            </div>
          </div>
        </Section>

        {/* Section 6: Medicine Image (Optional) */}
        <Section title="📸 Medicine Image (Optional)">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
            <div>
              <FL label="Upload Medicine Image">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px dashed #e5e7eb',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                />
              </FL>
              <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>
                Maximum size: 2MB • Formats: JPG, PNG, GIF, WebP
              </p>
            </div>
            
            {imagePreview && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '2px solid #0891b2',
                  background: 'linear-gradient(135deg, #e0e7ff, #f0fdf4)',
                  position: 'relative'
                }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <button
                  onClick={removeImage}
                  style={{
                    marginTop: 8,
                    padding: '4px 12px',
                    border: 'none',
                    borderRadius: 6,
                    background: '#fee2e2',
                    color: '#dc2626',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* Section 7: Stock Settings */}
        <Section title="📊 Stock Management">
          <FL label="Reorder Level">
            <Input type="number" value={form.reorderLevel} onChange={set('reorderLevel')} placeholder="20" min="0" />
          </FL>
        </Section>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 32px', border: 'none', borderRadius: 8, background: saving ? '#93c5fd' : '#0c3b73', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            <Save size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            {saving ? 'Saving...' : 'Save Medicine'}
          </button>
        </div>

      </div>
    </div>
  )
}
