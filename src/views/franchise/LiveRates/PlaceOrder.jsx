/* eslint-disable prettier/prettier */
/**
 * Screen 53 — Place Order
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, ArrowLeft } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { CART_ITEMS, SUPPLIERS } from './liveRatesMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function PlaceOrder() {
  const navigate = useNavigate()
  const [supplier, setSupplier]     = useState(SUPPLIERS[0].name)
  const [payMode, setPayMode]       = useState('Credit')
  const [expectedDate, setExpDate]  = useState('2025-05-21')
  const [transport, setTransport]   = useState('Free Delivery')
  const [note, setNote]             = useState('')
  const [agreed, setAgreed]         = useState(false)
  const [file, setFile]             = useState(null)

  const totalItems  = 100
  const totalMRP    = 3000.00
  const totalDisc   = 300.00
  const taxable     = totalMRP - totalDisc
  const gst         = 194.00
  const grandTotal  = taxable + gst

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Send} title="Place Order" subtitle="Review and submit your purchase order" color="#16a34a">
        <button onClick={() => navigate('/franchise/live-rates/purchase-cart')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={12} /> Back to Cart
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
          {/* Order Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
              <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Order Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Supplier',       value: supplier,      comp: <select value={supplier} onChange={e => setSupplier(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb' }}>{SUPPLIERS.map(s => <option key={s.id}>{s.name}</option>)}</select> },
                  { label: 'Your Staff',     value: 'User Admin',  comp: <input value="User Admin" readOnly style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} /> },
                  { label: 'Expected Date',  value: expectedDate,  comp: <input type="date" value={expectedDate} onChange={e => setExpDate(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} /> },
                  { label: 'Payment Mode',   value: payMode,       comp: <select value={payMode} onChange={e => setPayMode(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb' }}><option>Credit</option><option>Cash</option><option>Bank Transfer</option></select> },
                  { label: 'Transport',      value: transport,     comp: <input value={transport} onChange={e => setTransport(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} /> },
                  { label: 'Order ID (auto)',value: 'RMK429DT410125',comp: <input value="RMK429DT410125" readOnly style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', fontFamily: 'monospace', boxSizing: 'border-box' }} /> },
                ].map(f => (
                  <div key={f.label}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>{f.label}</p>
                    {f.comp}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>Note (Optional)</p>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Add note for supplier..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>Upload PO (Optional)</p>
                <input type="file" onChange={e => setFile(e.target.files[0])}
                  style={{ fontSize: 12, color: '#374151' }} />
              </div>
            </div>

            {/* Order Items */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Order Items ({CART_ITEMS.length})</p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    <Th c="Medicine Name" /><Th c="Pack" /><Th c="Qty" align="center" />
                    <Th c="MRP" align="right" /><Th c="Disc%" align="center" /><Th c="Amount" align="right" />
                  </tr></thead>
                  <tbody>
                    {CART_ITEMS.map((it, i) => (
                      <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <Td style={{ fontWeight: 600 }}>{it.name}</Td>
                        <Td style={{ color: '#6b7280', fontSize: 11 }}>{it.pack}</Td>
                        <Td style={{ textAlign: 'center', fontWeight: 700 }}>{it.qty}</Td>
                        <Td style={{ textAlign: 'right' }}>₹{it.price.toFixed(2)}</Td>
                        <Td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>{it.discount}%</Td>
                        <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>₹{it.amount.toFixed(2)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                { l: 'Taxable Amount', v: `₹ ${taxable.toFixed(2)}` },
                { l: 'GST (12%)',      v: `₹ ${gst.toFixed(2)}` },
              ].map(s => (
                <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ color: '#6b7280' }}>{s.l}</span>
                  <span style={{ fontWeight: 600, color: s.color || '#111827' }}>{s.v}</span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid #0c3b73', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800 }}>
                <span>Grand Total</span>
                <span style={{ color: '#0c3b73' }}>₹ {grandTotal.toFixed(2)}</span>
              </div>

              <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#0c3b73', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#6b7280' }}>I agree to terms & conditions of this purchase order</span>
              </div>

              <button disabled={!agreed} onClick={() => navigate('/franchise/live-rates/order-tracking')}
                style={{ marginTop: 14, width: '100%', padding: '12px', background: agreed ? '#16a34a' : '#e5e7eb', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, color: agreed ? '#fff' : '#9ca3af', cursor: agreed ? 'pointer' : 'not-allowed' }}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}
