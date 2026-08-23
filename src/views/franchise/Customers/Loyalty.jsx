/* eslint-disable prettier/prettier */
/**
 * Screen 69 — Loyalty Program
 */
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star, Gift, TrendingUp } from 'lucide-react'
import { CUSTOMERS, LOYALTY_HISTORY } from './mockData'
import PageHeader from '../components/PageHeader'

const REDEEM_OPTIONS = [
  { label: '₹50 Discount Coupon',  points: '500 Points',   color: '#0c3b73' },
  { label: 'Free Delivery',        points: '250 Points',   color: '#16a34a' },
  { label: '₹100 Gift Voucher',    points: '1,000 Points', color: '#7c3aed' },
  { label: 'Health Checkup',       points: '2,000 Points', color: '#d97706' },
]

const EARNING_SUMMARY = [
  { label: 'Purchase (₹100 Spent)', points: '+1,000' },
  { label: 'Referrals',             points: '+150'   },
  { label: 'Birthday Bonus',        points: '+100'   },
  { label: 'Feedback / Review',     points: '+50'    },
  { label: 'Medicine Reminder',     points: '+30'    },
]

export default function Loyalty() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const cust     = CUSTOMERS.find(c => c.id === id) || CUSTOMERS[0]

  const monthEarned   = 1250
  const monthUsed     = 360
  const available     = cust.loyaltyPoints
  const totalEarned   = 1330

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      <PageHeader icon={Star} title="Loyalty" subtitle="Customer loyalty and reward management" color="#d97706">
        <button onClick={() => navigate(`/franchise/customers/${cust.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#374151' }}>
          <ArrowLeft size={14} /> Back
        </button>
      </PageHeader>

      {/* Customer Strip */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {cust.name[0]}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{cust.name}</p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{cust.id} · {cust.phone}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18, alignItems: 'start' }}>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Points Balance Card */}
          <div style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', borderRadius: 14, padding: '22px', color: '#1c1917' }}>
            <p style={{ fontSize: 11, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', opacity: 0.8 }}>Total Loyalty Points</p>
            <p style={{ fontSize: 38, fontWeight: 900, margin: '4px 0 18px', letterSpacing: -1 }}>
              {available.toLocaleString('en-IN')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { l: 'This Month Earned', v: `+${monthEarned.toLocaleString('en-IN')}` },
                { l: 'This Month Used',   v: `-${monthUsed}` },
                { l: 'Available Points',  v: available.toLocaleString('en-IN') },
              ].map(s => (
                <div key={s.l}>
                  <p style={{ fontSize: 10, opacity: 0.7, margin: '0 0 3px' }}>{s.l}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Points Earning Summary */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={14} color="#16a34a" /> Points Earning Summary
            </p>
            {EARNING_SUMMARY.map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>
                <span style={{ color: '#374151' }}>{s.label}</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>{s.points}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: '#374151' }}>Total Earned</span>
              <span style={{ fontWeight: 800, color: '#d97706' }}>+{totalEarned.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Points Redeem History */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: 0 }}>Points Redeem History</p>
              <button style={{ fontSize: 12, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer' }}>View Full History →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LOYALTY_HISTORY.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: 8 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{r.desc}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{r.date}</p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: r.type === 'earn' ? '#16a34a' : '#dc2626' }}>{r.points}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Redeem Points */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Gift size={14} color="#7c3aed" /> Redeem Points
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
              {REDEEM_OPTIONS.map(o => (
                <div key={o.label} style={{ padding: '16px', background: '#f9fafb', borderRadius: 12, border: `1px solid ${o.color}22`, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>{o.label}</p>
                  <p style={{ fontSize: 12, color: o.color, fontWeight: 600, margin: '0 0 12px' }}>{o.points}</p>
                  <button style={{ background: o.color, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%' }}>Redeem</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
