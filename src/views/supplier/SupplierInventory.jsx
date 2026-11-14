import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CFormCheck,
  CSpinner,
  CToaster,
  CToast,
  CToastHeader,
  CToastBody,
} from '@coreui/react'
import { Package, Plus, Edit, Trash2, Search, AlertCircle, TrendingDown } from 'lucide-react'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../Helpers'

const SupplierInventory = () => {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentMedicine, setCurrentMedicine] = useState(null)
  const [saving, setSaving] = useState(false)
  const [searchingMedicine, setSearchingMedicine] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [toasts, setToasts] = useState([])

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    stockFilter: '',
  })

  // Toast helper function
  const showToast = (message, type = 'success') => {
    const id = Date.now()
    const newToast = { id, message, type }
    setToasts(prev => [...prev, newToast])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const [formData, setFormData] = useState({
    medicine_id: '',
    name: '',
    generic_name: '',
    manufacturer: '',
    medical_system: '',
    category: '',
    strength: '',
    packSize: '',
    mrp: '',
    supplierPrice: '',
    stock: '',
    minOrderQuantity: 1,
    minStock: 10,
    scheme: '',
    description: '',
    isAvailable: true,
    expiryDate: '',
    batchNumber: '',
    discount: 0,
    brand_names: [],
    formulation: '',
    primary_specialty: '',
  })

  useEffect(() => {
    fetchMedicines()
    
    // Check if URL has filter parameter
    const params = new URLSearchParams(window.location.search)
    const filterParam = params.get('filter')
    if (filterParam === 'low-stock') {
      setFilters(prev => ({ ...prev, stockFilter: 'low' }))
    }
  }, [])

  const fetchMedicines = async () => {
    try {
      setLoading(true)
      
      const response = await getRequest('suppliers/medicines?limit=100')
      
      if (response?.data?.success !== false) {
        const medicinesList = response?.data?.data?.medicines || response?.data?.medicines || []
        setMedicines(medicinesList)
      } else {
        setMedicines([])
      }
    } catch (error) {
      console.error('Error fetching medicines:', error)
      setMedicines([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedicine = () => {
    setEditMode(false)
    setCurrentMedicine(null)
    setFormData({
      medicine_id: '',
      name: '',
      generic_name: '',
      manufacturer: '',
      medical_system: '',
      category: '',
      strength: '',
      packSize: '',
      mrp: '',
      supplierPrice: '',
      stock: '',
      minOrderQuantity: 1,
      minStock: 10,
      scheme: '',
      description: '',
      isAvailable: true,
      expiryDate: '',
      batchNumber: '',
      discount: 0,
      brand_names: [],
      formulation: '',
      primary_specialty: '',
    })
    setSearchResults([])
    setShowSearchResults(false)
    setShowModal(true)
  }

  // Search medicines from SuperAdmin API
  const searchGlobalMedicines = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      setSearchingMedicine(true)
      const response = await getRequest(`/superadmin/medicines?search=${searchTerm}&limit=20`)
      
      if (response?.data?.success) {
        setSearchResults(response.data.data.medicines || [])
        setShowSearchResults(true)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching medicines:', error)
      setSearchResults([])
    } finally {
      setSearchingMedicine(false)
    }
  }

  // Select medicine from search results - auto-fill fields
  const selectMedicineFromGlobal = (medicine) => {
    setFormData({
      medicine_id: medicine.medicine_id || '',
      name: medicine.name || medicine.generic_name || '',
      generic_name: medicine.generic_name || '',
      manufacturer: medicine.manufacturer || '',
      medical_system: medicine.medical_system || 'Allopathy',
      category: medicine.sub_category || medicine.category || '',
      strength: medicine.strength || '',
      packSize: medicine.pack_size || '',
      mrp: medicine.mrp || '',
      supplierPrice: '', // Supplier enters this
      stock: '',
      minOrderQuantity: 1,
      minStock: 10,
      scheme: '',
      description: medicine.indications_symptoms || '',
      isAvailable: true,
      expiryDate: '',
      batchNumber: medicine.batch_number || '',
      discount: 0,
      brand_names: medicine.brand_names || [],
      formulation: medicine.formulation || '',
      primary_specialty: medicine.primary_specialty || '',
    })
    setShowSearchResults(false)
  }

  const handleEditMedicine = (medicine) => {
    setEditMode(true)
    setCurrentMedicine(medicine)
    setFormData({
      medicine_id: medicine.medicine_id || '',
      name: medicine.name || '',
      generic_name: medicine.genericName || '',
      manufacturer: medicine.manufacturer || '',
      medical_system: medicine.medical_system || '',
      category: medicine.category || '',
      strength: medicine.strength || '',
      packSize: medicine.packSize || '',
      mrp: medicine.mrp || '',
      supplierPrice: medicine.supplierPrice || '',
      stock: medicine.stock || '',
      minOrderQuantity: medicine.minOrderQuantity || 1,
      minStock: medicine.minStock || 10,
      scheme: medicine.scheme || '',
      description: medicine.description || '',
      isAvailable: medicine.isAvailable !== false,
      expiryDate: medicine.expiryDate ? medicine.expiryDate.split('T')[0] : '',
      batchNumber: medicine.batchNumber || '',
      discount: medicine.discount || 0,
      brand_names: medicine.brand_names || [],
      formulation: medicine.formulation || '',
      primary_specialty: medicine.primary_specialty || '',
    })
    setShowModal(true)
  }

  const handleSaveMedicine = async () => {
    // ✅ VALIDATION
    const errors = [];

    // Required fields
    if (!formData.generic_name?.trim()) errors.push('Generic name is required');
    if (!formData.name?.trim()) errors.push('Brand/Product name is required');
    if (!formData.manufacturer?.trim()) errors.push('Manufacturer is required');
    if (!formData.strength?.trim()) errors.push('Strength is required');
    if (!formData.packSize?.trim()) errors.push('Pack size is required');

    // Numeric validations
    if (!formData.mrp || parseFloat(formData.mrp) <= 0) errors.push('MRP must be greater than 0');
    if (!formData.supplierPrice || parseFloat(formData.supplierPrice) <= 0) errors.push('Supplier price must be greater than 0');
    if (!formData.stock || parseInt(formData.stock) < 0) errors.push('Stock cannot be negative');
    if (formData.minOrderQuantity && parseInt(formData.minOrderQuantity) <= 0) errors.push('Min order quantity must be greater than 0');

    // Price validation - supplier price should be <= MRP
    if (parseFloat(formData.supplierPrice) > parseFloat(formData.mrp)) {
      errors.push('Supplier price cannot be more than MRP');
    }

    // Show errors
    if (errors.length > 0) {
      showToast('❌ ' + errors[0], 'danger')
      return;
    }

    try {
      setSaving(true)

      const medicineData = {
        ...formData,
        mrp: parseFloat(formData.mrp),
        supplierPrice: parseFloat(formData.supplierPrice),
        stock: parseInt(formData.stock),
        minOrderQuantity: parseInt(formData.minOrderQuantity) || 1,
      }

      if (editMode && currentMedicine) {
        await putRequest({
          url: `suppliers/medicines/${currentMedicine._id}`,
          cred: medicineData,
        })
        
        showToast('✅ Medicine updated successfully!', 'success')
      } else {
        await postRequest({
          url: 'suppliers/medicines',
          cred: medicineData,
        })
        
        showToast('✅ Medicine added successfully!', 'success')
      }
      
      setShowModal(false)
      await fetchMedicines()
    } catch (error) {
      console.error('Error saving medicine:', error)
      showToast(`❌ ${error.response?.data?.message || error.message}`, 'danger')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMedicine = async (medicineId) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return

    try {
      await deleteRequest(`suppliers/medicines/${medicineId}`)
      showToast('✅ Medicine deleted successfully!', 'success')
      await fetchMedicines()
    } catch (error) {
      console.error('Error deleting medicine:', error)
      showToast(`❌ Failed to delete medicine: ${error.response?.data?.message || error.message}`, 'danger')
    }
  }

  const handleToggleAvailability = async (medicine) => {
    try {
      await putRequest({
        url: `suppliers/medicines/${medicine._id}/toggle`,
        cred: {},
      })
      
      await fetchMedicines()
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  const calculateDiscount = () => {
    const { mrp, supplierPrice } = formData
    if (mrp && supplierPrice && parseFloat(mrp) > 0) {
      const discount = ((parseFloat(mrp) - parseFloat(supplierPrice)) / parseFloat(mrp)) * 100
      return discount.toFixed(2)
    }
    return '0'
  }

  const calculateGST = () => {
    const { supplierPrice } = formData
    if (supplierPrice) {
      return (parseFloat(supplierPrice) * 0.12).toFixed(2)
    }
    return '0.00'
  }

  const calculateEffectiveRate = () => {
    const { supplierPrice } = formData
    if (supplierPrice) {
      return (parseFloat(supplierPrice) * 1.12).toFixed(2)
    }
    return '0.00'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      !filters.search ||
      medicine.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      medicine.genericName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      medicine.manufacturer?.toLowerCase().includes(filters.search.toLowerCase())

    const matchesCategory = !filters.category || medicine.category === filters.category

    const matchesStock =
      !filters.stockFilter ||
      (filters.stockFilter === 'low' && medicine.stock <= 50 && medicine.stock > 0) ||
      (filters.stockFilter === 'out' && medicine.stock <= 0)

    return matchesSearch && matchesCategory && matchesStock
  })

  // Calculate stats
  const stats = {
    total: medicines.length,
    lowStock: medicines.filter((m) => m.stock <= 50 && m.stock > 0).length,
    outOfStock: medicines.filter((m) => m.stock <= 0).length,
    totalValue: medicines.reduce((sum, m) => sum + (m.supplierPrice || 0) * (m.stock || 0), 0),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13 }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Toast Container */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              marginBottom: 10,
              padding: '12px 16px',
              borderRadius: 8,
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              animation: 'slideIn 0.3s ease-out',
              background: toast.type === 'success' ? '#10b981' : '#ef4444',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Stats Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {[
          { label: 'Total Medicines', value: stats.total, icon: Package, color: '#0c3b73' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertCircle, color: '#f59e0b' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: TrendingDown, color: '#dc2626' },
          { label: 'Inventory Value', value: formatCurrency(stats.totalValue), icon: Package, color: '#16a34a' },
        ].map((stat, idx) => (
          <div key={idx} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 16px', flex: '1 1 150px', minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{stat.label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: stat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={15} color={stat.color} />
              </div>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Inventory Table Card */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb' }}>
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={18} color="#0c3b73" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Medicine Inventory</span>
          </div>
          <button
            onClick={handleAddMedicine}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: '#0c3b73',
              color: '#fff',
              border: 'none',
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            Add Medicine
          </button>
        </div>

        {/* Filters */}
        <div style={{ padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search by name, generic name, or manufacturer..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 36px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 7,
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              style={{
                padding: '7px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 7,
                fontSize: 12,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">All Categories</option>
              <option value="Analgesics">Analgesics</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Antacids">Antacids</option>
              <option value="Antidiabetic">Antidiabetic</option>
              <option value="Vitamins">Vitamins</option>
            </select>
            <select
              value={filters.stockFilter}
              onChange={(e) => setFilters({ ...filters, stockFilter: e.target.value })}
              style={{
                padding: '7px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 7,
                fontSize: 12,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">All Stock Levels</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #0c3b73',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              <p style={{ color: '#6b7280', margin: 0, fontSize: 12 }}>Loading medicines...</p>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div style={{ padding: '50px 24px', textAlign: 'center' }}>
              <Package size={48} style={{ opacity: 0.2, color: '#6b7280', marginBottom: 16 }} />
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>
                No medicines found
              </h4>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
                Click "Add Medicine" to get started
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Medicine Name', 'Generic Name', 'Category', 'Manufacturer', 'Strength', 'Batch', 'Stock', 'Min Stock', 'MRP', 'My Price', 'Discount', 'Expiry', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine) => {
                  const stockBadge = medicine.stock <= 0
                    ? { label: 'Out of Stock', color: '#dc2626', bg: '#fee2e2' }
                    : medicine.stock <= 50
                      ? { label: `Low (${medicine.stock})`, color: '#f59e0b', bg: '#fef3c7' }
                      : { label: `In Stock (${medicine.stock})`, color: '#16a34a', bg: '#d1fae5' }

                  return (
                    <tr key={medicine._id} style={{ background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '9px 10px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                          {medicine.name}
                        </div>
                        <div style={{ fontSize: 10, color: '#6b7280' }}>
                          {medicine.packSize}
                        </div>
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 10,
                          background: '#0c3b7318',
                          color: '#0c3b73',
                          border: '1px solid #0c3b7330'
                        }}>
                          {medicine.genericName}
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 5, background: '#e0e7ff', color: '#3730a3', fontSize: 11, fontWeight: 600 }}>
                          {medicine.category || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>
                        {medicine.manufacturer}
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>
                        {medicine.strength}
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 11, color: '#6b7280' }}>
                        {medicine.batchNumber || 'N/A'}
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 10,
                          background: stockBadge.bg,
                          color: stockBadge.color,
                        }}>
                          {stockBadge.label}
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
                        {medicine.minStock || 10}
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#6b7280' }}>
                        {formatCurrency(medicine.mrp || 0)}
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0c3b73' }}>
                          {formatCurrency(medicine.supplierPrice || 0)}
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 11, color: '#16a34a', fontWeight: 700 }}>
                        {medicine.discount || 0}%
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 11, color: '#6b7280' }}>
                        {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={medicine.isAvailable}
                            onChange={() => handleToggleAvailability(medicine)}
                            style={{ width: 36, height: 20, cursor: 'pointer' }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => handleEditMedicine(medicine)}
                            style={{
                              padding: '5px 10px',
                              background: '#eff6ff',
                              color: '#0c3b73',
                              border: 'none',
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteMedicine(medicine._id)}
                            style={{
                              padding: '5px 10px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Medicine Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="xl" backdrop="static">
        <CModalHeader>
          <CModalTitle>{editMode ? 'Edit Medicine' : 'Add New Medicine'}</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Search Global Medicines */}
          {!editMode && (
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>
                🔍 Search Global Medicines Library
              </label>
              <input
                type="text"
                placeholder="Search by name, generic name, or manufacturer..."
                onChange={(e) => searchGlobalMedicines(e.target.value)}
                style={{ width: '100%', padding: '7px 12px', border: '1px solid #0c3b73', borderRadius: 7, fontSize: 13, outline: 'none' }}
              />
              {searchingMedicine && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>Searching...</div>
              )}
              {showSearchResults && searchResults.length > 0 && (
                <div style={{ marginTop: 8, border: '1px solid #e5e7eb', borderRadius: 7, background: '#fff', maxHeight: '300px', overflowY: 'auto' }}>
                  {searchResults.map((med) => (
                    <div
                      key={med._id}
                      onClick={() => selectMedicineFromGlobal(med)}
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        hover: { background: '#f9fafb' }
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.background = '#fff'}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                        {med.generic_name} - {med.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                        {med.manufacturer} | {med.strength} | ₹{med.mrp}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>
                  Generic Medicine Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.generic_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, generic_name: e.target.value }))}
                  required
                  placeholder="Auto-filled from search"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>
                  Brand/Product Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Auto-filled from search"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>
                  Manufacturer <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  required
                  placeholder="Auto-filled from search"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>
                  Strength <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  required
                  placeholder="Auto-filled from search"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>
                  Pack Size <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.packSize}
                  onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                  required
                  placeholder="Auto-filled from search"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '7px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 7,
                    fontSize: 13,
                    outline: 'none',
                    background: '#f9fafb',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select Category</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Drops">Drops</option>
                  <option value="Cream">Cream</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Powder">Powder</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Gel">Gel</option>
                  <option value="Lotion">Lotion</option>
                  <option value="Spray">Spray</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Medical System</label>
                <input
                  type="text"
                  value={formData.medical_system}
                  onChange={(e) => setFormData({ ...formData, medical_system: e.target.value })}
                  placeholder="e.g., Allopathy, Ayurveda"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Batch Number</label>
                <input
                  type="text"
                  value={formData.batchNumber || ''}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="e.g., BATCH001"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Min Stock Alert</label>
                <input
                  type="number"
                  value={formData.minStock || 10}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  placeholder="10"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Discount (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount || 0}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="0"
                  min="0"
                  max="100"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>
                  MRP (₹) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <CInputGroup>
                  <CInputGroupText>₹</CInputGroupText>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    required
                    placeholder="0.00"
                    style={{ flex: 1, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '0 7px 7px 0', fontSize: 13, outline: 'none', background: '#f9fafb' }}
                  />
                </CInputGroup>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>
                  My Price (₹) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <CInputGroup>
                  <CInputGroupText>₹</CInputGroupText>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.supplierPrice}
                    onChange={(e) => setFormData({ ...formData, supplierPrice: e.target.value })}
                    required
                    placeholder="Enter your price"
                    style={{ flex: 1, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '0 7px 7px 0', fontSize: 13, outline: 'none' }}
                  />
                </CInputGroup>
                {formData.supplierPrice && formData.mrp && (
                  <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>
                    Discount: {calculateDiscount()}%
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>GST (12%)</label>
                <input
                  type="text"
                  value={`₹${calculateGST()}`}
                  readOnly
                  disabled
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Effective Rate</label>
                <input
                  type="text"
                  value={`₹${calculateEffectiveRate()}`}
                  readOnly
                  disabled
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>
                  Stock Quantity <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  placeholder="0"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Min Order Quantity</label>
                <input
                  type="number"
                  value={formData.minOrderQuantity}
                  onChange={(e) => setFormData({ ...formData, minOrderQuantity: e.target.value })}
                  placeholder="1"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Description/Notes</label>
            <CFormTextarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any additional notes"
            />
       
          </div>

          <div>
            <CFormCheck
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              label="Available for sale"
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <button
            onClick={() => setShowModal(false)}
            disabled={saving}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveMedicine}
            disabled={saving}
            style={{
              padding: '8px 16px',
              background: saving ? '#d1d5db' : '#0c3b73',
              color: '#fff',
              border: 'none',
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? (
              <>
                <CSpinner size="sm" /> Saving...
              </>
            ) : editMode ? (
              '✏️ Update Medicine'
            ) : (
              '✅ Add Medicine'
            )}
          </button>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default SupplierInventory
