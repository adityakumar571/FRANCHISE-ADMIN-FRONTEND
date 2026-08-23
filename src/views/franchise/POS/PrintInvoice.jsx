/* eslint-disable prettier/prettier */
/**
 * Screen 9 — Print Invoice
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer, ArrowLeft, Download, Share2, Plus, Minus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { SBtn, FieldLabel, SelectInput } from './posHelpers'
import { MEDICINES } from './posMockData'

const INVOICE_ITEMS = MEDICINES.slice(0, 3).map((m, i) => ({ ...m, qty: i+1, disc: 0 }))

export default function PrintInvoice() {
  const navigate = useNavigate()
  const [printer, setPrinter]     = useState('PDF / A4 Printer')
  const [paperSize, setPaperSize] = useState('A4')
  const [fontSize, setFontSize]   = useState('10')
  const [copies, setCopies]       = useState(1)

  const subtotal = INVOICE_ITEMS.reduce((s,m) => s + m.mrp * m.qty, 0)
  const total    = subtotal * 1.05

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Printer} title="Print Invoice" subtitle="Preview and print the bill invoice" color="#0c3b73">
        <SBtn label="Back" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/payment')} />
        <SBtn label="New Bill" bg="#0c3b73" color="#fff" sm onClick={() => navigate('/franchise/pos/billing')} />
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 18, alignItems: 'start' }}>
        {/* Invoice Preview */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>Invoice Preview</p>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, fontFamily: 'monospace' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #e5e7eb' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0c3b73', fontFamily: 'Inter' }}>Araya Medical Store</p>
                  <p style={{ margin: '2px 0', fontSize: 10, color: '#6b7280', fontFamily: 'Inter' }}>Shop No. 12A, Main Market, Lucknow, UP - 226001</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#6b7280', fontFamily: 'Inter' }}>GST: 09AAAPA1234K1ZM  ·  DL: UP-LKO-001  ·  Ph: 0522-001122</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151', fontFamily: 'Inter' }}>INV-2025-07534</p>
                  <p style={{ margin: '2px 0', fontSize: 11, color: '#6b7280', fontFamily: 'Inter' }}>30-05-2025</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', fontFamily: 'Inter' }}>Qty in Quantities</p>
                </div>
              </div>

              {/* Items */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    {['#','Medicine Name','Batch','Qty','MRP','Disc%','Amount'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', fontSize: 10, textAlign: 'left', fontFamily: 'Inter', borderBottom: '1px solid #e5e7eb', color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVOICE_ITEMS.map((item, i) => (
                    <tr key={item.id}>
                      <td style={{ padding: '6px 8px', fontSize: 11, fontFamily: 'Inter', borderBottom: '1px solid #f3f4f6' }}>{i+1}</td>
                      <td style={{ padding: '6px 8px', fontSize: 11, fontWeight: 600, fontFamily: 'Inter', borderBottom: '1px solid #f3f4f6' }}>{item.name}</td>
                      <td style={{ padding: '6px 8px', fontSize: 10, fontFamily: 'monospace', borderBottom: '1px solid #f3f4f6' }}>{item.batch}</td>
                      <td style={{ padding: '6px 8px', fontSize: 11, fontFamily: 'Inter', borderBottom: '1px solid #f3f4f6' }}>{item.qty}</td>
                      <td style={{ padding: '6px 8px', fontSize: 11, fontFamily: 'Inter', borderBottom: '1px solid #f3f4f6' }}>₹{item.mrp.toFixed(2)}</td>
                      <td style={{ padding: '6px 8px', fontSize: 11, fontFamily: 'Inter', borderBottom: '1px solid #f3f4f6' }}>0%</td>
                      <td style={{ padding: '6px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'Inter', borderBottom: '1px solid #f3f4f6' }}>₹{(item.mrp*item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ minWidth: 200 }}>
                  {[['Subtotal', `₹ ${subtotal.toFixed(2)}`], ['GST (5%)', `₹ ${(subtotal*0.05).toFixed(2)}`]].map(([l,v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', fontFamily: 'Inter' }}>
                      <span style={{ color: '#6b7280' }}>{l}</span><span>{v}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '2px solid #0c3b73', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter' }}>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>Total</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#0c3b73' }}>₹ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed #e5e7eb', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', fontFamily: 'Inter' }}>Thank you for shopping with us! Get well soon.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Options */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: 0 }}>Print Options</p>

          <div>
            <FieldLabel>Printer</FieldLabel>
            <SelectInput value={printer} onChange={e => setPrinter(e.target.value)}>
              {['PDF / A4 Printer','Thermal 80mm','Thermal 58mm','Network Printer'].map(o => <option key={o}>{o}</option>)}
            </SelectInput>
          </div>
          <div>
            <FieldLabel>Paper Size</FieldLabel>
            <SelectInput value={paperSize} onChange={e => setPaperSize(e.target.value)}>
              {['A4','A5','Thermal 80mm','Thermal 58mm'].map(o => <option key={o}>{o}</option>)}
            </SelectInput>
          </div>
          <div>
            <FieldLabel>Font Size</FieldLabel>
            <SelectInput value={fontSize} onChange={e => setFontSize(e.target.value)}>
              {['8','9','10','11','12'].map(o => <option key={o}>{o}</option>)}
            </SelectInput>
          </div>
          <div>
            <FieldLabel>Copies</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setCopies(c => Math.max(1,c-1))} style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
              <span style={{ fontSize: 20, fontWeight: 800, minWidth: 28, textAlign: 'center' }}>{copies}</span>
              <button onClick={() => setCopies(c => c+1)} style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            <SBtn label="Print Invoice" icon={Printer} full onClick={() => window.print()} />
            <SBtn label="Download PDF"  icon={Download} full bg="#f0fdf4" color="#16a34a" border="#bbf7d0" />
            <SBtn label="Share Invoice" icon={Share2}   full bg="#f0f9ff" color="#0891b2" border="#bae6fd" />
          </div>
        </div>
      </div>
    </div>
  )
}
