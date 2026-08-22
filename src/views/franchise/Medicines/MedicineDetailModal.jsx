/* eslint-disable prettier/prettier */
/**
 * MedicineDetailModal — View full medicine record
 */
import { X, FlaskConical } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'

const Row = ({ label, value }) => (
  <div style={{ padding: '9px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 12 }}>
    <span style={{ width: 140, fontSize: 12, color: '#9ca3af', fontWeight: 600, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{value || '—'}</span>
  </div>
)

const MedicineDetailModal = ({ open, onClose, data }) => {
  if (!open || !data) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#7c3aed18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={18} color="#7c3aed" />
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Medicine Details</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
          <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>{data.name}</h4>
          {data.genericName && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{data.genericName}</p>}
          <div style={{ marginTop: 8 }}>
            <StatusBadge status={data.isActive ? 'active' : 'inactive'} />
          </div>
        </div>

        <Row label="Strength"         value={data.strength} />
        <Row label="Dosage Form"      value={data.dosageForm} />
        <Row label="Brand"            value={data.brand} />
        <Row label="Manufacturer"     value={data.manufacturer} />
        <Row label="Pack Size"        value={data.packSize} />
        <Row label="Unit"             value={data.unit} />
        <Row label="Category"         value={data.category} />
        <Row label="HSN Code"         value={data.hsn} />
        <Row label="GST Rate"         value={data.gstRate !== undefined ? `${data.gstRate}%` : undefined} />
        <Row label="Barcode / SKU"    value={data.barcode} />

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 22px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default MedicineDetailModal
