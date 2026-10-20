/* eslint-disable prettier/prettier */
/**
 * Supplier Order Management - EXACT COPY of franchise PurchaseOrders pattern
 */
import { useState, useEffect, useCallback } from 'react'
import { FileText, Search, Eye, Check, X, Truck } from 'lucide-react'
import { getRequest, putRequest, postRequest } from '../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from './components/PageHeader'
import DataTable from './components/DataTable'
import StatusBadge from './components/StatusBadge'

const OrderManagement = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = useCallback(async () => {
    console.log('📦 Fetching supplier orders...')
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: search,
        status: statusFilter,
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (fromDate) params.append('fromDate', fromDate)
      if (toDate) params.append('toDate', toDate)
      
      const res = await getRequest(`/franchise/suppliers/orders?${params.toString()}`)
      console.log('📦 Supplier orders response:', res)
      
      const orders = res.data?.data?.orders || res.data?.orders || []
      setData(orders)
      setTotal(res.data?.data?.total || res.data?.total || 0)
      
      console.log(`✅ Loaded ${orders.length} supplier orders`)
    } catch (err) {
      console.error('❌ Failed to fetch supplier orders:', err)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, fromDate, toDate, page, limit])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleAccept = async (orderId) => {
    try {
      await putRequest({ 
        url: `/franchise/suppliers/orders/${orderId}/status`, 
        cred: { status: 'accepted' } 
      })
      toast.success('Order accepted successfully!')
      fetchOrders()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to accept order')
    }
  }

  const handleReject = async (orderId) => {
    const reason = prompt('Rejection reason (optional):')
    try {
      await putRequest({ 
        url: `/franchise/suppliers/orders/${orderId}/status`, 
        cred: { status: 'rejected', rejectionReason: reason } 
      })
      toast.success('Order rejected')
      fetchOrders()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject order')
    }
  }

  const handleDispatch = async (dispatchData) => {
    try {
      await postRequest({ 
        url: `/franchise/suppliers/orders/${selectedOrder._id}/dispatch`, 
        cred: dispatchData 
      })
      toast.success('Order marked as dispatched!')
      setDispatchModalOpen(false)
      setSelectedOrder(null)
      fetchOrders()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to dispatch order')
    }
  }

  const columns = [
    { title: '#', key: '_idx', width: 50, align: 'center', render: (_, __, i) => (page - 1) * limit + i + 1 },
    { title: 'PO No.', key: 'poNo', render: (v) => <span style={{ fontWeight: 700, color: '#0c3b73' }}>{v}</span> },
    { title: 'Franchise', key: 'franchiseName' },
    { title: 'Items', key: 'items', align: 'center' },
    { title: 'Amount', key: 'totalAmount', render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}` },
    { title: 'Date', key: 'createdAt', render: (v) => v || '—' },
    { title: 'Expected', key: 'expectedDate', render: (v) => v || '—' },
    { title: 'Status', key: 'status', align: 'center', render: (v) => <StatusBadge status={v} /> },
    { 
      title: 'Actions', 
      key: '_actions', 
      align: 'center', 
      width: 150, 
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <button 
            onClick={() => window.alert('View details for: ' + row.poNo)}
            style={actionBtn('#0c3b73')}
            title="View Details"
          >
            <Eye size={13} />
          </button>
          
          {row.status === 'pending' && (
            <>
              <button 
                onClick={() => handleAccept(row._id)}
                style={actionBtn('#16a34a')}
                title="Accept Order"
              >
                <Check size={13} />
              </button>
              <button 
                onClick={() => handleReject(row._id)}
                style={actionBtn('#e11d48')}
                title="Reject Order"
              >
                <X size={13} />
              </button>
            </>
          )}

          {row.status === 'accepted' && (
            <button 
              onClick={() => {
                setSelectedOrder(row)
                setDispatchModalOpen(true)
              }}
              style={actionBtn('#8b5cf6')}
              title="Dispatch Order"
            >
              <Truck size={13} />
            </button>
          )}
        </div>
      )
    },
  ]

  return (
    <div>
      <PageHeader 
        icon={FileText} 
        title="Purchase Orders" 
        subtitle="Manage orders from franchises" 
        color="#7c3aed" 
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input 
            type="text" 
            placeholder="Search PO number, franchise…" 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{ ...searchInput, paddingLeft: 32 }} 
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} 
          style={selectStyle}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="dispatched">Dispatched</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(1) }}
          placeholder="From Date"
          style={dateInput}
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1) }}
          placeholder="To Date"
          style={dateInput}
        />
        {(fromDate || toDate) && (
          <button
            onClick={() => { setFromDate(''); setToDate(''); setPage(1) }}
            style={clearBtn}
          >
            Clear Dates
          </button>
        )}
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
        emptyText="No orders found"
      />

      {dispatchModalOpen && selectedOrder && (
        <DispatchModal
          order={selectedOrder}
          onClose={() => {
            setDispatchModalOpen(false)
            setSelectedOrder(null)
          }}
          onDispatch={handleDispatch}
        />
      )}
    </div>
  )
}

// Dispatch Modal Component
const DispatchModal = ({ order, onClose, onDispatch }) => {
  const [formData, setFormData] = useState({
    trackingNumber: '',
    courierName: '',
    expectedDelivery: '',
    notes: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.trackingNumber || !formData.courierName) {
      toast.error('Please fill in tracking number and courier name')
      return
    }
    onDispatch(formData)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Dispatch Order - {order.poNo}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '24px', color: '#6b7280' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                Tracking Number *
              </label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                placeholder="Enter tracking number"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                Courier Name *
              </label>
              <input
                type="text"
                value={formData.courierName}
                onChange={(e) => setFormData({ ...formData, courierName: e.target.value })}
                placeholder="e.g., BlueDart, DTDC"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                Expected Delivery
              </label>
              <input
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional dispatch notes"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={submitBtn}
            >
              <Truck size={16} />
              Mark as Dispatched
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Reusable styles - EXACT SAME as franchise portal
const actionBtn = (color) => ({ 
  width: 30, 
  height: 30, 
  borderRadius: 6, 
  border: `1px solid ${color}20`, 
  background: `${color}10`, 
  color: color, 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  transition: 'all 0.2s'
})

const searchInput = { 
  width: '100%', 
  height: 38, 
  border: '1px solid #e5e7eb', 
  borderRadius: 8, 
  padding: '0 12px', 
  fontSize: 13, 
  outline: 'none', 
  background: '#fff' 
}

const selectStyle = { 
  height: 38, 
  border: '1px solid #e5e7eb', 
  borderRadius: 8, 
  padding: '0 12px', 
  fontSize: 13, 
  outline: 'none', 
  background: '#fff', 
  cursor: 'pointer' 
}

const dateInput = { 
  height: 38, 
  border: '1px solid #e5e7eb', 
  borderRadius: 8, 
  padding: '0 12px', 
  fontSize: 13, 
  outline: 'none', 
  background: '#fff', 
  cursor: 'pointer',
  minWidth: 150
}

const clearBtn = {
  height: 38,
  padding: '0 16px',
  borderRadius: 8,
  border: '1px solid #ef4444',
  background: '#fff',
  color: '#ef4444',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer'
}

const inputStyle = {
  width: '100%',
  height: '40px',
  padding: '0 12px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none'
}

const cancelBtn = {
  padding: '10px 20px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600
}

const submitBtn = {
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  background: '#8b5cf6',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}

export default OrderManagement
