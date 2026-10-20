import React, { useState, useEffect } from 'react';
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
  CFormSelect,
  CInputGroup,
  CFormInput,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react';
import { Package, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getRequest } from 'src/Helpers';

/**
 * Unified Order Tracking
 * 
 * Shows orders from BOTH:
 * - Purchase Module (source: 'purchase_module')
 * - Live Rates Module (source: 'live_rates_module')
 * 
 * Uses single PurchaseOrder collection with 'source' field for tracking
 */

const UnifiedOrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch orders from Purchase module
      const purchaseResponse = await getRequest('/franchise/purchase/orders');
      const purchaseOrders = purchaseResponse?.data?.orders || [];

      // Fetch orders from Live Rates module (now uses same PurchaseOrder collection)
      const liveRatesResponse = await getRequest('/franchise/live-rates/order-tracking/all');
      const liveRatesOrders = liveRatesResponse?.data?.orders || [];

      // Combine and deduplicate (in case both APIs return same data)
      const allOrders = [...purchaseOrders];
      
      // Add live rates orders that aren't already in the list
      liveRatesOrders.forEach(lro => {
        const exists = allOrders.find(po => po._id === lro._id || po.id === lro.id);
        if (!exists) {
          allOrders.push({
            ...lro,
            poNo: lro.id,
            source: 'live_rates_module',
          });
        }
      });

      setOrders(allOrders);
    } catch (err) {
      console.error('Error fetching unified orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getSourceBadge = (source) => {
    if (source === 'purchase_module') {
      return <CBadge color="primary">Purchase Module</CBadge>;
    }
    return <CBadge color="info">Live Rates Module</CBadge>;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: 'secondary',
      pending: 'warning',
      Pending: 'warning',
      accepted: 'info',
      Confirmed: 'info',
      dispatched: 'primary',
      Packed: 'primary',
      'In Transit': 'primary',
      'Out for Delivery': 'success',
      completed: 'success',
      Delivered: 'success',
      cancelled: 'danger',
      Cancelled: 'danger',
    };
    return (
      <CBadge color={statusColors[status] || 'secondary'}>
        {status || 'Unknown'}
      </CBadge>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSource = sourceFilter === 'all' || order.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || 
      (order.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = !searchQuery || 
      (order.poNo || order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.supplier || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSource && matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    purchase: orders.filter(o => o.source === 'purchase_module').length,
    liveRates: orders.filter(o => o.source === 'live_rates_module').length,
    pending: orders.filter(o => ['pending', 'Pending', 'draft'].includes(o.status)).length,
    completed: orders.filter(o => ['completed', 'Delivered'].includes(o.status)).length,
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-3">Loading unified orders...</p>
      </div>
    );
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol xs={12}>
          <h4 className="mb-0">Unified Order Tracking</h4>
          <p className="text-medium-emphasis">
            All orders from Purchase Module and Live Rates Module in one place
          </p>
        </CCol>
      </CRow>

      {/* Statistics Cards */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CCard className="border-start border-start-4 border-start-primary">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-medium-emphasis text-uppercase fw-semibold small">
                    Total Orders
                  </div>
                  <div className="fs-4 fw-semibold">{stats.total}</div>
                </div>
                <Package size={40} className="text-primary opacity-25" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard className="border-start border-start-4 border-start-info">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-medium-emphasis text-uppercase fw-semibold small">
                    Purchase Module
                  </div>
                  <div className="fs-4 fw-semibold">{stats.purchase}</div>
                </div>
                <TrendingUp size={40} className="text-info opacity-25" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard className="border-start border-start-4 border-start-warning">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-medium-emphasis text-uppercase fw-semibold small">
                    Live Rates
                  </div>
                  <div className="fs-4 fw-semibold">{stats.liveRates}</div>
                </div>
                <Clock size={40} className="text-warning opacity-25" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard className="border-start border-start-4 border-start-success">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-medium-emphasis text-uppercase fw-semibold small">
                    Completed
                  </div>
                  <div className="fs-4 fw-semibold">{stats.completed}</div>
                </div>
                <CheckCircle size={40} className="text-success opacity-25" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Filters */}
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol md={4}>
              <CFormSelect
                label="Filter by Source"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="all">All Sources</option>
                <option value="purchase_module">Purchase Module</option>
                <option value="live_rates_module">Live Rates Module</option>
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormSelect
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CInputGroup>
                <CFormInput
                  placeholder="Search by Order ID or Supplier"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  label="Search"
                />
              </CInputGroup>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Orders Table */}
      <CCard>
        <CCardHeader>
          <strong>All Orders</strong>
          <span className="text-medium-emphasis ms-2">
            ({filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'})
          </span>
        </CCardHeader>
        <CCardBody>
          {error && (
            <CAlert color="danger" dismissible onClose={() => setError(null)}>
              <AlertCircle size={16} className="me-2" />
              {error}
            </CAlert>
          )}

          {filteredOrders.length === 0 ? (
            <div className="text-center py-5 text-medium-emphasis">
              <Package size={48} className="mb-3 opacity-25" />
              <p>No orders found matching your filters</p>
            </div>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Order ID</CTableHeaderCell>
                  <CTableHeaderCell>Source</CTableHeaderCell>
                  <CTableHeaderCell>Supplier</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Items</CTableHeaderCell>
                  <CTableHeaderCell>Amount</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredOrders.map((order) => (
                  <CTableRow key={order._id || order.id}>
                    <CTableDataCell>
                      <strong>{order.poNo || order.id}</strong>
                    </CTableDataCell>
                    <CTableDataCell>
                      {getSourceBadge(order.source)}
                    </CTableDataCell>
                    <CTableDataCell>{order.supplier || 'N/A'}</CTableDataCell>
                    <CTableDataCell>
                      {order.date || new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </CTableDataCell>
                    <CTableDataCell>{order.items?.length || 0}</CTableDataCell>
                    <CTableDataCell>
                      ₹{(order.grandTotal || order.totalAmount || 0).toLocaleString('en-IN')}
                    </CTableDataCell>
                    <CTableDataCell>
                      {getStatusBadge(order.status)}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="primary"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (order.source === 'live_rates_module') {
                            window.location.href = `#/franchise/live-rates/order-tracking`;
                          } else {
                            window.location.href = `#/franchise/purchase/orders`;
                          }
                        }}
                      >
                        View
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default UnifiedOrderTracking;
