/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Star, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

export default function BestDeal() {
  const [medicine, setMedicine] = useState('')
  const [deal, setDeal]         = useState(null)
  const [loading, setLoading]   = useState(false)

  const searchDeal = async () => {
    if (!medicine) return
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/live-rates/best-deal?medicine=${encodeURIComponent(medicine)}`)
      setDeal(res.data?.data)
    } catch { toast.error('No deal found for this medicine') }
    finally   { setLoading(false) }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Star} title="Best Deal" subtitle="Find the best price for any medicine" color="#16a34a" />

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={medicine} onChange={e => setMedicine(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchDeal()}
            placeholder="Type medicine name..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <button onClick={searchDeal} disabled={loading}
          style={{ padding: '9px 18px', border: 'none', borderRadius: 8, background: loading ? '#9ca3af' : '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? '...' : 'Find Deal'}
        </button>
      </div>

      {!deal && !loading && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
          <Star size={36} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
          Search a medicine to find the best available deal
        </div>
      )}

      {deal && (
        <div style={{ background: '#fff', border: '2px solid #bbf7d0', borderRadius: 12, padding: 24, maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={20} color="#16a34a" fill="#16a34a" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Best Deal Found!</p>
              <p style={{ margin: 0, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>{deal.medicine}</p>
            </div>
          </div>
          {[
            { l: 'Supplier',      v: deal.supplierName,                   bold: true },
            { l: 'Basic Rate',    v: `₹${deal.basicRate?.toFixed(2)}`,    bold: false },
            { l: 'Effective Rate',v: `₹${deal.effectiveRate?.toFixed(2)}`, bold: true, color: '#16a34a' },
            { l: 'Scheme',        v: deal.scheme,                          bold: false },
            { l: 'Discount',      v: deal.discount,                        bold: false, color: '#16a34a' },
            { l: 'Stock',         v: `${deal.stock} units`,                bold: false },
            { l: 'Delivery',      v: deal.delivery,                        bold: false },
            { l: 'Your Savings',  v: `₹${deal.savings?.toFixed(2)} per unit`, bold: true, color: '#0c3b73' },
          ].map(({ l, v, bold, color }) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
              <span style={{ color: '#6b7280' }}>{l}</span>
              <span style={{ fontWeight: bold ? 700 : 500, color: color || '#111827' }}>{v}</span>
            </div>
          ))}
          <button style={{ marginTop: 16, width: '100%', padding: '10px', border: 'none', borderRadius: 8, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Add to Cart
          </button>
        </div>
      )}
    </div>
  )
}
