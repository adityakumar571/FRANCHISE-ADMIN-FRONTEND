/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const StarBar = ({ rating }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={13} color="#f59e0b" fill={rating >= s ? '#f59e0b' : 'none'} />
    ))}
    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginLeft: 4 }}>{rating?.toFixed(1)}</span>
  </div>
)

export default function SupplierRating() {
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/live-rates/supplier-ratings')
        setRatings(res.data?.data || [])
      } catch { toast.error('Failed to load ratings') }
      finally   { setLoading(false) }
    })()
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Star} title="Supplier Ratings" subtitle="Performance ratings for all suppliers" color="#f59e0b" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {loading
          ? Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 18, height: 140 }}>
              <div style={{ height: 14, background: '#f3f4f6', borderRadius: 4, marginBottom: 8, width: '60%' }} />
              <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, width: '40%' }} />
            </div>
          ))
          : ratings.map((r, i) => (
            <div key={r._id || i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 18 }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#111827' }}>{r.supplier}</p>
                  <StarBar rating={r.rating} />
                </div>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#d97706' }}>{r.rating?.toFixed(1)}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { l: 'On-Time Delivery', v: r.onTime },
                  { l: 'Quality Score',   v: r.quality },
                  { l: 'Service',         v: r.service },
                  { l: 'Total Orders',    v: r.orders },
                ].map(({ l, v }) => (
                  <div key={l} style={{ background: '#f9fafb', borderRadius: 7, padding: '8px 10px' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>{l}</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
