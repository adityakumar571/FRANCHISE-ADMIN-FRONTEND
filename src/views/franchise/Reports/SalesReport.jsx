/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { FileText, Download, TrendingUp, IndianRupee, ShoppingCart, RotateCcw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

export default function SalesReport() {
  const [report, setReport]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')
  const [page, setPage] = useState(1)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/reports/sales?from=${from}&to=${to}&page=${page}&limit=20`)
      setReport(res.data?.data)
    } catch { toast.error('Failed to load sales report') }
    finally   { setLoading(false) }
  }
  useEffect(() => { fetchReport() }, [from, to, page])

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  const kpi = report?.kpi || {}

  const columns = [
    { title: 'Invoice No.',  key: 'invoiceNo',  render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#0c3b73', fontWeight: 700 }}>{v}</span> },
    { title: 'Date',         key: 'date' },
    { title: 'Time',         key: 'time',        render: (v) => <span style={{ color: '#6b7280', fontSize: 12 }}>{v}</span> },
    { title: 'Customer',     key: 'customer' },
    { title: 'Items',        key: 'items',        align: 'center' },
    { title: 'Gross (₹)',    key: 'gross',        render: (v) => fmt(v) },
    { title: 'Discount (₹)',  key: 'discount',    render: (v) => <span style={{ color: '#16a34a' }}>{fmt(v)}</span> },
    { title: 'Net (₹)',      key: 'net',          render: (v) => <span style={{ fontWeight: 700, color: '#0c3b73' }}>{fmt(v)}</span> },
    { title: 'Payment',      key: 'payment' },
    { title: 'Cashier',      key: 'cashier',      render: (v) => <span style={{ color: '#6b7280', fontSize: 12 }}>{v}</span> },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={FileText} title="Sales Report" subtitle="Detailed sales analysis by date range" color="#0c3b73">
        <button style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <Download size={12} /> Export
        </button>
      </PageHeader>

      {/* Date Filter */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13 }}>From:</span>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        <span style={{ fontSize: 13 }}>To:</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        <button onClick={fetchReport} style={{ padding: '7px 16px', border: 'none', borderRadius: 7, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Apply</button>
        {(from || to) && <button onClick={() => { setFrom(''); setTo('') }} style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Clear</button>}
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Sales',      value: loading ? '...' : fmt(kpi.totalSales),   icon: IndianRupee, color: '#0c3b73', bg: '#e0e7ff' },
          { label: 'Sales Returns',    value: loading ? '...' : fmt(kpi.totalReturns), icon: RotateCcw,  color: '#dc2626', bg: '#fee2e2' },
          { label: 'Net Sales',        value: loading ? '...' : fmt(kpi.netSales),     icon: TrendingUp, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Avg Invoice Value',value: loading ? '...' : fmt(kpi.avgInvoice),   icon: ShoppingCart,color:'#d97706', bg: '#fef3c7' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={18} color={k.color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{k.label}</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: k.color, margin: '2px 0 0' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Breakdown */}
      {!loading && report?.paymentBreakdown && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>Payment Breakdown:</p>
          {Object.entries(report.paymentBreakdown).map(([mode, count]) => (
            <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{mode}:</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0c3b73' }}>{count} invoices</span>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={report?.invoices || []}
        loading={loading}
        total={report?.total || 0}
        page={page}
        limit={20}
        onPageChange={setPage}
        onLimitChange={() => {}}
      />
    </div>
  )
}
