import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CFormInput,
  CFormSelect,
  CButton,
  CSpinner,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
} from '@coreui/react'
import { Package, ShoppingCart, TrendingUp, Clock, Filter, Search, Eye, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getRequest, putRequest } from '../../Helpers'

const SupplierOrders = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const statusFromUrl = searchParams.get('status') || ''

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [filters, setFilters] = useState({
    search: '',
    status: statusFromUrl,
    orderType: '',
    fromDate: '',
    toDate: '',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Update status modal
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [remarks, setRemarks] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courierName, setCourierName] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [page, filters.status, filters.orderType, filters.fromDate, filters.toDate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const supplierId = localStorage.getItem('supplierId')
      const params = new URLSearchParams({
        supplierId,
        page,
        limit: 20,
        ...(filters.status && { status: filters.status }),
        ...(filters.orderType && { orderType: filters.orderType }),
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
      })

      const response = await getRequest(`/api/franchise/suppliers/orders?${params}`)
      if (response.success) {
        setOrders(response.data.orders)
        setTotalPages(response.data.totalPages)
        setStats(response.data.stats || {})
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      setUpdatingStatus(true)
      const response = await putRequest(`/api/franchise/suppliers/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        remarks,
        trackingNumber: trackingNumber || undefined,
        courierName: courierName || undefined,
      })

      if (response.success) {
        // Update order in list
        setOrders(prev =>
          prev.map(order =>
            order._id === selectedOrder._id
              ? { ...order, status: newStatus, supplierRemarks: remarks }
              : order
          )
        )
        setShowStatusModal(false)
        resetStatusModal()
        fetchOrders() // Refresh to get updated stats
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const resetStatusModal = () => {
    setSelectedOrder(null)
    setNewStatus('')
    setRemarks('')
    setTrackingNumber('')
    setCourierName('')
  }

  const openStatusModal = (order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setRemarks(order.supplierRemarks || '')
    setTrackingNumber(order.trackingNumber || '')
    setCourierName(order.courierName || '')
    setShowStatusModal(true)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Pending' },
      confirmed: { color: 'info', text: 'Confirmed' },
      processing: { color: 'primary', text: 'Processing' },
      dispatched: { color: 'success', text: 'Dispatched' },
      delivered: { color: 'success', text: 'Delivered' },
      cancelled: { color: 'danger', text: 'Cancelled' },
      rejected: { color: 'danger', text: 'Rejected' },
    }
    const config = statusConfig[status] || { color: 'secondary', text: status }
    return <CBadge color={config.color}>{config.text}</CBadge>
  }

  const getOrderTypeBadge = (type) => {
    const colors = {
      Medicine: 'primary',
      Dummy: 'warning',
      Equipment: 'info',
      Mixed: 'secondary',
    }
    return <CBadge color={colors[type] || 'secondary'}>{type}</CBadge>
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      {/* Stats Cards */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CCard className="mb-4" style={{ borderLeft: '4px solid #ffc107' }}>
            <CCardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-medium-emphasis small">Pending Orders</div>
                  <div className="fs-4 fw-semibold">{stats.pending || 0}</div>
                </div>
                <Clock size={40} color="#ffc107" style={{ opacity: 0.2 }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard className="mb-4" style={{ borderLeft: '4px solid #0d6efd' }}>
            <CCardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-medium-emphasis small">Processing</div>
                  <div className="fs-4 fw-semibold">{stats.processing || 0}</div>
                </div>
                <Package size={40} color="#0d6efd" style={{ opacity: 0.2 }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard className="mb-4" style={{ borderLeft: '4px solid #198754' }}>
            <CCardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-medium-emphasis small">Delivered</div>
                  <div className="fs-4 fw-semibold">{stats.delivered || 0}</div>
                </div>
                <CheckCircle size={40} color="#198754" style={{ opacity: 0.2 }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard className="mb-4" style={{ borderLeft: '4px solid #d97706' }}>
            <CCardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-medium-emphasis small">Total Revenue</div>
                  <div className="fs-4 fw-semibold">
                    {formatCurrency(stats.totalRevenue || 0)}
                  </div>
                </div>
                <TrendingUp size={40} color="#d97706" style={{ opacity: 0.2 }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Orders Table */}
      <CCard>
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <ShoppingCart size={20} />
              <strong>All Orders</strong>
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          {/* Filters */}
          <CRow className="mb-3">
            <CCol md={3}>
              <CFormInput
                type="text"
                placeholder="Search order ID, franchise..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </CCol>
            <CCol md={2}>
              <CFormSelect
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect
                value={filters.orderType}
                onChange={(e) => handleFilterChange('orderType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Medicine">Medicine</option>
                <option value="Dummy">Dummy</option>
                <option value="Equipment">Equipment</option>
                <option value="Mixed">Mixed</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormInput
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                placeholder="From Date"
              />
            </CCol>
            <CCol md={2}>
              <CFormInput
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                placeholder="To Date"
              />
            </CCol>
            <CCol md={1}>
              <CButton
                color="primary"
                onClick={fetchOrders}
                disabled={loading}
                className="w-100"
              >
                {loading ? <CSpinner size="sm" /> : <Search size={16} />}
              </CButton>
            </CCol>
          </CRow>

          {/* Table */}
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <ShoppingCart size={48} style={{ opacity: 0.3 }} />
              <p className="mt-3">No orders found</p>
            </div>
          ) : (
            <>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Order ID</CTableHeaderCell>
                    <CTableHeaderCell>Franchise</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Items</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {orders.map((order) => (
                    <CTableRow key={order._id}>
                      <CTableDataCell>
                        <strong>{order.orderId}</strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{order.franchiseName}</div>
                        <small className="text-muted">{order.franchiseCode}</small>
                      </CTableDataCell>
                      <CTableDataCell>{formatDate(order.createdAt)}</CTableDataCell>
                      <CTableDataCell>{getOrderTypeBadge(order.orderType)}</CTableDataCell>
                      <CTableDataCell>{order.products?.length || 0} items</CTableDataCell>
                      <CTableDataCell>
                        <strong>{formatCurrency(order.totalAmount)}</strong>
                      </CTableDataCell>
                      <CTableDataCell>{getStatusBadge(order.status)}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex gap-2">
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => navigate(`/supplier/orders/${order._id}`)}
                          >
                            <Eye size={14} />
                          </CButton>
                          <CButton
                            color="primary"
                            size="sm"
                            onClick={() => openStatusModal(order)}
                            disabled={order.status === 'delivered' || order.status === 'cancelled'}
                          >
                            Update
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              {/* Pagination */}
              {totalPages > 1 && (
                <CPagination align="center" className="mt-3">
                  <CPaginationItem
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </CPaginationItem>
                  {[...Array(totalPages)].map((_, idx) => (
                    <CPaginationItem
                      key={idx}
                      active={page === idx + 1}
                      onClick={() => setPage(idx + 1)}
                    >
                      {idx + 1}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </CPaginationItem>
                </CPagination>
              )}
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Update Status Modal */}
      <CModal visible={showStatusModal} onClose={() => setShowStatusModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Update Order Status</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedOrder && (
            <>
              <div className="mb-3">
                <strong>Order ID:</strong> {selectedOrder.orderId}
                <br />
                <strong>Franchise:</strong> {selectedOrder.franchiseName}
                <br />
                <strong>Current Status:</strong> {getStatusBadge(selectedOrder.status)}
              </div>

              <CRow>
                <CCol md={12} className="mb-3">
                  <label className="form-label">New Status</label>
                  <CFormSelect value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </CFormSelect>
                </CCol>

                {(newStatus === 'dispatched' || newStatus === 'delivered') && (
                  <>
                    <CCol md={6} className="mb-3">
                      <label className="form-label">Tracking Number</label>
                      <CFormInput
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number"
                      />
                    </CCol>
                    <CCol md={6} className="mb-3">
                      <label className="form-label">Courier Name</label>
                      <CFormInput
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        placeholder="e.g., Blue Dart, DTDC"
                      />
                    </CCol>
                  </>
                )}

                <CCol md={12} className="mb-3">
                  <label className="form-label">Remarks</label>
                  <CFormTextarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any remarks or notes..."
                  />
                </CCol>
              </CRow>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={handleUpdateStatus}
            disabled={updatingStatus || !newStatus}
          >
            {updatingStatus ? <CSpinner size="sm" /> : 'Update Status'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default SupplierOrders
