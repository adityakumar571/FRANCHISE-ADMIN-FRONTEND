/* eslint-disable prettier/prettier */
/**
 * POSBilling — High-speed pharmacy POS
 * SOW §13: POS Billing, Sales & Returns
 */
import { useState, useRef } from 'react'
import { ScanLine, Search, Plus, Minus, Trash2, Printer, Save, User, IndianRupee, CreditCard, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK_MEDICINES = [
  { _id: 'm1', name: 'Paracetamol 650mg', batch: 'B2401', expiry: '2027-06', mrp: 12.50, gst: 0, stock: 450, rack: 'A01' },
  { _id: 'm2', name: 'Amoxicillin 500mg', batch: 'B2395', expiry: '2026-10', mrp: 8.00, gst: 12, stock: 25, rack: 'A02' },
  { _id: 'm3', name: 'Metformin 500mg', batch: 'B2388', expiry: '2027-02', mrp: 4.50, gst: 5, stock: 320, rack: 'C03' },
  { _id: 'm4', name: 'Atorvastatin 10mg', batch: 'B2377', expiry: '2026-09', mrp: 6.00, gst: 12, stock: 80, rack: 'C04' },
  { _id: 'm5', name: 'Pantoprazole 40mg', batch: 'B2402', expiry: '2028-01', mrp: 3.50, gst: 5, stock: 600, rack: 'D01' },
]

const POSBilling = () => {
  const [search, setSearch]     = useState('')
  const [suggestions, setSugg]  = useState([])
  const [cart, setCart]         = useState([])
  const [customer, setCustomer] = useState('')
  const [payMode, setPayMode]   = useState('cash')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading]   = useState(false)
  const searchRef = useRef()

  const handleSearch = (val) => {
    setSearch(val)
    if (val.length < 2) { setSugg([]); return }
    const q = val.toLowerCase()
    setSugg(MOCK_MEDICINES.filter((m) => m.name.toLowerCase().includes(q) || m.batch.toLowerCase().includes(q)).slice(0, 5))
  }

  const addToCart = (med) => {
    setCart((prev) => {
      const exists = prev.find((c) => c._id === med._id)
      if (exists) return prev.map((c) => c._id === med._id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...med, qty: 1, salePrice: med.mrp }]
    })
    setSearch('')
    setSugg([])
    searchRef.current?.focus()
  }

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((c) => {
      if (c._id !== id) return c
      const newQty = c.qty + delta
      return newQty <= 0 ? null : { ...c, qty: newQty }
    }).filter(Boolean))
  }

  const removeItem = (id) => setCart((p) => p.filter((c) => c._id !== id))

  const subtotal = cart.reduce((sum, c) => sum + c.salePrice * c.qty, 0)
  const gstAmt   = cart.reduce((sum, c) => sum + (c.salePrice * c.qty * (c.gst / 100)), 0)
  const discAmt  = (subtotal * discount) / 100
  const total    = subtotal + gstAmt - discAmt

  const handleBill = () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Bill generated successfully')
      setCart([])
      setCustomer('')
      setDiscount(0)
    }, 700)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, minHeight: 'calc(100vh - 120px)', alignItems: 'start' }}>

      {/* LEFT — Medicine search + cart */}
      <div>
        {/* Header */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 18px', border: '1px solid #e5e7eb', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0c3b7318', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScanLine size={18} color="#0c3b73" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>POS Billing</h2>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Scan barcode or search medicine</p>
            </div>
          </div>

          {/* Customer */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <User size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name / phone (optional)"
                style={{ width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 8, paddingLeft: 30, fontSize: 13, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Medicine search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search medicine name, barcode, batch…"
              style={{ width: '100%', height: 44, border: '2px solid #0c3b73', borderRadius: 8, paddingLeft: 36, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
              autoFocus
            />
            {suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, marginTop: 4, overflow: 'hidden' }}>
                {suggestions.map((m) => (
                  <div key={m._id} onClick={() => addToCart(m)}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{m.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Batch: {m.batch} · Rack: {m.rack} · Stock: {m.stock}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#0c3b73' }}>₹{m.mrp}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>MRP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})</h3>
          </div>

          {cart.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <ScanLine size={36} color="#d1d5db" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Search and add medicines above</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Medicine', 'Batch', 'MRP', 'Qty', 'Total', ''].map((h) => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item._id} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Rack: {item.rack} · Exp: {item.expiry}</p>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontFamily: 'monospace' }}>{item.batch}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>₹{item.salePrice.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button onClick={() => updateQty(item._id, -1)} style={qtyBtn}><Minus size={11} /></button>
                          <span style={{ width: 28, textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                          <button onClick={() => updateQty(item._id, +1)} style={qtyBtn}><Plus size={11} /></button>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>₹{(item.salePrice * item.qty).toFixed(2)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48', padding: 4 }}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Bill summary */}
      <div style={{ position: 'sticky', top: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', background: '#0c3b73', color: '#fff' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Bill Summary</h3>
            {customer && <p style={{ margin: '2px 0 0', fontSize: 12, opacity: 0.8 }}>{customer}</p>}
          </div>

          <div style={{ padding: 18 }}>
            {/* Amounts */}
            {[
              { label: 'Subtotal', value: `₹${subtotal.toFixed(2)}` },
              { label: 'GST',      value: `₹${gstAmt.toFixed(2)}` },
            ].map((r) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>{r.label}</span>
                <span style={{ fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}

            {/* Discount */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
              <span style={{ color: '#6b7280' }}>Discount (%)</span>
              <input type="number" value={discount} min={0} max={100}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                style={{ width: 60, height: 30, border: '1px solid #e5e7eb', borderRadius: 6, textAlign: 'center', fontSize: 13, outline: 'none' }} />
            </div>

            <div style={{ borderTop: '2px solid #0c3b73', marginTop: 10, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#0c3b73' }}>₹{total.toFixed(2)}</span>
            </div>

            {/* Payment mode */}
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Payment Mode</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { key: 'cash',   label: 'Cash',   icon: IndianRupee },
                  { key: 'upi',    label: 'UPI',    icon: Phone },
                  { key: 'card',   label: 'Card',   icon: CreditCard },
                  { key: 'credit', label: 'Credit', icon: User },
                ].map((p) => (
                  <button key={p.key} onClick={() => setPayMode(p.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px', borderRadius: 8, border: `2px solid ${payMode === p.key ? '#0c3b73' : '#e5e7eb'}`, background: payMode === p.key ? '#0c3b7310' : '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer', color: payMode === p.key ? '#0c3b73' : '#374151' }}>
                    <p.icon size={13} /> {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={handleBill} disabled={loading || cart.length === 0}
                style={{ width: '100%', height: 46, borderRadius: 8, border: 'none', background: cart.length === 0 ? '#e5e7eb' : loading ? '#6fa3d0' : '#0c3b73', color: cart.length === 0 ? '#9ca3af' : '#fff', fontWeight: 700, fontSize: 15, cursor: cart.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Printer size={16} /> {loading ? 'Processing…' : 'Generate Bill'}
              </button>
              <button onClick={() => setCart([])} style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const qtyBtn = { width: 24, height: 24, borderRadius: 5, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }

export default POSBilling
