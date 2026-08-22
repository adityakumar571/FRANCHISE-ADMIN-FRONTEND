/* eslint-disable prettier/prettier */
/**
 * ExpiryReport — Batch Expiry & Near-Expiry Stock Report
 */
import { useState } from 'react'
import { FileText, Download, AlertTriangle, Package, XCircle, Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

const today = new Date('2026-08-22')

const MOCK_EXPIRY = [
  { batch: 'B-2024-09-01', name: 'Amoxicillin 500mg', brand: 'Novamox', rack: 'B02-S1', qty: 45, expiry: '2026-09-15', daysLeft: 24, status: 'Near Expiry' },
  { batch: 'B-2024-08-15', name: 'Aspirin 75mg', brand: 'Disprin', rack: 'A03-S2', qty: 18, expiry: '2026-09-01', daysLeft: 10, status: 'Critical' },
  { batch: 'B-2023-12-01', name: 'Vitamin C 500mg', brand: 'Celin', rack: 'D01-S1', qty: 60, expiry: '2026-08-25', daysLeft: 3, status: 'Critical' },
  { batch: 'B-2024-01-10', name: 'Metronidazole 400mg', brand: 'Flagyl', rack: 'C02-S3', qty: 24, expiry: '2026-08-20', daysLeft: -2, status: 'Expired' },
  { batch: 'B-2024-07-01', name: 'Pantoprazole 40mg', brand: 'Pan-D', rack: 'A02-S1', qty: 96, expiry: '2026-10-15', daysLeft: 54, status: 'Near Expiry' },
  { batch: 'B-2024-11-20', name: 'Cetirizine 10mg', brand: 'Cetzine', rack: 'B01-S2', qty: 8, expiry: '2026-08-18', daysLeft: -4, status: 'Expired' },
]

const statusConfig = {
  Expired: { color: '#dc2626', bg: '#fee2e2' },
  Critical: { color: '#ea580c', bg: '#fff7ed' },
  'Near Expiry': { color: '#d97706', bg: '#fef3c7' },
}

const ExpiryReport = () => {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? MOCK_EXPIRY : MOCK_EXPIRY.filter(m => m.status === filter)

  const summary = [
    { label: 'Expired', value: MOCK_EXPIRY.filter(m => m.status === 'Expired').length, color: '#dc2626', icon: XCircle },
    { label: 'Critical (≤10 days)', value: MOCK_EXPIRY.filter(m => m.status === 'Critical').length, color: '#ea580c', icon: AlertTriangle },
    { label: 'Near Expiry (≤30 days)', value: MOCK_EXPIRY.filter(m => m.status === 'Near Expiry').length, color: '#d97706', icon: Clock },
    { label: 'Total Batches', value: MOCK_EXPIRY.length, color: '#0c3b73', icon: Package },
  ]

  const columns = [
    { title: 'Batch No.', key: 'batch', render: v => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>{v}</span> },
    { title: 'Medicine', key: 'name', render: (v, row) => (
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#111827' }}>{v}</p>
        <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{row.brand}</p>
      </div>
    )},
    { title: 'Rack', key: 'rack', render: v => <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>{v}</span> },
    { title: 'Qty Left', key: 'qty', align: 'center', render: v => <span style={{ fontWeight: 700 }}>{v}</span> },
    { title: 'Expiry Date', key: 'expiry', render: v => <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span> },
    {
      title: 'Days Left', key: 'daysLeft', align: 'center', render: v => (
        <span style={{ fontWeight: 700, fontSize: 14, color: v < 0 ? '#dc2626' : v <= 10 ? '#ea580c' : '#d97706' }}>
          {v < 0 ? `${Math.abs(v)}d ago` : `${v}d`}
        </span>
      )
    },
    {
      title: 'Status', key: 'status', render: v => {
        const cfg = statusConfig[v] || { color: '#9ca3af', bg: '#f3f4f6' }
        return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{v}</span>
      }
    },
    {
      title: 'Action', key: '_a', render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {row.status === 'Expired' && (
            <button style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #fecdd3', background: '#fff1f2', cursor: 'pointer', fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
              Quarantine
            </button>
          )}
          {row.status !== 'Expired' && (
            <button style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #fde68a', background: '#fffbeb', cursor: 'pointer', fontSize: 11, color: '#d97706', fontWeight: 600 }}>
              Mark Alert
            </button>
          )}
        </div>
      )
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={AlertTriangle} title="Expiry Report" subtitle="Expired and near-expiry batch tracking by rack" color="#d97706">
        <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Download size={14} /> Export
        </button>
      </PageHeader>

      {/* Warning Banner for Expired */}
      {MOCK_EXPIRY.some(m => m.status === 'Expired') && (
        <div style={{ background: '#fee2e2', borderRadius: 10, border: '1px solid #fecdd3', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <XCircle size={16} color="#dc2626" />
          <p style={{ margin: 0, fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
            {MOCK_EXPIRY.filter(m => m.status === 'Expired').length} batches have expired. They must be quarantined and cannot be dispensed.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {summary.map(s => (
          <div key={s.label} style={{ flex: '1 1 140px', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={17} color={s.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['All', 'Expired', 'Critical', 'Near Expiry'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '7px 16px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            borderColor: filter === s ? '#0c3b73' : '#e5e7eb',
            background: filter === s ? '#0c3b73' : '#fff',
            color: filter === s ? '#fff' : '#374151',
          }}>{s}</button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} total={filtered.length} page={1} limit={20} />
    </div>
  )
}

export default ExpiryReport
