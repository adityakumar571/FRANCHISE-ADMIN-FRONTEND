/* eslint-disable prettier/prettier */
/**
 * Screen 65 — Customer Wallet
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Wallet, Plus, Minus, ArrowRightLeft, FileText, TrendingUp, TrendingDown } from 'lucide-react'
import { CUSTOMERS, TRANSACTIONS } from './mockData'
import PageHeader from '../components/PageHeader'

const Th = ({ c }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '11px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function CustomerWallet() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const cust     = CUSTOMERS.find(c => c.id === id) || CUSTOMERS[0]
  const [showAdd, setShowAdd] = useState(false)
  const [amount, setAmount]   = useState('')
  const [note, setNote]       = useState('')

  const TOTAL_ADDED   = 5000.00
  const TOTAL_USED    = 3750.00
  const CASHBACK      = 850.00

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      <PageHeader icon={Wallet} title="Customer Wallet" subtitle="Manage customer wallet and transaction history" color="#7c3aed">
        <button onClick={() => navigate(`/franchise/customers/${cust.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#374151' }}>
          <ArrowLeft size={14} /> Back
        </button>
      </PageHeader>

      {/* Customer Info Strip */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {cust.name[0]}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{cust.name}</p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{cust.id} &nbsp;·&nbsp; {cust.phone}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Wallet Balance Card */}
          <div style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: 16, padding: '24px 28px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{ fontSize: 12, margin: 0, opacity: 0.85, letterSpacing: 1, textTransform: 'uppercase' }}>Wallet Balance</p>
              <Wallet size={20} style={{ opacity: 0.7 }} />
            </div>
            <p style={{ fontSize: 36, fontWeight: 900, margin: '4px 0 20px', letterSpacing: -1 }}>
              ₹ {cust.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {[
                { l: 'Total Added',      v: `₹${TOTAL_ADDED.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
                { l: 'Total Used',       v: `₹${TOTAL_USED.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
                { l: 'Cashback Earned',  v: `₹${CASHBACK.toFixed(2)}` },
              ].map(s => (
                <div key={s.l}>
                  <p style={{ fontSize: 10, opacity: 0.75, margin: '0 0 3px', textTransform: 'uppercase' }}>{s.l}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Transactions</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Date','Description','Type','Amount (₹)','Balance (₹)'].map(h => <Th key={h} c={h} />)}</tr>
                </thead>
                <tbody>
                  {TRANSACTIONS.map((t, i) => (
                    <tr key={i} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                      <Td style={{ fontSize: 12, color: '#6b7280' }}>{t.date}</Td>
                      <Td>{t.desc}</Td>
                      <Td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: t.type === 'Credit' ? '#f0fdf4' : '#fff1f2', color: t.type === 'Credit' ? '#16a34a' : '#dc2626', border: `1px solid ${t.type === 'Credit' ? '#bbf7d0' : '#fecdd3'}`, width: 'fit-content' }}>
                          {t.type === 'Credit' ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {t.type}
                        </span>
                      </Td>
                      <Td style={{ fontWeight: 700, color: t.amount > 0 ? '#16a34a' : '#dc2626' }}>
                        {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Td>
                      <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹{t.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid #f3f4f6' }}>
              <button style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}>View Full Statement →</button>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Add Money',        icon: Plus,             color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
              { label: 'Deduct Amount',    icon: Minus,            color: '#dc2626', bg: '#fff1f2', border: '#fecdd3' },
              { label: 'Transfer to Bank', icon: ArrowRightLeft,   color: '#0c3b73', bg: '#e0e7ff', border: '#c7d2fe' },
              { label: 'Wallet Statement', icon: FileText,         color: '#7c3aed', bg: '#f5f3ff', border: '#e9d5ff' },
            ].map(a => (
              <button key={a.label} onClick={() => a.label === 'Add Money' && setShowAdd(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 14px', border: `1px solid ${a.border}`, borderRadius: 9, background: a.bg, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: a.color, textAlign: 'left' }}>
                <a.icon size={15} /> {a.label}
              </button>
            ))}
          </div>

          {showAdd && (
            <div style={{ marginTop: 16, padding: '16px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>Add Money to Wallet</p>
              <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount (₹)"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Reason / note"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '8px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#fff' }}>Cancel</button>
                <button style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#16a34a', color: '#fff' }}>Confirm</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
