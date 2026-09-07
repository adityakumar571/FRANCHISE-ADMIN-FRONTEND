/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { FileText, Download } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

export default function PurchaseReport() {
  const [report, setReport]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')
  const [page, setPage] = useState(1)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/reports/purchase?from=${from}&to=${to}&page=${page}&limit=20`)
      setReport(res.data?.data)
    } catch { toast.error('Failed to load purchase report') }
    finally   { setLoading(false) }
  }
  useEffect(() => { fetchReport() }, [from, to, page])

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  const kpi = report?.kpi || {}

  const columns = [
    { title: 'Bill No.',    key: 'billNo',    render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#0c3b73', fontWeight: 700 }}>{v}</span> },
    { title: 'PO Ref.',     key: 'poRef',     render: (v) => <span style={{ color: '#6b7280', fontSize: 12 }}>{v}</span> },
    { title: 'Date',        key: 'date' },
    { title: 'Supplier',    key: 'supplier' },
    { title: 'Items',       key: 'items',     align: 'center' },
    { title: 'Qty',         key: 'qty',       align: 'center' },
    { title: 'Gross (₹)',   key: 'gross',     render: (v) => fmt(v) },
    { title: 'Discount (₹)',key: 'discount',  render: (v) => <span style={{ color: '#16a34a' }}>{fmt(v)}</span> },
    { title: 'Tax (₹)',     key: 'tax',       render: (v) => fmt(v) },
    { title: 'Net (₹)',     key: 'net',       render: (v) => <span style={{ fontWeight: 700, color: '#0c3b73' }}>{fmt(v)}</span> },
    { title: 'Status',      key: 'status',    render: (v) => <StatusBadge status={v} /> },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={FileText} title="Purchase Report" subtitle="Detailed purchase analysis" color="#7c3aed">
        <button style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <Download size={12} /> Export
        </button>
      </PageHeader>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 13 }}>From:</span>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        <span style={{ fontSize: 13 }}>To:</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        <button onClick={fetchReport} style={{ padding: '7px 16px', border: 'none', borderRadius: 7, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Apply</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Purchase', value: loading ? '...' : fmt(kpi.totalPurchase), color: '#0c3b73' },
          { label: 'Total Discount', value: loading ? '...' : fmt(kpi.totalDiscount), color: '#16a34a' },
          { label: 'Total GST',      value: loading ? '...' : fmt(kpi.totalGST),      color: '#d97706' },
          { label: 'Invoices',       value: loading ? '...' : kpi.invoiceCount || 0,  color: '#374151' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={report?.invoices || []} loading={loading} total={report?.total || 0} page={page} limit={20} onPageChange={setPage} onLimitChange={() => {}} />
    </div>
  )
}
