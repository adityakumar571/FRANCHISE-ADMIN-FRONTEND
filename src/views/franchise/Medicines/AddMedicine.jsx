/* eslint-disable prettier/prettier */
/**
 * Screen 14 — Add New Medicine (API-connected)
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, ArrowLeft, Save, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { postRequest, getRequest } from '../../../Helpers'

const FL = ({ label, required, children, hint }) => (
  <div>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </label>
    {hint && <p style={{ margin: '0 0 4px', fontSize: 10, color: '#9ca3af' }}>{hint}</p>}
    {children}
  </div>
)

const Input = ({ value, onChange, placeholder, type = 'text', disabled }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: disabled ? '#f9fafb' : '#fff', boxSizing: 'border-box', color: '#111827' }}
    onFocus={e => { if (!disabled) e.target.style.borderColor = '#0c3b73' }}
    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
  />
)

const Sel = ({ value, onChange, opts }) => (
  <select value={value} onChange={onChange}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer', color: '#111827' }}>
    {opts.map(o => <option key={o}>{o}</option>)}
  </select>
)

const Section = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
    <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>{title}</p>
    </div>
    <div style={{ padding: '18px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
      {children}
    </div>
  </div>
)

const UNITS     = ['Tablet','Capsule','Syrup','Injection','Ointment','Drops','Strip','Bottle','Sachet','Cream','Gel','Powder']
const GST_RATES = ['0%','5%','12%','18%']
const CATEGORIES_DEFAULT = ['Analgesic','Antibiotic','Antifungal','Antiviral','Antacid','Vitamin','Supplement','Cardiac','Diabetic','Other']
const FORMULATIONS_DEFAULT = ['Tablet','Capsule','Syrup','Injection','Ointment','Cream','Gel','Drops','Powder','Sachet']
const COMPANIES_DEFAULT = ['Sun Pharma','Cipla','Lupin','Dr. Reddy\'s','Alkem','Mankind','Torrent','Abbott','GSK','Pfizer','Other']

export default function AddMedicine() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', salt: '', brand: '', category: 'Analgesic', formulation: 'Tablet',
    company: 'Sun Pharma', strength: '', unit: 'Tablet', packSize: '', hsn: '3004',
    gst: '12%', mrp: '', purchasePrice: '', reorderLevel: '100',
    openingStock: '0', description: '', prescription: false,
  })
  const [saving, setSaving]     = useState(false)
  const [categories, setCategories]     = useState(CATEGORIES_DEFAULT)
  const [formulations, setFormulations] = useState(FORMULATIONS_DEFAULT)
  const [companies, setCompanies]       = useState(COMPANIES_DEFAULT)

  // Load dynamic categories/companies from API if available
  useEffect(() => {
    getRequest('/franchise/medicines/meta').then(res => {
      const d = res.data?.data
      if (d?.categories?.length)   setCategories(d.categories)
      if (d?.formulations?.length) setFormulations(d.formulations)
      if (d?.companies?.length)    setCompanies(d.companies)
    }).catch(() => { /* use defaults */ })
  }, [])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const setCheck = k => e => setForm(p => ({ ...p, [k]: e.target.checked }))

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Medicine name is required'); return }
    if (!form.salt.trim()) { toast.error('Salt / generic name is required'); return }
    if (!form.mrp)         { toast.error('MRP is required'); return }

    setSaving(true)
    try {
      const payload = {
        ...form,
        mrp:           parseFloat(form.mrp)           || 0,
        purchasePrice: parseFloat(form.purchasePrice) || 0,
        reorderLevel:  parseInt(form.reorderLevel)    || 100,
        openingStock:  parseInt(form.openingStock)    || 0,
        gst:           parseFloat(form.gst)           || 0,
      }
      await postRequest({ url: '/franchise/medicines', cred: payload })
      toast.success('Medicine added successfully')
      navigate('/franchise/medicines')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add medicine')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader icon={FlaskConical} title="Add New Medicine" subtitle="Add a new medicine to your inventory" color="#16a34a">
        <button onClick={() => navigate('/franchise/medicines')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>
        <div>
          {/* Basic Info */}
          <Section title="Basic Information">
            <FL label="Medicine Name" required>
              <Input value={form.name} onChange={set('name')} placeholder="e.g. Paracetamol 650mg Tablet" />
            </FL>
            <FL label="Salt / Generic Name" required>
              <Input value={form.salt} onChange={set('salt')} placeholder="e.g. Paracetamol 650mg" />
            </FL>
            <FL label="Brand Name">
              <Input value={form.brand} onChange={set('brand')} placeholder="e.g. Crocin" />
            </FL>
            <FL label="Medicine Category">
              <Sel value={form.category} onChange={set('category')} opts={categories} />
            </FL>
            <FL label="Select Formulation">
              <Sel value={form.formulation} onChange={set('formulation')} opts={formulations} />
            </FL>
            <FL label="Strength">
              <Input value={form.strength} onChange={set('strength')} placeholder="e.g. 650 mg" />
            </FL>
            <FL label="Unit">
              <Sel value={form.unit} onChange={set('unit')} opts={UNITS} />
            </FL>
            <FL label="Company / Manufacturer">
              <Sel value={form.company} onChange={set('company')} opts={companies} />
            </FL>
            <FL label="HSN Code">
              <Input value={form.hsn} onChange={set('hsn')} placeholder="3004" />
            </FL>
            <FL label="GST Rate">
              <Sel value={form.gst} onChange={set('gst')} opts={GST_RATES} />
            </FL>
          </Section>

          {/* Pricing & Stock */}
          <Section title="Pricing & Stock">
            <FL label="MRP (₹)" required>
              <Input value={form.mrp} onChange={set('mrp')} placeholder="0.00" type="number" />
            </FL>
            <FL label="Purchase Price (₹)">
              <Input value={form.purchasePrice} onChange={set('purchasePrice')} placeholder="0.00" type="number" />
            </FL>
            <FL label="Opening Stock">
              <Input value={form.openingStock} onChange={set('openingStock')} placeholder="0" type="number" />
            </FL>
            <FL label="Reorder Level">
              <Input value={form.reorderLevel} onChange={set('reorderLevel')} placeholder="100" type="number" />
            </FL>
          </Section>

          {/* Other Info */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>Other Information</p>
            </div>
            <div style={{ padding: '18px' }}>
              <div style={{ marginBottom: 14 }}>
                <FL label="Description">
                  <textarea value={form.description} onChange={set('description')} rows={3}
                    placeholder="Medicine description, usage, side effects..."
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </FL>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.prescription} onChange={setCheck('prescription')}
                  style={{ width: 15, height: 15, accentColor: '#0c3b73' }} />
                <span style={{ fontWeight: 500, color: '#374151' }}>Prescription Required (Rx)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Image Upload + Pack Size + Save */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Image Upload */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase' }}>Upload Image</p>
            <div style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#0c3b73'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#e5e7eb'}>
              <Upload size={28} color="#9ca3af" style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px', fontWeight: 600 }}>Click or drag to upload</p>
              <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>PNG, JPG up to 2MB</p>
            </div>
          </div>

          {/* Pack Size */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
            <FL label="Pack Size">
              <Input value={form.packSize} onChange={set('packSize')} placeholder="e.g. 1x15 Strips" />
            </FL>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', background: saving ? '#9ca3af' : '#0c3b73', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save Medicine'}
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
