/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Save, User, MapPin,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { postRequest } from '../../../Helpers'
import PageHeader from '../components/PageHeader'

/* ─── UI helpers ─────────────────────────────────────────── */
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
const TInput = ({ value, onChange, placeholder, type = 'text', min, step }) => (
  <input type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder}
    min={min} step={step} className={inputCls} />
)
const TSel = ({ value, onChange, opts = [], placeholder }) => (
  <select value={value ?? ''} onChange={onChange} className={inputCls + ' cursor-pointer'}>
    {placeholder && <option value="">{placeholder}</option>}
    {opts.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
)
const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
    <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
      {Icon && <Icon size={15} className="text-blue-900" />}
      <span className="text-sm font-bold text-gray-700">{title}</span>
    </div>
    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
)

/* ══════════════════════════════════════════════════════════ */
export default function AddCustomer() {
  const navigate = useNavigate()

  /* form state */
  const [form, setForm] = useState({
    name:    '',
    phone:   '',
    email:   '',
    address: '',
    dob:     '',
    gender:  'Male',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error('Customer name is required')
      return
    }
    if (!form.phone?.trim()) {
      toast.error('Phone number is required')
      return
    }

    setSaving(true)
    try {
      const res = await postRequest({ url: '/franchise/customers', cred: form })
      if (res.status === 201 || res.status === 200) {
        toast.success('Customer created successfully')
        navigate('/franchise/customers')
      } else {
        toast.error(res.data?.message || 'Failed to create customer')
      }
    } catch (err) {
      console.error('Error creating customer:', err)
      toast.error(err.response?.data?.message || 'Error creating customer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <PageHeader icon={User} title="Add Customer" subtitle="Create a new customer profile" color="#0c3b73">
        <button onClick={() => navigate('/franchise/customers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Back
        </button>
      </PageHeader>

      <div style={{ padding: '24px 32px', maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Personal Info */}
        <Card title="Personal Information" icon={User}>
          <Field label="Name" required>
            <TInput value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Full name" />
          </Field>
          <Field label="Phone" required>
            <TInput value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="Phone number" />
          </Field>
          <Field label="Email">
            <TInput value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="Email address" type="email" />
          </Field>
          <Field label="Date of Birth">
            <TInput value={form.dob} onChange={(e) => handleChange('dob', e.target.value)} type="date" />
          </Field>
          <Field label="Gender">
            <TSel value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} opts={['Male', 'Female', 'Other']} />
          </Field>
        </Card>

        {/* Address */}
        <Card title="Address" icon={MapPin}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Address">
              <textarea 
                value={form.address} 
                onChange={(e) => handleChange('address', e.target.value)} 
                placeholder="Full address"
                className={inputCls}
                style={{ minHeight: 80, fontFamily: 'inherit' }}
              />
            </Field>
          </div>
        </Card>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={() => navigate('/franchise/customers')}
            style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, background: '#0c3b73', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </div>
    </div>
  )
}
