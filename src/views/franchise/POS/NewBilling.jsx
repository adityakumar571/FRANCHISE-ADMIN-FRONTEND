/* eslint-disable prettier/prettier */
/**
 * Screen 1 — New Billing (Main POS)
 * Real API integration: medicine search, add to cart, checkout
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanLine, Search, User, Plus, ChevronDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { CartTable, BillSummaryPanel, SBtn, calcTotal } from './posHelpers'
import { getRequest, postRequest } from '../../../Helpers/index'
import toast from 'react-hot-toast'

export default function NewBilling() {
  const navigate = useNavigate()
  const [cart, setCart]           = useState([])
  const [customer, setCustomer]   = useState(null)
  const [discount, setDiscount]   = useState(0)
  const [search, setSearch]       = useState('')
  const [suggest, setSuggest]     = useState([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const searchRef = useRef()
  const debounceRef = useRef()

  const handleSearch = (val) => {
    setSearch(val)
    if (val.length < 2) { setSuggest([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoadingSearch(true)
      try {
        const res = await getRequest(`/franchise/pos/medicines/search?q=${encodeURIComponent(val)}&limit=7`)
        setSuggest(res.data?.data?.medicines || [])
      } catch {
        setSuggest([])
      } finally {
        setLoadingSearch(false)
      }
    }, 300)
  }

  const addToCart = (med) => {
    setCart(p => {
      const ex = p.find(i => i.id?.toString() === med.id?.toString())
      return ex
        ? p.map(i => i.id?.toString() === med.id?.toString() ? { ...i, qty: i.qty + 1 } : i)
        : [...p, { ...med, qty: 1 }]
    })
    setSearch(''); setSuggest([])
    searchRef.current?.focus()
  }

  const updateQty = (id, d) =>
    setCart(p => p.map(i => i.id?.toString() === id?.toString() ? { ...i, qty: Math.max(1, i.qty + d) } : i))

  const removeItem = (id) => setCart(p => p.filter(i => i.id?.toString() !== id?.toString()))

  const total = calcTotal(cart, discount)

  const handleCheckout = () => {
    navigate('/franchise/pos/payment', { state: { cart, customer, discount, total } })
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PageHeader icon={ScanLine} title="New Billing" subtitle="Create new sale bill" color="#0c3b73">
        <SBtn label="Scan Barcode [F2]"    icon={ScanLine} bg="#e0e7ff" color="#0c3b73" border="#c7d2fe" sm onClick={() => navigate('/franchise/pos/barcode-scan')} />
        <SBtn label="Search Medicine [F3]" icon={Search}   bg="#dcfce7" color="#16a34a" border="#bbf7d0" sm onClick={() => navigate('/franchise/pos/medicine-search')} />
        <SBtn label="Prescription [F4]"    icon={Plus}     bg="#fef3c7" color="#d97706" border="#fde68a" sm onClick={() => navigate('/franchise/pos/prescription-billing')} />
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14, alignItems: 'start' }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Customer + Search Bar */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <button
                onClick={() => navigate('/franchise/pos/customer-selection')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 500 }}>
                <User size={14} color="#9ca3af" />
                <span style={{ flex: 1, textAlign: 'left' }}>{customer ? customer.name : 'Walk-In Customer'}</span>
                <ChevronDown size={13} color="#9ca3af" />
              </button>
              <SBtn label="+ Add Customer" icon={Plus} bg="#e0e7ff" color="#0c3b73" border="#c7d2fe" sm onClick={() => navigate('/franchise/pos/customer-selection')} />
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
              <input
                ref={searchRef}
                value={search}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
                placeholder="Search medicine name / batch / barcode..."
                style={{ width: '100%', padding: '11px 12px 11px 34px', border: '2px solid #0c3b73', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
              />
              {(suggest.length > 0 || loadingSearch) && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 100, marginTop: 4, overflow: 'hidden' }}>
                  {loadingSearch
                    ? <div style={{ padding: '12px 14px', fontSize: 12, color: '#9ca3af' }}>Searching...</div>
                    : suggest.map(m => (
                      <div key={m.id} onClick={() => addToCart(m)}
                        style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{m.name}</p>
                          <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>
                            Batch: {m.batch} · Exp: {m.exp} · Stock: {m.stock}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0c3b73' }}>₹{m.mrp}</p>
                          <p style={{ margin: 0, fontSize: 9, color: '#9ca3af' }}>MRP</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

          {/* Cart */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '11px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
                Cart ({cart.length} medicines · {cart.reduce((s, i) => s + i.qty, 0)} qty)
              </p>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Clear All
                </button>
              )}
            </div>
            <CartTable cart={cart} onQty={updateQty} onRemove={removeItem} />
          </div>
        </div>

        {/* RIGHT — Bill Summary */}
        <BillSummaryPanel
          cart={cart}
          discount={discount}
          setDiscount={setDiscount}
          footer={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SBtn
                label="Proceed to Pay [F5]"
                full
                disabled={cart.length === 0}
                onClick={handleCheckout}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <SBtn label="Hold Bill"  bg="#fef3c7" color="#d97706" border="#fde68a" sm full onClick={() => navigate('/franchise/pos/hold-bill')} />
                <SBtn label="Return"     bg="#fee2e2" color="#dc2626" border="#fecdd3" sm full onClick={() => navigate('/franchise/pos/return-bill')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <SBtn label="Exchange"   bg="#e0e7ff" color="#0c3b73" border="#c7d2fe" sm full onClick={() => navigate('/franchise/pos/exchange-bill')} />
                <SBtn label="Credit"     bg="#dcfce7" color="#16a34a" border="#bbf7d0" sm full onClick={() => navigate('/franchise/pos/credit-sale')} />
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}
