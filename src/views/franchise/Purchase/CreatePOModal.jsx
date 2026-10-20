/* eslint-disable prettier/prettier */
/**
 * CreatePOModal — Production-level Purchase Order creation
 * Features: Supplier dropdown, Medicine autocomplete, Auto-fill rates, Real API integration
 */
import { useState, useEffect, useRef } from 'react'
import { X, Plus, Trash2, ShoppingCart, Search, Package } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const EMPTY_ITEM = { 
  medicineId: '', 
  medicineName: '', 
  salt: '',
  formulation: '',
  qty: 1, 
  ptr: '', 
  mrp: '',
  scheme: '',
  batchNo: '',
  expiryDate: ''
}

const CreatePOModal = ({ open, onClose, onSaved, prefilledSupplier = null, prefilledMedicine = null }) => {
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(prefilledSupplier || null)
  const [expectedDate, setExpDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([{ ...EMPTY_ITEM }])
  const [loading, setLoading] = useState(false)
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)

  // Fetch suppliers on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoadingSuppliers(true)
      try {
        const res = await getRequest('/franchise-suppliers/suppliers')
        console.log('📦 Fetched suppliers response:', res)
        console.log('📦 res.data:', res?.data)
        
        // Handle different response structures
        let suppliersList = []
        
        if (Array.isArray(res?.data)) {
          // Direct array
          suppliersList = res.data
        } else if (Array.isArray(res?.data?.data)) {
          // Nested in data.data
          suppliersList = res.data.data
        } else if (Array.isArray(res?.data?.suppliers)) {
          // In data.suppliers
          suppliersList = res.data.suppliers
        } else if (res?.data?.data?.suppliers && Array.isArray(res.data.data.suppliers)) {
          // In data.data.suppliers
          suppliersList = res.data.data.suppliers
        } else {
          console.error('❌ Unexpected supplier response format:', res?.data)
          suppliersList = []
        }
        
        console.log('📦 Final suppliers list:', suppliersList)
        setSuppliers(suppliersList)
      } catch (err) {
        console.error('❌ Failed to fetch suppliers:', err)
        toast.error('Failed to load suppliers')
        setSuppliers([])
      } finally {
        setLoadingSuppliers(false)
      }
    }
    fetchSuppliers()
  }, [])

  // Prefill medicine if coming from LiveRateCompare
  useEffect(() => {
    if (prefilledMedicine && prefilledSupplier) {
      setItems([{
        medicineId: prefilledMedicine.id,
        medicineName: prefilledMedicine.name,
        salt: prefilledMedicine.salt || '',
        formulation: prefilledMedicine.formulation || '',
        qty: 1,
        ptr: prefilledMedicine.ptr || prefilledMedicine.netRate || '',
        mrp: prefilledMedicine.mrp || '',
        scheme: '',
        batchNo: prefilledMedicine.batchNo || '',
        expiryDate: prefilledMedicine.expiryDate || ''
      }])
    }
  }, [prefilledMedicine, prefilledSupplier])

  const addItem = () => setItems((p) => [...p, { ...EMPTY_ITEM }])
  const delItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i))
  const setItem = (i, field, val) => setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const totalAmt = items.reduce((sum, it) => sum + (parseFloat(it.ptr || 0) * parseInt(it.qty || 0)), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedSupplier) { 
      toast.error('Please select a supplier') 
      return 
    }
    
    const validItems = items.filter(it => it.medicineId && it.qty > 0 && it.ptr)
    if (validItems.length === 0) { 
      toast.error('Add at least one medicine with valid details') 
      return 
    }

    setLoading(true)
    try {
      const payload = {
        supplierId: selectedSupplier._id || selectedSupplier.id,
        supplierName: selectedSupplier.companyName || selectedSupplier.name,
        expectedDeliveryDate: expectedDate || undefined,
        notes: notes || undefined,
        items: validItems.map(it => ({
          medicineId: it.medicineId,
          medicineName: it.medicineName,
          salt: it.salt,
          formulation: it.formulation,
          quantity: parseInt(it.qty),
          purchasePrice: parseFloat(it.ptr),
          mrp: parseFloat(it.mrp) || undefined,
          scheme: it.scheme || undefined,
          batchNo: it.batchNo || undefined,
          expiryDate: it.expiryDate || undefined,
        }))
      }

      console.log('📤 Submitting PO:', payload)
      console.log('📤 Request method: POST')
      console.log('📤 Request URL:', '/franchise/purchase/orders')
      
      const res = await postRequest({ 
        url: '/franchise/purchase/orders', 
        cred: payload 
      })
      console.log('✅ PO Created Response:', res)
      console.log('✅ Response data type:', typeof res.data)
      console.log('✅ Response data:', res.data)
      
      const poNo = res?.data?.data?.poNo || res?.data?.poNo || 'created'
      toast.success(`Purchase Order ${poNo} created successfully!`)
      onSaved()
    } catch (err) {
      console.error('❌ Failed to create PO:', err)
      console.error('❌ Error response:', err?.response)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create Purchase Order'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: '20px 16px' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 820, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#7c3aed18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={18} color="#7c3aed" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Create Purchase Order</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Select supplier and add medicines</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Header fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Supplier / Distributor *</label>
              {loadingSuppliers ? (
                <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                  Loading suppliers...
                </div>
              ) : (
                <select 
                  value={selectedSupplier?._id || selectedSupplier?.id || ''} 
                  onChange={(e) => {
                    const supplier = suppliers.find(s => (s._id || s.id) === e.target.value)
                    setSelectedSupplier(supplier || null)
                  }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  required
                >
                  <option value="">-- Select Supplier --</option>
                  {Array.isArray(suppliers) && suppliers.length > 0 ? (
                    suppliers.map((sup) => (
                      <option key={sup._id || sup.id} value={sup._id || sup.id}>
                        {sup.companyName || sup.name} {sup.address?.city || sup.city ? `- ${sup.address?.city || sup.city}` : ''}
                      </option>
                    ))
                  ) : (
                    <option disabled>No suppliers available</option>
                  )}
                </select>
              )}
              {selectedSupplier && (
                <div style={{ marginTop: 6, padding: '6px 10px', background: '#f0fdf4', borderRadius: 6, fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                  ✓ {selectedSupplier.companyName || selectedSupplier.name} selected
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Expected Delivery Date</label>
              <input type="date" value={expectedDate} onChange={(e) => setExpDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Notes / Remarks</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" style={inputStyle} />
            </div>
          </div>

          {/* Items table */}
          <div style={{ flex: 1, minHeight: '400px', maxHeight: '500px', display: 'flex', flexDirection: 'column', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                Order Items ({items.length})
              </label>
              <button 
                type="button" 
                onClick={addItem} 
                disabled={!selectedSupplier}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 4, 
                  padding: '5px 12px', 
                  borderRadius: 6, 
                  border: '1px solid #0c3b7340', 
                  background: selectedSupplier ? '#0c3b7310' : '#f3f4f6', 
                  color: selectedSupplier ? '#0c3b73' : '#9ca3af', 
                  fontSize: 12, 
                  fontWeight: 600, 
                  cursor: selectedSupplier ? 'pointer' : 'not-allowed' 
                }}
              >
                <Plus size={13} /> Add Medicine
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, minHeight: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Medicine', 'Salt/Form', 'Qty', 'PTR (₹)', 'MRP (₹)', 'Scheme', 'Total', ''].map((h) => (
                      <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 12, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <MedicineRow
                      key={i}
                      index={i}
                      item={item}
                      supplier={selectedSupplier}
                      onChange={(field, val) => setItem(i, field, val)}
                      onDelete={() => delItem(i)}
                      canDelete={items.length > 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'right', marginTop: 12, padding: '12px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Total Items: {items.filter(it => it.medicineId).length}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Total Amount: ₹{totalAmt.toFixed(2)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading || !selectedSupplier || items.filter(it => it.medicineId).length === 0} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: loading || !selectedSupplier ? '#93c5fd' : '#0c3b73', color: '#fff', fontWeight: 700, fontSize: 13, cursor: loading || !selectedSupplier ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Submitting…' : 'Submit PO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Medicine Row Component with Autocomplete
const MedicineRow = ({ index, item, supplier, onChange, onDelete, canDelete }) => {
  const [query, setQuery] = useState(item.medicineName || '')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Update query when item.medicineName changes from parent
  useEffect(() => {
    if (item.medicineName && query !== item.medicineName) {
      setQuery(item.medicineName)
    }
  }, [item.medicineName])

  // Fetch medicine suggestions from supplier's inventory
  useEffect(() => {
    if (!supplier) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    const fetchSuggestions = async () => {
      // Don't search if query is too short or if medicine is already selected
      if (query.trim().length < 2) {
        setSuggestions([])
        setShowDropdown(false)
        return
      }
      
      // Don't search if this medicine is already fully selected
      if (item.medicineId && query === item.medicineName) {
        setSuggestions([])
        setShowDropdown(false)
        return
      }

      setLoadingSuggestions(true)
      try {
        const supplierId = supplier._id || supplier.id
        const supplierName = supplier.companyName || supplier.name
        console.log(`🔍 Row ${index + 1}: Searching for "${query}" from ${supplierName}`)
        
        let medicines = []
        
        // Try Method 1: Public search endpoint with supplier filter
        try {
          const res = await getRequest(`/franchise-suppliers/medicines/search?search=${encodeURIComponent(query.trim())}&supplierName=${encodeURIComponent(supplierName)}`)
          
          const rawMedicines = res?.data?.data?.medicines || res?.data?.medicines || res?.data || []
          
          // Only process if we got an array back
          if (Array.isArray(rawMedicines) && rawMedicines.length > 0) {
            // Transform format
            medicines = rawMedicines.map(med => ({
              _id: med._id,
              name: med.name || med.medicineName,
              salt: med.genericName || med.salt,
              formulation: med.formulation,
              supplierRate: {
                purchasePrice: med.supplierPrice || med.ptr || med.supplierInfo?.price || 0,
                mrp: med.mrp || 0,
                qty: med.stockQuantity || med.quantity || med.stock || 0,
                scheme: med.scheme || '',
                batchNo: med.batchNo || '',
                expiryDate: med.expiryDate || ''
              }
            }))
          } else {
            // If empty or not array, throw to try Method 2
            throw new Error('No medicines from Method 1')
          }
        } catch (err1) {
          console.log(`⚠️ Row ${index + 1}: Method 1 failed, trying Method 2...`)
          
          // Fallback Method 2: Live-rate API with supplier filtering
          const res2 = await getRequest(`/franchise/purchase/live-rate?medicine=${encodeURIComponent(query.trim())}`)
          
          const allMedicines = res2?.data?.data?.medicines || res2?.data?.medicines || []
          
          // Filter by selected supplier
          medicines = allMedicines
            .map(med => {
              const supplierRate = med.supplierRates?.find(sr => 
                sr.supplierId === supplierId || 
                sr.supplierName === supplierName
              )
              return supplierRate ? { ...med, supplierRate } : null
            })
            .filter(Boolean)
        }
        
        console.log(`✅ Row ${index + 1}: Found ${medicines.length} medicines`)
        
        setSuggestions(medicines)
        setShowDropdown(medicines.length > 0)
      } catch (err) {
        console.error(`❌ Row ${index + 1}: Error fetching medicines:`, err)
        setSuggestions([])
        setShowDropdown(false)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [query, supplier, index, item.medicineId, item.medicineName])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectMedicine = (medicine) => {
    console.log(`✅ Row ${index + 1}: Selected medicine:`, medicine.name)
    onChange('medicineId', medicine._id)
    onChange('medicineName', medicine.name)
    onChange('salt', medicine.salt || '')
    onChange('formulation', medicine.formulation || '')
    onChange('ptr', medicine.supplierRate.purchasePrice || '')
    onChange('mrp', medicine.supplierRate.mrp || medicine.mrp || '')
    onChange('scheme', medicine.supplierRate.scheme || '')
    onChange('batchNo', medicine.supplierRate.batchNo || '')
    onChange('expiryDate', medicine.supplierRate.expiryDate || '')
    setQuery(medicine.name)
    setSuggestions([])
    setShowDropdown(false)
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setQuery(newValue)
    
    // Clear selection if user changes the text
    if (item.medicineId && newValue !== item.medicineName) {
      onChange('medicineId', '')
      onChange('medicineName', '')
      onChange('salt', '')
      onChange('formulation', '')
      onChange('ptr', '')
      onChange('mrp', '')
      onChange('scheme', '')
      onChange('batchNo', '')
      onChange('expiryDate', '')
    }
  }

  const handleInputFocus = () => {
    // Show dropdown if we have suggestions and medicine not fully selected
    if (suggestions.length > 0 && !item.medicineId) {
      setShowDropdown(true)
    }
  }

  return (
    <tr style={{ borderTop: '1px solid #f3f4f6' }}>
      <td style={{ padding: '6px 8px', position: 'relative', minWidth: 180 }}>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <input 
            ref={inputRef}
            value={query} 
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={supplier ? "Type to search medicine..." : "Select supplier first"}
            disabled={!supplier}
            style={{ 
              ...inputStyle, 
              height: 32, 
              fontSize: 12,
              background: item.medicineId ? '#f0fdf4' : '#fafafa',
              border: `1px solid ${item.medicineId ? '#16a34a' : showDropdown ? '#0c3b73' : '#e5e7eb'}`,
              fontWeight: item.medicineId ? 600 : 400,
              color: item.medicineId ? '#16a34a' : '#111827',
              paddingRight: item.medicineId ? '30px' : '10px'
            }} 
          />
          
          {item.medicineId && (
            <div style={{ 
              position: 'absolute', 
              top: 6, 
              right: 8, 
              background: '#16a34a', 
              color: '#fff', 
              fontSize: 9, 
              fontWeight: 700, 
              padding: '2px 5px', 
              borderRadius: 3,
              pointerEvents: 'none'
            }}>
              ✓
            </div>
          )}

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 2,
              background: '#fff',
              border: '2px solid #0c3b73',
              borderRadius: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              maxHeight: 200,
              overflowY: 'auto',
              zIndex: 10000,  // ✅ Increased from 1000 to 10000 to appear above table
            }}>
              {loadingSuggestions ? (
                <div style={{ padding: '8px 10px', fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
                  Searching...
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div style={{ 
                    padding: '6px 10px', 
                    background: '#f0f9ff', 
                    borderBottom: '1px solid #0c3b7320',
                    fontSize: 10,
                    color: '#0c3b73',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {suggestions.length} medicine{suggestions.length > 1 ? 's' : ''} found
                  </div>
                  {suggestions.map((med, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectMedicine(med)}
                      style={{
                        padding: '8px 10px',
                        cursor: 'pointer',
                        borderBottom: idx < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                        fontSize: 12,
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                    >
                      <div style={{ fontWeight: 600, color: '#111827', marginBottom: 2 }}>{med.name}</div>
                      {med.salt && (
                        <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>
                          {med.salt} {med.formulation && `• ${med.formulation}`}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                        <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>
                          ₹{med.supplierRate.purchasePrice}
                        </span>
                        <span style={{ fontSize: 10, color: '#6b7280' }}>
                          Stock: {med.supplierRate.qty}
                        </span>
                        {med.supplierRate.scheme && (
                          <span style={{ fontSize: 10, color: '#7c3aed', fontWeight: 600 }}>
                            {med.supplierRate.scheme}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ padding: '8px 10px', fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
                  No medicines found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
      </td>
      <td style={{ padding: '6px 8px', fontSize: 11, color: '#6b7280', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.salt || item.formulation ? `${item.salt || ''} ${item.formulation || ''}`.trim() : '—'}
      </td>
      <td style={{ padding: '6px 8px', width: 70 }}>
        <input 
          type="number" 
          value={item.qty} 
          min={1} 
          onChange={(e) => onChange('qty', e.target.value)} 
          style={{ ...inputStyle, height: 32, width: '100%', fontSize: 12 }} 
        />
      </td>
      <td style={{ padding: '6px 8px', width: 90 }}>
        <input 
          type="number" 
          step="0.01" 
          value={item.ptr} 
          onChange={(e) => onChange('ptr', e.target.value)} 
          placeholder="0.00" 
          style={{ ...inputStyle, height: 32, width: '100%', fontSize: 12 }} 
        />
      </td>
      <td style={{ padding: '6px 8px', width: 90 }}>
        <input 
          type="number" 
          step="0.01" 
          value={item.mrp} 
          onChange={(e) => onChange('mrp', e.target.value)} 
          placeholder="0.00" 
          style={{ ...inputStyle, height: 32, width: '100%', fontSize: 12 }} 
        />
      </td>
      <td style={{ padding: '6px 8px', width: 80 }}>
        <input 
          value={item.scheme} 
          onChange={(e) => onChange('scheme', e.target.value)} 
          placeholder="10+1" 
          style={{ ...inputStyle, height: 32, width: '100%', fontSize: 12 }} 
        />
      </td>
      <td style={{ padding: '6px 8px', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 13 }}>
        ₹{(parseFloat(item.ptr || 0) * parseInt(item.qty || 0)).toFixed(2)}
      </td>
      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
        {canDelete && (
          <button 
            type="button" 
            onClick={onDelete} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48', padding: 4 }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </td>
    </tr>
  )
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }
const inputStyle  = { width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 7, padding: '0 11px', fontSize: 13, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }

export default CreatePOModal
