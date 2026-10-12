/* eslint-disable prettier/prettier */
/**
 * Supplier Order Management - View and manage purchase orders from franchises
 */
import { useState, useEffect, useCallback } from 'react'
import { Package, Search, Eye, Check, X, Truck } from 'lucide-react'
import { getRequest, postRequest, putRequest } from '../../Helpers'
import toast from 'react-hot-toast'

const OrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(20)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDispatchModal, setShowDispatchModal] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/suppliers/orders?search=${encodeURIComponent(search)}&status=${statusFilter}&page=${page}&limit=${limit}`)
      console.log('📦 Supplier orders:', res.data)
      setOrders(res.data?.data?.orders || res.data?.orders || [])
      setTotal(res.data?.data?.total || res.data?.total || 0)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page, limit])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleAccept = async (orderId) => {
    try {
      await putRequest({ 
        url: `/suppliers/orders/${orderId}/status`, 
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
        url: `/suppliers/orders/${orderId}/status`, 
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
        url: `/suppliers/orders/${selectedOrder._id}/dispatch`, 
        cred: dispatchData 
      })
      toast.success('Order marked as dispatched!')
      setShowDispatchModal(false)
      fetchOrders()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to dispatch order')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      accepted: '#3b82f6',
      rejected: '#ef4444',
      dispatched: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#6b7280'
    }
    return colors[status] || '#6b7280'
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Package size={28} color="#0c3b73" />
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>Purchase Orders</h1>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Manage orders from franchises
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search PO number, franchise..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '40px',
              paddingRight: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          style={{
            height: '40px',
            padding: '0 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="dispatched">Dispatched</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ margin: 0 }}>No orders found</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '16px' }}>
            {orders.map((order) => (
              <div
                key={order._id}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '20px',
                  alignItems: 'center'
                }}
              >
                {/* Status Indicator */}
                <div
                  style={{
                    width: '4px',
                    height: '60px',
                    borderRadius: '2px',
                    background: getStatusColor(order.status)
                  }}
                />

                {/* Order Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#0c3b73' }}>
                      {order.poNo}
                    </span>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status),
                        textTransform: 'uppercase'
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#6b7280' }}>
                    <span><strong>Franchise:</strong> {order.franchiseName}</span>
                    <span><strong>Items:</strong> {order.items}</span>
                    <span><strong>Amount:</strong> ₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    <span><strong>Date:</strong> {order.createdAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowDetailModal(true)
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      background: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151'
                    }}
                  >
                    <Eye size={16} />
                    View
                  </button>

                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(order._id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#10b981',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                      >
                        <Check size={16} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(order._id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#ef4444',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </>
                  )}

                  {order.status === 'accepted' && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowDispatchModal(true)
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#8b5cf6',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      <Truck size={16} />
                      Dispatch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: page === 1 ? '#f3f4f6' : '#fff',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Previous
            </button>
            <span style={{ padding: '8px 16px', fontSize: '14px', color: '#6b7280' }}>
              Page {page} of {Math.ceil(total / limit) || 1}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: page >= Math.ceil(total / limit) ? '#f3f4f6' : '#fff',
                cursor: page >= Math.ceil(total / limit) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedOrder(null)
          }}
        />
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && selectedOrder && (
        <DispatchModal
          order={selectedOrder}
          onClose={() => {
            setShowDispatchModal(false)
            setSelectedOrder(null)
          }}
          onDispatch={handleDispatch}
        />
      )}
    </div>
  )
}

// Order Detail Modal Component
const OrderDetailModal = ({ order, onClose }) => {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getRequest(`/suppliers/orders/${order._id}`)
        setDetails(res.data?.data || res.data)
      } catch (err) {
        toast.error('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [order._id])

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
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Order Details - {order.poNo}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={24} color="#6b7280" />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading...</div>
        ) : details ? (
          <>
            {/* Order Info */}
            <div style={{ marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: '#6b7280' }}>Status:</span>
                  <span style={{ marginLeft: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
                    {details.status}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Total Amount:</span>
                  <span style={{ marginLeft: '8px', fontWeight: 600 }}>
                    ₹{details.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Expected Date:</span>
                  <span style={{ marginLeft: '8px', fontWeight: 600 }}>
                    {details.expectedDate || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Created:</span>
                  <span style={{ marginLeft: '8px', fontWeight: 600 }}>
                    {new Date(details.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {details.notes && (
                <div style={{ marginTop: '12px' }}>
                  <span style={{ color: '#6b7280' }}>Notes:</span>
                  <p style={{ margin: '4px 0 0', fontSize: '14px' }}>{details.notes}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Order Items</h3>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Medicine</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Qty</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>PTR</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.items?.map((item, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.medicineName}</div>
                            {item.salt && (
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.salt}</div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{item.qty}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.ptr}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                          ₹{item.amount?.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            Failed to load order details
          </div>
        )}
      </div>
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
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={24} color="#6b7280" />
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
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
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
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
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
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
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
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
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
              }}
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

export default OrderManagement
