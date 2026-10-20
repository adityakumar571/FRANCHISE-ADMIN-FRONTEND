/* eslint-disable prettier/prettier */
/**
 * PurchaseOrders — Real API integration with prefilled data support
 */
import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { FileText, Search, Plus, Eye } from 'lucide-react'
import { getRequest, postRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import CreatePOModal from './CreatePOModal'
import PODetailModal from './PODetailModal'

const PurchaseOrders = () => {
  const location = useLocation()
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatus] = useState('')
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [limit, setLimit]       = useState(20)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [prefilledData, setPrefilledData] = useState({ supplier: null, medicine: null })

  // Check if coming from LiveRateCompare with prefilled data
  useEffect(() => {
    if (location.state?.prefilledSupplier && location.state?.prefilledMedicine) {
      setPrefilledData({
        supplier: location.state.prefilledSupplier,
        medicine: location.state.prefilledMedicine
      })
      setCreateOpen(true)
      // Clear location state to prevent reopening on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const fetchOrders = useCallback(async () => {
    console.log('📋 Fetching purchase orders...')
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/purchase/orders?search=${encodeURIComponent(search)}&status=${statusFilter}&page=${page}&limit=${limit}`)
      console.log('📋 Purchase orders response:', res)
      console.log('📋 Orders data:', res.data?.data?.orders || res.data?.orders)
      
      const orders = res.data?.data?.orders || res.data?.orders || []
      setData(orders)
      setTotal(res.data?.data?.total || res.data?.total || 0)
      
      console.log(`✅ Loaded ${orders.length} purchase orders`)
    } catch (err) {
      console.error('❌ Failed to fetch purchase orders:', err)
      toast.error('Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page, limit])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const columns = [
    { title: '#',       key: '_idx',        width: 50, align: 'center', render: (_, __, i) => (page - 1) * limit + i + 1 },
    { title: 'PO No.',  key: 'poNo',         render: (v) => <span style={{ fontWeight: 700, color: '#0c3b73' }}>{v}</span> },
    { title: 'Supplier',key: 'supplier' },
    { title: 'Items',   key: 'items',        align: 'center' },
    { title: 'Amount',  key: 'totalAmount',  render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}` },
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
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{ ...searchInput, paddingLeft: 32 }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1) }} style={selectStyle}>
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
        data={data}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(s) => { setLimit(s); setPage(1) }}
      />

      {createOpen && (
        <CreatePOModal
          open={createOpen}
          onClose={() => {
            setCreateOpen(false)
            setPrefilledData({ supplier: null, medicine: null })
          }}
          onSaved={() => { 
            console.log('✅ PO saved callback triggered')
            setCreateOpen(false)
            setPrefilledData({ supplier: null, medicine: null })
            
            // Small delay to ensure backend has saved
            setTimeout(() => {
              console.log('🔄 Refreshing purchase orders list...')
              fetchOrders()
            }, 500)
          }}
          prefilledSupplier={prefilledData.supplier}
          prefilledMedicine={prefilledData.medicine}
        />
      )}
      {detailOpen && <PODetailModal open={detailOpen} onClose={() => setDetailOpen(false)} data={selected} />}
    </div>
  )
}

const primaryBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0c3b73', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }
const searchInput = { width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 12px', fontSize: 13, outline: 'none', background: '#fff' }
const selectStyle = { height: 38, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 12px', fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer' }

export default PurchaseOrders
