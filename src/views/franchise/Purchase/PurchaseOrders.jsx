/* eslint-disable prettier/prettier */
/**
 * PurchaseOrders — List, create and track Purchase Orders
 * SOW §12: Purchase & Procurement Workflow
 */
import { useState, useEffect, useCallback } from 'react'
import { FileText, Search, Plus, Eye, X, Truck, Package, Hash } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import CreatePOModal from './CreatePOModal'
import PODetailModal from './PODetailModal'

const MOCK_DATA = [
  { _id: 'PO-2401', supplier: 'Medico Agencies', items: 12, totalAmount: 24500, status: 'pending', createdAt: '2026-08-22', expectedDate: '2026-08-25' },
  { _id: 'PO-2400', supplier: 'PharmaDist Pvt Ltd', items: 8, totalAmount: 18200, status: 'accepted', createdAt: '2026-08-21', expectedDate: '2026-08-24' },
  { _id: 'PO-2399', supplier: 'SunPharma Dist', items: 5, totalAmount: 9000, status: 'dispatched', createdAt: '2026-08-20', expectedDate: '2026-08-22' },
  { _id: 'PO-2398', supplier: 'Medico Agencies', items: 20, totalAmount: 42000, status: 'completed', createdAt: '2026-08-18', expectedDate: '2026-08-20' },
  { _id: 'PO-2397', supplier: 'Apex Distributors', items: 3, totalAmount: 5600, status: 'cancelled', createdAt: '2026-08-15', expectedDate: '2026-08-18' },
]

const PurchaseOrders = () => {
  const [data, setData]         = useState(MOCK_DATA)
  const [loading, setLoading]   = useState(false)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatus] = useState('')
  const [total, setTotal]       = useState(MOCK_DATA.length)
  const [page, setPage]         = useState(1)
  const [limit, setLimit]       = useState(20)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const filtered = data.filter((d) => {
    const q = search.toLowerCase()
    return (!q || d._id?.toLowerCase().includes(q) || d.supplier?.toLowerCase().includes(q))
      && (!statusFilter || d.status === statusFilter)
  })

  const columns = [
    { title: '#',       key: '_idx',        width: 50, align: 'center', render: (_, __, i) => (page - 1) * limit + i + 1 },
    { title: 'PO No.',  key: '_id',          render: (v) => <span style={{ fontWeight: 700, color: '#0c3b73' }}>{v}</span> },
    { title: 'Supplier',key: 'supplier' },
    { title: 'Items',   key: 'items',        align: 'center' },
    { title: 'Amount',  key: 'totalAmount',  render: (v) => `₹${v?.toLocaleString()}` },
    { title: 'Date',    key: 'createdAt',    render: (v) => v || '—' },
    { title: 'Expected',key: 'expectedDate', render: (v) => v || '—' },
    { title: 'Status',  key: 'status',       align: 'center', render: (v) => <StatusBadge status={v} /> },
    { title: 'Actions', key: '_actions',     align: 'center', width: 80, render: (_, row) => (
      <button onClick={() => { setSelected(row); setDetailOpen(true) }}
        style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #0c3b7320', background: '#0c3b7310', color: '#0c3b73', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
        <Eye size={13} />
      </button>
    )},
  ]

  return (
    <div>
      <PageHeader icon={FileText} title="Purchase Orders" subtitle="Create and track all purchase orders" color="#7c3aed">
        <button onClick={() => setCreateOpen(true)} style={primaryBtn}><Plus size={14} /> Create PO</button>
      </PageHeader>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input type="text" placeholder="Search PO number, supplier…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...searchInput, paddingLeft: 32 }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="dispatched">Dispatched</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        total={filtered.length}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(s) => { setLimit(s); setPage(1) }}
      />

      {createOpen && <CreatePOModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); toast.success('PO created') }} />}
      {detailOpen && <PODetailModal open={detailOpen} onClose={() => setDetailOpen(false)} data={selected} />}
    </div>
  )
}

const primaryBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0c3b73', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }
const searchInput = { width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 12px', fontSize: 13, outline: 'none', background: '#fff' }
const selectStyle = { height: 38, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 12px', fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer' }

export default PurchaseOrders
