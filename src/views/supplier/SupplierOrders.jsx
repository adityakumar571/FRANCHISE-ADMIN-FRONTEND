/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { FileText, Search, Eye, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getRequest, putRequest } from '../../Helpers'
import toast from 'react-hot-toast'

// Import franchise components
import PageHeader from '../franchise/components/PageHeader'
import DataTable from '../franchise/components/DataTable'
import StatusBadge from '../franchise/components/StatusBadge'

const SupplierOrders = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatus] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  useEffect(() => {
    fetchOrders()
  }, [page, limit, search, statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      })

      const res = await getRequest(`/api/franchise/suppliers/orders?${params}`)
      
      if (res.success || res.data) {
        const orders = res.data?.orders || res.data?.data?.orders || []
        setData(orders)
        setTotal(res.data?.total || res.data?.data?.total || 0)
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '#', key: '_idx', width: 50, align: 'center', render: (_, __, i) => (page - 1) * limit + i + 1 },
    { title: 'PO No.', key: 'poNo', render: (v) => <span style={{ fontWeight: 700, color: '#0c3b73' }}>{v || '—'}</span> },
    { title: 'Franchise', key: 'franchiseName', render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600 }}>{v || '—'}</div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>{row.franchiseSubdomain}</div>
      </div>
    )},
    { title: 'Items', key: 'items', align: 'center' },
    { title: 'Amount', key: 'totalAmount', render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}` },
    { title: 'Date', key: 'createdAt', render: (v) => v || '—' },
    { title: 'Expected', key: 'expectedDate', render: (v) => v || '—' },
    { title: 'Status', key: 'status', align: 'center', render: (v) => <StatusBadge status={v} /> },
    { title: 'Actions', key: '_actions', align: 'center', width: 80, render: (_, row) => (
      <button 
        onClick={() => navigate(`/supplier/orders/${row._id}`)}
        style={{ 
          width: 30, 
          height: 30, 
          borderRadius: 6, 
          border: '1px solid #0c3b7320', 
          background: '#0c3b7310', 
          color: '#0c3b73', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto' 
        }}
      >
        <Eye size={13} />
      </button>
    )},
  ]

  return (
    <div>
      <PageHeader 
        icon={Package} 
        title="Purchase Orders" 
        subtitle="View and manage orders from franchises" 
        color="#7c3aed"
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input 
            type="text" 
            placeholder="Search PO number, franchise..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{ ...searchInput, paddingLeft: 32 }} 
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatus(e.target.value); setPage(1) }} 
          style={selectStyle}
        >
          <option value="">All Status</option>
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
    </div>
  )
}

const searchInput = {
  height: 38,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '0 12px',
  fontSize: 13,
  outline: 'none',
  background: '#fff',
  width: '100%',
}

const selectStyle = {
  height: 38,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '0 12px',
  fontSize: 13,
  outline: 'none',
  background: '#fff',
  cursor: 'pointer',
  minWidth: 150,
}

const primaryBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  background: '#7c3aed',
  color: '#fff',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
}

export default SupplierOrders

