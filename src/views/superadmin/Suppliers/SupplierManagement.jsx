import React, { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react'
import { getRequest, postRequest } from '../../../Helpers'

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [stats, setStats] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    password: '',
    phone: '',
    businessType: 'Distributor',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  })

  useEffect(() => {
    console.log('✅ SupplierManagement Component Mounted')
    fetchSuppliers()
    fetchStats()
  }, [])

  const fetchSuppliers = async () => {
    console.log('🚀 Fetching suppliers...')
    setLoading(true)
    setError(null)
    
    try {
      const token = Cookies.get('accessToken') || Cookies.get('SA_TOKEN') || Cookies.get('LMS')
      console.log('🔑 Token exists:', !!token)
      console.log('📡 Making request to: /api/suppliers/admin/list')
      
      const response = await getRequest('suppliers/admin/list?page=1&limit=50')
      console.log('📡 Full Response:', response)
      console.log('📊 Response data:', response?.data)
      
      if (response?.data?.success !== false) {
        const suppliersList = response?.data?.data?.suppliers || response?.data?.suppliers || []
        setSuppliers(suppliersList)
        console.log('✅ Loaded', suppliersList.length, 'suppliers')
      } else {
        setError(response?.data?.message || 'Failed to load suppliers')
      }
    } catch (error) {
      console.error('❌ Error fetching suppliers:', error)
      setError(error?.response?.data?.message || error.message || 'Failed to fetch suppliers')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await getRequest('suppliers/admin/stats')
      if (response?.data?.success !== false) {
        setStats(response?.data?.data?.general || response?.data?.general)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    
    try {
      console.log('📤 Creating supplier:', formData)
      const response = await postRequest({
        url: 'suppliers/admin/create',
        cred: formData
      })
      
      console.log('✅ Supplier created:', response)
      setSuccess('Supplier created successfully!')
      setShowModal(false)
      resetForm()
      fetchSuppliers()
      fetchStats()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('❌ Error creating supplier:', error)
      setError(error?.response?.data?.message || error.message || 'Failed to create supplier')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      password: '',
      phone: '',
      businessType: 'Distributor',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    })
  }

  const getStatusBadge = (status) => {
    const colorMap = {
      Active: 'success',
      Pending: 'warning',
      Suspended: 'danger',
      Inactive: 'secondary'
    }
    return <CBadge color={colorMap[status] || 'secondary'}>{status}</CBadge>
  }

  console.log('🎨 Rendering with', suppliers.length, 'suppliers')

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Supplier Management</h2>
          <p className="text-muted">Manage all suppliers for all franchises</p>
        </div>
        <div className="d-flex gap-2">
          <CButton color="secondary" onClick={fetchSuppliers} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : '🔄'} Refresh
          </CButton>
          <CButton color="primary" onClick={() => setShowModal(true)}>
            + Add Supplier
          </CButton>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <CCard className="text-center">
              <CCardBody>
                <h5 className="text-muted">Active Suppliers</h5>
                <h2 className="text-success">{stats.activeSuppliers || 0}</h2>
              </CCardBody>
            </CCard>
          </div>
          <div className="col-md-3">
            <CCard className="text-center">
              <CCardBody>
                <h5 className="text-muted">Pending</h5>
                <h2 className="text-warning">{stats.pendingSuppliers || 0}</h2>
              </CCardBody>
            </CCard>
          </div>
          <div className="col-md-3">
            <CCard className="text-center">
              <CCardBody>
                <h5 className="text-muted">Suspended</h5>
                <h2 className="text-danger">{stats.suspendedSuppliers || 0}</h2>
              </CCardBody>
            </CCard>
          </div>
          <div className="col-md-3">
            <CCard className="text-center">
              <CCardBody>
                <h5 className="text-muted">Total</h5>
                <h2 className="text-primary">{stats.totalSuppliers || 0}</h2>
              </CCardBody>
            </CCard>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
          <strong>Success!</strong> {success}
        </CAlert>
      )}

      {/* Error Alert */}
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)}>
          <strong>Error:</strong> {error}
        </CAlert>
      )}

      {/* Suppliers Table */}
      <CCard>
        <CCardHeader>
          <strong>Suppliers ({suppliers.length})</strong>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p className="mt-2">Loading suppliers...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No suppliers found</p>
              <CButton color="primary" onClick={() => setShowModal(true)}>
                + Add First Supplier
              </CButton>
            </div>
          ) : (
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Company Name</CTableHeaderCell>
                  <CTableHeaderCell>Contact Person</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Phone</CTableHeaderCell>
                  <CTableHeaderCell>Business Type</CTableHeaderCell>
                  <CTableHeaderCell>City</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {suppliers.map((supplier, index) => (
                  <CTableRow key={supplier._id}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell><strong>{supplier.companyName}</strong></CTableDataCell>
                    <CTableDataCell>{supplier.contactPerson}</CTableDataCell>
                    <CTableDataCell>{supplier.email}</CTableDataCell>
                    <CTableDataCell>{supplier.phone}</CTableDataCell>
                    <CTableDataCell>{supplier.businessType}</CTableDataCell>
                    <CTableDataCell>{supplier.address?.city || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{getStatusBadge(supplier.status)}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="info" size="sm" className="me-1">
                        View
                      </CButton>
                      <CButton color="warning" size="sm">
                        Edit
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Add Supplier Modal */}
      <CModal size="lg" visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Add New Supplier</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Company Name *</CFormLabel>
                <CFormInput
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. ABC Pharmaceuticals"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Contact Person *</CFormLabel>
                <CFormInput
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                  placeholder="Full name"
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Email *</CFormLabel>
                <CFormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="supplier@example.com"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Password *</CFormLabel>
                <CFormInput
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Min 6 characters"
                  minLength={6}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Phone *</CFormLabel>
                <CFormInput
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Business Type *</CFormLabel>
                <CFormSelect
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Service Provider">Service Provider</option>
                </CFormSelect>
              </CCol>
            </CRow>

            <hr className="my-3" />
            <h6>Address Details</h6>

            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel>Street Address *</CFormLabel>
                <CFormInput
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  required
                  placeholder="Building, Street, Area"
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>City *</CFormLabel>
                <CFormInput
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  required
                  placeholder="City"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>State *</CFormLabel>
                <CFormInput
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  required
                  placeholder="State"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Pincode *</CFormLabel>
                <CFormInput
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                  required
                  placeholder="6-digit pincode"
                  pattern="[0-9]{6}"
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)} disabled={submitting}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit" disabled={submitting}>
              {submitting ? <><CSpinner size="sm" className="me-2" /> Creating...</> : 'Create Supplier'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}

export default SupplierManagement
