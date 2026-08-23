/* eslint-disable prettier/prettier */
/**
 * Screen 19 — Barcode Label
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Tag, ArrowLeft, Printer, Plus, Minus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { MEDICINES } from './medicineMockData'

const Toggle = ({ label, checked, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
    <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
    <div onClick={() => onChange(!checked)}
      style={{ width: 38, height: 20, borderRadius: 10, background: checked ? '#0c3b73' : '#e5e7eb', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: checked ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </div>
  </div>
)

export default function BarcodeLabel() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const med      = MEDICINES.find(m => m._id === id) || MEDICINES[0]

  const [labelSize, setLabelSize] = useState('Standard (60mm × 30mm)')
  const [qty, setQty]             = useState(1)
  const [showMRP, setShowMRP]     = useState(true)
  const [showBatch, setShowBatch] = useState(true)
  const [showCompany, setShowCompany] = useState(false)
  const [showBarcode, setShowBarcode] = useState(true)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Tag} title="Barcode Label" subtitle="Print medicine barcode labels" color="#7c3aed">
        <button onClick={() => navigate(`/franchise/medicines/${med._id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Label Settings */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 16px' }}>Label Settings</p>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 5 }}>Select Template</label>
            <select value={labelSize} onChange={e => setLabelSize(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, outline: 'none', background: '#f9fafb' }}>
              {['Standard (60mm × 30mm)', 'Small (40mm × 20mm)', 'Large (80mm × 40mm)', 'Thermal (58mm)'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 5 }}>Label Size</label>
            <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, outline: 'none', background: '#f9fafb' }}>
              {['40mm × 30mm', '60mm × 30mm', '80mm × 40mm'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', margin: '0 0 8px' }}>Show on Label</p>
          <Toggle label="Show MRP"     checked={showMRP}     onChange={setShowMRP} />
          <Toggle label="Show Batch No." checked={showBatch}   onChange={setShowBatch} />
          <Toggle label="Show Company" checked={showCompany} onChange={setShowCompany} />
          <Toggle label="Show Barcode" checked={showBarcode} onChange={setShowBarcode} />

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 5 }}>Quantity</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
              <input type="number" value={qty} onChange={e => setQty(Math.max(1,+e.target.value||1))} min={1}
                style={{ width: 60, padding: '7px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontWeight: 700, textAlign: 'center', outline: 'none' }} />
              <button onClick={() => setQty(q => q+1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
            </div>
          </div>

          <button onClick={() => window.print()}
            style={{ marginTop: 20, width: '100%', padding: '11px', background: '#7c3aed', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <Printer size={15} /> Print Label
          </button>
        </div>

        {/* Label Preview */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 20px' }}>Label Preview</p>

          {/* Preview Card */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ border: '2px solid #374151', borderRadius: 8, padding: '14px 18px', width: 260, background: '#fff' }}>
              <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 800, color: '#111827' }}>{med.name}</p>
              <p style={{ margin: '0 0 8px', fontSize: 10, color: '#6b7280' }}>{med.salt}</p>
              {showMRP && <p style={{ margin: '0 0 3px', fontSize: 12, fontWeight: 700 }}>MRP: ₹ {med.mrp.toFixed(2)}</p>}
              {showBatch && <p style={{ margin: '0 0 3px', fontSize: 10, color: '#6b7280' }}>Batch: CR08023 &nbsp; Exp: 31/12/2027</p>}
              {showCompany && <p style={{ margin: '0 0 6px', fontSize: 10, color: '#6b7280' }}>{med.company}</p>}
              {showBarcode && (
                <div style={{ marginTop: 8 }}>
                  <svg width="220" height="42" viewBox="0 0 220 42">
                    {Array.from({length:44},(_,i)=>(
                      <rect key={i} x={i*5} y={0} width={i%3===0?3:1.5} height={36} fill="#111827" />
                    ))}
                    <text x="110" y="41" textAnchor="middle" fontSize="7.5" fill="#374151" fontFamily="monospace">{med.barcode}</text>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Grid Preview */}
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', margin: '0 0 12px' }}>Print Preview — {qty} Label(s)</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8 }}>
              {Array.from({length: Math.min(qty, 6)}, (_, i) => (
                <div key={i} style={{ border: '1px solid #d1d5db', borderRadius: 4, padding: '8px', background: '#fff', fontSize: 9 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 9 }}>{med.name}</p>
                  {showMRP && <p style={{ margin: '2px 0 0', fontSize: 8 }}>MRP: ₹{med.mrp}</p>}
                  <p style={{ margin: '2px 0 0', fontSize: 7, color: '#9ca3af' }}>Mfg: 01/05/2025</p>
                </div>
              ))}
              {qty > 6 && (
                <div style={{ border: '1px dashed #d1d5db', borderRadius: 4, padding: '8px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>
                  +{qty-6} more
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
