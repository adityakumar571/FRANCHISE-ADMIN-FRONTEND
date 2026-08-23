/* eslint-disable prettier/prettier */
/**
 * Screen 7 — Split Payment
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, ArrowLeft, CheckCircle, Banknote, Smartphone, CreditCard } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { SBtn } from './posHelpers'

const TOTAL = 1248.00

export default function SplitPayment() {
  const navigate    = useNavigate()
  const [cash, setCash]   = useState(500.00)
  const [upi, setUpi]     = useState(500.00)
  const [card, setCard]   = useState(248.00)

  const totalPaid = cash + upi + card
  const remaining = Math.max(0, TOTAL - totalPaid)

  const splits = [
    { key: 'cash', label: 'Cash', value: cash, set: setCash, icon: Banknote,   color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
    { key: 'upi',  label: 'UPI',  value: upi,  set: setUpi,  icon: Smartphone, color: '#7c3aed', bg: '#f5f3ff', border: '#e9d5ff' },
    { key: 'card', label: 'Card', value: card, set: setCard, icon: CreditCard, color: '#0891b2', bg: '#e0f2fe', border: '#bae6fd' },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={ArrowLeftRight} title="Split Payment" subtitle="Pay using multiple payment methods" color="#7c3aed">
        <SBtn label="Back to Payment" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/payment')} />
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Bill Amount */}
          <div style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: 14, padding: '24px', color: '#fff', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Bill Amount</p>
            <p style={{ margin: 0, fontSize: 42, fontWeight: 900, letterSpacing: -1 }}>₹ {TOTAL.toFixed(2)}</p>
          </div>

          {/* Split inputs */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 16px' }}>Split Payment</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {splits.map(p => (
                <div key={p.key} style={{ padding: '16px', background: p.bg, borderRadius: 12, border: `2px solid ${p.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p.icon size={16} color={p.color} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.label}</span>
                  </div>
                  <input type="number" value={p.value} min={0} onChange={e => p.set(parseFloat(e.target.value)||0)}
                    style={{ width: '100%', padding: '9px 10px', border: `1px solid ${p.border}`, borderRadius: 8, fontSize: 16, fontWeight: 700, outline: 'none', background: '#fff', textAlign: 'right', boxSizing: 'border-box', color: p.color }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 16px' }}>Payment Summary</p>
          {splits.map(p => (
            <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontWeight: 500 }}>{p.label}</span>
              <span style={{ fontWeight: 700, color: p.value > 0 ? p.color : '#9ca3af' }}>₹ {p.value.toFixed(2)}</span>
            </div>
          ))}

          <div style={{ borderTop: '2px solid #111827', marginTop: 12, paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700 }}>
              <span>Total Paid</span>
              <span style={{ color: totalPaid >= TOTAL ? '#16a34a' : '#dc2626' }}>₹ {totalPaid.toFixed(2)}</span>
            </div>
            {remaining > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 6, padding: '8px 12px', background: '#fee2e2', borderRadius: 8, color: '#dc2626', fontWeight: 600 }}>
                <span>Remaining</span><span>₹ {remaining.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: 20, borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Total Paid</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#0c3b73' }}>₹ {totalPaid.toFixed(2)}</span>
            </div>
            <SBtn label="Confirm Payment [F5]" icon={CheckCircle} full disabled={totalPaid < TOTAL}
              onClick={() => navigate('/franchise/pos/print-invoice')} />
          </div>
        </div>
      </div>
    </div>
  )
}
