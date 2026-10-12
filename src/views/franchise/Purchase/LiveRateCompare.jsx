/* eslint-disable prettier/prettier */
/**
 * LiveRateCompare — Compare supplier stock, price and schemes
 * SOW §9.1: Live Medicine Price & Stock Comparison
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BarChart2, Star, ShoppingCart, Package, Percent, X } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'

const LiveRateCompare = () => {
  const navigate = useNavigate()
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedMed, setSelectedMed] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Fetch medicine suggestions as user types - directly from supplier inventory
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([])
        setShowDropdown(false)
        return
      }

      setLoadingSuggestions(true)
      try {
        // Fetch medicines directly from suppliers (live-rate API gives us available medicines)
        const res = await getRequest(`/franchise/purchase/live-rate?medicine=${encodeURIComponent(query.trim())}`)
        const medicines = res?.data?.data?.medicines || res?.data?.medicines || []
        
        console.log('Autocomplete - Found medicines:', medicines.length)
        
        // Extract unique medicine suggestions with supplier count
        const uniqueMedicines = medicines.map(med => ({
          _id: med._id,
          name: med.name,
          salt: med.salt,
          formulation: med.formulation,
          mrp: med.mrp,
          supplierCount: med.supplierRates?.length || 0,
          suppliers: med.supplierRates?.map(s => s.supplierName).join(', ') || '',
          minPrice: Math.min(...(med.supplierRates?.map(s => s.purchasePrice) || [0]))
        }))
        
        setSuggestions(uniqueMedicines)
        setShowDropdown(uniqueMedicines.length > 0)
      } catch (err) {
        console.error('Error fetching medicines:', err)
        setSuggestions([])
        setShowDropdown(false)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [query])

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
    setQuery(medicine.name)
    setSelectedMed(medicine)
    setShowDropdown(false)
    // Don't auto-trigger search, let user click Compare button
  }

  const handleSearchWithMedicine = async (medicineName) => {
    const searchQuery = medicineName || query.trim()
    if (!searchQuery) {
      toast.error('Please select a medicine first')
      return
    }
    
    setLoading(true)
    setShowDropdown(false)
    try {
      const res = await getRequest(`/franchise/purchase/live-rate?medicine=${encodeURIComponent(searchQuery)}`)
      console.log('🔍 API Response:', res)
      // Fix: Response has nested data structure - res.data.data.medicines
      const medicines = res?.data?.data?.medicines || res?.data?.medicines || []
      console.log('📦 Medicines:', medicines)
      
      // Transform backend response to frontend format
      const transformed = []
      medicines.forEach(med => {
        console.log('  Processing medicine:', med.name, 'with', med.supplierRates?.length, 'supplier rates')
        med.supplierRates?.forEach(rate => {
          transformed.push({
            medicineName: med.name,
            medicineId: med._id,
            salt: med.salt,
            formulation: med.formulation,
            supplier: rate.supplierName,
            supplierId: rate.supplierId,
            ptr: rate.purchasePrice,
            netRate: rate.purchasePrice * (1 - (rate.discount || 0) / 100),
            mrp: rate.mrp,
            stock: rate.qty,
            isAvailable: rate.qty > 0,
            scheme: rate.scheme || null,
            batchNo: rate.batchNo,
            expiryDate: rate.expiryDate,
            isPreferred: false,
          })
        })
      })
      
      console.log('✅ Transformed results:', transformed.length, 'supplier rates')
      
      setResults(transformed)
      setSearched(true)
      setSelectedMed(searchQuery) // Set the medicine name that was searched
      
      if (transformed.length === 0) {
        toast.error('No suppliers found for this medicine')
      } else {
        toast.success(`Found ${transformed.length} supplier(s) for ${searchQuery}`)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to fetch rates')
      setResults([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) {
      toast.error('Please enter or select a medicine')
      return
    }
    handleSearchWithMedicine(query.trim())
  }

  const minRate = results.length ? Math.min(...results.filter((r) => r.isAvailable && r.netRate != null).map((r) => Number(r.netRate || 0))) : 0

  return (
    <div>
      <PageHeader icon={BarChart2} title="Live Rate Compare" subtitle="Compare supplier stock, price and schemes in real-time" color="#0c3b73" />

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 10px', color: '#374151' }}>Search Medicine</p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
          <div ref={dropdownRef} style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 13, color: '#9ca3af', zIndex: 1 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                // Reset selection when user manually types
                if (selectedMed && e.target.value !== selectedMed.name) {
                  setSelectedMed(null)
                }
              }}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Type to search medicine name, generic, barcode…"
              style={{ 
                width: '100%', 
                height: 42, 
                border: `2px solid ${selectedMed ? '#16a34a' : showDropdown ? '#0c3b73' : '#e5e7eb'}`, 
                borderRadius: 8, 
                paddingLeft: 36, 
                paddingRight: query ? 36 : 12,
                fontSize: 13, 
                outline: 'none', 
                background: selectedMed ? '#f0fdf4' : '#fafafa', 
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                fontWeight: selectedMed ? 600 : 400,
                color: selectedMed ? '#16a34a' : '#111827'
              }}
            />
            {query && (
              <button 
                type="button"
                onClick={() => {
                  setQuery('')
                  setSelectedMed(null)
                  setSuggestions([])
                  setShowDropdown(false)
                  setSearched(false)
                  setResults([])
                  inputRef.current?.focus()
                }}
                style={{ position: 'absolute', right: 12, top: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <X size={15} />
              </button>
            )}

            {/* Selected Medicine Indicator */}
            {selectedMed && (
              <div style={{ 
                position: 'absolute', 
                top: -8, 
                left: 12, 
                background: '#16a34a', 
                color: '#fff', 
                fontSize: 10, 
                fontWeight: 700, 
                padding: '2px 8px', 
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <span>✓</span> SELECTED
              </div>
            )}

            {/* Autocomplete Dropdown */}
            {showDropdown && !selectedMed && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 4,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                maxHeight: 320,
                overflowY: 'auto',
                zIndex: 10,
              }}>
                {loadingSuggestions ? (
                  <div style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
                    Loading medicines...
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    <div style={{ padding: '8px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', margin: 0, textTransform: 'uppercase' }}>
                        Select a medicine ({suggestions.length} found)
                      </p>
                    </div>
                    {suggestions.map((med, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectMedicine(med)}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          borderBottom: idx < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>
                              {med.name}
                            </p>
                            {med.salt && (
                              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 2px' }}>
                                {med.salt} {med.formulation && `• ${med.formulation}`}
                              </p>
                            )}
                            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                              {med.supplierCount > 0 && (
                                <span style={{ 
                                  fontSize: 11, 
                                  color: '#16a34a', 
                                  fontWeight: 600,
                                  background: '#f0fdf4',
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}>
                                  <Package size={11} />
                                  {med.supplierCount} Supplier{med.supplierCount > 1 ? 's' : ''}
                                </span>
                              )}
                              {med.minPrice > 0 && (
                                <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>
                                  From ₹{med.minPrice.toFixed(2)}
                                </span>
                              )}
                              {med.mrp && (
                                <span style={{ fontSize: 11, color: '#6b7280' }}>
                                  MRP: ₹{med.mrp}
                                </span>
                              )}
                            </div>
                            {med.suppliers && (
                              <p style={{ fontSize: 10, color: '#9ca3af', margin: '4px 0 0', fontStyle: 'italic' }}>
                                Available at: {med.suppliers}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
                    No medicines found
                  </div>
                )}
              </div>
            )}
          </div>
          <button type="submit" disabled={loading || !query.trim()} style={{ 
            padding: '0 24px', 
            borderRadius: 8, 
            border: 'none', 
            background: loading || !query.trim() ? '#d1d5db' : selectedMed ? '#16a34a' : '#0c3b73', 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: 14, 
            cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', 
            height: 42, 
            minWidth: 120,
            transition: 'background 0.2s'
          }}>
            {loading ? 'Searching…' : selectedMed ? '✓ Compare' : 'Compare'}
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div>
          <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', border: '1px solid #e5e7eb', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Package size={16} color="#0c3b73" />
                  Comparing: <span style={{ color: '#16a34a' }}>{selectedMed || 'Unknown'}</span>
                </h3>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                  {results.length > 0 
                    ? `Found ${results.length} supplier${results.length > 1 ? 's' : ''} with best rates` 
                    : 'No suppliers available for this medicine'}
                </p>
              </div>
              {results.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '6px 12px', borderRadius: 6 }}>
                  <Star size={14} fill="#16a34a" />
                  Save up to ₹{Math.max(...results.map(r => r.ptr - (r.netRate || r.ptr))).toFixed(2)} per unit
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {results.map((r, i) => {
              const isBest = r.isAvailable && r.netRate === minRate
              return (
                <div key={i} style={{
                  background: '#fff', borderRadius: 12, border: `2px solid ${isBest ? '#0c3b73' : '#e5e7eb'}`,
                  padding: '18px 18px 14px', position: 'relative', overflow: 'hidden',
                }}>
                  {isBest && (
                    <div style={{ position: 'absolute', top: 0, right: 0, background: '#0c3b73', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderBottomLeftRadius: 8 }}>
                      BEST PRICE
                    </div>
                  )}
                  {r.isPreferred && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '2px 8px', borderRadius: 20, marginBottom: 10 }}>
                      <Star size={10} fill="#16a34a" /> Preferred Supplier
                    </div>
                  )}

                  <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: '#111827' }}>{r.supplier}</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px', fontWeight: 500 }}>PTR Rate</p>
                      <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111827' }}>₹{Number(r.ptr || 0).toFixed(2)}</p>
                    </div>
                    <div style={{ background: isBest ? '#eff6ff' : '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px', fontWeight: 500 }}>Net Rate</p>
                      <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: isBest ? '#2563eb' : '#111827' }}>₹{Number(r.netRate || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: r.isAvailable ? '#16a34a' : '#e11d48', fontWeight: 600 }}>
                      <Package size={12} /> Stock: {r.isAvailable ? r.stock.toLocaleString() : 'Out of Stock'}
                    </div>
                    {r.scheme && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>
                        <Percent size={12} /> Scheme: {r.scheme}
                      </div>
                    )}
                  </div>

                  <button
                    disabled={!r.isAvailable}
                    onClick={() => navigate('/franchise/purchase/orders', { 
                      state: { 
                        prefilledSupplier: { 
                          id: r.supplierId, 
                          _id: r.supplierId,
                          companyName: r.supplier,
                          name: r.supplier 
                        },
                        prefilledMedicine: {
                          id: r.medicineId,
                          name: r.medicineName,
                          salt: r.salt,
                          formulation: r.formulation,
                          ptr: r.ptr,
                          netRate: r.netRate,
                          mrp: r.mrp,
                          batchNo: r.batchNo,
                          expiryDate: r.expiryDate,
                        }
                      }
                    })}
                    style={{
                      width: '100%', height: 38, borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 13, cursor: r.isAvailable ? 'pointer' : 'not-allowed',
                      background: r.isAvailable ? '#0c3b73' : '#e5e7eb', color: r.isAvailable ? '#fff' : '#9ca3af',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <ShoppingCart size={14} /> {r.isAvailable ? 'Create PO' : 'Out of Stock'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!searched && (
        <div style={{ textAlign: 'center', padding: '64px 20px' }}>
          <BarChart2 size={48} color="#d1d5db" style={{ margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Search a medicine to compare rates</p>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Enter medicine name or barcode above to see live stock and prices from your suppliers</p>
        </div>
      )}
    </div>
  )
}

export default LiveRateCompare
