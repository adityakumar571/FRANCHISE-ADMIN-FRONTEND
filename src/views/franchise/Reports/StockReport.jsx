/* eslint-disable prettier/prettier */
/**
 * StockReport — Current Stock & Movement Report
 */
import { useState } from 'react'
import { FileText, Download, Package, AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

const MOCK_STOCK = [
  { code: 'MED-001', name: 'Paracetamol 650mg', brand: 'Calpol', category: 'Analgesic', rack: 'A01-S2', qty: 342, unit: 'Strip', mrp: '₹28', value: '₹9,576', reorder: 50, status: 'Adequate' },
  { code: 'MED-002', name: 'Amoxicillin 500mg', brand: 'Novamox', category: 'Antibiotic', rack: 'B02-S1', qty: 38, unit: 'Strip', mrp: '₹65', value: '₹2,470', reorder: 50, status: 'Low' },
  { code: 'MED-003', name: 'Metformin 500mg', brand: 'Glycomet', category: 'Antidiabetic', rack: 'C01-S3', qty: 120, unit: 'Strip', mrp: '₹42', value: '₹5,040', reorder: 30, status: 'Adequate' },
  { code: 'MED-004', name: 'Atorvastatin 10mg', brand: 'Storvas', category: 'Cardiac', rack: 'D03-S1', qty: 18, unit: 'Strip', mrp: '₹88', value: '₹1,584', reorder: 30, status: 'Low' },
  { code: 'MED-005', name: 'Omeprazole 20mg', brand: 'Omez', category: 'Antacid', rack: 'A03-S1', qty: 0, unit: 'Strip', mrp: '₹38', value: '₹0', reorder: 20, status: 'Out of Stock' },
  { code: 'MED-006', name: 'Cetirizine 10mg', brand: 'Cetzine', category: 'Antihistamine', rack: 'B01-S2', qty: 256, unit: 'Strip', mrp: '₹22', value: '₹5,632', reorder: 40, status: 'Adequate' },
  { code: 'MED-007', name: 'Azithromycin 500mg', brand: 'Azithral', category: 'Antibiotic', rack: 'B02-S3', qty: 72, unit: 'Strip', mrp: '₹125', value: '₹9,000', reorder: 20, status: 'Adequate' },
]

const statusConfig = {
  Adequate: { color: '#16a34a', bg: '#dcfce7' },
  Low: { color: '#d97706', bg: '#fef3c7' },
  'Out of Stock': { color: '#dc2626', bg: '#fee2e2' },
}

const StockReport = () => {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = MOCK_STOCK.filter(m =>
    (filter === 'All' || m.status === filter) &&
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const summary = [
    { label: 'Total SKUs', value: MOCK_STOCK.length, color: '#0c3b73', icon: Package },
    { label: 'Adequate', value: MOCK_STOCK.filter(m => m.status === 'Adequate').length, color: '#16a34a', icon: CheckCircle2 },
    { label: 'Low Stock', value: MOCK_STOCK.filter(m => m.status === 'Low').length, color: '#d97706', icon: AlertTriangle },
    { label: 'Out of Stock', value: MOCK_STOCK.filter(m => m.status === 'Out of Stock').length, color: '#dc2626', icon: TrendingDown },
  ]

  const columns = [
    { title: 'Code', key: 'code', render: v => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{v}</span> },
    { title: 'Medicine', key: 'name', render: (v, row) => (
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#111827' }}>{v}</p>
        <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{row.brand}</p>
      </div>
    )},
    { title: 'Category', key: 'category', render: v => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span> },
    { title: 'Rack', key: 'rack', render: v => <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>{v}</span> },
    { title: 'Qty', key: 'qty', align: 'center', render: (v, row) => (
      <span style={{ fontWeight: 700, color: v === 0 ? '#dc2626' : v <= row.reorder ? '#d97706' : '#111827' }}>{v}</span>
    )},
    { title: 'Unit', key: 'unit', render: v => <span style={{ fontSize: 12, color: '#9ca3af' }}>{v}</span> },
    { title: 'MRP', key: 'mrp', align: 'right' },
    { title: 'Stock Value', key: 'value', align: 'right', render: v => <strong style={{ color: '#0c3b73' }}>{v}</strong> },
    { title: 'Reorder', key: 'reorder', align: 'center', render: v => <span style={{ fontSize: 12, color: '#9ca3af' }}>{v}</span> },
    {
      title: 'Status', key: 'status', render: v => {
        const cfg = statusConfig[v] || { color: '#9ca3af', bg: '#f3f4f6' }
        return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{v}</span>
      }
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={FileText} title="Stock Report" subtitle="Current stock levels, rack locations and reorder status" color="#0891b2">
        <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Download size={14} /> Export
        </button>
      </PageHeader>

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

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search medicine…"
          style={{ flex: 1, minWidth: 200, padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Adequate', 'Low', 'Out of Stock'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '7px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              borderColor: filter === s ? '#0c3b73' : '#e5e7eb',
              background: filter === s ? '#0c3b73' : '#fff',
              color: filter === s ? '#fff' : '#374151',
            }}>{s}</button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} total={filtered.length} page={1} limit={20} />
    </div>
  )
}

export default StockReport
