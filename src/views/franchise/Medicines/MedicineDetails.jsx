/* eslint-disable prettier/prettier */
/**
 * Screen 16 — Medicine Details
 */
import { useNavigate, useParams } from 'react-router-dom'
import { FlaskConical, ArrowLeft, Edit2, Printer, Tag, Package, Info, CheckCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { MEDICINES } from './medicineMockData'

const Row = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
    <span style={{ color: '#9ca3af', fontSize: 12 }}>{label}</span>
    <span style={{ fontWeight: 600, color: color || '#374151', textAlign: 'right', maxWidth: 200 }}>{value || '—'}</span>
  </div>
)

export default function MedicineDetails() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const med      = MEDICINES.find(m => m._id === id) || MEDICINES[0]

  const stockColor = med.stock === 0 ? '#dc2626' : med.stock <= med.reorderLevel ? '#d97706' : '#16a34a'
  const stockLabel = med.stock === 0 ? 'Out of Stock' : med.stock <= med.reorderLevel ? 'Low Stock' : 'In Stock'

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={FlaskConical} title="Medicine Details" subtitle="View complete medicine information" color="#0c3b73">
        <button onClick={() => navigate('/franchise/medicines')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
        <button onClick={() => navigate(`/franchise/medicines/${med._id}/edit`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#d97706', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Edit2 size={13} /> Edit Medicine
        </button>
        <button onClick={() => navigate(`/franchise/medicines/${med._id}/barcode`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Printer size={13} /> Print Details
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Left — Image + Key Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Medicine Image */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: 16, background: 'linear-gradient(135deg,#e0e7ff,#f0fdf4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, margin: '0 auto 16px' }}>
              💊
            </div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>{med.name}</p>
            <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#9ca3af' }}>{med.salt}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: med.isActive?'#dcfce7':'#fee2e2', color: med.isActive?'#16a34a':'#dc2626' }}>
                {med.isActive ? '● Active' : '● Inactive'}
              </span>
              {med.prescription && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>Rx Required</span>
              )}
            </div>
          </div>

          {/* Pricing & Stock */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Package size={13} /> Pricing & Stock
            </p>
            <Row label="MRP"              value={`₹ ${med.mrp.toFixed(2)}`}          color="#0c3b73" />
            <Row label="Purchase Price"   value={`₹ ${med.purchasePrice.toFixed(2)}`} />
            <Row label="Current Stock"    value={`${med.stock} Units`}               color={stockColor} />
            <Row label="Reorder Level"    value={med.reorderLevel} />
            <Row label="Stock Status"     value={stockLabel}                         color={stockColor} />
            <Row label="Rack / Shelf"     value={med.rack || 'A-02'} />
          </div>
        </div>

        {/* Right — Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Basic Info */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Info size={14} color="#0c3b73" /> Medicine Details
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <Row label="Salt / Generic Name"   value={med.salt} />
              <Row label="Brand Name"            value={med.brand} />
              <Row label="Category"              value={med.category} />
              <Row label="Sub Category"          value={med.category} />
              <Row label="Formulation"           value={med.formulation} />
              <Row label="Company"               value={med.company} />
              <Row label="Tablet"                value={med.formulation} />
              <Row label="MSN Code"              value={med.hsn} />
              <Row label="GST"                   value={`${med.gst}%`} />
              <Row label="Shelf Life (Months)"   value="24 Months" />
            </div>
          </div>

          {/* Barcode */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Tag size={14} color="#7c3aed" /> Barcode
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#f9fafb', borderRadius: 8, marginBottom: 10 }}>
              {/* Barcode bars SVG */}
              <svg width="200" height="60" viewBox="0 0 200 60">
                {Array.from({length: 40}, (_, i) => (
                  <rect key={i} x={i*5} y={0} width={i%3===0?3:1.5} height={50} fill="#111827" />
                ))}
                <text x="100" y="58" textAnchor="middle" fontSize="9" fill="#374151" fontFamily="monospace">{med.barcode}</text>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>{med.barcode}</p>
          </div>

          {/* Description */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>Description</p>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
              {med.name} is used to relieve fever, pain, and inflammation. It is effective in headaches, body ache, and hyperthermia.
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'View Batches',   path: `/franchise/medicines/${med._id}/batches`,    color: '#0c3b73', bg: '#e0e7ff' },
              { label: 'Generic Mapping',path: `/franchise/medicines/${med._id}/generic`,    color: '#16a34a', bg: '#dcfce7' },
              { label: 'Alternatives',   path: `/franchise/medicines/${med._id}/alternatives`,color: '#7c3aed', bg: '#f5f3ff' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                style={{ padding: '10px 8px', border: `1px solid ${a.color}33`, borderRadius: 9, background: a.bg, color: a.color, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <CheckCircle size={12} /> {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
