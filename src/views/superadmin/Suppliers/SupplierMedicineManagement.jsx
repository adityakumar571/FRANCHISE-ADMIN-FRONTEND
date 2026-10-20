import React, { useState, useEffect } from 'react'
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
  CFormTextarea,
  CRow,
  CCol,
  CFormCheck,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import MedicineAutocomplete from '../../../components/MedicineAutocomplete'
import { getRequest, postRequest } from '../../../Helpers'
import { toast } from 'react-toastify'

const SupplierMedicineManagement = () => {
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)

  const [medicineForm, setMedicineForm] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    category: '',
    strength: '',
    packSize: '',
    mrp: '',
    supplierPrice: '',
    stock: '',
    minOrderQuantity: 1,
    scheme: '',
    description: '',
    isAvailable: true,
    expiryDate: '',
  })

  // Fetch all suppliers on mount
  useEffect(() => {
    fetchSuppliers()
  }, [])

  // Fetch medicines when supplier is selected
  useEffect(() => {
    if (selectedSupplier) {
      fetchMedicines(selectedSupplier._id)
    }
  }, [selectedSupplier])

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const response = await getRequest('suppliers/admin/list?page=1&limit=100')
      if (response?.data?.success !== false) {
        const suppliersList = response?.data?.data?.suppliers || response?.data?.suppliers || []
        setSuppliers(suppliersList)
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      toast.error('Failed to fetch suppliers')
    } finally {
      setLoading(false)
    }
  }

  const fetchMedicines = async (supplierId) => {
    setLoading(true)
    try {
      const response = await getRequest(`suppliers/${supplierId}`)
      if (response?.data?.success !== false) {
        const supplier = response?.data?.data || response?.data
        setMedicines(supplier?.medicines || [])
      }
    } catch (error) {
      console.error('Error fetching medicines:', error)
      toast.error('Failed to fetch medicines')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setMedicineForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine)
    setMedicineForm((prev) => ({
      ...prev,
      genericName: medicine.genericName,
      category: medicine.category,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedSupplier) {
      toast.error('Please select a supplier first')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...medicineForm,
        mrp: parseFloat(medicineForm.mrp),
        supplierPrice: parseFloat(medicineForm.supplierPrice),
        stock: parseInt(medicineForm.stock),
        minOrderQuantity: parseInt(medicineForm.minOrderQuantity) || 1,
      }

      const response = await postRequest({
        url: `suppliers/${selectedSupplier._id}/medicines`,
        cred: payload,
      })

      if (response?.data?.success !== false) {
        toast.success('Medicine added successfully!')
        setShowModal(false)
        resetForm()
        fetchMedicines(selectedSupplier._id)
      }
    } catch (error) {
      console.error('Error adding medicine:', error)
      toast.error(error?.response?.data?.message || 'Failed to add medicine')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setMedicineForm({
      name: '',
      genericName: '',
      manufacturer: '',
      category: '',
      strength: '',
      packSize: '',
      mrp: '',
      supplierPrice: '',
      stock: '',
      minOrderQuantity: 1,
      scheme: '',
      description: '',
      isAvailable: true,
      expiryDate: '',
    })
    setSelectedMedicine(null)
  }

  const calculateDiscount = () => {
    const { mrp, supplierPrice } = medicineForm
    if (mrp && supplierPrice && parseFloat(mrp) > 0) {
      const discount = ((parseFloat(mrp) - parseFloat(supplierPrice)) / parseFloat(mrp)) * 100
      return discount.toFixed(2)
    }
    return '0'
  }

  const calculateGST = () => {
    const { supplierPrice } = medicineForm
    if (supplierPrice) {
      return (parseFloat(supplierPrice) * 0.12).toFixed(2)
    }
    return '0.00'
  }

  const calculateEffectiveRate = () => {
    const { supplierPrice } = medicineForm
    if (supplierPrice) {
      return (parseFloat(supplierPrice) * 1.12).toFixed(2)
    }
    return '0.00'
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Supplier Medicine Management</h2>
          <p className="text-muted">Add and manage medicines for suppliers</p>
        </div>
      </div>

      <CRow className="mb-4">
        {/* Supplier Selection */}
        <CCol md={12}>
          <CCard>
            <CCardHeader>
              <strong>Step 1: Select Supplier</strong>
            </CCardHeader>
            <CCardBody>
              {loading && !selectedSupplier ? (
                <div className="text-center py-3">
                  <CSpinner color="primary" size="sm" className="me-2" />
                  Loading suppliers...
                </div>
              ) : (
                <CRow>
                  {suppliers.map((supplier) => (
                    <CCol md={4} key={supplier._id} className="mb-3">
                      <CCard
                        className={`cursor-pointer ${
                          selectedSupplier?._id === supplier._id ? 'border-primary' : ''
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedSupplier(supplier)}
                      >
                        <CCardBody>
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong>{supplier.companyName}</strong>
                              <div className="small text-muted">{supplier.city || 'N/A'}</div>
                              <div className="small">
                                <CBadge color="info">
                                  {supplier.medicines?.length || 0} medicines
                                </CBadge>
                              </div>
                            </div>
                            {selectedSupplier?._id === supplier._id && (
                              <CBadge color="primary">Selected ✓</CBadge>
                            )}
                          </div>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))}
                </CRow>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Medicines List */}
      {selectedSupplier && (
        <CRow>
          <CCol md={12}>
            <CCard>
              <CCardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <strong>
                    Step 2: Medicines for {selectedSupplier.companyName} ({medicines.length})
                  </strong>
                  <CButton color="primary" onClick={() => setShowModal(true)}>
                    + Add Medicine
                  </CButton>
                </div>
              </CCardHeader>
              <CCardBody>
                {loading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                    <p className="mt-2">Loading medicines...</p>
                  </div>
                ) : medicines.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p>No medicines added yet</p>
                    <CButton color="primary" onClick={() => setShowModal(true)}>
                      + Add First Medicine
                    </CButton>
                  </div>
                ) : (
                  <CTable striped hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell>Generic Name</CTableHeaderCell>
                        <CTableHeaderCell>Strength</CTableHeaderCell>
                        <CTableHeaderCell>MRP</CTableHeaderCell>
                        <CTableHeaderCell>Supplier Price</CTableHeaderCell>
                        <CTableHeaderCell>Stock</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {medicines.map((medicine, index) => (
                        <CTableRow key={medicine._id || index}>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>
                            <strong>{medicine.name}</strong>
                            <div className="small text-muted">{medicine.manufacturer}</div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="info">{medicine.genericName}</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{medicine.strength}</CTableDataCell>
                          <CTableDataCell>₹{medicine.mrp}</CTableDataCell>
                          <CTableDataCell>₹{medicine.supplierPrice}</CTableDataCell>
                          <CTableDataCell>
                            {medicine.stock >= 100 ? (
                              <CBadge color="success">{medicine.stock}</CBadge>
                            ) : medicine.stock > 0 ? (
                              <CBadge color="warning">{medicine.stock}</CBadge>
                            ) : (
                              <CBadge color="danger">Out of Stock</CBadge>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={medicine.isAvailable ? 'success' : 'danger'}>
                              {medicine.isAvailable ? 'Available' : 'Unavailable'}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Add Medicine Modal */}
      <CModal size="xl" visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Add Medicine to {selectedSupplier?.companyName}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            {/* Generic Name with Autocomplete */}
            <CRow className="mb-3">
              <CCol md={6}>
                <MedicineAutocomplete
                  value={medicineForm.genericName}
                  onChange={(value) =>
                    setMedicineForm((prev) => ({ ...prev, genericName: value }))
                  }
                  onSelect={handleMedicineSelect}
                  label="Generic Medicine Name"
                  required
                />
                {selectedMedicine && (
                  <div className="mt-2">
                    <CBadge color="info" className="me-2">
                      {selectedMedicine.category}
                    </CBadge>
                    <span className="small text-muted">
                      Common brands: {selectedMedicine.commonBrands.slice(0, 3).join(', ')}
                    </span>
                  </div>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Brand/Product Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={medicineForm.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Dolo 650, Crocin Advance"
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>
                  Manufacturer <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="manufacturer"
                  value={medicineForm.manufacturer}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Micro Labs, Cipla"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Strength <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="strength"
                  value={medicineForm.strength}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 650mg, 500mg"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Pack Size <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="packSize"
                  value={medicineForm.packSize}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 15 Tablets, 100ml"
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={3}>
                <CFormLabel>
                  MRP (₹) <span className="text-danger">*</span>
                </CFormLabel>
                <CInputGroup>
                  <CInputGroupText>₹</CInputGroupText>
                  <CFormInput
                    type="number"
                    step="0.01"
                    name="mrp"
                    value={medicineForm.mrp}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                  />
                </CInputGroup>
              </CCol>
              <CCol md={3}>
                <CFormLabel>
                  Supplier Price (₹) <span className="text-danger">*</span>
                </CFormLabel>
                <CInputGroup>
                  <CInputGroupText>₹</CInputGroupText>
                  <CFormInput
                    type="number"
                    step="0.01"
                    name="supplierPrice"
                    value={medicineForm.supplierPrice}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                  />
                </CInputGroup>
                {medicineForm.supplierPrice && (
                  <div className="small text-success mt-1">
                    Discount: {calculateDiscount()}%
                  </div>
                )}
              </CCol>
              <CCol md={3}>
                <CFormLabel>GST (12%)</CFormLabel>
                <CFormInput type="text" value={`₹${calculateGST()}`} readOnly disabled />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Effective Rate</CFormLabel>
                <CFormInput
                  type="text"
                  value={`₹${calculateEffectiveRate()}`}
                  readOnly
                  disabled
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>
                  Stock Quantity <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="number"
                  name="stock"
                  value={medicineForm.stock}
                  onChange={handleInputChange}
                  required
                  placeholder="0"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Min Order Quantity</CFormLabel>
                <CFormInput
                  type="number"
                  name="minOrderQuantity"
                  value={medicineForm.minOrderQuantity}
                  onChange={handleInputChange}
                  placeholder="1"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Expiry Date</CFormLabel>
                <CFormInput
                  type="date"
                  name="expiryDate"
                  value={medicineForm.expiryDate}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Category</CFormLabel>
                <CFormInput
                  type="text"
                  name="category"
                  value={medicineForm.category}
                  onChange={handleInputChange}
                  placeholder="Auto-filled from generic name"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Scheme/Offer</CFormLabel>
                <CFormInput
                  type="text"
                  name="scheme"
                  value={medicineForm.scheme}
                  onChange={handleInputChange}
                  placeholder="e.g., Buy 10 Get 1 Free"
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel>Description</CFormLabel>
                <CFormTextarea
                  name="description"
                  value={medicineForm.description}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Additional information about the medicine"
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md={12}>
                <CFormCheck
                  type="checkbox"
                  name="isAvailable"
                  checked={medicineForm.isAvailable}
                  onChange={handleInputChange}
                  label="Available for sale"
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancel
            </CButton>
            <CButton color="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <CSpinner size="sm" className="me-2" /> Adding...
                </>
              ) : (
                'Add Medicine'
              )}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}

export default SupplierMedicineManagement
