/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, Plus } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

export default function InventoryAudit() {
  const [audits, setAudits]   = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)

  const fetchAudits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/inventory/audit?page=${page}&limit=20`)
      const d = res.data?.data
      setAudits(d?.audits || [])
      setTotal(d?.total || 0)
    } catch { toast.error('Failed to load audits') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchAudits() }, [fetchAudits])

  const handleStartAudit = async () => {
    setStarting(true)
    try {
      await postRequest({ url: '/franchise/inventory/audit', cred: { notes: 'Regular audit' } })
      toast.success('Audit started')
      fetchAudits()
    } catch { toast.error('Failed to start audit') }
    finally { setStarting(false) }
  }

  const columns = [
    { title: 'Audit No.', key: 'auditNo', render: (v) => <span style={{ fontWeight: 700, color: '#dc2626' }}>{v}</span> },
    { title: 'Start Date', key: 'startedAt' },
    { title: 'Completed', key: 'completedAt' },
    { title: 'Items', key: 'items', align: 'center' },
    { title: 'Notes', key: 'notes' },
    { title: 'By', key: 'by' },
    { title: 'Status', key: 'status', render: (v) => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      <PageHeader icon={ClipboardList} title="Inventory Audit" subtitle="Track and manage periodic stock audits" color="#dc2626">
        <button onClick={handleStartAudit} disabled={starting}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: starting ? '#9ca3af' : '#0c3b73', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          <Plus size={14} /> {starting ? 'Starting...' : 'Start New Audit'}
        </button>
      </PageHeader>

      <DataTable columns={columns} data={audits} loading={loading} total={total} page={page} limit={20}
        onPageChange={setPage} onLimitChange={() => {}} />
    </div>
  )
}
