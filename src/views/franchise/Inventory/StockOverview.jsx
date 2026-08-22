/* eslint-disable prettier/prettier */
/**
 * StockOverview — Current stock levels with search and filters
 * SOW §11: Inventory, Batch, Expiry & Rack-Wise Medicine Management
 */
import { useState } from 'react'
import { ClipboardList, Search, AlertTriangle, Download, Filter } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

const MOCK = [
  { medicine: 'Paracetamol 650mg', category: 'Analgesic', rack: 'A01', batch: 'B2401', expiry: '2027-06', qty: 450, reorderLevel: 100, mrp: 12.50, status: 'active' },
  { medicine: 'Amoxicillin 500mg', category: 'Antibiotic', rack: 'B02', batch: 'B2395', expiry: '2026-10', qty: 25, reorderLevel: 50, mrp: 8.00, status: 'low' },
  { medicine: 'Metformin 500mg',   category: 'Antidiabetic', rack: 'C03', batch: 'B2388', expiry: '2027-02', qty: 320, reorderLevel: 100, mrp: 4.50, status: 'active' },
  { medicine: 'Atorvastatin 10mg', category: 'Cardiac', rack: 'C04', batch: 'B2377', expiry: '2026-09', qty: 80, reorderLevel: 50, mrp: 6.00, status: 'warning' },
  { medicine: 'Azithromycin 500mg',category: 'Antibiotic', rack: 'B03', batch: 'B2310', expiry: '2026-08', qty: 0, reorderLevel: 30, mrp: 28.00, status: 'expired' },
  { medicine: 'Pantoprazole 40mg', category: 'Antacid', rack: 'D01', batch: 'B2402', expiry: '2028-01', qty: 600, reorderLevel: 100, mrp: 3.50, status: 'active' },
]

const StockOverview = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatus] = useState('')

  const filtered = MOCK.filter((r) => {
    const q = search.toLowerCase()
    return (!q || r.medicine?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q) || r.rack?.toLowerCase().includes(q))
      && (!statusFilter || r.status === statusFilter)
  })

  const stats = {
    total: MOCK.length,
    low:   MOCK.filter((m) => m.status === 'low').length,
    expired: MOCK.filter((m) => m.status === 'expired').length,
    expiring: MOCK.filter((m) => m.status === 'warning').length,
  }

  const columns = [
    { title: '#',         key: '_idx',    width: 50, align: 'center', render: (_, __, i) => i + 1 },
    { title: 'Medicine',  key: 'medicine', render: (v, row) => (
      <div><div style={{ fontWeight: 600, color: '#111827' }}>{v}</div><div style={{ fontSize: 11, color: '#6b7280' }}>{row.category}</div></div>
    )},
    { title: 'Rack',      key: 'rack',     render: (v) => <span style={{ padding: '2px 8px', borderRadius: 5, background: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: 12 }}>{v}</span> },
    { title: 'Batch',     key: 'batch',    render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</span> },
    { title: 'Expiry',    key: 'expiry' },
    { title: 'Qty',       key: 'qty',      align: 'center', render: (v, row) => (
      <span style={{ fontWeight: 700, color: v <= row.reorderLevel ? '#e11d48' : '#16a34a' }}>{v}</span>
    )},
    { title: 'MRP (₹)',   key: 'mrp',      align: 'right', render: (v) => `₹${v.toFixed(2)}` },
    { title: 'Status',    key: 'status',   align: 'center', render: (v) => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      <PageHeader icon={ClipboardList} title="Stock Overview" subtitle="Current inventory levels across all medicines" color="#0891b2">
        <button style={btnSec}><Download size={14} /> Export</button>
      </PageHeader>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total SKUs', value: stats.total, color: '#0c3b73' },
          { label: 'Low Stock', value: stats.low, color: '#d97706' },
          { label: 'Near Expiry', value: stats.expiring, color: '#7c3aed' },
          { label: 'Expired', value: stats.expired, color: '#e11d48' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', border: `1px solid ${s.color}30`, borderLeft: `4px solid ${s.color}`, flex: '1 1 130px' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px', fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input type="text" placeholder="Search medicine, category, rack…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 8, paddingLeft: 32, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} style={selStyle}>
          <option value="">All Status</option>
          <option value="active">Normal</option>
          <option value="low">Low Stock</option>
          <option value="warning">Near Expiry</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} loading={false} total={filtered.length} page={1} limit={20} />
    </div>
  )
}

const btnSec  = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 500, fontSize: 13, cursor: 'pointer' }
const selStyle = { height: 38, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 12px', fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer' }

export default StockOverview
