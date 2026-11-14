/* eslint-disable prettier/prettier */
/**
 * BulkCreatePOModal — Bulk Purchase Order creation from Supplier inventory
 * Features: Supplier dropdown, Auto-load medicines, Checkbox selection, Quick quantity entry
 */
import { useState, useEffect } from 'react'
import { Plus, CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { calculateStandardPTR, batchValidatePTR } from '../../../utils/ptrValidation'

const BulkCreatePOModal = ({ open, onClose, onSaved }) => {
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [supplierMedicines, setSupplierMedicines] = useState([])
  const [selectedMedicines, setSelectedMedicines] = useState(new Set())
  const [quantities, setQuantities] = useState({})
  const [expectedDate, setExpDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [loadingMedicines, setLoadingMedicines] = useState(false)
  const [medicinePage, setMedicinePage] = useState(1)
  const [medicineSearch, setMedicineSearch] = useState('')
  const medicinesPerPage = 15

  // Fetch suppliers on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoadingSuppliers(true)
      try {
        const res = await getRequest('/franchise-suppliers/suppliers')
        let suppliersList = []
        
        if (Array.isArray(res?.data)) {
          suppliersList = res.data
        } else if (Array.isArray(res?.data?.data)) {
          suppliersList = res.data.data
        } else if (Array.isArray(res?.data?.suppliers)) {
          suppliersList = res.data.suppliers
        } else if (res?.data?.data?.suppliers && Array.isArray(res.data.data.suppliers)) {
          suppliersList = res.data.data.suppliers
        }
        
        setSuppliers(suppliersList)
      } catch (err) {
        console.error('❌ Failed to fetch suppliers:', err)
        toast.error('Failed to load suppliers')
      } finally {
        setLoadingSuppliers(false)
      }
    }
    fetchSuppliers()
  }, [])

  // Fetch supplier medicines when supplier changes
  useEffect(() => {
    if (!selectedSupplier) {
      setSupplierMedicines([])
      setSelectedMedicines(new Set())
      setQuantities({})
      return
    }

    const fetchMedicines = async () => {
      setLoadingMedicines(true)
      try {
        const supplierId = selectedSupplier._id || selectedSupplier.id
        const res = await getRequest(`/franchise/purchase/supplier/${supplierId}/medicines`)
        
        console.log('🔍 API Response:', res)
        
        // API returns: { statusCode: 200, data: { medicines: [...] } }
        const medicines = res?.data?.data?.medicines || res?.data?.medicines || []
        
        if (medicines && Array.isArray(medicines) && medicines.length > 0) {
          setSupplierMedicines(medicines)
          const initialQty = {}
          medicines.forEach(m => {
            initialQty[m._id] = ''
          })
          setQuantities(initialQty)
          setSelectedMedicines(new Set())
          console.log(`✅ Loaded ${medicines.length} medicines`)
        } else {
          console.warn('⚠️ No medicines found in response')
          toast.info('Supplier has no medicines available')
          setSupplierMedicines([])
          setQuantities({})
          setSelectedMedicines(new Set())
        }
      } catch (err) {
        console.error('❌ Failed to fetch supplier medicines:', err)
        toast.error(err?.response?.data?.message || 'Failed to load medicines')
        setSupplierMedicines([])
        setQuantities({})
        setSelectedMedicines(new Set())
      } finally {
        setLoadingMedicines(false)
      }
    }

    fetchMedicines()
  }, [selectedSupplier])

  // Toggle medicine selection
  const toggleMedicine = (medicineId) => {
    const newSelected = new Set(selectedMedicines)
    if (newSelected.has(medicineId)) {
      newSelected.delete(medicineId)
    } else {
      newSelected.add(medicineId)
    }
    setSelectedMedicines(newSelected)
  }

  // Toggle all medicines
  const toggleAll = () => {
    if (selectedMedicines.size === supplierMedicines.length) {
      setSelectedMedicines(new Set())
    } else {
      setSelectedMedicines(new Set(supplierMedicines.map(m => m._id)))
    }
  }

  // Update quantity for a medicine
  const updateQuantity = (medicineId, qty) => {
    setQuantities(prev => ({
      ...prev,
      [medicineId]: qty
    }))
  }

  // Get selected medicines with quantities
  const getSelectedItems = () => {
    return Array.from(selectedMedicines)
      .map(medicineId => {
        const medicine = supplierMedicines.find(m => m._id === medicineId)
        const qty = parseInt(quantities[medicineId] || 0)
        
        if (!medicine || qty <= 0) return null
        
        const calculatedPTR = medicine.mrp ? calculateStandardPTR(medicine.mrp, medicine.category || 'Generic') : medicine.supplierPrice || 0
        
        return {
          medicineId: medicine._id,
          medicineName: medicine.name,
          quantity: qty,
          purchasePrice: calculatedPTR,
          mrp: medicine.mrp,
          batchNo: medicine.batchNumber || '',
          expiryDate: medicine.expiryDate || '',
          category: medicine.category || 'Generic',
          supplierPrice: medicine.supplierPrice,
        }
      })
      .filter(item => item !== null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedSupplier) {
      toast.error('Please select a supplier')
      return
    }
    
    const items = getSelectedItems()
    
    if (items.length === 0) {
      toast.error('Select at least one medicine with quantity > 0')
      return
    }

    const validation = batchValidatePTR(
      items.map(item => ({
        ptr: item.purchasePrice,
        mrp: item.mrp,
        name: item.medicineName,
        category: item.category
      }))
    )

    if (!validation.valid) {
      toast.error(`${validation.invalidItems?.length || 0} item(s) have invalid PTR`)
      return
    }

    if (validation.warningItems?.length > 0) {
      const proceed = window.confirm(
        `⚠️ ${validation.warningItems.length} item(s) have low margins.\n\nDo you want to proceed?`
      )
      if (!proceed) return
    }

    setLoading(true)
    try {
      const payload = {
        supplierId: selectedSupplier._id || selectedSupplier.id,
        supplierName: selectedSupplier.companyName || selectedSupplier.name,
        expectedDeliveryDate: expectedDate || undefined,
        notes: notes || undefined,
        items: items.map(it => ({
          medicineId: it.medicineId,
          medicineName: it.medicineName,
          quantity: it.quantity,
          purchasePrice: it.purchasePrice,
          mrp: it.mrp || undefined,
          batchNo: it.batchNo || undefined,
          expiryDate: it.expiryDate || undefined,
        }))
      }

      console.log('📤 Submitting Bulk PO:', payload)
      
      const res = await postRequest({
        url: '/franchise/purchase/orders',
        cred: payload
      })

      const poNo = res?.data?.data?.poNo || res?.data?.poNo || 'created'
      toast.success(`Bulk PO ${poNo} created with ${items.length} medicines!`)
      onSaved()
    } catch (err) {
      console.error('❌ Failed to create bulk PO:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create PO'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const selectedCount = selectedMedicines.size
  const selectedWithQty = getSelectedItems().length
  const totalAmt = getSelectedItems().reduce((sum, it) => sum + (it.purchasePrice * it.quantity), 0)

  // Filter medicines by search
  const filteredMedicines = supplierMedicines.filter(med =>
    med.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
    med.genericName?.toLowerCase().includes(medicineSearch.toLowerCase()) ||
    med.manufacturer?.toLowerCase().includes(medicineSearch.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredMedicines.length / medicinesPerPage)
  const startIdx = (medicinePage - 1) * medicinesPerPage
  const paginatedMedicines = filteredMedicines.slice(startIdx, startIdx + medicinesPerPage)

  if (!open) return null

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '24px',
      }}>
        <form onSubmit={handleSubmit}>
          {/* Step 1: Supplier Selection */}
          <div style={{
            background: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            borderLeft: '4px solid #0c3b73',
          }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '8px',
            }}>
              Step 1: Select Supplier *
            </label>
            <select
              value={selectedSupplier?._id || selectedSupplier?.id || ''}
              onChange={(e) => {
                const supplier = suppliers.find(s => (s._id || s.id) === e.target.value)
                setSelectedSupplier(supplier || null)
              }}
              disabled={loadingSuppliers}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                background: 'white',
              }}
            >
              <option value="">
                {loadingSuppliers ? 'Loading suppliers...' : 'Choose a supplier'}
              </option>
              {suppliers.map(s => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.companyName || s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Medicine Selection */}
          {selectedSupplier && (
            <div style={{
              background: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              borderLeft: '4px solid #16a34a',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#374151',
                }}>
                  Step 2: Select Medicines ({selectedCount} selected, {selectedWithQty} with qty)
                </label>
                {paginatedMedicines.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAll}
                    style={{
                      background: 'transparent',
                      border: '1px solid #16a34a',
                      color: '#16a34a',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    {selectedMedicines.size === supplierMedicines.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              {/* Search Bar */}
              {!loadingMedicines && supplierMedicines.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="Search medicine name, generic name, manufacturer..."
                    value={medicineSearch}
                    onChange={(e) => {
                      setMedicineSearch(e.target.value)
                      setMedicinePage(1)
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              {loadingMedicines && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                  Loading medicines...
                </div>
              )}

              {!loadingMedicines && supplierMedicines.length === 0 && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #fcd34d',
                  padding: '12px',
                  borderRadius: '6px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  color: '#92400e',
                  fontSize: '12px',
                }}>
                  <AlertCircle size={16} />
                  <span>This supplier has no medicines available</span>
                </div>
              )}

              {!loadingMedicines && filteredMedicines.length === 0 && medicineSearch && (
                <div style={{
                  background: '#fecaca',
                  border: '1px solid #fca5a5',
                  padding: '12px',
                  borderRadius: '6px',
                  color: '#991b1b',
                  fontSize: '12px',
                  textAlign: 'center',
                }}>
                  No medicines found matching "{medicineSearch}"
                </div>
              )}

              {!loadingMedicines && filteredMedicines.length > 0 && (
                <>
                  <div style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    overflow: 'auto',
                    maxHeight: '400px',
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #d1d5db', position: 'sticky', top: 0 }}>
                          <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#374151', width: '40px' }}>
                            ☑
                          </th>
                          <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>
                            Medicine
                          </th>
                          <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#374151', width: '80px' }}>
                            Stock
                          </th>
                          <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#374151', width: '80px' }}>
                            MRP
                          </th>
                          <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#374151', width: '100px' }}>
                            Qty *
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedMedicines.map((med, idx) => (
                          <tr key={med._id} style={{
                            borderBottom: '1px solid #e5e7eb',
                            background: selectedMedicines.has(med._id) ? '#f0fdf4' : idx % 2 === 0 ? '#fafafa' : 'white',
                          }}>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => toggleMedicine(med._id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: selectedMedicines.has(med._id) ? '#16a34a' : '#d1d5db',
                                }}
                              >
                                {selectedMedicines.has(med._id) ? (
                                  <CheckCircle size={18} />
                                ) : (
                                  <Circle size={18} />
                                )}
                              </button>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: '500', color: '#111827' }}>{med.name}</div>
                              <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                                {med.manufacturer && `${med.manufacturer} • `}
                                {med.strength}
                              </div>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center', color: med.stock < med.minStock ? '#dc2626' : '#374151' }}>
                              {med.stock}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center', color: '#374151' }}>
                              ₹{med.mrp.toFixed(2)}
                            </td>
                            <td style={{ padding: '10px' }}>
                              {selectedMedicines.has(med._id) && (
                                <input
                                  type="number"
                                  min="1"
                                  value={quantities[med._id] || ''}
                                  onChange={(e) => updateQuantity(med._id, e.target.value)}
                                  placeholder="0"
                                  style={{
                                    width: '100%',
                                    padding: '6px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                  }}
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '12px',
                      padding: '8px',
                      background: '#f3f4f6',
                      borderRadius: '6px',
                    }}>
                      <button
                        onClick={() => setMedicinePage(Math.max(1, medicinePage - 1))}
                        disabled={medicinePage === 1}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          background: medicinePage === 1 ? '#f3f4f6' : 'white',
                          cursor: medicinePage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: medicinePage === 1 ? '#9ca3af' : '#374151',
                        }}
                      >
                        ← Prev
                      </button>

                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        Page {medicinePage} of {totalPages} ({filteredMedicines.length} results)
                      </span>

                      <button
                        onClick={() => setMedicinePage(Math.min(totalPages, medicinePage + 1))}
                        disabled={medicinePage === totalPages}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          background: medicinePage === totalPages ? '#f3f4f6' : 'white',
                          cursor: medicinePage === totalPages ? 'not-allowed' : 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: medicinePage === totalPages ? '#9ca3af' : '#374151',
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 3: Additional Details */}
          {selectedSupplier && (
            <div style={{
              background: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              borderLeft: '4px solid #7c3aed',
            }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#374151',
                marginBottom: '12px',
              }}>
                Step 3: Additional Details (Optional)
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>
                    Total Amount
                  </label>
                  <div style={{
                    padding: '8px',
                    background: '#ecfdf5',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#16a34a',
                  }}>
                    ₹{totalAmt.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    resize: 'vertical',
                    minHeight: '60px',
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedWithQty === 0}
              style={{
                padding: '10px 24px',
                border: 'none',
                borderRadius: '6px',
                background: selectedWithQty === 0 ? '#d1d5db' : '#16a34a',
                color: 'white',
                cursor: selectedWithQty === 0 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={14} />
              {loading ? 'Creating...' : `Create Bulk PO (${selectedWithQty} items)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BulkCreatePOModal
