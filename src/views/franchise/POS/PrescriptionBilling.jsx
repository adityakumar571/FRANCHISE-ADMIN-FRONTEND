/* eslint-disable prettier/prettier */
/**
 * Screen 5 — Prescription Billing
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft, UploadCloud, Trash2, IndianRupee } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Th, Td, BillRow, SBtn } from './posHelpers'
import { PRESCRIPTION_MEDS } from './posMockData'

export default function PrescriptionBilling() {
  const navigate  = useNavigate()
  const [meds, setMeds] = useState(PRESCRIPTION_MEDS)

  const subtotal  = meds.reduce((s,m) => s + m.mrp * m.qty, 0)
  const discount  = subtotal * 0.03
  const taxable   = subtotal - discount
  const gst5      = meds.filter(m=>m.gst===5).reduce((s,m)=>s+m.mrp*m.qty,0)*0.05
  const gst12     = meds.filter(m=>m.gst===12).reduce((s,m)=>s+m.mrp*m.qty,0)*0.12
  const total     = taxable + gst5 + gst12

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={FileText} title="Prescription Billing" subtitle="Upload prescription and auto-detect medicines" color="#d97706">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
        <SBtn label="Upload Prescription" icon={UploadCloud} bg="#e0e7ff" color="#0c3b73" border="#c7d2fe" sm />
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 240px', gap: 16, alignItems: 'start' }}>
        {/* Prescription Preview */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#374151' }}>Prescription</p>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ background: '#f9fafb', border: '2px dashed #e5e7eb', borderRadius: 8, height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#0c3b73'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#e5e7eb'}>
              <UploadCloud size={28} color="#9ca3af" />
              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: 0 }}>Click to upload or drag prescription here</p>
            </div>
            <p style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', margin: '8px 0 0' }}>Supports JPG, PNG, PDF</p>
          </div>
        </div>

        {/* Detected Medicines */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Detected Medicines ({meds.length})</p>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#dcfce7', color: '#16a34a', fontWeight: 600 }}>Auto Detected</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Medicine Name','MRP','Stock','Qty','Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
              <tbody>
                {meds.map((m,i) => (
                  <tr key={m.id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td style={{ fontWeight: 600 }}>{m.name}</Td>
                    <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹{m.mrp.toFixed(2)}</Td>
                    <Td style={{ color: m.stock < 30 ? '#dc2626' : '#374151', fontWeight: 600 }}>{m.stock}</Td>
                    <Td>
                      <input type="number" value={m.qty} min={1} onChange={e => setMeds(p => p.map((x,j) => j===i ? {...x, qty: +e.target.value||1} : x))}
                        style={{ width: 50, padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, textAlign: 'center', outline: 'none' }} />
                    </Td>
                    <Td>
                      <button onClick={() => setMeds(p => p.filter((_,j) => j!==i))}
                        style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer' }}>
                        <Trash2 size={12} color="#dc2626" />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill Summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', background: '#0c3b73', color: '#fff' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Bill Summary</p>
          </div>
          <div style={{ padding: '14px' }}>
            <BillRow label="Items"       value={meds.length} />
            <BillRow label="MRP Total"   value={`₹ ${subtotal.toFixed(2)}`} />
            <BillRow label="Discount"    value={`- ₹ ${discount.toFixed(2)}`} color="#dc2626" />
            <BillRow label="Taxable"     value={`₹ ${taxable.toFixed(2)}`} />
            <BillRow label="GST (5%)"    value={`₹ ${gst5.toFixed(2)}`} />
            <BillRow label="GST (12%)"   value={`₹ ${gst12.toFixed(2)}`} />
            <BillRow label="Round Off"   value="₹ 0.18" />
            <div style={{ borderTop: '2px solid #0c3b73', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Total Amount</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0c3b73' }}>₹ {total.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ padding: '12px 14px', borderTop: '1px solid #f3f4f6' }}>
            <SBtn label="Proceed to Pay [F5]" icon={IndianRupee} full onClick={() => navigate('/franchise/pos/payment')} />
          </div>
        </div>
      </div>
    </div>
  )
}
