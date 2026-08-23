/* eslint-disable prettier/prettier */
/**
 * Screen 52 — Purchase Cart
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, MapPin } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { CART_ITEMS } from './liveRatesMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function PurchaseCart() {
  const navigate  = useNavigate()
  const [items, setItems] = useState(CART_ITEMS.map((it, i) => ({ ...it, id: i })))

  const removeItem = id => setItems(p => p.filter(it => it.id !== id))
  const updateQty  = (id, delta) => setItems(p => p.map(it => it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it))

  const totalItems  = items.reduce((s, it) => s + it.qty, 0)
  const totalMRP    = 3000.00
  const totalDisc   = 300.00
  const delivery    = 0
  const gst         = 194.00
  const grandTotal  = totalMRP - totalDisc + delivery + gst

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={ShoppingCart} title="Purchase Cart" subtitle="Review your cart before placing order" color="#0c3b73" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
          {/* Cart Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Cart ({items.length} medicines · {totalItems} qty)</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <Th c="Medicine" /><Th c="Pack" /><Th c="Qty" align="center" />
                  <Th c="Price (₹)" align="right" /><Th c="Disc%" align="center" /><Th c="Amount (₹)" align="right" /><Th c="" />
                </tr></thead>
                <tbody>
                  {items.map(it => (
                    <tr key={it.id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <Td style={{ fontWeight: 600 }}>{it.name}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 11 }}>{it.pack}</Td>
                      <Td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <button onClick={() => updateQty(it.id, -1)} style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                          <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{it.qty}</span>
                          <button onClick={() => updateQty(it.id, 1)} style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </div>
                      </Td>
                      <Td style={{ textAlign: 'right', fontWeight: 600 }}>₹ {it.price.toFixed(2)}</Td>
                      <Td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>{it.discount}%</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>₹ {it.amount.toFixed(2)}</Td>
                      <Td>
                        <button onClick={() => removeItem(it.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}>
                          <Trash2 size={13} />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: '#0c3b73', color: '#fff' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Order Summary</p>
            </div>
            <div style={{ padding: '16px' }}>
              {[
                { l: 'Total Items',    v: totalItems },
                { l: 'Total MRP',      v: `₹ ${totalMRP.toFixed(2)}` },
                { l: 'Total Discount', v: `- ₹ ${totalDisc.toFixed(2)}`, color: '#16a34a' },
                { l: 'Delivery',       v: delivery === 0 ? 'Free Delivery' : `₹ ${delivery}`, color: '#16a34a' },
                { l: 'GST (12%)',      v: `₹ ${gst.toFixed(2)}` },
              ].map(s => (
                <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ color: '#6b7280' }}>{s.l}</span>
                  <span style={{ fontWeight: 600, color: s.color || '#111827' }}>{s.v}</span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid #0c3b73', marginTop: 8, paddingTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800 }}>
                  <span>Grand Total</span>
                  <span style={{ color: '#0c3b73' }}>₹ {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{ marginTop: 14, padding: '12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={11} /> Delivery Address
                  </p>
                  <button style={{ fontSize: 11, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Change</button>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>DoctorsAdda Pharmacy, Shop No. 12A, Main Market, Lucknow, UP - 226001</p>
              </div>

              <button onClick={() => navigate('/franchise/live-rates/place-order')}
                style={{ marginTop: 14, width: '100%', padding: '12px', background: '#0c3b73', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                Proceed to Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}
