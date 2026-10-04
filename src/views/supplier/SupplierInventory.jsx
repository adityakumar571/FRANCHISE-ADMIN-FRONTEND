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
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { Package, Plus, Edit, Trash2, Search, AlertCircle, TrendingDown } from 'lucide-react'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../Helpers'

const SupplierInventory = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [saving, setSaving] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    stockFilter: '',
  })

  const [formData, setFormData] = useState({
    productName: '',
    productCode: '',
    category: 'Medicine',
    description: '',
    unit: 'pcs',
    pricePerUnit: '',
    stock: '',
    minStockLevel: '',
    manufacturer: '',
    expiryDate: '',
    isActive: true,
  })

  useEffect(() => {
    // Debug: Log localStorage values
    console.log('📊 Supplier Inventory - LocalStorage Debug:');
    console.log('  - supplierId:', localStorage.getItem('supplierId'));
    console.log('  - supplierName:', localStorage.getItem('supplierName'));
    console.log('  - supplierEmail:', localStorage.getItem('supplierEmail'));
    console.log('  - supplierCode:', localStorage.getItem('supplierCode'));
    
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const supplierId = localStorage.getItem('supplierId')
      
      console.log('🔍 Fetching products for supplier:', supplierId)
      
      if (!supplierId) {
        console.error('❌ No supplier ID found in localStorage')
        setLoading(false)
        return
      }
      
      // Fetch products from API - Use public supplier endpoint
      const url = `/suppliers/medicines?limit=100`  // No /api/ prefix
      console.log('📡 API URL:', url)
      
      const response = await getRequest(url)
      console.log('📦 API Response:', response)
      
      // Handle response structure properly
      if (response.success && response.data && response.data.products) {
        console.log('✅ Products loaded:', response.data.products.length)
        setProducts(response.data.products)
      } else if (response.data && Array.isArray(response.data)) {
        console.log('✅ Products loaded (array):', response.data.length)
        setProducts(response.data)
      } else {
        console.log('⚠️ No products found in response')
        setProducts([])
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error)
      console.error('Error details:', error.response?.data || error.message)
      // Use empty array on error
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    setEditMode(false)
    setCurrentProduct(null)
    setFormData({
      productName: '',
      productCode: '',
      category: 'Medicine',
      description: '',
      unit: 'pcs',
      pricePerUnit: '',
      stock: '',
      minStockLevel: '',
      manufacturer: '',
      expiryDate: '',
      isActive: true,
    })
    setShowModal(true)
  }

  const handleEditProduct = (product) => {
    setEditMode(true)
    setCurrentProduct(product)
    setFormData({
      productName: product.productName || '',
      productCode: product.productCode || '',
      category: product.category || 'Medicine',
      description: product.description || '',
      unit: product.unit || 'pcs',
      pricePerUnit: product.pricePerUnit || '',
      stock: product.stock || '',
      minStockLevel: product.minStockLevel || '',
      manufacturer: product.manufacturer || '',
      expiryDate: product.expiryDate || '',
      isActive: product.isActive !== false,
    })
    setShowModal(true)
  }

  const handleSaveProduct = async () => {
    try {
      setSaving(true)
      const supplierId = localStorage.getItem('supplierId')
      
      if (!supplierId) {
        alert('Supplier ID not found. Please login again.')
        return
      }

      const productData = {
        ...formData,
        supplierId,
      }

      if (editMode) {
        // Update product via API - Use existing medicines endpoint
        console.log('🔄 Updating product:', currentProduct._id)
        const response = await putRequest({
          url: `/suppliers/medicines/${currentProduct._id}`,  // No /api/ prefix
          cred: productData,
        })
        
        console.log('✅ Product updated:', response)
        
        // Update local state
        setProducts(
          products.map((p) => (p._id === currentProduct._id ? { ...p, ...formData } : p))
        )
        alert('Product updated successfully!')
      } else {
        // Add new product via API - Use existing medicines endpoint
        console.log('➕ Creating product:', productData)
        const response = await postRequest({
          url: '/suppliers/medicines',  // No /api/ prefix
          cred: productData,
        })
        
        console.log('✅ Product created:', response)
        
        // Refresh product list from server
        await fetchProducts()
        alert('Product added successfully!')
      }
      
      setShowModal(false)
    } catch (error) {
      console.error('❌ Error saving product:', error)
      console.error('Error details:', error.response?.data || error.message)
      alert(`Failed to save product: ${error.response?.data?.message || error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      console.log('🗑️ Deleting product:', productId)
      
      // Use existing medicines endpoint (No /api/ prefix)
      const response = await deleteRequest(`/suppliers/medicines/${productId}`)
      
      console.log('✅ Product deleted:', response)
      
      // Remove from local state
      setProducts(products.filter((p) => p._id !== productId))
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('❌ Error deleting product:', error)
      console.error('Error details:', error.response?.data || error.message)
      alert(`Failed to delete product: ${error.response?.data?.message || error.message}`)
    }
  }

  const getStockBadge = (stock, minLevel) => {
    const minStockLevel = minLevel || 20 // Default to 20 if not set
    if (stock <= 0) {
      return <CBadge color="danger">Out of Stock</CBadge>
    } else if (stock <= minStockLevel) {
      return <CBadge color="warning">Low Stock</CBadge>
    } else {
      return <CBadge color="success">In Stock</CBadge>
    }
  }

  const getCategoryBadge = (category) => {
    const colors = {
      Medicine: 'primary',
      Dummy: 'warning',
      Equipment: 'info',
    }
    return <CBadge color={colors[category] || 'secondary'}>{category}</CBadge>
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !filters.search ||
      product.productName.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.productCode.toLowerCase().includes(filters.search.toLowerCase())

    const matchesCategory = !filters.category || product.category === filters.category

    const minLevel = product.minStockLevel || product.reorderLevel || 20
    const matchesStock =
      !filters.stockFilter ||
      (filters.stockFilter === 'low' && product.stock <= minLevel && product.stock > 0) ||
      (filters.stockFilter === 'out' && product.stock <= 0)

    return matchesSearch && matchesCategory && matchesStock
  })

  // Calculate stats
  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.stock <= (p.minStockLevel || p.reorderLevel || 20) && p.stock > 0).length,
    outOfStock: products.filter((p) => p.stock <= 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.pricePerUnit || p.purchasePrice || p.sellingPrice || 0) * p.stock, 0),
  }

  return (
    <>
      {/* Stats Cards */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CCard style={{ borderLeft: '4px solid #0d6efd' }}>
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-medium-emphasis small">Total Products</div>
                  <div className="fs-4 fw-semibold">{stats.total}</div>
                </div>
                <Package size={40} color="#0d6efd" style={{ opacity: 0.2 }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard style={{ borderLeft: '4px solid #ffc107' }}>
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-medium-emphasis small">Low Stock</div>
                  <div className="fs-4 fw-semibold">{stats.lowStock}</div>
                </div>
                <AlertCircle size={40} color="#ffc107" style={{ opacity: 0.2 }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard style={{ borderLeft: '4px solid #dc3545' }}>
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-medium-emphasis small">Out of Stock</div>
                  <div className="fs-4 fw-semibold">{stats.outOfStock}</div>
                </div>
                <TrendingDown size={40} color="#dc3545" style={{ opacity: 0.2 }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard style={{ borderLeft: '4px solid #198754' }}>
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-medium-emphasis small">Inventory Value</div>
                  <div className="fs-4 fw-semibold">{formatCurrency(stats.totalValue)}</div>
                </div>
                <Package size={40} color="#198754" style={{ opacity: 0.2 }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Inventory Table */}
      <CCard>
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <Package size={20} />
              <strong>Product Inventory</strong>
            </div>
            <CButton color="primary" onClick={handleAddProduct}>
              <Plus size={16} className="me-2" />
              Add Product
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {/* Filters */}
          <CRow className="mb-3">
            <CCol md={4}>
              <CInputGroup>
                <CInputGroupText>
                  <Search size={16} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Search by name or code..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </CInputGroup>
            </CCol>
            <CCol md={3}>
              <CFormSelect
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="Medicine">Medicine</option>
                <option value="Dummy">Dummy</option>
                <option value="Equipment">Equipment</option>
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormSelect
                value={filters.stockFilter}
                onChange={(e) => setFilters({ ...filters, stockFilter: e.target.value })}
              >
                <option value="">All Stock Levels</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </CFormSelect>
            </CCol>
          </CRow>

          {/* Table */}
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Package size={48} style={{ opacity: 0.3 }} />
              <p className="mt-3">No products found</p>
            </div>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Product Code</CTableHeaderCell>
                  <CTableHeaderCell>Product Name</CTableHeaderCell>
                  <CTableHeaderCell>Category</CTableHeaderCell>
                  <CTableHeaderCell>Stock</CTableHeaderCell>
                  <CTableHeaderCell>Price</CTableHeaderCell>
                  <CTableHeaderCell>Manufacturer</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredProducts.map((product) => (
                  <CTableRow key={product._id}>
                    <CTableDataCell>
                      <strong>{product.productCode}</strong>
                    </CTableDataCell>
                    <CTableDataCell>{product.productName}</CTableDataCell>
                    <CTableDataCell>{getCategoryBadge(product.category)}</CTableDataCell>
                    <CTableDataCell>
                      <div>
                        {product.stock} {product.unit || 'pcs'}
                      </div>
                      {getStockBadge(product.stock, product.minStockLevel || product.reorderLevel)}
                    </CTableDataCell>
                    <CTableDataCell>{formatCurrency(product.pricePerUnit || product.purchasePrice || product.sellingPrice || 0)}</CTableDataCell>
                    <CTableDataCell>{product.manufacturer}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={product.isActive ? 'success' : 'secondary'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex gap-2">
                        <CButton
                          color="info"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit size={14} />
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <Trash2 size={14} />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Add/Edit Product Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{editMode ? 'Edit Product' : 'Add New Product'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={6} className="mb-3">
              <label className="form-label">Product Name *</label>
              <CFormInput
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="e.g., Paracetamol 500mg"
              />
            </CCol>
            <CCol md={6} className="mb-3">
              <label className="form-label">Product Code *</label>
              <CFormInput
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                placeholder="e.g., MED001"
              />
            </CCol>

            <CCol md={6} className="mb-3">
              <label className="form-label">Category *</label>
              <CFormSelect
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Medicine">Medicine</option>
                <option value="Dummy">Dummy</option>
                <option value="Equipment">Equipment</option>
              </CFormSelect>
            </CCol>

            <CCol md={6} className="mb-3">
              <label className="form-label">Unit *</label>
              <CFormSelect
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="pcs">Pieces</option>
                <option value="strip">Strip</option>
                <option value="box">Box</option>
                <option value="bottle">Bottle</option>
                <option value="kg">Kilogram</option>
                <option value="ltr">Liter</option>
              </CFormSelect>
            </CCol>

            <CCol md={4} className="mb-3">
              <label className="form-label">Price per Unit *</label>
              <CInputGroup>
                <CInputGroupText>₹</CInputGroupText>
                <CFormInput
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  placeholder="0"
                />
              </CInputGroup>
            </CCol>

            <CCol md={4} className="mb-3">
              <label className="form-label">Stock Quantity *</label>
              <CFormInput
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </CCol>

            <CCol md={4} className="mb-3">
              <label className="form-label">Min Stock Level</label>
              <CFormInput
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                placeholder="0"
              />
            </CCol>

            <CCol md={6} className="mb-3">
              <label className="form-label">Manufacturer</label>
              <CFormInput
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="e.g., Sun Pharma"
              />
            </CCol>

            <CCol md={6} className="mb-3">
              <label className="form-label">Expiry Date</label>
              <CFormInput
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </CCol>

            <CCol md={12} className="mb-3">
              <label className="form-label">Description</label>
              <CFormTextarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description..."
              />
            </CCol>

            <CCol md={12} className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  id="isActive"
                />
                <label className="form-check-label" htmlFor="isActive">
                  Product is Active
                </label>
              </div>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={handleSaveProduct}
            disabled={
              saving || 
              !formData.productName || 
              !formData.productCode || 
              !formData.pricePerUnit ||
              !formData.stock
            }
          >
            {saving ? <CSpinner size="sm" /> : editMode ? 'Update Product' : 'Add Product'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default SupplierInventory
