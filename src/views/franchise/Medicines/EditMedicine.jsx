/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2, ArrowLeft, Save, Eye, RefreshCw, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest, putRequest } from '../../../Helpers'

const FL = ({ label, required, children }) => (
  <div>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </label>
    {children}
  </div>
)
const Input = ({ value, onChange, placeholder, type = 'text', disabled }) => (
  <input type={type} value={value ?? ''} onChange={e => onChange && onChange(e)} placeholder={placeholder} disabled={disabled}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: disabled ? '#f9fafb' : '#fff', boxSizing: 'border-box', color: disabled ? '#9ca3af' : '#111827' }}
    onFocus={e => { if (!disabled) e.target.style.borderColor = '#0c3b73' }}
    onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
)
const Sel = ({ value, onChange, opts }) => (
  <select value={value ?? ''} onChange={onChange}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer' }}>
    {opts.map(o => <option key={o}>{o}</option>)}
  </select>
)

const TABS      = ['Basic Information', 'Pricing & Stock', 'Rack Location', 'Other Information', 'Images']
const CATS      = ['Analgesic','Antibiotic','Antifungal','Antiviral','Antacid','Vitamin','Supplement','Cardiac','Diabetic','Other']
const FORMS     = ['Tablet','Capsule','Syrup','Injection','Ointment','Cream','Gel','Drops','Powder','Sachet']
const COMPANIES = ['Sun Pharma','Cipla','Lupin','Dr. Reddy\'s','Alkem','Mankind','Torrent','Abbott','GSK','Pfizer','Other']
const UNITS     = ['Tablet','Capsule','Syrup','Injection','Ointment','Drops','Strip','Bottle','Sachet']
const GST_RATES = ['0%','5%','12%','18%']
const RACKS     = ['RACK-A', 'RACK-B', 'RACK-C', 'RACK-D', 'RACK-E', 'RACK-F']
const ROWS      = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

export default function EditMedicine() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const [tab, setTab]     = useState('Basic Information')
  const [form, setForm]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [racks, setRacks]     = useState([]) // Dynamic racks from API

  const fetchMed = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch medicine data
      const res = await getRequest(`/franchise/medicines/${id}`)
      const d   = res.data?.data
      if (d) {
        setForm({ 
          ...d, 
          gst: d.gst ? `${d.gst}%` : '12%', 
          mrp: d.mrp ?? '', 
          purchasePrice: d.purchasePrice ?? '', 
          stock: d.stock ?? 0, 
          reorderLevel: d.reorderLevel ?? 100,
          // Initialize rackLocation with fallback
          rackLocation: d.rackLocation ? {
            rackId: d.rackLocation.rackId || '',
            shelf: d.rackLocation.shelf || '',
            row: d.rackLocation.row || '',
            column: d.rackLocation.column || '',
            position: d.rackLocation.position || ''
          } : {
            rackId: '',
            shelf: '',
            row: '',
            column: '',
            position: ''
          }
        })
      }
      
      // Fetch racks list for dropdown
      try {
        const racksRes = await getRequest('/franchise/rack-management')
        console.log('🏪 Racks API Response:', racksRes)
        
        // Backend returns {data: [...racks]}
        let racksData = racksRes.data?.data || racksRes.data || []
        
        console.log('🏪 Processed Racks Data:', racksData)
        
        if (Array.isArray(racksData) && racksData.length > 0) {
          // Transform racks: use 'code' as name if 'name' doesn't exist
          const transformedRacks = racksData.map(rack => ({
            ...rack,
            name: rack.name || rack.code, // Use code as fallback
            displayName: `${rack.name || rack.code} - ${rack.description || rack.area}` // Descriptive name
          }))
          setRacks(transformedRacks)
          console.log('✅ Racks loaded:', transformedRacks.length, transformedRacks)
        } else {
          console.warn('⚠️ No racks found in API response')
          setRacks([])
        }
      } catch (err) {
        console.error('❌ Failed to load racks:', err)
        toast.error('Failed to load racks')
        setRacks([])
      }
    } catch (err) { 
      console.error('Failed to load:', err)
      toast.error('Failed to load medicine')
    } finally { 
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchMed() }, [fetchMed])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  
  const setNested = (parent, field) => e => {
    setForm(p => ({
      ...p,
      [parent]: { ...p[parent], [field]: e.target.value }
    }))
  }

  // Auto-generate position when rack location changes
  useEffect(() => {
    if (form?.rackLocation) {
      const { rackId, shelf, row, column } = form.rackLocation
      if (rackId && shelf && row && column) {
        setForm(p => ({
          ...p,
          rackLocation: { 
            ...p.rackLocation, 
            position: `${rackId}-${shelf}-${row}-${column}` 
          }
        }))
      }
    }
  }, [form?.rackLocation?.rackId, form?.rackLocation?.shelf, form?.rackLocation?.row, form?.rackLocation?.column])

  const handleUpdate = async () => {
    if (!form?.name?.trim()) { toast.error('Medicine name is required'); return }
    if (!form?.mrp)          { toast.error('MRP is required'); return }
    setSaving(true)
    try {
      const payload = { 
        ...form, 
        mrp: parseFloat(form.mrp) || 0, 
        purchasePrice: parseFloat(form.purchasePrice) || 0, 
        reorderLevel: parseInt(form.reorderLevel) || 100, 
        gst: parseFloat(form.gst) || 0,
        // Include rack location in update
        rackLocation: form.rackLocation && form.rackLocation.rackId ? {
          rackId: form.rackLocation.rackId,
          shelf: parseInt(form.rackLocation.shelf) || 0,
          row: form.rackLocation.row,
          column: parseInt(form.rackLocation.column) || 0,
          position: form.rackLocation.position
        } : undefined
      }
      await putRequest({ url: `/franchise/medicines/${id}`, cred: payload })
      toast.success('Medicine updated successfully')
      navigate(`/franchise/medicines/${id}`)
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to update medicine') }
    finally { setSaving(false) }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontFamily: 'Inter,sans-serif' }}>Loading medicine data...</div>
  if (!form)   return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontFamily: 'Inter,sans-serif' }}>Medicine not found.</div>

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader icon={Edit2} title="Edit Medicine" subtitle="Update medicine information" color="#d97706">
        <button onClick={() => navigate(`/franchise/medicines/${id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Eye size={13} /> View Details
        </button>
        <button onClick={() => navigate('/franchise/medicines')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '11px 18px', border: 'none', borderBottom: tab===t?'2px solid #d97706':'2px solid transparent', background: 'none', fontSize: 12, fontWeight: tab===t?700:500, color: tab===t?'#d97706':'#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ padding: 20 }}>
            {tab === 'Basic Information' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FL label="Medicine Name *"><Input value={form.name}        onChange={set('name')}        placeholder="e.g. Paracetamol 650mg" /></FL>
                <FL label="Salt / Generic *"><Input value={form.salt}        onChange={set('salt')}        placeholder="e.g. Paracetamol" /></FL>
                <FL label="Brand Name">      <Input value={form.brand}       onChange={set('brand')}       placeholder="e.g. Crocin" /></FL>
                <FL label="Category">        <Sel   value={form.category}    onChange={set('category')}    opts={CATS} /></FL>
                <FL label="Formulation">     <Sel   value={form.formulation} onChange={set('formulation')} opts={FORMS} /></FL>
                <FL label="Strength">        <Input value={form.strength}    onChange={set('strength')}    placeholder="e.g. 650 mg" /></FL>
                <FL label="Company">         <Sel   value={form.company}     onChange={set('company')}     opts={COMPANIES} /></FL>
                <FL label="HSN Code">        <Input value={form.hsn}         onChange={set('hsn')}         placeholder="3004" /></FL>
              </div>
            )}
            {tab === 'Pricing & Stock' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FL label="MRP (₹) *">          <Input value={form.mrp}            onChange={set('mrp')}           type="number" /></FL>
                <FL label="Purchase Price (₹)"> <Input value={form.purchasePrice}  onChange={set('purchasePrice')} type="number" /></FL>
                <FL label="Current Stock">       <Input value={form.stock}          onChange={set('stock')}         type="number" /></FL>
                <FL label="Reorder Level">       <Input value={form.reorderLevel}   onChange={set('reorderLevel')}  type="number" /></FL>
                <FL label="Pack Size">           <Input value={form.packSize}       onChange={set('packSize')}      placeholder="1x15 Strips" /></FL>
                <FL label="GST Rate">            <Sel   value={form.gst}            onChange={set('gst')}           opts={GST_RATES} /></FL>
              </div>
            )}
            {tab === 'Rack Location' && (
              <div>
                {/* Debug: Show racks count */}
                {console.log('📦 Racks state:', racks)}
                
                {/* Show loading/empty state */}
                {racks.length === 0 && loading && (
                  <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>
                    Loading racks...
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <FL label="Rack">
                    <select value={form.rackLocation?.rackId || ''} onChange={setNested('rackLocation', 'rackId')} 
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer' }}>
                      <option value="">Select Rack</option>
                      {racks.length === 0 && !loading && (
                        <option value="" disabled>No racks available - Add in Rack Management</option>
                      )}
                      {racks.map(rack => (
                        <option key={rack._id} value={rack.code}>
                          {rack.displayName || `${rack.code} - ${rack.description || rack.area}`}
                        </option>
                      ))}
                    </select>
                    {racks.length > 0 && (
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#16a34a' }}>
                        ✅ {racks.length} racks available
                      </p>
                    )}
                  </FL>
                  <FL label="Shelf (1-10)">
                    <Input type="number" value={form.rackLocation?.shelf || ''} onChange={setNested('rackLocation', 'shelf')} placeholder="1" min="1" max="10" />
                  </FL>
                  <FL label="Row">
                    <Sel value={form.rackLocation?.row || ''} onChange={setNested('rackLocation', 'row')} opts={['', ...ROWS]} />
                  </FL>
                  <FL label="Column (1-20)">
                    <Input type="number" value={form.rackLocation?.column || ''} onChange={setNested('rackLocation', 'column')} placeholder="1" min="1" max="20" />
                  </FL>
                </div>
                {racks.length === 0 && (
                  <div style={{ padding: 14, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, marginBottom: 14 }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#854d0e' }}>
                      ⚠️ No racks found. Please add racks in Rack Management first.
                    </p>
                  </div>
                )}
                {form.rackLocation?.position && (
                  <div style={{ padding: 14, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#15803d' }}>
                      📦 Position: <span style={{ fontFamily: 'monospace' }}>{form.rackLocation.position}</span>
                    </p>
                  </div>
                )}
                {!form.rackLocation?.rackId && racks.length > 0 && (
                  <div style={{ padding: 14, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8 }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#854d0e' }}>
                      ⚠️ Rack location not assigned. Select rack details above to assign a location.
                    </p>
                  </div>
                )}
              </div>
            )}
            {tab === 'Other Information' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FL label="Unit"><Sel value={form.unit} onChange={set('unit')} opts={UNITS} /></FL>
                <FL label="Description">
                  <textarea value={form.description || ''} onChange={set('description')} rows={4}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </FL>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={!!form.prescription} onChange={e => setForm(p => ({...p, prescription: e.target.checked}))} style={{ width: 15, height: 15, accentColor: '#0c3b73' }} />
                  <span style={{ fontWeight: 500 }}>Prescription Required (Rx)</span>
                </label>
              </div>
            )}
            {tab === 'Images' && (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <Image size={40} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 16px' }}>
                  {form.image ? 'Image uploaded' : 'No images uploaded yet'}
                </p>
                <button onClick={() => navigate(`/franchise/medicines/${id}/images`)}
                  style={{ padding: '9px 18px', background: '#0c3b73', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Manage Images
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right — Preview + Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>💊</div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{form.name}</p>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af' }}>{form.salt}</p>
              </div>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 8px', textTransform: 'uppercase' }}>Quick Info</p>
            {[['Category',form.category],['Formulation',form.formulation],['Company',form.company],['MRP',form.mrp?`₹${form.mrp}`:'—']].map(([l,v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>
                <span style={{ color: '#9ca3af' }}>{l}</span>
                <span style={{ fontWeight: 600, color: '#374151' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={handleUpdate} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', background: saving ? '#9ca3af' : '#d97706', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>
              <Save size={15} /> {saving ? 'Saving...' : 'Update Medicine'}
            </button>
            <button onClick={() => navigate('/franchise/medicines')}
              style={{ padding: '10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
