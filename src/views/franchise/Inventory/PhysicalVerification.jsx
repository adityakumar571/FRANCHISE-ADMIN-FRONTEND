/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, Plus } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

export default function PhysicalVerification() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest('/franchise/inventory/physical-verification')
      setRecords(res.data?.data || [])
    } catch { toast.error('Failed to load verifications') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const handleStart = async () => {
    setStarting(true)
    try {
      await postRequest({ url: '/franchise/inventory/physical-verification', cred: { notes: 'Physical count verification' } })
      toast.success('Verification submitted')
      fetchRecords()
    } catch { toast.error('Failed to submit') }
    finally { setStarting(false) }
  }

  const columns = [
    { title: 'Audit No.',  key: 'auditNo', render: (v) => <span style={{ fontWeight: 700, color: '#16a34a' }}>{v}</span> },
    { title: 'Date',       key: 'date' },
    { title: 'Items',      key: 'items', align: 'center' },
    { title: 'By',         key: 'by' },
    { title: 'Status',     key: 'status', render: (v) => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      <PageHeader icon={ShieldCheck} title="Physical Verification" subtitle="Track physical stock verification records" color="#16a34a">
        <button onClick={handleStart} disabled={starting}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: starting ? '#9ca3af' : '#0c3b73', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          <Plus size={14} /> {starting ? 'Submitting...' : 'New Verification'}
        </button>
      </PageHeader>

      <DataTable columns={columns} data={records} loading={loading} total={records.length} page={1} limit={20} />
    </div>
  )
}
