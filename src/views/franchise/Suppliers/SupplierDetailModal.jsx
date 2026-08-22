/* eslint-disable prettier/prettier */
import { X, Truck, Phone, MapPin, Mail, FileText } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'

const Row = ({ label, value }) => (
  <div style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 12 }}>
    <span style={{ width: 150, fontSize: 12, color: '#9ca3af', fontWeight: 600, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{value || '—'}</span>
  </div>
)

const SupplierDetailModal = ({ open, onClose, data }) => {
  if (!open || !data) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} color="#d97706" />
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Supplier Details</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
        </div>

        <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{data.businessName}</h4>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatusBadge status={data.isActive ? 'active' : 'inactive'} />
            {data.assignmentType && (
              <span style={{ padding: '2px 10px', borderRadius: 20, background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 600 }}>
                {data.assignmentType}
              </span>
            )}
          </div>
        </div>

        <Row label="Type"             value={data.type} />
        <Row label="Contact Person"   value={data.contactPerson} />
        <Row label="Phone"            value={data.phone} />
        <Row label="Email"            value={data.email} />
        <Row label="City"             value={data.city} />
        <Row label="State"            value={data.state} />
        <Row label="Address"          value={data.address} />
        <Row label="GST Number"       value={data.gstNo} />
        <Row label="Drug Licence"     value={data.drugLicence} />
        <Row label="Service Coverage" value={data.coverage} />

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 22px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SupplierDetailModal
