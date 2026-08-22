/* eslint-disable prettier/prettier */
/**
 * MedicineFormModal — Add / Edit medicine
 */
import { useState, useEffect } from 'react'
import { X, FlaskConical } from 'lucide-react'
import { postRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const INITIAL = {
  name: '', genericName: '', strength: '', dosageForm: '',
  brand: '', manufacturer: '', packSize: '', unit: '',
  hsn: '', gstRate: '', category: '', barcode: '', isActive: true,
}

const MedicineFormModal = ({ open, onClose, data, onSaved }) => {
  const [form, setForm] = useState(INITIAL)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (data) setForm({ ...INITIAL, ...data })
    else setForm(INITIAL)
  }, [data])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Medicine name is required'); return }
    setLoading(true)
    const req = data?._id
      ? putRequest({ url: `franchise/medicines/${data._id}`, cred: form })
      : postRequest({ url: 'franchise/medicines', cred: form })
    req
      .then(() => { toast.success(data?._id ? 'Medicine updated' : 'Medicine added'); onSaved() })
      .catch((err) => toast.error(err?.response?.data?.message || 'Save failed'))
      .finally(() => setLoading(false))
  }

  if (!open) return null

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#7c3aed18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={18} color="#7c3aed" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{data?._id ? 'Edit Medicine' : 'Add Medicine'}</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Medicine master record</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Medicine Name *" name="name" value={form.name} onChange={onChange} placeholder="e.g. Paracetamol" span={2} />
            <Field label="Generic / Composition" name="genericName" value={form.genericName} onChange={onChange} placeholder="e.g. Acetaminophen" />
            <Field label="Strength" name="strength" value={form.strength} onChange={onChange} placeholder="e.g. 500mg" />
            <Field label="Dosage Form" name="dosageForm" value={form.dosageForm} onChange={onChange} placeholder="e.g. Tablet, Syrup" />
            <Field label="Brand" name="brand" value={form.brand} onChange={onChange} placeholder="Brand name" />
            <Field label="Manufacturer" name="manufacturer" value={form.manufacturer} onChange={onChange} placeholder="Company name" />
            <Field label="Pack Size" name="packSize" value={form.packSize} onChange={onChange} placeholder="e.g. 10" />
            <Field label="Unit" name="unit" value={form.unit} onChange={onChange} placeholder="e.g. Tablets, ml" />
            <Field label="HSN Code" name="hsn" value={form.hsn} onChange={onChange} placeholder="e.g. 3004" />
            <Field label="GST Rate (%)" name="gstRate" value={form.gstRate} onChange={onChange} type="number" placeholder="e.g. 12" />
            <Field label="Category" name="category" value={form.category} onChange={onChange} placeholder="e.g. Antibiotic" />
            <Field label="Barcode / SKU" name="barcode" value={form.barcode} onChange={onChange} placeholder="Barcode" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
            <input type="checkbox" name="isActive" id="med_active" checked={form.isActive} onChange={onChange} />
            <label htmlFor="med_active" style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Active</label>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={submitBtn(loading)}>
              {loading ? 'Saving…' : data?._id ? 'Update' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Field = ({ label, name, value, onChange, placeholder, type = 'text', span }) => (
  <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', height: 38, border: '1px solid #e5e7eb',
        borderRadius: 7, padding: '0 11px', fontSize: 13, outline: 'none',
        background: '#fafafa', boxSizing: 'border-box',
      }}
    />
  </div>
)

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
}
const modal = {
  background: '#fff', borderRadius: 12, padding: 28,
  width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
}
const cancelBtn = {
  padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb',
  background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer',
}
const submitBtn = (loading) => ({
  padding: '9px 22px', borderRadius: 8, border: 'none',
  background: loading ? '#93c5fd' : '#0c3b73',
  color: '#fff', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
})

export default MedicineFormModal
