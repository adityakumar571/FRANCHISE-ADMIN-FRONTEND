/* eslint-disable prettier/prettier */
/**
 * CreatePOModal — Build and submit a new Purchase Order
 */
import { useState } from 'react'
import { X, Plus, Trash2, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_ITEM = { medicine: '', qty: 1, ptr: '', scheme: '' }

const CreatePOModal = ({ open, onClose, onSaved }) => {
  const [supplier, setSupplier]   = useState('')
  const [expectedDate, setExpDate] = useState('')
  const [notes, setNotes]         = useState('')
  const [items, setItems]         = useState([{ ...EMPTY_ITEM }])
  const [loading, setLoading]     = useState(false)

  const addItem  = () => setItems((p) => [...p, { ...EMPTY_ITEM }])
  const delItem  = (i) => setItems((p) => p.filter((_, idx) => idx !== i))
  const setItem  = (i, field, val) => setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const totalAmt = items.reduce((sum, it) => sum + (parseFloat(it.ptr || 0) * parseInt(it.qty || 0)), 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!supplier) { toast.error('Please select a supplier'); return }
    if (!items[0].medicine) { toast.error('Add at least one medicine'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); onSaved() }, 600)
  }

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: '20px 16px' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 720 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#7c3aed18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={18} color="#7c3aed" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Create Purchase Order</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Fill in supplier and item details</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Header fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Supplier / Distributor *</label>
              <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Select supplier" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Expected Delivery Date</label>
              <input type="date" value={expectedDate} onChange={(e) => setExpDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Notes / Remarks</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" style={inputStyle} />
            </div>
          </div>

          {/* Items table */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Order Items</label>
              <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: '1px solid #0c3b7340', background: '#0c3b7310', color: '#0c3b73', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={13} /> Add Item
              </button>
            </div>

            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Medicine', 'Qty', 'PTR (₹)', 'Scheme', 'Total', ''].map((h) => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '6px 10px' }}>
                        <input value={item.medicine} onChange={(e) => setItem(i, 'medicine', e.target.value)} placeholder="Medicine name" style={{ ...inputStyle, height: 32 }} />
                      </td>
                      <td style={{ padding: '6px 10px', width: 70 }}>
                        <input type="number" value={item.qty} min={1} onChange={(e) => setItem(i, 'qty', e.target.value)} style={{ ...inputStyle, height: 32, width: '100%' }} />
                      </td>
                      <td style={{ padding: '6px 10px', width: 90 }}>
                        <input type="number" step="0.01" value={item.ptr} onChange={(e) => setItem(i, 'ptr', e.target.value)} placeholder="0.00" style={{ ...inputStyle, height: 32, width: '100%' }} />
                      </td>
                      <td style={{ padding: '6px 10px', width: 90 }}>
                        <input value={item.scheme} onChange={(e) => setItem(i, 'scheme', e.target.value)} placeholder="e.g. 10+1" style={{ ...inputStyle, height: 32, width: '100%' }} />
                      </td>
                      <td style={{ padding: '6px 10px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        ₹{(parseFloat(item.ptr || 0) * parseInt(item.qty || 0)).toFixed(2)}
                      </td>
                      <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                        {items.length > 1 && (
                          <button type="button" onClick={() => delItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48', padding: 4 }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'right', marginTop: 10, fontSize: 15, fontWeight: 700, color: '#111827' }}>
              Total: ₹{totalAmt.toFixed(2)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: loading ? '#93c5fd' : '#0c3b73', color: '#fff', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Submitting…' : 'Submit PO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }
const inputStyle  = { width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 7, padding: '0 11px', fontSize: 13, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }

export default CreatePOModal
