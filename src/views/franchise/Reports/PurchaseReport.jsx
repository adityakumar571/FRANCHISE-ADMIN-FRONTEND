/* eslint-disable prettier/prettier */
/**
 * PurchaseReport — Franchise Purchase & Procurement Report
 */
import { useState } from 'react'
import { FileText, Download, ShoppingCart, Package, Truck, RotateCcw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

const MOCK_PURCHASES = [
  { grn: 'GRN-0024', po: 'PO-0031', date: '22 Aug 2026', supplier: 'Medico Agency', items: 8, qty: 350, gross: '₹24,500', disc: '₹1,200', tax: '₹2,030', net: '₹25,330', status: 'Completed' },
  { grn: 'GRN-0023', po: 'PO-0029', date: '21 Aug 2026', supplier: 'PharmaNexus', items: 5, qty: 120, gross: '₹12,800', disc: '₹640', tax: '₹1,056', net: '₹13,216', status: 'Completed' },
  { grn: 'GRN-0022', po: 'PO-0028', date: '20 Aug 2026', supplier: 'Sun Pharma Wholesale', items: 12, qty: 600, gross: '₹41,200', disc: '₹2,060', tax: '₹3,404', net: '₹42,544', status: 'Partial' },
  { grn: 'GRN-0021', po: 'PO-0026', date: '18 Aug 2026', supplier: 'Cipla Distributors', items: 3, qty: 90, gross: '₹8,650', disc: '₹433', tax: '₹715', net: '₹8,932', status: 'Completed' },
]

const statusColor = { Completed: '#16a34a', Partial: '#d97706', Pending: '#9ca3af' }

const PurchaseReport = () => {
  const [from, setFrom] = useState('2026-08-01')
  const [to, setTo] = useState('2026-08-22')

  const kpis = [
    { label: 'Total Purchases', value: '₹89,022', sub: '28 GRNs this month', icon: ShoppingCart, color: '#0c3b73' },
    { label: 'Total Items', value: '4 suppliers', sub: '28 POs raised', icon: Truck, color: '#7c3aed' },
    { label: 'Avg Per GRN', value: '₹3,179', sub: 'Average GRN value', icon: Package, color: '#0891b2' },
    { label: 'Purchase Returns', value: '₹1,850', sub: '3 returns this month', icon: RotateCcw, color: '#dc2626' },
  ]

  const columns = [
    { title: 'GRN #', key: 'grn', render: v => <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0c3b73', fontWeight: 600 }}>{v}</span> },
    { title: 'PO #', key: 'po', render: v => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{v}</span> },
    { title: 'Date', key: 'date', render: v => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span> },
    { title: 'Supplier', key: 'supplier', render: v => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: 'Items', key: 'items', align: 'center' },
    { title: 'Qty', key: 'qty', align: 'center' },
    { title: 'Gross', key: 'gross', align: 'right' },
    { title: 'Discount', key: 'disc', align: 'right', render: v => <span style={{ color: '#16a34a' }}>{v}</span> },
    { title: 'Tax', key: 'tax', align: 'right', render: v => <span style={{ color: '#d97706' }}>{v}</span> },
    { title: 'Net Amount', key: 'net', align: 'right', render: v => <strong>{v}</strong> },
    {
      title: 'Status', key: 'status', render: v => (
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: (statusColor[v] || '#9ca3af') + '18', color: statusColor[v] || '#9ca3af' }}>{v}</span>
      )
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={FileText} title="Purchase Report" subtitle="GRN-wise purchase and supplier summary" color="#7c3aed">
        <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Download size={14} /> Export
        </button>
      </PageHeader>

      {/* Date Filter */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {[{ label: 'From Date', val: from, set: setFrom }, { label: 'To Date', val: to, set: setTo }].map(({ label, val, set }) => (
          <div key={label}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
            <input type="date" value={val} onChange={e => set(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6 }}>
          {['This Month', 'Last Month', 'Last 3 Months'].map(q => (
            <button key={q} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 12, cursor: 'pointer', color: '#374151' }}>{q}</button>
          ))}
        </div>
        <button style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>Apply</button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ flex: '1 1 160px', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <k.icon size={18} color={k.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{k.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</p>
              <p style={{ margin: '1px 0 0', fontSize: 11, color: '#9ca3af' }}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={MOCK_PURCHASES} total={MOCK_PURCHASES.length} page={1} limit={20} />
    </div>
  )
}

export default PurchaseReport
