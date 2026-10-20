/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, Package, AlertCircle, ArrowRight } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', borderBottom: '2px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function PurchaseCart() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [cartLoading, setCartLoading] = useState(true)
  const [placing, setPlacing] = useState(false)

  // Load cart from localStorage
  useEffect(() => {
    const loadCart = async () => {
      setCartLoading(true)
      try {
        const localCart = JSON.parse(localStorage.getItem('purchaseCart') || '[]')
        setItems(localCart)
      } catch {
        setItems([])
      } finally {
        setCartLoading(false)
      }
    }
    loadCart()
  }, [])

  const removeItem = (id) => {
    const newItems = items.filter(it => (it.id || it._id) !== id)
    setItems(newItems)
    localStorage.setItem('purchaseCart', JSON.stringify(newItems))
    toast.success('Item removed from cart')
  }
  
  const updateQty = (id, delta) => {
    const newItems = items.map(it => {
      const itId = it.id || it._id
      if (itId !== id) return it
      const newQty = Math.max(1, it.qty + delta)
      return { ...it, qty: newQty, amount: +(it.price * newQty * (1 - (it.discountPct || 0) / 100)).toFixed(2) }
    })
    setItems(newItems)
    localStorage.setItem('purchaseCart', JSON.stringify(newItems))
  }

  const totalItems = items.reduce((s, it) => s + it.qty, 0)
  const grossAmt = +items.reduce((s, it) => s + it.price * it.qty, 0).toFixed(2)
  const discountAmt = +items.reduce((s, it) => s + it.price * it.qty * (it.discountPct || 0) / 100, 0).toFixed(2)
  const gstAmt = +((grossAmt - discountAmt) * 0.12).toFixed(2)
  const grandTotal = +(grossAmt - discountAmt + gstAmt).toFixed(2)

  const handlePlaceOrder = async () => {
    if (!items.length) {
      toast.error('Cart is empty!')
      return
    }
    
    setPlacing(true)
    try {
      const res = await postRequest({ 
        url: '/franchise/live-rates/place-order', 
        cred: {
          supplierName: items[0]?.supplierName || 'Wholesale Supplier',
          items: items.map(it => ({ 
            medicineName: it.name || it.medicineName, 
            packSize: it.pack || it.packSize, 
            qty: it.qty, 
            price: it.price, 
            discountPct: it.discountPct || 0, 
            amount: it.amount 
          })),
          totalMRP: grossAmt, 
          discountAmt, 
          gstAmt, 
          grandTotal,
        }
      })
      
      const orderId = res.data?.data?.orderId
      toast.success(`Order placed successfully! Order ID: ${orderId}`)
      
      // Clear cart after successful order
      setItems([])
      localStorage.removeItem('purchaseCart')
      
      // Navigate to order tracking
      setTimeout(() => {
        navigate('/franchise/live-rates/order-tracking')
      }, 1500)
    } catch (err) { 
      console.error('Place order error:', err)
      toast.error('Failed to place order. Please try again.') 
    } finally { 
      setPlacing(false) 
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header with gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
        borderRadius: 16, 
        padding: '28px 32px',
        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 180, height: 180, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <ShoppingCart size={28} color="#fff" />
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Purchase Cart</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Review your cart and place your wholesale order</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        {/* Cart Table */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ 
            padding: '16px 20px', 
            borderBottom: '2px solid #f3f4f6', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
          }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 800, color: '#374151' }}>
                Your Cart
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                {items.length} {items.length === 1 ? 'medicine' : 'medicines'} · {totalItems} total qty
              </p>
            </div>
            {items.length > 0 && (
              <button 
                onClick={() => {
                  setItems([])
                  localStorage.removeItem('purchaseCart')
                  toast.success('Cart cleared')
                }} 
                style={{ 
                  fontSize: 12, 
                  color: '#dc2626', 
                  fontWeight: 700, 
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  padding: '6px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.target.style.background = '#fecaca'}
                onMouseLeave={e => e.target.style.background = '#fee2e2'}
              >
                Clear All
              </button>
            )}
          </div>
          
          {items.length === 0 ? (
            <div style={{ 
              padding: 64, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
            }}>
              <ShoppingCart size={64} style={{ color: '#d1d5db', margin: '0 auto 16px', display: 'block' }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>
                Your cart is empty
              </div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>
                Add items from Best Deal or Compare Suppliers
              </div>
              <button
                onClick={() => navigate('/franchise/live-rates/best-deal')}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                Browse Best Deals
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <Th c="Medicine" />
                    <Th c="Pack" />
                    <Th c="Quantity" align="center" />
                    <Th c="Price" align="right" />
                    <Th c="Discount" align="center" />
                    <Th c="Amount" align="right" />
                    <Th c="" />
                  </tr>
                </thead>
                <tbody>
                  {cartLoading
                    ? Array(3).fill(0).map((_, i) => (
                      <tr key={i}>
                        {Array(7).fill(0).map((_, j) => (
                          <td key={j} style={{ padding: '14px 16px' }}>
                            <div style={{ height: 16, background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                    : items.map(it => {
                      const itId = it.id || it._id
                      return (
                        <tr 
                          key={itId} 
                          style={{ transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Td style={{ fontWeight: 700, color: '#0c3b73' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Package size={16} style={{ color: '#6b7280' }} />
                              {it.name || it.medicineName}
                            </div>
                          </Td>
                          <Td style={{ color: '#6b7280', fontSize: 12 }}>{it.pack || it.packSize}</Td>
                          <Td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f9fafb', padding: '4px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                              <button 
                                onClick={() => updateQty(itId, -1)} 
                                style={{ 
                                  width: 28, 
                                  height: 28, 
                                  borderRadius: 6, 
                                  border: '1px solid #e5e7eb', 
                                  background: '#fff', 
                                  cursor: 'pointer', 
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.target.style.background = '#f3f4f6'}
                                onMouseLeave={e => e.target.style.background = '#fff'}
                              >
                                <Minus size={14} />
                              </button>
                              <span style={{ fontWeight: 800, minWidth: 32, textAlign: 'center', fontSize: 14 }}>{it.qty}</span>
                              <button 
                                onClick={() => updateQty(itId, +1)} 
                                style={{ 
                                  width: 28, 
                                  height: 28, 
                                  borderRadius: 6, 
                                  border: '1px solid #e5e7eb', 
                                  background: '#fff', 
                                  cursor: 'pointer', 
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.target.style.background = '#f3f4f6'}
                                onMouseLeave={e => e.target.style.background = '#fff'}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </Td>
                          <Td style={{ textAlign: 'right', fontWeight: 600 }}>
                            ₹ {Number(it.price || it.rate || 0).toFixed(2)}
                          </Td>
                          <Td style={{ textAlign: 'center' }}>
                            <span style={{ 
                              fontSize: 12, 
                              fontWeight: 700, 
                              padding: '3px 8px', 
                              borderRadius: 6, 
                              background: '#dcfce7',
                              color: '#166534',
                              border: '1px solid #bbf7d0'
                            }}>
                              {it.discountPct || 0}%
                            </span>
                          </Td>
                          <Td style={{ textAlign: 'right', fontWeight: 800, color: '#0c3b73', fontSize: 15 }}>
                            ₹ {Number(it.amount || 0).toFixed(2)}
                          </Td>
                          <Td>
                            <button 
                              onClick={() => removeItem(itId)} 
                              style={{ 
                                background: '#fee2e2', 
                                border: '1px solid #fecaca', 
                                borderRadius: 6, 
                                padding: '6px 8px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => e.target.style.background = '#fecaca'}
                              onMouseLeave={e => e.target.style.background = '#fee2e2'}
                            >
                              <Trash2 size={14} color="#dc2626" />
                            </button>
                          </Td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={{ 
          background: '#fff', 
          border: '1px solid #e5e7eb', 
          borderRadius: 12, 
          padding: '24px 28px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 20
        }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#374151' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { l: 'Gross Amount', v: `₹ ${grossAmt.toFixed(2)}`, color: '#374151' },
              { l: 'Discount', v: `- ₹ ${discountAmt.toFixed(2)}`, color: '#16a34a' },
              { l: 'GST (12%)', v: `₹ ${gstAmt.toFixed(2)}`, color: '#374151' },
            ].map(({ l, v, color }) => (
              <div key={l} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '10px 0', 
                borderBottom: '1px solid #f3f4f6', 
                fontSize: 14 
              }}>
                <span style={{ color: '#6b7280', fontWeight: 500 }}>{l}</span>
                <span style={{ fontWeight: 700, color }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '16px 0 8px', 
            borderTop: '2px solid #e5e7eb', 
            fontSize: 18 
          }}>
            <span style={{ fontWeight: 800, color: '#374151' }}>Grand Total</span>
            <span style={{ fontWeight: 800, color: '#0c3b73' }}>₹ {grandTotal.toFixed(2)}</span>
          </div>

          {items.length > 0 && (
            <div style={{ 
              padding: '12px', 
              background: '#fef3c7', 
              borderRadius: 8, 
              border: '1px solid #fbbf24',
              marginTop: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
                <AlertCircle size={16} style={{ color: '#92400e', marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>
                    You're saving ₹{discountAmt.toFixed(2)}!
                  </div>
                  <div style={{ fontSize: 11, color: '#78350f' }}>
                    Total discount applied to this order
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button 
              onClick={() => navigate('/franchise/live-rates/best-deal')} 
              style={{ 
                flex: 1, 
                padding: '12px', 
                border: '2px solid #e5e7eb', 
                borderRadius: 10, 
                fontSize: 14, 
                background: '#fff', 
                cursor: 'pointer', 
                fontWeight: 700,
                color: '#374151',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.target.style.borderColor = '#10b981'}
              onMouseLeave={e => e.target.style.borderColor = '#e5e7eb'}
            >
              Add More
            </button>
            <button 
              onClick={handlePlaceOrder} 
              disabled={placing || !items.length}
              style={{ 
                flex: 1, 
                padding: '12px', 
                border: 'none', 
                borderRadius: 10, 
                fontSize: 14, 
                background: placing || !items.length 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: '#fff', 
                cursor: placing || !items.length ? 'not-allowed' : 'pointer', 
                fontWeight: 800,
                boxShadow: placing || !items.length ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {placing ? 'Placing Order...' : 'Place Order'}
              {!placing && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}} />
    </div>
  )
}
