/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Package, ShoppingCart, RefreshCw, Bell, Plus, TrendingDown } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', borderBottom: '2px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function LowStockAlert() {
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState({})
  const [selectedItems, setSelectedItems] = useState([])

  // Fetch medicines from local inventory
  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        // Get local inventory stock levels
        const res = await getRequest('/franchise/medicines')
        const allMedicines = res.data?.data || []
        
        // Filter medicines with low stock (< 20 units) or out of stock
        const lowStockMedicines = allMedicines
          .filter(m => (m.stock || 0) <= 20)
          .map(m => ({
            _id: m._id,
            name: m.medicineName || m.name,
            strength: m.strength,
            pack: m.packSize,
            currentStock: m.stock || 0,
            reorderLevel: m.reorderLevel || 10,
            reorderQty: m.reorderQty || 50,
            lastOrderDate: m.lastOrderDate,
            avgConsumption: m.avgDailyConsumption || 0,
            daysUntilStockout: m.stock && m.avgDailyConsumption 
              ? Math.floor(m.stock / m.avgDailyConsumption) 
              : 0,
            status: m.stock === 0 ? 'outOfStock' : m.stock <= 5 ? 'critical' : 'low'
          }))
          .sort((a, b) => a.currentStock - b.currentStock)

        setMedicines(lowStockMedicines)
      } catch (err) {
        console.error('Error loading low stock:', err)
        toast.error('Failed to load low stock medicines')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const getStatusBadge = (status) => {
    const configs = {
      critical: { 
        bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 
        color: '#991b1b', 
        border: '#ef4444',
        text: 'Critical',
        icon: AlertTriangle
      },
      outOfStock: { 
        bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
        color: '#92400e', 
        border: '#fbbf24',
        text: 'Out of Stock',
        icon: Package
      },
      low: { 
        bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', 
        color: '#9a3412', 
        border: '#fb923c',
        text: 'Low Stock',
        icon: TrendingDown
      }
    }
    return configs[status] || configs.low
  }

  const handleQuickReorder = async (medicine) => {
    setReordering({ ...reordering, [medicine._id]: true })
    
    try {
      // Find best deal for this medicine
      const res = await getRequest(`/franchise/live-rates/best-deal?medicine=${encodeURIComponent(medicine.name)}`)
      const bestDeal = res.data?.data
      
      if (bestDeal) {
        // Add to cart
        const cartItem = {
          id: `reorder-${medicine._id}-${Date.now()}`,
          medicineName: medicine.name,
          name: medicine.name,
          pack: medicine.pack,
          qty: medicine.reorderQty,
          price: bestDeal.lowestPrice,
          discountPct: 10,
          amount: medicine.reorderQty * bestDeal.lowestPrice * 0.9,
          supplierName: bestDeal.supplier
        }
        
        const currentCart = JSON.parse(localStorage.getItem('purchaseCart') || '[]')
        currentCart.push(cartItem)
        localStorage.setItem('purchaseCart', JSON.stringify(currentCart))
        
        toast.success(`${medicine.name} added to cart!`)
      } else {
        toast.error('No supplier found for this medicine')
      }
    } catch (err) {
      console.error('Reorder error:', err)
      toast.error('Failed to add to cart')
    } finally {
      setReordering({ ...reordering, [medicine._id]: false })
    }
  }

  const handleBulkReorder = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select medicines to reorder')
      return
    }

    // Add all selected items to cart
    const currentCart = JSON.parse(localStorage.getItem('purchaseCart') || '[]')
    
    selectedItems.forEach(id => {
      const medicine = medicines.find(m => m._id === id)
      if (medicine) {
        currentCart.push({
          id: `reorder-${medicine._id}-${Date.now()}`,
          medicineName: medicine.name,
          name: medicine.name,
          pack: medicine.pack,
          qty: medicine.reorderQty,
          price: 100, // Default price - will be updated in cart
          discountPct: 10,
          amount: medicine.reorderQty * 100 * 0.9,
          supplierName: 'To be selected'
        })
      }
    })
    
    localStorage.setItem('purchaseCart', JSON.stringify(currentCart))
    toast.success(`${selectedItems.length} items added to cart!`)
    navigate('/franchise/live-rates/purchase-cart')
  }

  const toggleSelection = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const stats = {
    total: medicines.length,
    critical: medicines.filter(m => m.status === 'critical').length,
    outOfStock: medicines.filter(m => m.status === 'outOfStock').length,
    low: medicines.filter(m => m.status === 'low').length
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header with gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', 
        borderRadius: 16, 
        padding: '28px 32px',
        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 180, height: 180, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Bell size={28} color="#fff" />
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Low Stock Alerts</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Medicines that need immediate reordering
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 
          border: '2px solid #ef4444',
          borderRadius: 12, 
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <AlertTriangle size={32} style={{ color: '#991b1b' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' }}>
              CRITICAL
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#7f1d1d' }}>{stats.critical}</div>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
          border: '2px solid #fbbf24',
          borderRadius: 12, 
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <Package size={32} style={{ color: '#92400e' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#92400e', fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' }}>
              OUT OF STOCK
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#78350f' }}>{stats.outOfStock}</div>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', 
          border: '2px solid #fb923c',
          borderRadius: 12, 
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <TrendingDown size={32} style={{ color: '#9a3412' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#9a3412', fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' }}>
              LOW STOCK
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#7c2d12' }}>{stats.low}</div>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
          border: '2px solid #3b82f6',
          borderRadius: 12, 
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <Package size={32} style={{ color: '#1e40af' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 700, marginBottom: 4, letterSpacing: '0.5px' }}>
              TOTAL ALERTS
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#1e3a8a' }}>{stats.total}</div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {medicines.length > 0 && (
        <div style={{ 
          background: '#fff', 
          border: '1px solid #e5e7eb', 
          borderRadius: 12, 
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="checkbox"
              checked={selectedItems.length === medicines.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems(medicines.map(m => m._id))
                } else {
                  setSelectedItems([])
                }
              }}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
              {selectedItems.length > 0 
                ? `${selectedItems.length} selected` 
                : 'Select all medicines'}
            </span>
          </div>

          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkReorder}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
              }}
            >
              <ShoppingCart size={16} />
              Add {selectedItems.length} to Cart
            </button>
          )}
        </div>
      )}

      {/* Medicines Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th c="" />
                <Th c="Medicine" />
                <Th c="Strength" />
                <Th c="Pack" />
                <Th c="Current Stock" align="center" />
                <Th c="Reorder Level" align="center" />
                <Th c="Suggested Qty" align="center" />
                <Th c="Days Left" align="center" />
                <Th c="Status" align="center" />
                <Th c="Action" align="center" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(10).fill(0).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 16, background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4 }} />
                      </td>
                    ))}
                  </tr>
                ))
                : medicines.length === 0
                  ? (
                    <tr>
                      <td colSpan={10} style={{ padding: 64, textAlign: 'center' }}>
                        <Package size={64} style={{ color: '#d1d5db', margin: '0 auto 16px', display: 'block' }} />
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>
                          No Low Stock Medicines
                        </div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>
                          All medicines have sufficient stock levels
                        </div>
                      </td>
                    </tr>
                  )
                  : medicines.map((medicine, i) => {
                    const badge = getStatusBadge(medicine.status)
                    const Icon = badge.icon
                    const isSelected = selectedItems.includes(medicine._id)
                    
                    return (
                      <tr 
                        key={medicine._id} 
                        style={{ 
                          background: isSelected ? '#f0f9ff' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f9fafb' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                      >
                        <Td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(medicine._id)}
                            style={{ width: 16, height: 16, cursor: 'pointer' }}
                          />
                        </Td>
                        <Td style={{ fontWeight: 700, color: '#0c3b73' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Package size={16} style={{ color: '#6b7280' }} />
                            {medicine.name}
                          </div>
                        </Td>
                        <Td style={{ color: '#6b7280' }}>{medicine.strength || '—'}</Td>
                        <Td style={{ color: '#6b7280', fontSize: 12 }}>{medicine.pack}</Td>
                        <Td style={{ textAlign: 'center' }}>
                          <span style={{ 
                            fontWeight: 800, 
                            fontSize: 16,
                            color: medicine.currentStock === 0 ? '#dc2626' : medicine.currentStock <= 5 ? '#f59e0b' : '#374151'
                          }}>
                            {medicine.currentStock}
                          </span>
                        </Td>
                        <Td style={{ textAlign: 'center', color: '#6b7280', fontWeight: 600 }}>
                          {medicine.reorderLevel}
                        </Td>
                        <Td style={{ textAlign: 'center' }}>
                          <span style={{ 
                            fontWeight: 700, 
                            color: '#10b981',
                            fontSize: 15
                          }}>
                            {medicine.reorderQty}
                          </span>
                        </Td>
                        <Td style={{ textAlign: 'center' }}>
                          <span style={{ 
                            fontWeight: 700,
                            color: medicine.daysUntilStockout <= 2 ? '#dc2626' : medicine.daysUntilStockout <= 5 ? '#f59e0b' : '#16a34a',
                            fontSize: 14
                          }}>
                            {medicine.daysUntilStockout > 0 ? `${medicine.daysUntilStockout}d` : '—'}
                          </span>
                        </Td>
                        <Td style={{ textAlign: 'center' }}>
                          <span style={{ 
                            fontSize: 11, 
                            fontWeight: 700, 
                            padding: '4px 12px', 
                            borderRadius: 12, 
                            background: badge.bg,
                            color: badge.color,
                            border: `1.5px solid ${badge.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <Icon size={12} />
                            {badge.text}
                          </span>
                        </Td>
                        <Td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleQuickReorder(medicine)}
                            disabled={reordering[medicine._id]}
                            style={{
                              padding: '8px 14px',
                              background: reordering[medicine._id] 
                                ? '#d1d5db' 
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: reordering[medicine._id] ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              transition: 'all 0.2s'
                            }}
                          >
                            {reordering[medicine._id] ? (
                              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Plus size={14} />
                            )}
                            {reordering[medicine._id] ? 'Adding...' : 'Reorder'}
                          </button>
                        </Td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
}
