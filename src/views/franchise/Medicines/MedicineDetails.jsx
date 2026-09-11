/* eslint-disable prettier/prettier */
/**
 * Screen 16 — Medicine Details (API-connected)
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FlaskConical, ArrowLeft, Edit2, Printer, Tag, Package, Info, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'

const Row = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
    <span style={{ color: '#9ca3af', fontSize: 12 }}>{label}</span>
    <span style={{ fontWeight: 600, color: color || '#374151', textAlign: 'right', maxWidth: 200 }}>{value ?? '—'}</span>
  </div>
)

const SkeletonRow = () => (
  <div style={{ padding: '7px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ height: 12, width: '35%', background: '#f3f4f6', borderRadius: 4 }} />
    <div style={{ height: 12, width: '40%', background: '#f3f4f6', borderRadius: 4 }} />
  </div>
)

export default function MedicineDetails() {
  const navigate    = useNavigate()
  const { id }      = useParams()
  const [med, setMed]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMedicine = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/medicines/${id}`)
      setMed(res.data?.data || null)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load medicine details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchMedicine() }, [fetchMedicine])

  if (loading) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 18 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
              {Array(6).fill(0).map((_, j) => <SkeletonRow key={j} />)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!med) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '60px 20px' }}>
        <FlaskConical size={48} color="#e5e7eb" style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 15, color: '#6b7280' }}>Medicine not found.</p>
        <button onClick={() => navigate('/franchise/medicines')}
          style={{ marginTop: 10, padding: '9px 20px', background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Back to List
        </button>
      </div>
    )
  }

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
          <Printer size={13} /> Print Label
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Left — Image + Key Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Medicine Image */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            {med.image ? (
              <img src={med.image} alt={med.name} style={{ width: 100, height: 100, borderRadius: 12, objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} />
            ) : (
              <div style={{ width: 100, height: 100, borderRadius: 16, background: 'linear-gradient(135deg,#e0e7ff,#f0fdf4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, margin: '0 auto 16px' }}>💊</div>
            )}
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>{med.name}</p>
            <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#9ca3af' }}>{med.salt}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: med.isActive ? '#dcfce7' : '#fee2e2', color: med.isActive ? '#16a34a' : '#dc2626' }}>
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
            <Row label="MRP"              value={`₹ ${Number(med.mrp || 0).toFixed(2)}`}            color="#0c3b73" />
            <Row label="Purchase Price"   value={`₹ ${Number(med.purchasePrice || 0).toFixed(2)}`} />
            <Row label="Current Stock"    value={`${med.stock ?? 0} Units`}                         color={stockColor} />
            <Row label="Reorder Level"    value={med.reorderLevel}                                   />
            <Row label="Stock Status"     value={stockLabel}                                         color={stockColor} />
            <Row label="Rack / Shelf"     value={med.rack || med.rackLabel || '—'} />
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
              <Row label="Salt / Generic Name"   value={med.salt}        />
              <Row label="Brand Name"            value={med.brand}       />
              <Row label="Category"              value={med.category}    />
              <Row label="Formulation"           value={med.formulation} />
              <Row label="Company"               value={med.company}     />
              <Row label="Strength"              value={med.strength}    />
              <Row label="Unit"                  value={med.unit}        />
              <Row label="Pack Size"             value={med.packSize}    />
              <Row label="HSN Code"              value={med.hsn}         />
              <Row label="GST Rate"              value={med.gst ? `${med.gst}%` : '—'} />
              <Row label="Shelf Life (Months)"   value={med.shelfLife ? `${med.shelfLife} Months` : '—'} />
            </div>
          </div>

          {/* Barcode */}
          {med.barcode && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Tag size={14} color="#7c3aed" /> Barcode
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#f9fafb', borderRadius: 8, marginBottom: 10 }}>
                <svg width="200" height="60" viewBox="0 0 200 60">
                  {Array.from({length: 40}, (_, i) => (
                    <rect key={i} x={i*5} y={0} width={i%3===0?3:1.5} height={50} fill="#111827" />
                  ))}
                  <text x="100" y="58" textAnchor="middle" fontSize="9" fill="#374151" fontFamily="monospace">{med.barcode}</text>
                </svg>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>{med.barcode}</p>
            </div>
          )}

          {/* Description */}
          {med.description && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>Description</p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{med.description}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'View Batches',    path: `/franchise/medicines/${med._id}/batches`,     color: '#0c3b73', bg: '#e0e7ff' },
              { label: 'Generic Mapping', path: `/franchise/medicines/${med._id}/generic`,     color: '#16a34a', bg: '#dcfce7' },
              { label: 'Alternatives',    path: `/franchise/medicines/${med._id}/alternatives`,color: '#7c3aed', bg: '#f5f3ff' },
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
