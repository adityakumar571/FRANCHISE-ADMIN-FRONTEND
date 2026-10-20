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

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    stockFilter: '',
  })

  const [formData, setFormData] = useState({
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
    setShowModal(true)
  }

  const handleEditMedicine = (medicine) => {
    setEditMode(true)
    setCurrentMedicine(medicine)
    setFormData({
      name: medicine.name || '',
      genericName: medicine.genericName || '',
      manufacturer: medicine.manufacturer || '',
      category: medicine.category || '',
      strength: medicine.strength || '',
      packSize: medicine.packSize || '',
      mrp: medicine.mrp || '',
      supplierPrice: medicine.supplierPrice || '',
      stock: medicine.stock || '',
      minOrderQuantity: medicine.minOrderQuantity || 1,
      scheme: medicine.scheme || '',
      description: medicine.description || '',
      isAvailable: medicine.isAvailable !== false,
      expiryDate: medicine.expiryDate ? medicine.expiryDate.split('T')[0] : '',
    })
    setShowModal(true)
  }

  const handleSaveMedicine = async () => {
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
        
        alert('Medicine updated successfully!')
      } else {
        await postRequest({
          url: 'suppliers/medicines',
          cred: medicineData,
        })
        
        alert('Medicine added successfully!')
      }
      
      setShowModal(false)
      await fetchMedicines()
    } catch (error) {
      console.error('Error saving medicine:', error)
      alert(`Failed to save medicine: ${error.response?.data?.message || error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMedicine = async (medicineId) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return

    try {
      await deleteRequest(`suppliers/medicines/${medicineId}`)
      alert('Medicine deleted successfully!')
      await fetchMedicines()
    } catch (error) {
      console.error('Error deleting medicine:', error)
      alert(`Failed to delete medicine: ${error.response?.data?.message || error.message}`)
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
                  {['Medicine Name', 'Generic Name', 'Manufacturer', 'Strength', 'Stock', 'MRP', 'My Price', 'Status', 'Actions'].map(h => (
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
                        {medicine.manufacturer}
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>
                        {medicine.strength}
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
                      <td style={{ padding: '9px 10px', fontSize: 12, color: '#6b7280' }}>
                        {formatCurrency(medicine.mrp || 0)}
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0c3b73' }}>
                          {formatCurrency(medicine.supplierPrice || 0)}
                        </span>
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
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>
                  Generic Medicine Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.genericName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, genericName: e.target.value }))}
                  required
                  placeholder="e.g., Paracetamol"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }}
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
                  placeholder="e.g., Dolo 650"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }}
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
                  placeholder="e.g., Micro Labs"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }}
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
                  placeholder="e.g., 650mg"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }}
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
                  placeholder="e.g., 15 Tablets"
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
                    style={{ flex: 1, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '0 7px 7px 0', fontSize: 13, outline: 'none' }}
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
                    placeholder="0.00"
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Auto-filled from generic name"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Scheme/Offer</label>
                <input
                  type="text"
                  value={formData.scheme}
                  onChange={(e) => setFormData({ ...formData, scheme: e.target.value })}
                  placeholder="e.g., Buy 10 Get 1 Free"
                  style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }}>Description</label>
            <CFormTextarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional information about the medicine"
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
            disabled={
              saving ||
              !formData.name ||
              !formData.genericName ||
              !formData.manufacturer ||
              !formData.strength ||
              !formData.packSize ||
              !formData.mrp ||
              !formData.supplierPrice ||
              !formData.stock
            }
            style={{
              padding: '8px 16px',
              background: '#0c3b73',
              color: '#fff',
              border: 'none',
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {saving ? (
              <>
                <CSpinner size="sm" /> Saving...
              </>
            ) : editMode ? (
              'Update Medicine'
            ) : (
              'Add Medicine'
            )}
          </button>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default SupplierInventory
