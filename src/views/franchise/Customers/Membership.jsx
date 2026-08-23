/* eslint-disable prettier/prettier */
/**
 * Screen 68 — Membership
 */
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Crown, CheckCircle, Users, UserCheck, XCircle } from 'lucide-react'
import { CUSTOMERS, MEMBERSHIP_PLANS, TIER_COLORS } from './mockData'
import PageHeader from '../components/PageHeader'

export default function Membership() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const cust     = CUSTOMERS.find(c => c.id === id) || CUSTOMERS[0]
  const tc       = TIER_COLORS[cust.memberTier] || '#6b7280'

  const BENEFITS = [
    '10% Discount on All Medicines',
    'Free Home Delivery',
    'Priority Customer Support',
    'Double CareCoin Points',
    'Free Health Checkup (Yearly)',
  ]

  const SUMMARY = [
    { l: 'Total Members',   v: '1,256' },
    { l: 'Active Members',  v: '1,028' },
    { l: 'Expired Members', v: '228'   },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      <PageHeader icon={Crown} title="Membership" subtitle="Customer membership and subscription" color="#d97706">
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

        {/* Left — Current Membership + Benefits + Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Current Card */}
          <div style={{ background: `linear-gradient(135deg, ${tc}, ${tc}cc)`, borderRadius: 14, padding: '22px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <Crown size={22} />
              <span style={{ fontSize: 18, fontWeight: 800 }}>{cust.memberTier} Member</span>
            </div>
            <p style={{ fontSize: 11, opacity: 0.8, margin: '0 0 3px' }}>Member ID: {cust.id}</p>
            <p style={{ fontSize: 11, opacity: 0.8, margin: '0 0 16px' }}>Member Since: {cust.memberSince}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <p style={{ fontSize: 10, opacity: 0.7, margin: '0 0 3px' }}>Valid Till</p>
                <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>12 Jan 2026</p>
              </div>
              <div>
                <p style={{ fontSize: 10, opacity: 0.7, margin: '0 0 3px' }}>Discount</p>
                <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>10%</p>
              </div>
            </div>
          </div>

          {/* Membership Summary */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Membership Summary</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {SUMMARY.map(s => (
                <div key={s.l} style={{ padding: '12px 8px', background: '#f9fafb', borderRadius: 8, textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 4px', lineHeight: 1.3 }}>{s.l}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#374151', margin: 0 }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Benefits</p>
            {BENEFITS.map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13, color: '#374151', borderBottom: '1px solid #f9fafb' }}>
                <CheckCircle size={13} color="#16a34a" style={{ flexShrink: 0 }} /> {b}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Membership Plans */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 16px' }}>Membership Plans</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MEMBERSHIP_PLANS.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: p.active ? '#fffbeb' : '#f9fafb', borderRadius: 12, border: p.active ? `2px solid ${p.color}` : '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: p.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Crown size={18} color={p.color} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{p.name}</p>
                      {p.active && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fffbeb', color: p.color, border: `1px solid ${p.color}44` }}>Current</span>}
                    </div>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{p.duration} &nbsp;·&nbsp; {p.discount} Discount</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: p.color }}>₹{p.fees}</span>
                  {p.active
                    ? <span style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 7, background: p.color + '18', color: p.color, border: `1px solid ${p.color}44` }}>Current Plan</span>
                    : <button style={{ fontSize: 13, fontWeight: 600, background: p.color, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 18px', cursor: 'pointer' }}>Join</button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
