/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

// Cart is managed in local state (session-level)
const INIT_CART = [
  { id: 'c1', name: 'Paracetamol 650mg Tablet', pack: 'Strip of 15', qty: 50, price: 15.95, discountPct: 12, amount: 680.00 },
  { id: 'c2', name: 'Azithral 500 Tablet',      pack: 'Strip of 3',  qty: 30, price: 43.00, discountPct: 10, amount: 1161.80 },
  { id: 'c3', name: 'Amoxicillin 500mg',        pack: 'Strip of 10', qty: 10, price: 28.00, discountPct: 12, amount: 492.80 },
]

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function PurchaseCart() {
  const navigate = useNavigate()
  const [items, setItems]       = useState(INIT_CART)
  const [placing, setPlacing]   = useState(false)

  const removeItem = (id) => setItems(p => p.filter(it => it.id !== id))
  const updateQty  = (id, delta) => setItems(p => p.map(it => it.id === id ? { ...it, qty: Math.max(1, it.qty + delta), amount: +(it.price * Math.max(1, it.qty + delta) * (1 - it.discountPct / 100)).toFixed(2) } : it))

  const totalItems  = items.reduce((s, it) => s + it.qty, 0)
  const grossAmt    = +items.reduce((s, it) => s + it.price * it.qty, 0).toFixed(2)
  const discountAmt = +items.reduce((s, it) => s + it.price * it.qty * it.discountPct / 100, 0).toFixed(2)
  const gstAmt      = +((grossAmt - discountAmt) * 0.12).toFixed(2)
  const grandTotal  = +(grossAmt - discountAmt + gstAmt).toFixed(2)

  const handlePlaceOrder = async () => {
    if (!items.length) return
    setPlacing(true)
    try {
      const res = await postRequest({ url: '/franchise/live-rates/place-order', cred: {
        supplierName: 'Medico Agency',
        items: items.map(it => ({ medicineName: it.name, packSize: it.pack, qty: it.qty, price: it.price, discountPct: it.discountPct, amount: it.amount })),
        totalMRP: grossAmt, discountAmt, gstAmt, grandTotal,
      }})
      toast.success(`Order placed! ID: ${res.data?.data?.orderId}`)
      navigate('/franchise/live-rates/order-tracking/all')
    } catch { toast.error('Failed to place order') }
    finally   { setPlacing(false) }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={ShoppingCart} title="Purchase Cart" subtitle="Review your cart before placing order" color="#0c3b73" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
        {/* Cart Table */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Cart ({items.length} medicines · {totalItems} qty)</p>
            {items.length > 0 && (
              <button onClick={() => setItems([])} style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Clear All</button>
            )}
          </div>
          {items.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
              <ShoppingCart size={36} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ margin: 0 }}>Your cart is empty</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <Th c="Medicine" /><Th c="Pack" /><Th c="Qty" align="center" />
                  <Th c="Price (₹)" align="right" /><Th c="Disc%" align="center" /><Th c="Amount (₹)" align="right" /><Th c="" />
                </tr></thead>
                <tbody>
                  {items.map(it => (
                    <tr key={it.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td style={{ fontWeight: 600 }}>{it.name}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{it.pack}</Td>
                      <Td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => updateQty(it.id, -1)} style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontWeight: 700 }}>-</button>
                          <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{it.qty}</span>
                          <button onClick={() => updateQty(it.id, +1)} style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontWeight: 700 }}>+</button>
                        </div>
                      </Td>
                      <Td style={{ textAlign: 'right' }}>₹ {it.price.toFixed(2)}</Td>
                      <Td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>{it.discountPct}%</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>₹ {it.amount.toFixed(2)}</Td>
                      <Td>
                        <button onClick={() => removeItem(it.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 5, padding: '4px 7px', cursor: 'pointer' }}>
                          <Trash2 size={12} color="#dc2626" />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>Order Summary</h3>
          {[
            { l: 'Gross Amount',  v: `₹ ${grossAmt.toFixed(2)}`,    color: '#374151' },
            { l: 'Discount',      v: `- ₹ ${discountAmt.toFixed(2)}`, color: '#16a34a' },
            { l: 'GST (12%)',     v: `₹ ${gstAmt.toFixed(2)}`,      color: '#374151' },
          ].map(({ l, v, color }) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
              <span style={{ color: '#6b7280' }}>{l}</span>
              <span style={{ fontWeight: 600, color }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px', borderTop: '2px solid #e5e7eb', fontSize: 15 }}>
            <span style={{ fontWeight: 700 }}>Grand Total</span>
            <span style={{ fontWeight: 800, color: '#0c3b73' }}>₹ {grandTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button onClick={() => navigate(-1)} style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Continue
            </button>
            <button onClick={handlePlaceOrder} disabled={placing || !items.length}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, fontSize: 13, background: placing || !items.length ? '#9ca3af' : '#0c3b73', color: '#fff', cursor: placing || !items.length ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
              {placing ? 'Placing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
