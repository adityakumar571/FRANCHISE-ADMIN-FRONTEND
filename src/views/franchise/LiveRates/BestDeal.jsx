/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Star, Search, TrendingDown, Clock, Package, Zap } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

export default function BestDeal() {
  const [medicine, setMedicine] = useState('')
  const [deal, setDeal]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [medicines, setMedicines] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)

  // Fetch medicines on mount
  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      const res = await getRequest('/franchise/live-rates?limit=100')
      
      if (res?.data?.data?.medicines) {
        const medicineList = res.data.data.medicines.map(med => ({
          name: med.name,
          genericName: med.name,
          strength: med.strength,
          packSize: med.pack
        }))
        setMedicines(medicineList)
      }
    } catch (err) {
      console.error('Error fetching medicines:', err)
    }
  }

  // Filter medicines based on search
  const filteredMedicines = medicines.filter(med =>
    med.name?.toLowerCase().includes(medicine.toLowerCase()) ||
    med.genericName?.toLowerCase().includes(medicine.toLowerCase())
  )

  const searchDeal = async (medName = null) => {
    const searchTerm = medName || selectedMedicine?.name || medicine
    if (!searchTerm) return
    
    setLoading(true)
    setShowDropdown(false)
    try {
      const res = await getRequest(`/franchise/live-rates/best-deal?medicine=${encodeURIComponent(searchTerm)}`)
      setDeal(res.data?.data)
    } catch { 
      toast.error('No deal found for this medicine') 
      setDeal(null)
    }
    finally { setLoading(false) }
  }

  const handleSelectMedicine = (med) => {
    setSelectedMedicine(med)
    setMedicine(med.name)
    setShowDropdown(false)
    searchDeal(med.name)
  }

  const handleInputChange = (e) => {
    setMedicine(e.target.value)
    setSelectedMedicine(null)
    setShowDropdown(true)
    setDeal(null)
  }

  const handleInputFocus = () => {
    if (medicine && filteredMedicines.length > 0) {
      setShowDropdown(true)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader icon={Star} title="Best Deal Finder" subtitle="Find the lowest price across all suppliers instantly" color="#16a34a" />

      {/* Search Section */}
      <div style={{ background: '#fff', border: '2px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Search Medicine
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
              <input 
                value={medicine} 
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={e => e.key === 'Enter' && searchDeal()}
                placeholder="Type medicine name (e.g., Paracetamol, Pantoprazole, Dolo 650)"
                style={{ 
                  width: '100%', 
                  padding: '12px 14px 12px 42px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 8, 
                  fontSize: 14, 
                  outline: 'none', 
                  background: '#fff', 
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }} 
                onMouseEnter={e => e.currentTarget.style.borderColor = '#9ca3af'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}
              />
              
              {/* Autocomplete Dropdown */}
              {showDropdown && filteredMedicines.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  maxHeight: 280,
                  overflowY: 'auto',
                  zIndex: 10
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
                    {filteredMedicines.length} medicines found
                  </div>
                  {filteredMedicines.slice(0, 10).map((med, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectMedicine(med)}
                      style={{
                        padding: '12px 14px',
                        cursor: 'pointer',
                        borderBottom: idx < filteredMedicines.length - 1 ? '1px solid #f3f4f6' : 'none',
                        background: '#fff',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                        {med.name}
                      </div>
                      {(med.strength || med.packSize) && (
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {med.strength && <span>{med.strength}</span>}
                          {med.strength && med.packSize && <span> • </span>}
                          {med.packSize && <span>{med.packSize}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showDropdown && medicine && filteredMedicines.length === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '16px',
                  fontSize: 13,
                  color: '#6b7280',
                  textAlign: 'center',
                  zIndex: 10,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                  <Search size={24} color="#d1d5db" style={{ marginBottom: 8 }} />
                  <div>No medicines found matching "{medicine}"</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Try different keywords</div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => searchDeal()} 
              disabled={loading || !medicine}
              style={{ 
                padding: '12px 28px', 
                border: 'none', 
                borderRadius: 8, 
                background: loading || !medicine ? '#d1d5db' : 'linear-gradient(135deg, #16a34a, #15803d)', 
                color: '#fff', 
                fontSize: 14, 
                fontWeight: 600, 
                cursor: loading || !medicine ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: loading || !medicine ? 'none' : '0 4px 6px -1px rgba(22, 163, 74, 0.3)'
              }}
              onMouseEnter={e => !loading && medicine && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Find Deal
                </>
              )}
            </button>
          </div>
        </div>

        {selectedMedicine && (
          <div style={{ 
            marginTop: 12,
            padding: '10px 14px', 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0',
            borderRadius: 8, 
            fontSize: 13,
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Star size={14} fill="#16a34a" color="#16a34a" />
            <span><strong>Selected:</strong> {selectedMedicine.name}</span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!deal && !loading && (
        <div style={{ background: '#fff', border: '2px dashed #e5e7eb', borderRadius: 12, padding: 60, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Star size={40} color="#d1d5db" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>
            Search for Best Deals
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: '#6b7280', maxWidth: 400, margin: '0 auto' }}>
            Enter a medicine name above to find the lowest price from all verified suppliers
          </p>
        </div>
      )}

      {/* Best Deal Result */}
      {deal && (
        <div style={{ background: '#fff', border: '2px solid #bbf7d0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.1)' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
              <Star size={24} color="#fff" fill="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best Deal Found!</p>
              <p style={{ margin: '4px 0 0', fontSize: 20, color: '#fff', fontWeight: 700 }}>{deal.medicine}</p>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            {/* Supplier Info */}
            <div style={{ marginBottom: 20, padding: '16px', background: '#f9fafb', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Best Supplier</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{deal.supplierName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Effective Rate</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>₹{deal.effectiveRate?.toFixed(2)}</div>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
              {[
                { icon: Package, label: 'Basic Rate', value: `₹${deal.basicRate?.toFixed(2)}`, color: '#6b7280' },
                { icon: TrendingDown, label: 'Discount', value: deal.discount, color: '#16a34a' },
                { icon: Zap, label: 'Stock Available', value: `${deal.stock} units`, color: '#0c3b73' },
                { icon: Clock, label: 'Delivery Time', value: deal.delivery, color: '#d97706' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '14px', background: '#f9fafb', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <item.icon size={18} color={item.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scheme */}
            {deal.scheme && deal.scheme !== 'No Scheme' && (
              <div style={{ padding: '14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Star size={14} color="#d97706" fill="#d97706" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Special Scheme</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#78350f' }}>{deal.scheme}</div>
              </div>
            )}

            {/* Savings Highlight */}
            <div style={{ padding: '16px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: 10, marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 4 }}>Your Savings</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0c3b73' }}>₹{deal.savings?.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: '#3b82f6' }}>per unit</div>
            </div>

            {/* Action Button */}
            <button style={{ 
              width: '100%', 
              padding: '14px', 
              border: 'none', 
              borderRadius: 8, 
              background: 'linear-gradient(135deg, #0c3b73, #1e40af)', 
              color: '#fff', 
              fontSize: 14, 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(12, 59, 115, 0.3)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Package size={18} />
              Add to Cart
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
