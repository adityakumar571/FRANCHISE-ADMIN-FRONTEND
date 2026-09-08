/* eslint-disable prettier/prettier */
/**
 * Screen 59 — Add / Edit Supplier (API-connected)
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Truck, ArrowLeft, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest, putRequest } from '../../../Helpers'

const FL = ({ label, required, children }) => (
  <div>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </label>
    {children}
  </div>
)

const Input = ({ value, onChange, placeholder, type = 'text', disabled }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: disabled ? '#f9fafb' : '#fff', boxSizing: 'border-box', color: '#111827' }}
    onFocus={e => { if (!disabled) e.target.style.borderColor = '#d97706' }}
    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
  />
)

const Sel = ({ value, onChange, children }) => (
  <select value={value} onChange={onChange}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer' }}>
    {children}
  </select>
)

const Section = ({ title, cols = 3, children }) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
    <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>{title}</p>
    </div>
    <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 14 }}>
      {children}
    </div>
  </div>
)

const EMPTY = {
  name: '', phone: '', email: '', website: '', gstNo: '',
  billingAddress: '', shippingAddress: '', city: '', state: '', pincode: '',
  supplierType: 'Wholesaler', paymentTerms: '30 Days', creditLimit: '',
  transporter: '', deliveryTime: 'Next Day', status: true,
  bankName: '', accountNo: '', ifsc: '', branch: '',
}

export default function AddSupplier() {
  const navigate   = useNavigate()
  const { id }     = useParams()
  const isEdit     = !!id
  const [form, setForm]     = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  // Load existing data for edit mode
  useEffect(() => {
    if (!isEdit) return
    getRequest(`/franchise/suppliers/${id}`)
      .then(res => {
        const d = res.data?.data
        if (d) setForm({
          name:            d.name         || '',
          phone:           d.phone        || '',
          email:           d.email        || '',
          website:         d.website      || '',
          gstNo:           d.gstNo        || '',
          billingAddress:  d.billingAddress  || '',
          shippingAddress: d.shippingAddress || '',
          city:            d.city         || '',
          state:           d.state        || '',
          pincode:         d.pincode      || '',
          supplierType:    d.supplierType || 'Wholesaler',
          paymentTerms:    d.paymentTerms || '30 Days',
          creditLimit:     d.creditLimit  || '',
          transporter:     d.transporter  || '',
          deliveryTime:    d.deliveryTime || 'Next Day',
          status:          d.status !== false,
          bankName:        d.bank?.name   || '',
          accountNo:       d.bank?.accountNo || '',
          ifsc:            d.bank?.ifsc   || '',
          branch:          d.bank?.branch || '',
        })
      })
      .catch(() => toast.error('Failed to load supplier data'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim())  { toast.error('Supplier name is required'); return }
    if (!form.phone.trim()) { toast.error('Phone number is required'); return }

    setSaving(true)
    try {
      const payload = {
        name:            form.name,
        phone:           form.phone,
        email:           form.email,
        website:         form.website,
        gstNo:           form.gstNo,
        billingAddress:  form.billingAddress,
        shippingAddress: form.shippingAddress,
        city:            form.city,
        state:           form.state,
        pincode:         form.pincode,
        supplierType:    form.supplierType,
        paymentTerms:    form.paymentTerms,
        creditLimit:     parseFloat(form.creditLimit) || 0,
        transporter:     form.transporter,
        deliveryTime:    form.deliveryTime,
        status:          form.status ? 'Active' : 'Inactive',
        bank: {
          name:      form.bankName,
          accountNo: form.accountNo,
          ifsc:      form.ifsc,
          branch:    form.branch,
        },
      }
      if (isEdit) {
        await putRequest({ url: `/franchise/suppliers/${id}`, cred: payload })
        toast.success('Supplier updated successfully')
      } else {
        await postRequest({ url: '/franchise/suppliers', cred: payload })
        toast.success('Supplier added successfully')
      }
      navigate('/franchise/suppliers')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save supplier')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          Loading supplier data...
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PageHeader icon={Truck} title={isEdit ? 'Edit Supplier' : 'Add Supplier'} subtitle={isEdit ? 'Update supplier information' : 'Add a new supplier to your system'} color="#d97706">
        <button onClick={() => navigate('/franchise/suppliers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
      </PageHeader>

      {/* Basic Information */}
      <Section title="Basic Information" cols={3}>
        <FL label="Supplier Name" required>
          <Input value={form.name} onChange={set('name')} placeholder="Enter supplier name" />
        </FL>
        <FL label="Phone" required>
          <Input value={form.phone} onChange={set('phone')} placeholder="Enter phone number" />
        </FL>
        <FL label="Email">
          <Input value={form.email} onChange={set('email')} placeholder="supplier@example.com" type="email" />
        </FL>
        <FL label="Supplier Type">
          <Sel value={form.supplierType} onChange={set('supplierType')}>
            {['Wholesaler','Distributor','Manufacturer','Retailer'].map(o => <option key={o}>{o}</option>)}
          </Sel>
        </FL>
        <FL label="GST No.">
          <Input value={form.gstNo} onChange={set('gstNo')} placeholder="15-digit GST number" />
        </FL>
        <FL label="Website">
          <Input value={form.website} onChange={set('website')} placeholder="www.example.com" />
        </FL>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Address Information */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Address Information</p>
          </div>
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FL label="Billing Address">
              <textarea value={form.billingAddress} onChange={set('billingAddress')} rows={2} placeholder="Enter billing address"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            </FL>
            <FL label="Shipping Address">
              <textarea value={form.shippingAddress} onChange={set('shippingAddress')} rows={2} placeholder="Same as billing address"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            </FL>
            <FL label="City">
              <Input value={form.city} onChange={set('city')} placeholder="City" />
            </FL>
            <FL label="State">
              <Sel value={form.state} onChange={set('state')}>
                <option value="">Select state</option>
                {['Andhra Pradesh','Delhi','Gujarat','Karnataka','Maharashtra','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'].map(o => <option key={o}>{o}</option>)}
              </Sel>
            </FL>
            <FL label="Pincode">
              <Input value={form.pincode} onChange={set('pincode')} placeholder="6-digit pincode" />
            </FL>
          </div>
        </div>

        {/* Payment & Delivery Terms */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Payment & Delivery Terms</p>
          </div>
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FL label="Credit Limit (₹)">
              <Input value={form.creditLimit} onChange={set('creditLimit')} placeholder="e.g. 100000" type="number" />
            </FL>
            <FL label="Payment Terms">
              <Sel value={form.paymentTerms} onChange={set('paymentTerms')}>
                {['Advance','7 Days','15 Days','30 Days','45 Days','60 Days','90 Days'].map(o => <option key={o}>{o}</option>)}
              </Sel>
            </FL>
            <FL label="Transporter">
              <Input value={form.transporter} onChange={set('transporter')} placeholder="Transporter name" />
            </FL>
            <FL label="Delivery Time">
              <Sel value={form.deliveryTime} onChange={set('deliveryTime')}>
                {['Same Day','Next Day','2-3 Days','5-7 Days','7-10 Days'].map(o => <option key={o}>{o}</option>)}
              </Sel>
            </FL>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Status</label>
              <div onClick={() => setForm(p => ({...p, status: !p.status}))}
                style={{ width: 44, height: 24, borderRadius: 12, background: form.status ? '#d97706' : '#e5e7eb', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.status ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
              </div>
              <span style={{ fontSize: 12, color: form.status ? '#16a34a' : '#9ca3af', marginTop: 5, display: 'block' }}>{form.status ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Bank Details</p>
          </div>
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FL label="Bank Name">
              <Input value={form.bankName} onChange={set('bankName')} placeholder="e.g. State Bank of India" />
            </FL>
            <FL label="Account Number">
              <Input value={form.accountNo} onChange={set('accountNo')} placeholder="Enter account number" />
            </FL>
            <FL label="IFSC Code">
              <Input value={form.ifsc} onChange={set('ifsc')} placeholder="e.g. SBIN0001234" />
            </FL>
            <FL label="Branch">
              <Input value={form.branch} onChange={set('branch')} placeholder="Branch name" />
            </FL>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '4px 0' }}>
        <button onClick={() => navigate('/franchise/suppliers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff' }}>
          <X size={14} /> Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', background: saving ? '#9ca3af' : '#d97706', color: '#fff' }}>
          <Save size={14} /> {saving ? 'Saving...' : isEdit ? 'Update Supplier' : 'Save Supplier'}
        </button>
      </div>
    </div>
  )
}
