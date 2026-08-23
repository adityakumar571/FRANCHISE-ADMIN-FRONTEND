/* eslint-disable prettier/prettier */
/**
 * Screen 59 — Add Supplier
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, ArrowLeft, Save, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const FL = ({ label, required, children, col = 1 }) => (
  <div style={{ gridColumn: `span ${col}` }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </label>
    {children}
  </div>
)

const Input = ({ value, onChange, placeholder, type = 'text', disabled }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: disabled?'#f9fafb':'#fff', boxSizing: 'border-box', color: '#111827' }}
    onFocus={e => { if(!disabled) e.target.style.borderColor='#d97706' }}
    onBlur={e => e.target.style.borderColor='#e5e7eb'}
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

export default function AddSupplier() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', supplierCode: 'Auto Generate', billingAddress: '', creditLimit: '',
    paymentTerms: '', gstNo: '', shippingAddress: '', transporter: '',
    phone: '', city: '', deliveryTime: '', email: '', state: '', status: true,
    website: '', pincode: '', bankName: '', accountNo: '', ifsc: '', branch: '',
  })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) { alert('Supplier name and phone are required'); return }
    navigate('/franchise/suppliers')
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PageHeader icon={Truck} title="Add Supplier" subtitle="Add a new supplier to your system" color="#d97706">
        <button onClick={() => navigate('/franchise/suppliers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {/* Basic Information */}
        <div style={{ gridColumn: 'span 3' }}>
          <Section title="Basic Information" cols={3}>
            <FL label="Supplier Name *">
              <Input value={form.name} onChange={set('name')} placeholder="Enter supplier name" />
            </FL>
            <FL label="Salt / Generic Name">
              <Input value={form.supplierCode} disabled />
            </FL>
            <FL label="Brand Name">
              <Input value="" onChange={set('brand')} placeholder="Enter brand name" />
            </FL>
            <FL label="Select Category">
              <Sel value="" onChange={set('category')}>
                <option value="">Select category</option>
                {['Wholesaler','Distributor','Manufacturer','Retailer'].map(o => <option key={o}>{o}</option>)}
              </Sel>
            </FL>
            <FL label="Select Formulation">
              <Sel value="" onChange={set('formulation')}>
                <option value="">Select formulation</option>
                {['Tablet','Capsule','Syrup','Injection'].map(o => <option key={o}>{o}</option>)}
              </Sel>
            </FL>
            <FL label="Strength">
              <Input value="" onChange={set('strength')} placeholder="e.g. 650 mg" />
            </FL>
          </Section>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {/* Address Information */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Address Information</p>
          </div>
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FL label="Billing Address *"><Input value={form.billingAddress} onChange={set('billingAddress')} placeholder="Enter billing address" /></FL>
            <FL label="Supplier Code *"><Input value={form.supplierCode} disabled /></FL>
            <FL label="GST No."><Input value={form.gstNo} onChange={set('gstNo')} placeholder="Enter GST number" /></FL>
            <FL label="Shipping Address"><Input value={form.shippingAddress} onChange={set('shippingAddress')} placeholder="Enter shipping address" /></FL>
            <FL label="Phone *"><Input value={form.phone} onChange={set('phone')} placeholder="Enter phone number" /></FL>
            <FL label="City"><Sel value={form.city} onChange={set('city')}><option value="">Select city</option>{['Lucknow','Kanpur','Delhi','Mumbai'].map(o=><option key={o}>{o}</option>)}</Sel></FL>
            <FL label="Email"><Input value={form.email} onChange={set('email')} placeholder="Enter email" type="email" /></FL>
            <FL label="State *"><Sel value={form.state} onChange={set('state')}><option value="">Select state</option>{['Uttar Pradesh','Delhi','Maharashtra','Gujarat'].map(o=><option key={o}>{o}</option>)}</Sel></FL>
            <FL label="Pincode *"><Input value={form.pincode} onChange={set('pincode')} placeholder="Enter pincode" /></FL>
          </div>
        </div>

        {/* Other Information */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Other Information</p>
          </div>
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FL label="Credit Limit"><Input value={form.creditLimit} onChange={set('creditLimit')} placeholder="Enter credit limit" type="number" /></FL>
            <FL label="Payment Terms *"><Sel value={form.paymentTerms} onChange={set('paymentTerms')}><option value="">Select payment terms</option>{['7 Days','15 Days','30 Days','45 Days','60 Days'].map(o=><option key={o}>{o}</option>)}</Sel></FL>
            <FL label="Transporter"><Input value={form.transporter} onChange={set('transporter')} placeholder="Enter transporter name" /></FL>
            <FL label="Delivery Time"><Sel value={form.deliveryTime} onChange={set('deliveryTime')}><option value="">Select delivery time</option>{['Same Day','Next Day','2-3 Days','5-7 Days'].map(o=><option key={o}>{o}</option>)}</Sel></FL>
            <FL label="Website"><Input value={form.website} onChange={set('website')} placeholder="www.example.com" /></FL>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Status</label>
              <div onClick={() => setForm(p => ({...p, status: !p.status}))}
                style={{ width: 44, height: 24, borderRadius: 12, background: form.status ? '#d97706' : '#e5e7eb', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.status ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Bank Details</p>
          </div>
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FL label="Bank Name"><Input value={form.bankName} onChange={set('bankName')} placeholder="Enter bank name" /></FL>
            <FL label="Account Number"><Input value={form.accountNo} onChange={set('accountNo')} placeholder="Enter account number" /></FL>
            <FL label="IFSC Code"><Input value={form.ifsc} onChange={set('ifsc')} placeholder="Enter IFSC code" /></FL>
            <FL label="Branch"><Input value={form.branch} onChange={set('branch')} placeholder="Enter branch" /></FL>
          </div>

          <div style={{ padding: '14px 18px', borderTop: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Upload Documents</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {['GST Certificate','Address Proof','Other Document'].map(doc => (
                <div key={doc}>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 5px' }}>{doc}</p>
                  <input type="file" style={{ fontSize: 11, width: '100%' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '4px 0' }}>
        <button onClick={() => navigate('/franchise/suppliers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff' }}>
          <X size={14} /> Cancel
        </button>
        <button onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: '#d97706', color: '#fff' }}>
          <Save size={14} /> Save Supplier
        </button>
      </div>
    </div>
  )
}
