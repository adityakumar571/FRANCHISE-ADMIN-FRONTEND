import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CBadge,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CRow,
  CCol,
  CFormCheck,
  CInputGroup,
  CInputGroupText,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import MedicineAutocomplete from '../../../components/MedicineAutocomplete'
import { getRequest, postRequest } from '../../../Helpers'
import { toast } from 'react-toastify'

const BulkMedicineAssignment = () => {
  const [suppliers, setSuppliers] = useState([])
  const [selectedSuppliers, setSelectedSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [selectAll, setSelectAll] = useState(false)

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

  // Different price for each supplier
  const [supplierPrices, setSupplierPrices] = useState({})

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const response = await getRequest('suppliers/admin/list?page=1&limit=100')
      if (response?.data?.success !== false) {
        const suppliersList = response?.data?.data?.suppliers || response?.data?.suppliers || []
        const activeSuppliers = suppliersList.filter((s) => s.status === 'Active')
        setSuppliers(activeSuppliers)
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      toast.error('Failed to fetch suppliers')
    } finally {
      setLoading(false)
    }
  }

  const handleSupplierToggle = (supplierId) => {
    setSelectedSuppliers((prev) => {
      if (prev.includes(supplierId)) {
        // Remove supplier
        const newPrices = { ...supplierPrices }
        delete newPrices[supplierId]
        setSupplierPrices(newPrices)
        return prev.filter((id) => id !== supplierId)
      } else {
        // Add supplier with default price
        setSupplierPrices((prevPrices) => ({
          ...prevPrices,
          [supplierId]: medicineForm.supplierPrice || '',
        }))
        return [...prev, supplierId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedSuppliers([])
      setSupplierPrices({})
    } else {
      // Select all
      const allIds = suppliers.map((s) => s._id)
      setSelectedSuppliers(allIds)
      
      // Set default prices for all
      const prices = {}
      allIds.forEach((id) => {
        prices[id] = medicineForm.supplierPrice || ''
      })
      setSupplierPrices(prices)
    }
    setSelectAll(!selectAll)
  }

  const handlePriceChange = (supplierId, value) => {
    setSupplierPrices((prev) => ({
      ...prev,
      [supplierId]: value,
    }))
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setMedicineForm((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Update all supplier prices if base price changes
    if (name === 'supplierPrice' && selectedSuppliers.length > 0) {
      const updatedPrices = {}
      selectedSuppliers.forEach((id) => {
        updatedPrices[id] = value
      })
      setSupplierPrices(updatedPrices)
    }
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

    if (selectedSuppliers.length === 0) {
      toast.error('Please select at least one supplier')
      return
    }

    // Validate all supplier prices
    const invalidPrices = selectedSuppliers.filter(
      (id) => !supplierPrices[id] || parseFloat(supplierPrices[id]) <= 0
    )
    if (invalidPrices.length > 0) {
      toast.error('Please enter valid prices for all selected suppliers')
      return
    }

    setSubmitting(true)

    try {
      const successCount = []
      const failedCount = []

      // Add medicine to each selected supplier
      for (const supplierId of selectedSuppliers) {
        const payload = {
          ...medicineForm,
          supplierPrice: parseFloat(supplierPrices[supplierId]),
          mrp: parseFloat(medicineForm.mrp),
          stock: parseInt(medicineForm.stock),
          minOrderQuantity: parseInt(medicineForm.minOrderQuantity) || 1,
        }

        try {
          await postRequest({
            url: `suppliers/${supplierId}/medicines`,
            cred: payload,
          })
          successCount.push(supplierId)
        } catch (error) {
          console.error(`Failed for supplier ${supplierId}:`, error)
          failedCount.push(supplierId)
        }
      }

      if (successCount.length > 0) {
        toast.success(
          `Medicine added to ${successCount.length} supplier(s) successfully!`
        )
      }

      if (failedCount.length > 0) {
        toast.error(`Failed to add to ${failedCount.length} supplier(s)`)
      }

      if (successCount.length > 0) {
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error in bulk assignment:', error)
      toast.error('Failed to add medicine')
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
    setSelectedSuppliers([])
    setSupplierPrices({})
    setSelectAll(false)
  }

  const calculateDiscount = (mrp, price) => {
    if (mrp && price && parseFloat(mrp) > 0) {
      const discount = ((parseFloat(mrp) - parseFloat(price)) / parseFloat(mrp)) * 100
      return discount.toFixed(2)
    }
    return '0'
  }

  const calculateGST = (price) => {
    if (price) {
      return (parseFloat(price) * 0.12).toFixed(2)
    }
    return '0.00'
  }

  const calculateEffectiveRate = (price) => {
    if (price) {
      return (parseFloat(price) * 1.12).toFixed(2)
    }
    return '0.00'
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Bulk Medicine Assignment</h2>
          <p className="text-muted">Add one medicine to multiple suppliers at once</p>
        </div>
        <CButton color="primary" size="lg" onClick={() => setShowModal(true)}>
          + Add Medicine to Multiple Suppliers
        </CButton>
      </div>

      {/* Instructions */}
      <CRow className="mb-4">
        <CCol md={12}>
          <CAlert color="info">
            <strong>How it works:</strong>
            <ol className="mb-0 mt-2">
              <li>Click "Add Medicine to Multiple Suppliers"</li>
              <li>Fill medicine details (Generic name with autocomplete)</li>
              <li>Select suppliers and set individual prices</li>
              <li>Submit - Medicine will be added to all selected suppliers</li>
            </ol>
          </CAlert>
        </CCol>
      </CRow>

      {/* Suppliers Overview */}
      <CRow>
        <CCol md={12}>
          <CCard>
            <CCardHeader>
              <strong>Active Suppliers ({suppliers.length})</strong>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                  <p className="mt-2">Loading suppliers...</p>
                </div>
              ) : (
                <CRow>
                  {suppliers.map((supplier) => (
                    <CCol md={3} key={supplier._id} className="mb-3">
                      <CCard>
                        <CCardBody>
                          <div>
                            <strong>{supplier.companyName}</strong>
                            <div className="small text-muted">{supplier.address?.city || 'N/A'}</div>
                            <div className="small">
                              <CBadge color="info">
                                {supplier.medicines?.length || 0} medicines
                              </CBadge>
                            </div>
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

      {/* Bulk Assignment Modal */}
      <CModal size="xl" visible={showModal} onClose={() => setShowModal(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Add Medicine to Multiple Suppliers</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Medicine Details Section */}
            <div className="border-bottom pb-3 mb-3">
              <h5 className="mb-3">Step 1: Medicine Details</h5>

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
                    placeholder="e.g., Dolo 650"
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Manufacturer *</CFormLabel>
                  <CFormInput
                    type="text"
                    name="manufacturer"
                    value={medicineForm.manufacturer}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Strength *</CFormLabel>
                  <CFormInput
                    type="text"
                    name="strength"
                    value={medicineForm.strength}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Pack Size *</CFormLabel>
                  <CFormInput
                    type="text"
                    name="packSize"
                    value={medicineForm.packSize}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>MRP (₹) *</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      step="0.01"
                      name="mrp"
                      value={medicineForm.mrp}
                      onChange={handleInputChange}
                      required
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Base Supplier Price (₹) *</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      step="0.01"
                      name="supplierPrice"
                      value={medicineForm.supplierPrice}
                      onChange={handleInputChange}
                      required
                      placeholder="Default price for all"
                    />
                  </CInputGroup>
                  {medicineForm.supplierPrice && medicineForm.mrp && (
                    <div className="small text-success mt-1">
                      Discount: {calculateDiscount(medicineForm.mrp, medicineForm.supplierPrice)}%
                    </div>
                  )}
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Default Stock *</CFormLabel>
                  <CFormInput
                    type="number"
                    name="stock"
                    value={medicineForm.stock}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
              </CRow>
            </div>

            {/* Supplier Selection Section */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Step 2: Select Suppliers & Set Prices</h5>
                <CButton color="secondary" size="sm" onClick={handleSelectAll}>
                  {selectAll ? 'Deselect All' : 'Select All'}
                </CButton>
              </div>

              {selectedSuppliers.length > 0 && (
                <CAlert color="success" className="mb-3">
                  <strong>{selectedSuppliers.length}</strong> supplier(s) selected
                </CAlert>
              )}

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <CTable bordered hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell style={{ width: '50px' }}>Select</CTableHeaderCell>
                      <CTableHeaderCell>Supplier Name</CTableHeaderCell>
                      <CTableHeaderCell>City</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '180px' }}>
                        Supplier Price (₹)
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '120px' }}>
                        Effective Rate
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {suppliers.map((supplier) => {
                      const isSelected = selectedSuppliers.includes(supplier._id)
                      const supplierPrice = supplierPrices[supplier._id] || ''

                      return (
                        <CTableRow
                          key={supplier._id}
                          color={isSelected ? 'light' : ''}
                        >
                          <CTableDataCell>
                            <CFormCheck
                              checked={isSelected}
                              onChange={() => handleSupplierToggle(supplier._id)}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <strong>{supplier.companyName}</strong>
                          </CTableDataCell>
                          <CTableDataCell>{supplier.address?.city || 'N/A'}</CTableDataCell>
                          <CTableDataCell>
                            <CInputGroup size="sm">
                              <CInputGroupText>₹</CInputGroupText>
                              <CFormInput
                                type="number"
                                step="0.01"
                                value={supplierPrice}
                                onChange={(e) =>
                                  handlePriceChange(supplier._id, e.target.value)
                                }
                                disabled={!isSelected}
                                required={isSelected}
                                placeholder="Price"
                              />
                            </CInputGroup>
                          </CTableDataCell>
                          <CTableDataCell>
                            {supplierPrice ? (
                              <strong className="text-success">
                                ₹{calculateEffectiveRate(supplierPrice)}
                              </strong>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      )
                    })}
                  </CTableBody>
                </CTable>
              </div>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)} disabled={submitting}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <CSpinner size="sm" className="me-2" /> Adding to {selectedSuppliers.length}{' '}
                  supplier(s)...
                </>
              ) : (
                `Add to ${selectedSuppliers.length} Supplier(s)`
              )}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}

export default BulkMedicineAssignment
