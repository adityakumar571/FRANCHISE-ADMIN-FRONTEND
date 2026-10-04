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
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSelect,
  CFormTextarea,
  CFormInput,
} from '@coreui/react'
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  User,
  Building,
  Phone,
  Mail,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRequest, putRequest } from '../../Helpers'

const SupplierOrderDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [remarks, setRemarks] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courierName, setCourierName] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const supplierId = localStorage.getItem('supplierId')
      const response = await getRequest(`/api/franchise/suppliers/orders/${id}?supplierId=${supplierId}`)
      if (response.success) {
        setOrder(response.data)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!newStatus) return

    try {
      setUpdatingStatus(true)
      const response = await putRequest(`/api/franchise/suppliers/orders/${id}/status`, {
        status: newStatus,
        remarks,
        trackingNumber: trackingNumber || undefined,
        courierName: courierName || undefined,
      })

      if (response.success) {
        setOrder(prev => ({
          ...prev,
          status: newStatus,
          supplierRemarks: remarks,
          trackingNumber: trackingNumber || prev.trackingNumber,
          courierName: courierName || prev.courierName,
        }))
        setShowStatusModal(false)
        resetStatusModal()
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const resetStatusModal = () => {
    setNewStatus('')
    setRemarks('')
    setTrackingNumber('')
    setCourierName('')
  }

  const openStatusModal = () => {
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
    return <CBadge color={config.color} className="px-3 py-2">{config.text}</CBadge>
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-5">
        <p>Order not found</p>
        <CButton color="primary" onClick={() => navigate('/supplier/orders')}>
          Back to Orders
        </CButton>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <CButton
            color="light"
            onClick={() => navigate('/supplier/orders')}
            className="d-flex align-items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </CButton>
          <div>
            <h4 className="mb-0">Order #{order.orderId}</h4>
            <small className="text-muted">Placed on {formatDate(order.createdAt)}</small>
          </div>
        </div>
        <div className="d-flex gap-2">
          {getStatusBadge(order.status)}
          <CButton
            color="primary"
            onClick={openStatusModal}
            disabled={order.status === 'delivered' || order.status === 'cancelled'}
          >
            Update Status
          </CButton>
        </div>
      </div>

      <CRow>
        {/* Left Column */}
        <CCol lg={8}>
          {/* Order Items */}
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex align-items-center gap-2">
                <Package size={18} />
                <strong>Order Items</strong>
              </div>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Product</CTableHeaderCell>
                    <CTableHeaderCell>Category</CTableHeaderCell>
                    <CTableHeaderCell>Quantity</CTableHeaderCell>
                    <CTableHeaderCell>Price</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {order.products?.map((product, idx) => (
                    <CTableRow key={idx}>
                      <CTableDataCell>
                        <div>
                          <strong>{product.productName}</strong>
                          {product.productCode && (
                            <div className="small text-muted">{product.productCode}</div>
                          )}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="info">{product.category || 'N/A'}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {product.quantity} {product.unit || 'pcs'}
                      </CTableDataCell>
                      <CTableDataCell>{formatCurrency(product.pricePerUnit)}</CTableDataCell>
                      <CTableDataCell>
                        <strong>{formatCurrency(product.totalPrice)}</strong>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              {/* Order Summary */}
              <div className="mt-4 border-top pt-3">
                <CRow>
                  <CCol md={6} className="ms-auto">
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td>Subtotal:</td>
                          <td className="text-end">{formatCurrency(order.subtotal)}</td>
                        </tr>
                        {order.discount > 0 && (
                          <tr>
                            <td>Discount:</td>
                            <td className="text-end text-success">
                              - {formatCurrency(order.discount)}
                            </td>
                          </tr>
                        )}
                        {order.tax > 0 && (
                          <tr>
                            <td>Tax:</td>
                            <td className="text-end">{formatCurrency(order.tax)}</td>
                          </tr>
                        )}
                        {order.shippingCharges > 0 && (
                          <tr>
                            <td>Shipping:</td>
                            <td className="text-end">{formatCurrency(order.shippingCharges)}</td>
                          </tr>
                        )}
                        <tr className="fw-bold">
                          <td>Total:</td>
                          <td className="text-end fs-5">{formatCurrency(order.totalAmount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </CCol>
                </CRow>
              </div>
            </CCardBody>
          </CCard>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <CCard className="mb-4">
              <CCardHeader>
                <div className="d-flex align-items-center gap-2">
                  <MapPin size={18} />
                  <strong>Delivery Address</strong>
                </div>
              </CCardHeader>
              <CCardBody>
                <p className="mb-2">{order.deliveryAddress.address}</p>
                <p className="mb-2">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} -{' '}
                  {order.deliveryAddress.pincode}
                </p>
                {order.deliveryAddress.contactPerson && (
                  <p className="mb-1">
                    <User size={14} className="me-2" />
                    {order.deliveryAddress.contactPerson}
                  </p>
                )}
                {order.deliveryAddress.contactNumber && (
                  <p className="mb-0">
                    <Phone size={14} className="me-2" />
                    {order.deliveryAddress.contactNumber}
                  </p>
                )}
              </CCardBody>
            </CCard>
          )}

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <CCard className="mb-4">
              <CCardHeader>
                <div className="d-flex align-items-center gap-2">
                  <Clock size={18} />
                  <strong>Status History</strong>
                </div>
              </CCardHeader>
              <CCardBody>
                <div className="timeline">
                  {order.statusHistory.map((history, idx) => (
                    <div key={idx} className="timeline-item mb-3">
                      <div className="d-flex align-items-start gap-3">
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: '#0d6efd',
                            marginTop: 6,
                          }}
                        />
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <strong className="text-capitalize">{history.status}</strong>
                            <small className="text-muted">{formatDate(history.timestamp)}</small>
                          </div>
                          {history.updatedBy && (
                            <small className="text-muted">By: {history.updatedBy}</small>
                          )}
                          {history.remarks && <p className="mb-0 mt-1">{history.remarks}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CCardBody>
            </CCard>
          )}
        </CCol>

        {/* Right Column */}
        <CCol lg={4}>
          {/* Franchise Details */}
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex align-items-center gap-2">
                <Building size={18} />
                <strong>Franchise Details</strong>
              </div>
            </CCardHeader>
            <CCardBody>
              <h6>{order.franchiseName}</h6>
              <p className="text-muted mb-2">Code: {order.franchiseCode}</p>
            </CCardBody>
          </CCard>

          {/* Payment Info */}
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex align-items-center gap-2">
                <CreditCard size={18} />
                <strong>Payment Information</strong>
              </div>
            </CCardHeader>
            <CCardBody>
              <div className="mb-2">
                <small className="text-muted">Payment Status</small>
                <div>
                  <CBadge
                    color={
                      order.paymentStatus === 'paid'
                        ? 'success'
                        : order.paymentStatus === 'partial'
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    {order.paymentStatus}
                  </CBadge>
                </div>
              </div>
              <div>
                <small className="text-muted">Payment Method</small>
                <div className="text-capitalize">{order.paymentMethod || 'N/A'}</div>
              </div>
            </CCardBody>
          </CCard>

          {/* Shipping Info */}
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex align-items-center gap-2">
                <Truck size={18} />
                <strong>Shipping Information</strong>
              </div>
            </CCardHeader>
            <CCardBody>
              {order.trackingNumber && (
                <div className="mb-2">
                  <small className="text-muted">Tracking Number</small>
                  <div>
                    <strong>{order.trackingNumber}</strong>
                  </div>
                </div>
              )}
              {order.courierName && (
                <div className="mb-2">
                  <small className="text-muted">Courier</small>
                  <div>{order.courierName}</div>
                </div>
              )}
              {order.dispatchDate && (
                <div className="mb-2">
                  <small className="text-muted">Dispatch Date</small>
                  <div>{formatDate(order.dispatchDate)}</div>
                </div>
              )}
              {order.expectedDeliveryDate && (
                <div className="mb-2">
                  <small className="text-muted">Expected Delivery</small>
                  <div>{formatDate(order.expectedDeliveryDate)}</div>
                </div>
              )}
              {order.actualDeliveryDate && (
                <div>
                  <small className="text-muted">Delivered On</small>
                  <div>{formatDate(order.actualDeliveryDate)}</div>
                </div>
              )}
            </CCardBody>
          </CCard>

          {/* Notes */}
          {(order.notes || order.supplierRemarks) && (
            <CCard>
              <CCardHeader>
                <div className="d-flex align-items-center gap-2">
                  <FileText size={18} />
                  <strong>Notes & Remarks</strong>
                </div>
              </CCardHeader>
              <CCardBody>
                {order.notes && (
                  <div className="mb-3">
                    <small className="text-muted">Order Notes</small>
                    <p className="mb-0">{order.notes}</p>
                  </div>
                )}
                {order.supplierRemarks && (
                  <div>
                    <small className="text-muted">Supplier Remarks</small>
                    <p className="mb-0">{order.supplierRemarks}</p>
                  </div>
                )}
              </CCardBody>
            </CCard>
          )}
        </CCol>
      </CRow>

      {/* Update Status Modal */}
      <CModal visible={showStatusModal} onClose={() => setShowStatusModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Update Order Status</CModalTitle>
        </CModalHeader>
        <CModalBody>
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

export default SupplierOrderDetails
