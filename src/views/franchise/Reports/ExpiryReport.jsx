/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { FileText, Download } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const STATUS_C = { Expired: '#dc2626', Critical: '#e11d48', 'Near Expiry': '#d97706', Safe: '#16a34a' }

export default function ExpiryReport() {
  const [report, setReport]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState('')
  const [page, setPage]       = useState(1)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/reports/expiry?status=${encodeURIComponent(status)}&page=${page}&limit=20`)
      setReport(res.data?.data)
    } catch { toast.error('Failed to load expiry report') }
    finally   { setLoading(false) }
  }
  useEffect(() => { fetchReport() }, [status, page])

  const columns = [
    { title: 'Batch No.',    key: 'batchNo',   render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{v}</span> },
    { title: 'Medicine',     key: 'medicine',  render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Rack',         key: 'rack',      render: (v) => <span style={{ color: '#6b7280', fontSize: 12 }}>{v}</span> },
    { title: 'Qty Left',     key: 'qty',       align: 'center', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Expiry Date',  key: 'expiry',    render: (v) => <span style={{ color: '#6b7280' }}>{v}</span> },
    { title: 'Days Left',    key: 'daysLeft',  render: (v) => <span style={{ fontWeight: 700, color: v < 0 ? '#dc2626' : v <= 30 ? '#e11d48' : '#d97706' }}>{v < 0 ? `Expired ${Math.abs(v)}d` : `${v}d`}</span> },
    { title: 'Status',       key: 'status',    render: (v) => <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: (STATUS_C[v] || '#6b7280') + '18', color: STATUS_C[v] || '#6b7280' }}>{v}</span> },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={FileText} title="Expiry Report" subtitle="Batch-wise expiry tracking" color="#dc2626">
        <button style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <Download size={12} /> Export
        </button>
      </PageHeader>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
        {['', 'Expired', 'Critical', 'Near Expiry'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }}
            style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${status === s ? '#dc2626' : '#e5e7eb'}`, background: status === s ? '#dc2626' : '#fff', color: status === s ? '#fff' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={report?.items || []} loading={loading} total={report?.total || 0} page={page} limit={20} onPageChange={setPage} onLimitChange={() => {}} />
    </div>
  )
}
