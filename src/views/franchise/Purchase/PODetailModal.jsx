/* eslint-disable prettier/prettier */
import { X, FileText } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'

const Row = ({ label, value }) => (
  <div style={{ padding: '7px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 12 }}>
    <span style={{ width: 130, fontSize: 12, color: '#9ca3af', fontWeight: 600, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{value || '—'}</span>
  </div>
)

const PODetailModal = ({ open, onClose, data }) => {
  if (!open || !data) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#7c3aed18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#7c3aed" />
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>PO Details — {data._id}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: 14 }}><StatusBadge status={data.status} /></div>

        <Row label="PO Number"    value={data._id} />
        <Row label="Supplier"     value={data.supplier} />
        <Row label="Items"        value={data.items} />
        <Row label="Total Amount" value={`₹${data.totalAmount?.toLocaleString()}`} />
        <Row label="Created"      value={data.createdAt} />
        <Row label="Expected"     value={data.expectedDate} />

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 22px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default PODetailModal
