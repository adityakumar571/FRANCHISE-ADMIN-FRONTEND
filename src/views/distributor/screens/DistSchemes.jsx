/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Tag, Plus, Edit2, Trash2, X, Save, Calendar } from 'lucide-react'

const MOCK_SCHEMES = [
  { id: 'SCH-001', name: 'Summer Offer',       type: 'Quantity', desc: 'Buy 10 get 2 free on all antibiotics', medicine: 'All Antibiotics', minQty: 10, freeQty: 2, discount: 0,   validFrom: '2026-08-01', validTo: '2026-08-31', active: true  },
  { id: 'SCH-002', name: 'Paracetamol Deal',   type: 'Discount', desc: '5% off on Paracetamol 650mg',         medicine: 'Paracetamol 650mg', minQty: 20, freeQty: 0, discount: 5, validFrom: '2026-08-01', validTo: '2026-09-30', active: true  },
  { id: 'SCH-003', name: 'Bulk Order Bonus',   type: 'Quantity', desc: 'Buy 50 get 5 free on vitamins',       medicine: 'Vitamins Range', minQty: 50, freeQty: 5, discount: 0,   validFrom: '2026-07-01', validTo: '2026-07-31', active: false },
  { id: 'SCH-004', name: 'Antidiabetic Offer', type: 'Discount', desc: '8% off on Metformin & Glipizide',    medicine: 'Antidiabetics', minQty: 30, freeQty: 0, discount: 8,   validFrom: '2026-09-01', validTo: '2026-09-30', active: true  },
]

const EMPTY = { name: '', type: 'Quantity', desc: '', medicine: '', minQty: '', freeQty: '', discount: '', validFrom: '', validTo: '' }

export default function DistSchemes() {
  const [schemes, setSchemes] = useState(MOCK_SCHEMES)
  const [showModal, setShowModal] = useState(false)
  const [editScheme, setEditScheme] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const openAdd = () => { setEditScheme(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (s) => { setEditScheme(s); setForm({ ...s }); setShowModal(true) }

  const handleSave = () => {
    if (!form.name || !form.medicine) return
    if (editScheme) {
      setSchemes(p => p.map(s => s.id === editScheme.id ? { ...s, ...form } : s))
    } else {
      setSchemes(p => [...p, { ...form, id: `SCH-00${p.length + 1}`, active: true, minQty: +form.minQty, freeQty: +form.freeQty, discount: +form.discount }])
    }
    setShowModal(false)
  }

  const toggleActive = (id) => setSchemes(p => p.map(s => s.id === id ? { ...s, active: !s.active } : s))
  const deleteScheme = (id) => setSchemes(p => p.filter(s => s.id !== id))

  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }
  const lbl = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={20} color="#fabf22" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Schemes & Offers</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage promotional schemes and discounts for franchises</p>
          </div>
        </div>
        <button onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#0c3b73', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          <Plus size={15} /> Add Scheme
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Total Schemes', value: schemes.length,                           color: '#0c3b73' },
          { label: 'Active',        value: schemes.filter(s => s.active).length,     color: '#16a34a' },
          { label: 'Expired',       value: schemes.filter(s => !s.active).length,    color: '#dc2626' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${k.color}` }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {schemes.map(s => (
          <div key={s.id} style={{ background: '#fff', border: `2px solid ${s.active ? '#0c3b73' : '#e5e7eb'}`, borderRadius: 14, padding: 20, position: 'relative', opacity: s.active ? 1 : 0.65 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: s.type === 'Quantity' ? '#dcfce7' : '#e0e7ff', color: s.type === 'Quantity' ? '#16a34a' : '#0c3b73' }}>{s.type}</span>
                <h3 style={{ margin: '6px 0 4px', fontSize: 14, fontWeight: 700, color: '#111827' }}>{s.name}</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{s.desc}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: s.active ? '#dcfce7' : '#f3f4f6', color: s.active ? '#16a34a' : '#6b7280', flexShrink: 0 }}>
                {s.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ background: '#f9fafb', borderRadius: 7, padding: '8px 10px' }}>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px' }}>Medicine</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{s.medicine}</p>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: 7, padding: '8px 10px' }}>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px' }}>{s.type === 'Quantity' ? 'Buy / Get Free' : 'Discount'}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0c3b73', margin: 0 }}>
                  {s.type === 'Quantity' ? `${s.minQty} + ${s.freeQty} free` : `${s.discount}% off`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>
              <Calendar size={11} />
              {s.validFrom} → {s.validTo}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => openEdit(s)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px', border: '1px solid #e5e7eb', borderRadius: 7, background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={() => toggleActive(s.id)}
                style={{ flex: 1, padding: '7px', border: 'none', borderRadius: 7, background: s.active ? '#fef3c7' : '#dcfce7', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: s.active ? '#d97706' : '#16a34a' }}>
                {s.active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => deleteScheme(s.id)}
                style={{ padding: '7px 10px', border: 'none', borderRadius: 7, background: '#fee2e2', cursor: 'pointer' }}>
                <Trash2 size={13} color="#dc2626" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{editScheme ? 'Edit Scheme' : 'Add New Scheme'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#6b7280" /></button>
            </div>
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Scheme Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Summer Offer 2026" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="Quantity">Quantity (Buy X Get Y)</option>
                    <option value="Discount">Discount (%)</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Medicine / Range *</label>
                  <input value={form.medicine} onChange={e => setForm(p => ({ ...p, medicine: e.target.value }))} placeholder="e.g. All Antibiotics" style={inp} />
                </div>
                {form.type === 'Quantity' ? (
                  <>
                    <div><label style={lbl}>Min Buy Qty</label><input type="number" value={form.minQty} onChange={e => setForm(p => ({ ...p, minQty: e.target.value }))} placeholder="10" style={inp} /></div>
                    <div><label style={lbl}>Free Qty</label><input type="number" value={form.freeQty} onChange={e => setForm(p => ({ ...p, freeQty: e.target.value }))} placeholder="2" style={inp} /></div>
                  </>
                ) : (
                  <div><label style={lbl}>Discount (%)</label><input type="number" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} placeholder="5" style={inp} /></div>
                )}
                <div><label style={lbl}>Valid From</label><input type="date" value={form.validFrom} onChange={e => setForm(p => ({ ...p, validFrom: e.target.value }))} style={inp} /></div>
                <div><label style={lbl}>Valid To</label><input type="date" value={form.validTo} onChange={e => setForm(p => ({ ...p, validTo: e.target.value }))} style={inp} /></div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Description</label>
                  <textarea value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} rows={2} placeholder="Brief scheme description..." style={{ ...inp, resize: 'none' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '14px 22px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '9px 20px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff' }}>Cancel</button>
              <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', border: 'none', borderRadius: 8, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                <Save size={14} /> {editScheme ? 'Update' : 'Save Scheme'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
