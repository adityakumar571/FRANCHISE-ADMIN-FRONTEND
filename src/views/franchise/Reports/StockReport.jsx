/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { FileText, Download, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const STATUS_COLORS = { 'In Stock': '#16a34a', 'Low Stock': '#d97706', 'Out of Stock': '#dc2626' }
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

export default function StockReport() {
  const [report, setReport]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [page, setPage]       = useState(1)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/reports/stock?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&page=${page}&limit=20`)
      setReport(res.data?.data)
    } catch { toast.error('Failed to load stock report') }
    finally   { setLoading(false) }
  }
  useEffect(() => { fetchReport() }, [search, status, page])

  const columns = [
    { title: 'Code',        key: 'code',        render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{v}</span> },
    { title: 'Medicine',    key: 'medicine',    render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Category',    key: 'category',    render: (v) => <span style={{ color: '#6b7280', fontSize: 12 }}>{v}</span> },
    { title: 'Rack',        key: 'rack',        render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#0c3b73' }}>{v}</span> },
    { title: 'Qty',         key: 'qty',         align: 'center', render: (v, row) => <span style={{ fontWeight: 700, color: STATUS_COLORS[row.status] || '#374151' }}>{v}</span> },
    { title: 'MRP (₹)',     key: 'mrp',         render: (v) => fmt(v) },
    { title: 'Stock Value', key: 'stockValue',  render: (v) => <span style={{ fontWeight: 700, color: '#0c3b73' }}>{fmt(v)}</span> },
    { title: 'Reorder Lvl', key: 'reorderLevel',align: 'center' },
    { title: 'Status',      key: 'status',      render: (v) => <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: (STATUS_COLORS[v] || '#6b7280') + '18', color: STATUS_COLORS[v] || '#6b7280' }}>{v}</span> },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={FileText} title="Stock Report" subtitle="Current inventory position" color="#d97706">
        <button style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <Download size={12} /> Export
        </button>
      </PageHeader>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search medicine..."
            style={{ width: '100%', padding: '8px 10px 8px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option value="">All Status</option>
          {['In Stock', 'Low Stock', 'Out of Stock', 'Near Expiry'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={report?.stock || []} loading={loading} total={report?.total || 0} page={page} limit={20} onPageChange={setPage} onLimitChange={() => {}} />
    </div>
  )
}
