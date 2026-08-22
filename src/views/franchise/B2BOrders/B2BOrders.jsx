/* eslint-disable prettier/prettier */
/**
 * B2BOrders — Franchise B2B Order Management
 * View, track and manage B2B orders placed with distributors/wholesalers
 */
import { useState } from 'react'
import { Store, Eye, RotateCcw, CheckCircle2, Clock, XCircle, Truck, Filter, Download } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

const MOCK_ORDERS = [
  { id: 'B2B-001', supplier: 'Medico Agency Pvt Ltd', date: '22 Aug 2026', items: 8, qty: 350, amount: '₹24,500', status: 'Delivered', payStatus: 'Paid' },
  { id: 'B2B-002', supplier: 'PharmaNexus Distributors', date: '21 Aug 2026', items: 5, qty: 120, amount: '₹12,800', status: 'In Transit', payStatus: 'Pending' },
  { id: 'B2B-003', supplier: 'Sun Pharma Wholesale', date: '20 Aug 2026', items: 12, qty: 600, amount: '₹41,200', status: 'Confirmed', payStatus: 'Partial' },
  { id: 'B2B-004', supplier: 'Cipla Distributors', date: '19 Aug 2026', items: 3, qty: 90, amount: '₹8,650', status: 'Pending', payStatus: 'Pending' },
  { id: 'B2B-005', supplier: 'Medico Agency Pvt Ltd', date: '18 Aug 2026', items: 7, qty: 280, amount: '₹19,300', status: 'Cancelled', payStatus: 'Refunded' },
  { id: 'B2B-006', supplier: 'HealthCare Distributors', date: '17 Aug 2026', items: 4, qty: 150, amount: '₹9,750', status: 'Delivered', payStatus: 'Paid' },
]

const statusColor = {
  Delivered: '#16a34a',
  'In Transit': '#0891b2',
  Confirmed: '#7c3aed',
  Pending: '#d97706',
  Cancelled: '#dc2626',
}

const payColor = {
  Paid: '#16a34a',
  Pending: '#d97706',
  Partial: '#0891b2',
  Refunded: '#6b7280',
}

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null
  const items = [
    { name: 'Paracetamol 650mg', qty: 50, unit: 'Strip', rate: 12, amount: 600 },
    { name: 'Amoxicillin 500mg', qty: 30, unit: 'Strip', rate: 28, amount: 840 },
    { name: 'Metformin 500mg', qty: 40, unit: 'Strip', rate: 18, amount: 720 },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Order Details — {order.id}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>{order.supplier} · {order.date}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            ['Order ID', order.id],
            ['Supplier', order.supplier],
            ['Order Date', order.date],
            ['Total Amount', order.amount],
            ['Order Status', order.status],
            ['Payment Status', order.payStatus],
          ].map(([label, val]) => (
            <div key={label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{label}</p>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: '#111827', fontWeight: 600 }}>{val}</p>
            </div>
          ))}
        </div>

        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Order Items</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Medicine', 'Qty', 'Unit', 'Rate', 'Amount'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 12px', color: '#111827', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '8px 12px', color: '#374151' }}>{item.qty}</td>
                <td style={{ padding: '8px 12px', color: '#374151' }}>{item.unit}</td>
                <td style={{ padding: '8px 12px', color: '#374151' }}>₹{item.rate}</td>
                <td style={{ padding: '8px 12px', color: '#111827', fontWeight: 600 }}>₹{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>Close</button>
        </div>
      </div>
    </div>
  )
}

const B2BOrders = () => {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')

  const statuses = ['All', 'Pending', 'Confirmed', 'In Transit', 'Delivered', 'Cancelled']

  const filtered = filter === 'All' ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === filter)

  const summary = [
    { label: 'Total Orders', value: MOCK_ORDERS.length, color: '#0c3b73', icon: Store },
    { label: 'Delivered', value: MOCK_ORDERS.filter(o => o.status === 'Delivered').length, color: '#16a34a', icon: CheckCircle2 },
    { label: 'In Transit', value: MOCK_ORDERS.filter(o => o.status === 'In Transit').length, color: '#0891b2', icon: Truck },
    { label: 'Pending', value: MOCK_ORDERS.filter(o => o.status === 'Pending').length, color: '#d97706', icon: Clock },
  ]

  const columns = [
    { title: '#', key: 'id', width: 90, render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0c3b73', fontWeight: 600 }}>{v}</span> },
    { title: 'Supplier', key: 'supplier', render: (v) => <span style={{ fontWeight: 500, color: '#111827' }}>{v}</span> },
    { title: 'Date', key: 'date', render: (v) => <span style={{ color: '#6b7280', fontSize: 12 }}>{v}</span> },
    { title: 'Items', key: 'items', align: 'center', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Total Qty', key: 'qty', align: 'center' },
    { title: 'Amount', key: 'amount', align: 'right', render: (v) => <span style={{ fontWeight: 700, color: '#111827' }}>{v}</span> },
    {
      title: 'Order Status', key: 'status', render: (v) => (
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusColor[v] + '18', color: statusColor[v] }}>
          {v}
        </span>
      )
    },
    {
      title: 'Payment', key: 'payStatus', render: (v) => (
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: payColor[v] + '18', color: payColor[v] }}>
          {v}
        </span>
      )
    },
    {
      title: 'Action', key: '_action', render: (_, row) => (
        <button onClick={() => setSelected(row)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151' }}>
          <Eye size={13} /> View
        </button>
      )
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={Store} title="B2B Orders" subtitle="Track orders placed with distributors and wholesalers" color="#0c3b73">
        <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
          <Download size={14} /> Export
        </button>
      </PageHeader>

      {/* Summary Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {summary.map((s) => (
          <div key={s.label} style={{ flex: '1 1 160px', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 700, color: '#111827' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 16px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            borderColor: filter === s ? '#0c3b73' : '#e5e7eb',
            background: filter === s ? '#0c3b73' : '#fff',
            color: filter === s ? '#fff' : '#374151',
          }}>
            {s}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        total={filtered.length}
        page={1}
        limit={20}
      />

      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

export default B2BOrders
