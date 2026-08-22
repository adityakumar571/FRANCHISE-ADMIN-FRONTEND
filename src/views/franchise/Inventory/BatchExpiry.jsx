/* eslint-disable prettier/prettier */
/**
 * BatchExpiry — Batch-wise tracking + near-expiry and expired alerts
 * SOW §11.3: Batch & Expiry Controls
 */
import { useState } from 'react'
import { FlaskConical, Search, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

const today = new Date()
const addMonths = (m) => { const d = new Date(today); d.setMonth(d.getMonth() + m); return d.toISOString().slice(0, 7) }

const MOCK = [
  { medicine: 'Amoxicillin 500mg',  batch: 'B2395', expiry: '2026-10', qty: 25, rack: 'A02', daysLeft: 50, status: 'warning' },
  { medicine: 'Azithromycin 500mg', batch: 'B2310', expiry: '2026-08', qty: 60, rack: 'B03', daysLeft: -5, status: 'expired' },
  { medicine: 'Atorvastatin 10mg',  batch: 'B2377', expiry: '2026-09', qty: 80, rack: 'C04', daysLeft: 28, status: 'warning' },
  { medicine: 'Paracetamol 650mg',  batch: 'B2401', expiry: '2027-06', qty: 450, rack: 'A01', daysLeft: 320, status: 'active' },
  { medicine: 'Metformin 500mg',    batch: 'B2388', expiry: '2027-02', qty: 320, rack: 'C03', daysLeft: 180, status: 'active' },
  { medicine: 'Pantoprazole 40mg',  batch: 'B2402', expiry: '2028-01', qty: 600, rack: 'D01', daysLeft: 500, status: 'active' },
]

const BatchExpiry = () => {
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')

  const filtered = MOCK.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.medicine.toLowerCase().includes(q) || r.batch.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || (filter === 'expired' && r.daysLeft < 0) || (filter === 'warning' && r.daysLeft >= 0 && r.daysLeft <= 90) || (filter === 'active' && r.daysLeft > 90)
    return matchSearch && matchFilter
  })

  const stats = {
    expired: MOCK.filter((m) => m.daysLeft < 0).length,
    expiring30: MOCK.filter((m) => m.daysLeft >= 0 && m.daysLeft <= 30).length,
    expiring90: MOCK.filter((m) => m.daysLeft >= 0 && m.daysLeft <= 90).length,
    healthy: MOCK.filter((m) => m.daysLeft > 90).length,
  }

  const columns = [
    { title: 'Medicine', key: 'medicine', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Batch No.', key: 'batch', render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</span> },
    { title: 'Expiry', key: 'expiry' },
    { title: 'Days Left', key: 'daysLeft', align: 'center', render: (v) => (
      <span style={{ fontWeight: 700, color: v < 0 ? '#e11d48' : v <= 30 ? '#ea580c' : v <= 90 ? '#d97706' : '#16a34a' }}>
        {v < 0 ? `${Math.abs(v)}d ago` : `${v} days`}
      </span>
    )},
    { title: 'Qty', key: 'qty', align: 'center', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Rack', key: 'rack', render: (v) => <span style={{ padding: '2px 8px', borderRadius: 5, background: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: 12 }}>{v}</span> },
    { title: 'Status', key: 'status', align: 'center', render: (v) => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      <PageHeader icon={FlaskConical} title="Batch & Expiry" subtitle="Track batches and expiry dates — FEFO-oriented" color="#7c3aed" />

      {/* Alert summary */}
      {(stats.expired > 0 || stats.expiring30 > 0) && (
        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} color="#e11d48" />
          <div>
            {stats.expired > 0 && <span style={{ fontSize: 13, color: '#e11d48', fontWeight: 700 }}>{stats.expired} batch(es) expired · </span>}
            {stats.expiring30 > 0 && <span style={{ fontSize: 13, color: '#ea580c', fontWeight: 700 }}>{stats.expiring30} expiring within 30 days</span>}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Expired',        value: stats.expired,    color: '#e11d48' },
          { label: 'Expiring < 30d', value: stats.expiring30, color: '#ea580c' },
          { label: 'Expiring < 90d', value: stats.expiring90, color: '#d97706' },
          { label: 'Healthy',        value: stats.healthy,    color: '#16a34a' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', border: `1px solid ${s.color}30`, borderLeft: `4px solid ${s.color}`, flex: '1 1 130px' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px', fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input type="text" placeholder="Search medicine, batch…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 8, paddingLeft: 32, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
        </div>
        {['all', 'expired', 'warning', 'active'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${filter === f ? '#0c3b73' : '#e5e7eb'}`, background: filter === f ? '#0c3b73' : '#fff', color: filter === f ? '#fff' : '#374151', fontWeight: 600, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>
            {f === 'all' ? 'All' : f === 'warning' ? 'Near Expiry' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} loading={false} total={filtered.length} page={1} limit={20} />
    </div>
  )
}

export default BatchExpiry
