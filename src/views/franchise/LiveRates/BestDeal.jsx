/* eslint-disable prettier/prettier */
/**
 * Screen 51 — Best Deal
 */
import { useNavigate } from 'react-router-dom'
import { Star, ShoppingCart } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { MEDICINES, SUPPLIERS } from './liveRatesMockData'

const SELECTED_ITEMS = [
  { name: 'Paracetamol 650mg Tablet', pack: '10x15', count: 'Qty: 15 Strips',  date: 'Exp: 12-04-2025' },
  { name: 'Azithral 500 Tablets',     pack: '10x3',  count: 'Qty: 30 Strips',  date: 'Exp: 24-06-2025' },
  { name: 'Amoxicillin 500 Capsule',  pack: '10x10', count: 'Qty: 20 Capsules', date: 'Exp: 24-05-2025' },
]

export default function BestDeal() {
  const navigate = useNavigate()
  const bestSupplier = SUPPLIERS[0]

  const DEAL = {
    discount: '12%', scheme: 'Buy 10 Get 1', freeItems: '3 Free Items', delivery: '1 Day',
    totalSavings: 3245.60, totalAmount: 32754.40
  }

  const OTHER_OPTIONS = [
    { name: 'Life Care Distributors', savings: '10%', badge: '' },
    { name: 'Apollo Pharma',          savings: '8%',  badge: '' },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Star} title="Best Deal" subtitle="Best deal found for your requirements" color="#f59e0b" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Selected Items */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Selected Items (3)</p>
            {SELECTED_ITEMS.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#f9fafb', borderRadius: 10, marginBottom: 10, border: '1px solid #e5e7eb' }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💊</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{it.name}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af' }}>{it.count} · {it.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Best Deal Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', borderRadius: 14, padding: 22, color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>Best Deal For You</p>
                  <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800 }}>{bestSupplier.name}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#fabf22', color: '#0c1a2e' }}>Total Savings</span>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 32, fontWeight: 900 }}>₹ {DEAL.totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p style={{ margin: '0 0 4px', fontSize: 11, opacity: 0.8 }}>vs. 32.45% better</p>
              {[['Discount', DEAL.discount], ['Scheme', DEAL.scheme], ['Free Items', DEAL.freeItems], ['Delivery Time', DEAL.delivery]].map(([l,v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ opacity: 0.75 }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 14, fontWeight: 700 }}>
                <span>Total Amount</span><span>₹ {DEAL.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <button onClick={() => navigate('/franchise/live-rates/purchase-cart')}
                style={{ marginTop: 16, width: '100%', padding: '11px', background: '#fabf22', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 800, color: '#0c1a2e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <ShoppingCart size={14} /> Add All to Cart
              </button>
            </div>

            {/* Other Options */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Other Options</p>
              {OTHER_OPTIONS.map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f9fafb', borderRadius: 8, marginBottom: 8, border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{o.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{o.savings}</span>
                    <button style={{ padding: '5px 12px', border: 'none', borderRadius: 6, background: '#0c3b73', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  )
}
