/* eslint-disable prettier/prettier */
/**
 * Screen 15 — Edit Medicine
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2, ArrowLeft, Save, Eye, RefreshCw, Image } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { MEDICINES, CATEGORIES, FORMULATIONS, COMPANIES } from './medicineMockData'

const FL = ({ label, required, children }) => (
  <div>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </label>
    {children}
  </div>
)

const Input = ({ value, onChange, placeholder, type = 'text', disabled }) => (
  <input type={type} value={value} onChange={e => onChange && onChange(e)} placeholder={placeholder} disabled={disabled}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: disabled ? '#f9fafb' : '#fff', boxSizing: 'border-box', color: disabled ? '#9ca3af' : '#111827' }}
    onFocus={e => { if (!disabled) e.target.style.borderColor = '#0c3b73' }}
    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
  />
)

const Sel = ({ value, onChange, opts }) => (
  <select value={value} onChange={onChange}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer' }}>
    {opts.map(o => <option key={o}>{o}</option>)}
  </select>
)

const TABS = ['Basic Information', 'Pricing & Stock', 'Other Information', 'Images']

export default function EditMedicine() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const med      = MEDICINES.find(m => m._id === id) || MEDICINES[0]
  const [tab, setTab] = useState('Basic Information')
  const [form, setForm] = useState({ ...med, gst: `${med.gst}%` })

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader icon={Edit2} title="Edit Medicine" subtitle="Update medicine information" color="#d97706">
        <button onClick={() => navigate(`/franchise/medicines/${med._id}`)}
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
          {/* Tabs */}
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
                <FL label="Medicine Name *"><Input value={form.name} onChange={set('name')} /></FL>
                <FL label="Salt / Generic Name"><Input value={form.salt} onChange={set('salt')} /></FL>
                <FL label="Brand Name"><Input value={form.brand} onChange={set('brand')} /></FL>
                <FL label="Category"><Sel value={form.category} onChange={set('category')} opts={CATEGORIES.slice(1)} /></FL>
                <FL label="Formulation"><Sel value={form.formulation} onChange={set('formulation')} opts={FORMULATIONS.slice(1)} /></FL>
                <FL label="Strength"><Input value={form.strength || ''} onChange={set('strength')} placeholder="e.g. 650 mg" /></FL>
                <FL label="Company"><Sel value={form.company} onChange={set('company')} opts={COMPANIES.slice(1)} /></FL>
                <FL label="HSN Code"><Input value={form.hsn} onChange={set('hsn')} /></FL>
              </div>
            )}
            {tab === 'Pricing & Stock' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FL label="MRP (₹) *"><Input value={form.mrp} onChange={set('mrp')} type="number" /></FL>
                <FL label="Purchase Price (₹)"><Input value={form.purchasePrice} onChange={set('purchasePrice')} type="number" /></FL>
                <FL label="Current Stock"><Input value={form.stock} onChange={set('stock')} type="number" /></FL>
                <FL label="Reorder Level"><Input value={form.reorderLevel} onChange={set('reorderLevel')} type="number" /></FL>
                <FL label="Pack Size"><Input value={form.packSize || ''} onChange={set('packSize')} placeholder="1x15 Strips" /></FL>
                <FL label="GST Rate"><Sel value={form.gst} onChange={set('gst')} opts={['0%','5%','12%','18%']} /></FL>
              </div>
            )}
            {tab === 'Other Information' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FL label="Unit">
                  <Sel value={form.unit} onChange={set('unit')} opts={['Tablet','Capsule','Syrup','Injection','Ointment','Drops']} />
                </FL>
                <FL label="Description">
                  <textarea value={form.description || ''} onChange={set('description')} rows={4}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </FL>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" defaultChecked={false} style={{ width: 15, height: 15, accentColor: '#0c3b73' }} />
                  <span style={{ fontWeight: 500 }}>Prescription Required</span>
                </label>
              </div>
            )}
            {tab === 'Images' && (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <Image size={40} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 16px' }}>No images uploaded yet</p>
                <button style={{ padding: '9px 18px', background: '#0c3b73', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Upload Images
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right — Preview + Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Medicine Preview */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>💊</div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{form.name}</p>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af' }}>{form.salt}</p>
              </div>
            </div>
            <button onClick={() => setForm(p => ({ ...p, image: null }))}
              style={{ width: '100%', padding: '8px', border: '1px dashed #e5e7eb', borderRadius: 8, background: '#f9fafb', cursor: 'pointer', fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <RefreshCw size={12} /> Change Image
            </button>
          </div>

          {/* Quick Info */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase' }}>Quick Info</p>
            {[['Medicine Name',form.name],['Salt / Common Name',form.salt],['Category',form.category],['Formulation',form.formulation],['Company',form.company],['HSN Code',form.hsn]].map(([l,v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>
                <span style={{ color: '#9ca3af' }}>{l}</span>
                <span style={{ fontWeight: 600, color: '#374151', maxWidth: 130, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || '—'}</span>
              </div>
            ))}
          </div>

          {/* Save Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => navigate('/franchise/medicines')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', background: '#d97706', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
              <Save size={15} /> Update Medicine
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
