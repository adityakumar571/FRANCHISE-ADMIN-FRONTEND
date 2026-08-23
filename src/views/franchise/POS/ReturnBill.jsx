/* eslint-disable prettier/prettier */
/**
 * Screen 10 — Return Bill
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, ArrowLeft, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Th, Td, BillRow, SBtn, TextInput, FieldLabel } from './posHelpers'
import { RETURN_ITEMS } from './posMockData'

export default function ReturnBill() {
  const navigate = useNavigate()
  const [invoice, setInvoice]   = useState('INV-2025-07524')
  const [customer, setCustomer] = useState('Walk-In Customer')
  const [invDate, setInvDate]   = useState('30-05-2025')
  const [items, setItems]       = useState(RETURN_ITEMS)

  const setRetQty = (i, v) => setItems(p => p.map((x, j) => j===i ? {...x, retQty: Math.min(x.qty, Math.max(0,v)), retAmt: Math.min(x.qty, Math.max(0,v)) * x.mrp} : x))
  const totalReturn = items.reduce((s, i) => s + i.retAmt, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={RotateCcw} title="Return Bill" subtitle="Process medicine returns against an invoice" color="#dc2626">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
      </PageHeader>

      {/* Invoice Details */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          <div>
            <FieldLabel>Original Invoice No.</FieldLabel>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={invoice} onChange={e => setInvoice(e.target.value)} placeholder="INV-XXXX-XXXXX"
                style={{ width: '100%', padding: '9px 12px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#f9fafb' }} />
            </div>
          </div>
          <div><FieldLabel>Customer</FieldLabel><TextInput value={customer} onChange={e => setCustomer(e.target.value)} /></div>
          <div><FieldLabel>Invoice Date</FieldLabel><TextInput value={invDate} onChange={e => setInvDate(e.target.value)} /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 18, alignItems: 'start' }}>
        {/* Return Items */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Invoice Items — Select items to return</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <Th c="" />
                {['Medicine Name','Batch','Billed Qty','MRP','Return Qty','Return Amount'].map(h => <Th key={h} c={h} />)}
              </tr></thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td>
                      <input type="checkbox" checked={item.retQty > 0}
                        onChange={e => setRetQty(i, e.target.checked ? 1 : 0)}
                        style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#0c3b73' }} />
                    </Td>
                    <Td style={{ fontWeight: 600 }}>{item.name}</Td>
                    <Td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{item.batch}</Td>
                    <Td style={{ fontWeight: 600 }}>{item.qty}</Td>
                    <Td>₹{item.mrp.toFixed(2)}</Td>
                    <Td>
                      <input type="number" value={item.retQty} min={0} max={item.qty} onChange={e => setRetQty(i, +e.target.value)}
                        style={{ width: 60, padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, textAlign: 'center', outline: 'none' }} />
                    </Td>
                    <Td style={{ fontWeight: 700, color: item.retAmt > 0 ? '#dc2626' : '#374151' }}>₹{item.retAmt.toFixed(2)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Return Summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>Return Summary</p>
          <BillRow label="Total Items"  value={items.filter(i=>i.retQty>0).length} />
          <BillRow label="Return Qty"   value={items.reduce((s,i)=>s+i.retQty,0)} />
          <div style={{ borderTop: '2px solid #dc2626', marginTop: 10, paddingTop: 10 }}>
            <BillRow label="Refund Amount" value={`₹ ${totalReturn.toFixed(2)}`} bold color="#dc2626" large />
          </div>
          <div style={{ marginTop: 20 }}>
            <SBtn label="Process Return [F5]" icon={RotateCcw} full bg="#fee2e2" color="#dc2626" border="#fecdd3"
              disabled={totalReturn === 0} onClick={() => navigate('/franchise/pos/billing')} />
          </div>
          <div style={{ marginTop: 10, padding: '10px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 12, color: '#6b7280' }}>
            Refund will be credited to customer wallet or cash as per pharmacy policy.
          </div>
        </div>
      </div>
    </div>
  )
}
