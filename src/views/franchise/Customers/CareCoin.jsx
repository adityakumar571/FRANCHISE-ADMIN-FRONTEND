/* eslint-disable prettier/prettier */
/**
 * Screen 70 — CareCoin
 */
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Award, TrendingUp, Gift } from 'lucide-react'
import { CUSTOMERS, CARECOIN_TX } from './mockData'
import PageHeader from '../components/PageHeader'

const Th = ({ c }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '11px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

const EARN_WAYS = [
  'Shop & Earn CareCoins on every purchase',
  'Refer & Earn friends referral bonus',
  'Rate medicines for bonus coins',
]

const REDEEM_OPTIONS = [
  { label: '₹50 Discount',       coins: '50 Coins',  color: '#0c3b73' },
  { label: 'Free Delivery',      coins: '100 Coins', color: '#16a34a' },
  { label: '₹100 Gift Voucher',  coins: '200 Coins', color: '#7c3aed' },
  { label: 'Health Checkup',     coins: '500 Coins', color: '#d97706' },
]

export default function CareCoin() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const cust     = CUSTOMERS.find(c => c.id === id) || CUSTOMERS[0]

  const monthEarned = 320
  const monthUsed   = 150

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      <PageHeader icon={Award} title="CareCoin" subtitle="CareCoin balance and transaction history" color="#f59e0b">
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

      {/* Top 3 Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>

        {/* Balance Card */}
        <div style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', borderRadius: 14, padding: '22px', color: '#1c1917' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Award size={18} style={{ opacity: 0.8 }} />
            <p style={{ fontSize: 11, fontWeight: 700, margin: 0, textTransform: 'uppercase', opacity: 0.8 }}>CareCoin Balance</p>
          </div>
          <p style={{ fontSize: 36, fontWeight: 900, margin: '4px 0 16px', letterSpacing: -1 }}>
            {cust.carecoins.toLocaleString('en-IN')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <p style={{ fontSize: 10, opacity: 0.7, margin: '0 0 3px' }}>This Month Earned</p>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>+{monthEarned}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, opacity: 0.7, margin: '0 0 3px' }}>This Month Used</p>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>-{monthUsed}</p>
            </div>
          </div>
        </div>

        {/* Earn CareCoins */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} color="#16a34a" /> Earn CareCoins
          </p>
          {EARN_WAYS.map(w => (
            <div key={w} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 12, color: '#374151' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block', flexShrink: 0, marginTop: 4 }} />
              {w}
            </div>
          ))}
        </div>

        {/* Redeem Coins */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Gift size={14} color="#7c3aed" /> Redeem Coins
          </p>
          {REDEEM_OPTIONS.map(o => (
            <div key={o.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 12, color: '#374151' }}>{o.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>{o.coins}</span>
                <button style={{ fontSize: 10, fontWeight: 600, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 5, padding: '3px 9px', cursor: 'pointer' }}>Redeem</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CareCoin Transactions */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>CareCoin Transactions</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Date','Description','Type','Coins','Balance'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {CARECOIN_TX.map((t, i) => (
                <tr key={i} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                  <Td style={{ fontSize: 12, color: '#6b7280' }}>{t.date}</Td>
                  <Td>{t.desc}</Td>
                  <Td>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: t.type === 'Earned' ? '#f0fdf4' : '#fffbeb', color: t.type === 'Earned' ? '#16a34a' : '#d97706', border: `1px solid ${t.type === 'Earned' ? '#bbf7d0' : '#fde68a'}` }}>
                      {t.type}
                    </span>
                  </Td>
                  <Td style={{ fontWeight: 700, color: t.coins.startsWith('+') ? '#16a34a' : '#d97706' }}>{t.coins}</Td>
                  <Td style={{ fontWeight: 700, color: '#f59e0b' }}>{t.balance.toLocaleString('en-IN')}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid #f3f4f6' }}>
          <button style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}>View All Transactions →</button>
        </div>
      </div>

      {/* Rewards Section */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>All Rewards</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          {REDEEM_OPTIONS.map(o => (
            <div key={o.label} style={{ padding: '16px', background: '#f9fafb', borderRadius: 12, border: `1px solid ${o.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>{o.label}</p>
                <p style={{ fontSize: 12, color: o.color, fontWeight: 600, margin: 0 }}>{o.coins}</p>
              </div>
              <button style={{ background: o.color, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Redeem</button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <button style={{ fontSize: 12, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer' }}>View All Rewards →</button>
        </div>
      </div>
    </div>
  )
}
