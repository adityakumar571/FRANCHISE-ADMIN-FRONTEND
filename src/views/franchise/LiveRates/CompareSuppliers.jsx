/* eslint-disable prettier/prettier */
import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitCompare, Search, ShoppingCart, Star } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function CompareSuppliers() {
  const navigate        = useNavigate()
  const [medicine, setMedicine] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [savings, setSavings]   = useState(0)
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const debounceRef = useRef()
  const suggestionDebounceRef = useRef()

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const res = await getRequest(`/franchise-suppliers/medicines/search?query=${encodeURIComponent(query)}`)
      if (res.data?.data) {
        setSuggestions(res.data.data)
        setShowSuggestions(true)
      }
    } catch (err) {
      console.error('Suggestion fetch error:', err)
      setSuggestions([])
    }
  }, [])

  // Fetch comparison data
  const fetchCompare = useCallback(async (medicineData) => {
    if (!medicineData) return
    
    const searchTerm = typeof medicineData === 'string' ? medicineData : medicineData._id || medicineData.genericName
    
    setLoading(true)
    setSearched(true)
    setShowSuggestions(false)
    
    try {
      const res = await getRequest(`/franchise-suppliers/medicines/compare/${encodeURIComponent(searchTerm)}`)
      
      if (res.data?.data?.suppliers) {
        const transformedSuppliers = res.data.data.suppliers.map((item, index) => ({
          id: item.supplierInfo._id || index,
          name: item.supplierInfo.companyName,
          verified: item.supplierInfo.rating >= 4,
          best: item.isBestPrice,
          priceMRP: item.medicine.mrp || 0,
          discount: item.medicine.discount > 0 ? `${item.medicine.discount}% OFF` : 'No Discount',
          yourPrice: item.medicine.effectiveRate || 0,
          scheme: item.medicine.scheme || 'No Scheme',
          stock: item.medicine.stock > 0 ? `${item.medicine.stock} Available` : 'Out of Stock',
          stockQty: item.medicine.stock || 0,
          delivery: item.medicine.deliveryEstimate || 'Next Day',
          rating: item.supplierInfo.rating?.toFixed(1) || '0.0',
          medicineName: item.medicine.name,
          genericName: item.medicine.genericName
        }))
        
        setSuppliers(transformedSuppliers)
        
        // Calculate savings
        if (transformedSuppliers.length > 1) {
          const sortedByPrice = [...transformedSuppliers].sort((a, b) => a.yourPrice - b.yourPrice)
          const lowestPrice = sortedByPrice[0].yourPrice
          const highestPrice = sortedByPrice[sortedByPrice.length - 1].yourPrice
          setSavings(highestPrice - lowestPrice)
        } else {
          setSavings(0)
        }

        // Set selected medicine info
        if (transformedSuppliers.length > 0) {
          setSelectedMedicine({
            name: transformedSuppliers[0].medicineName,
            genericName: transformedSuppliers[0].genericName
          })
        }
      } else {
        setSuppliers([])
        setSavings(0)
      }
    } catch (err) { 
      console.error('Comparison fetch error:', err)
      toast.error('Failed to load comparison') 
      setSuppliers([])
      setSavings(0)
    }
    finally { setLoading(false) }
  }, [])

  // Handle input change - show suggestions
  const handleChange = (val) => {
    setMedicine(val)
    setSelectedMedicine(null)
    
    // Fetch suggestions
    clearTimeout(suggestionDebounceRef.current)
    suggestionDebounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setMedicine(suggestion._id || suggestion.genericName)
    setSelectedMedicine(suggestion)
    setShowSuggestions(false)
    setSuggestions([])
    fetchCompare(suggestion.genericName)
  }

  // Handle search button click
  const handleSearch = () => {
    if (medicine) {
      fetchCompare(medicine)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && medicine) {
      setShowSuggestions(false)
      fetchCompare(medicine)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={GitCompare} title="Compare Suppliers" subtitle="Compare medicine prices across all suppliers" color="#7c3aed" />

      {/* Search with Autocomplete */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', position: 'relative' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              value={medicine} 
              onChange={e => handleChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Type medicine name (e.g., Paracetamol, Dolo, Clavm)..."
              style={{ 
                width: '100%', 
                padding: '10px 14px', 
                border: '1px solid #e5e7eb', 
                borderRadius: 8, 
                fontSize: 13, 
                outline: 'none', 
                background: '#f9fafb', 
                boxSizing: 'border-box' 
              }} 
            />
            
            {/* Selected Medicine Info */}
            {selectedMedicine && (
              <div style={{ marginTop: 6, fontSize: 11, color: '#6b7280', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Searching:</span>
                <span>{selectedMedicine.name}</span>
                <span style={{ color: '#9ca3af' }}>|</span>
                <span>Generic: {selectedMedicine.genericName}</span>
              </div>
            )}
            
            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 4,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                maxHeight: 300,
                overflowY: 'auto',
                zIndex: 1000
              }}>
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: idx < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                        {suggestion._id}
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                        Generic: {suggestion.genericName} {suggestion.category && `• ${suggestion.category}`}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>
                      <div>{suggestion.supplierCount} supplier{suggestion.supplierCount > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={handleSearch}
            disabled={!medicine || loading}
            style={{
              padding: '10px 20px',
              background: medicine ? '#7c3aed' : '#e5e7eb',
              color: medicine ? '#fff' : '#9ca3af',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: medicine ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { if (medicine) e.currentTarget.style.background = '#6d28d9' }}
            onMouseLeave={e => { if (medicine) e.currentTarget.style.background = '#7c3aed' }}
          >
            <Search size={14} />
            Compare
          </button>
        </div>
      </div>

      {!searched && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
          <GitCompare size={36} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>
            Search for a medicine to compare prices
          </div>
          <div>
            Type at least 2 characters to see suggestions, then select a medicine
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: '#9ca3af' }}>
            Try: "Paracetamol", "Dolo", "Clavm 625", "Amoxicillin"
          </div>
        </div>
      )}

      {searched && (() => {
        // Find the actual best supplier (not just first)
        const bestSupplier = suppliers.find(s => s.best === true) || suppliers[0]
        
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>
            {/* Suppliers Table */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>All Suppliers ({suppliers.length})</p>
                  {selectedMedicine && (
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6b7280' }}>
                      {selectedMedicine.name} • Generic: {selectedMedicine.genericName}
                    </p>
                  )}
                </div>
                {savings > 0 && (
                  <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '4px 10px', borderRadius: 20, border: '1px solid #bbf7d0' }}>
                    Save ₹{savings.toFixed(2)} per unit by choosing best
                  </span>
                )}
              </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <Th c="" /><Th c="Supplier" /><Th c="MRP (₹)" align="right" /><Th c="Discount" align="center" />
                  <Th c="Your Price" align="right" /><Th c="Scheme" /><Th c="Stock" /><Th c="Delivery" /><Th c="Rating" align="center" />
                </tr></thead>
                <tbody>
                  {loading
                    ? Array(4).fill(0).map((_, i) => (
                      <tr key={i}>{Array(9).fill(0).map((_, j) => (
                        <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>
                      ))}</tr>
                    ))
                    : suppliers.length === 0
                      ? <tr><td colSpan={9} style={{ padding: 28, textAlign: 'center', color: '#9ca3af' }}>No supplier data found</td></tr>
                      : suppliers.map((s, i) => (
                        <tr key={s.id || i}
                          style={{ background: s.best ? '#f0fdf4' : '#fff' }}
                          onMouseEnter={e => { if (!s.best) e.currentTarget.style.background = '#fafafa' }}
                          onMouseLeave={e => { if (!s.best) e.currentTarget.style.background = '' }}>
                          <Td>
                            <input type="checkbox" style={{ cursor: 'pointer' }} />
                          </Td>
                          <Td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 600 }}>{s.name}</span>
                              {s.verified && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: '#dcfce7', color: '#16a34a' }}>✓</span>}
                              {s.best && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: '#fef3c7', color: '#d97706' }}>Best</span>}
                            </div>
                          </Td>
                          <Td style={{ textAlign: 'right', color: '#6b7280' }}>₹ {s.priceMRP?.toFixed(2)}</Td>
                          <Td style={{ textAlign: 'center', fontWeight: 600, color: '#16a34a' }}>{s.discount}</Td>
                          <Td style={{ textAlign: 'right', fontWeight: 700, color: s.best ? '#16a34a' : '#111827' }}>₹ {s.yourPrice?.toFixed(2)}</Td>
                          <Td style={{ fontSize: 12, color: '#6b7280' }}>{s.scheme}</Td>
                          <Td>
                            <span style={{ fontSize: 11, fontWeight: 600, color: s.stockQty > 0 ? '#16a34a' : '#dc2626' }}>{s.stock}</span>
                          </Td>
                          <Td style={{ fontSize: 12, color: '#6b7280' }}>{s.delivery}</Td>
                          <Td style={{ textAlign: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>
                              <Star size={12} fill="#f59e0b" /> {s.rating}
                            </span>
                          </Td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>

            {/* Best Supplier Panel */}
            {bestSupplier && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Best Supplier
                  {bestSupplier.best && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: '#fef3c7', color: '#d97706' }}>
                      Lowest Price
                    </span>
                  )}
                </h3>
                
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14 }}>
                  <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#111827' }}>
                    {bestSupplier.name}
                  </p>
                  {bestSupplier.medicineName && (
                    <p style={{ margin: '0 0 8px', fontSize: 11, color: '#6b7280' }}>
                      {bestSupplier.medicineName}
                    </p>
                  )}
                  <p style={{ margin: '0 0 12px', fontSize: 16, color: '#16a34a', fontWeight: 700 }}>
                    ₹{bestSupplier.yourPrice?.toFixed(2)}
                  </p>
                  
                  {[
                    ['MRP',      `₹${bestSupplier.priceMRP?.toFixed(2)}`],
                    ['Discount', bestSupplier.discount],
                    ['Scheme',   bestSupplier.scheme],
                    ['Stock',    bestSupplier.stock],
                    ['Delivery', bestSupplier.delivery],
                    ['Rating',   `⭐ ${bestSupplier.rating}`],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #dcfce7', fontSize: 12 }}>
                      <span style={{ color: '#6b7280' }}>{l}</span>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => {
                    // Prepare cart item from best supplier
                    const cartItem = {
                      id: `cart_${Date.now()}`,
                      supplierId: bestSupplier.id,
                      supplierName: bestSupplier.name,
                      name: bestSupplier.medicineName || selectedMedicine?.name || 'Selected Medicine',
                      genericName: bestSupplier.genericName || selectedMedicine?.genericName,
                      pack: `${bestSupplier.priceMRP ? 'MRP ₹' + bestSupplier.priceMRP : 'Pack'}`,
                      qty: 1,
                      price: bestSupplier.yourPrice || 0,
                      mrp: bestSupplier.priceMRP || 0,
                      discountPct: bestSupplier.discount ? parseInt(bestSupplier.discount) : 0,
                      amount: bestSupplier.yourPrice || 0,
                      scheme: bestSupplier.scheme,
                      stock: bestSupplier.stockQty,
                      delivery: bestSupplier.delivery,
                      rating: bestSupplier.rating
                    }
                    
                    // Save to localStorage (temporary cart)
                    const existingCart = JSON.parse(localStorage.getItem('purchaseCart') || '[]')
                    existingCart.push(cartItem)
                    localStorage.setItem('purchaseCart', JSON.stringify(existingCart))
                    
                    toast.success(`Added ${cartItem.name} to cart!`)
                    navigate('/franchise/live-rates/purchase-cart')
                  }}
                  style={{ 
                    padding: '12px', 
                    border: 'none', 
                    borderRadius: 8, 
                    background: '#0c3b73', 
                    color: '#fff', 
                    fontSize: 13, 
                    fontWeight: 700, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 6,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0a2d5a'}
                  onMouseLeave={e => e.currentTarget.style.background = '#0c3b73'}
                >
                  <ShoppingCart size={14} /> Add to Cart
                </button>
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
