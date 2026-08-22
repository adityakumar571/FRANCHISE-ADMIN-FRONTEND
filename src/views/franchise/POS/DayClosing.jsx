/* eslint-disable prettier/prettier */
/**
 * DayClosing — Franchise POS Day Closing
 * Cash tally, transaction summary and day close confirmation
 */
import { useState } from 'react'
import { BookOpen, CheckCircle2, IndianRupee, CreditCard, Smartphone, AlertTriangle, Printer } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const MOCK_SUMMARY = {
  date: '22 Aug 2026',
  openingCash: 5000,
  transactions: 24,
  totalSales: 48650,
  salesReturns: 1250,
  netSales: 47400,
  payments: {
    cash: 22500,
    upi: 18900,
    card: 7250,
  },
  expenses: 850,
  closingCash: 26650,
  previousClose: '21 Aug 2026, 9:05 PM',
}

const PayRow = ({ label, value, color = '#111827', bold = false, border = false }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0',
    borderBottom: border ? '1px solid #e5e7eb' : 'none',
  }}>
    <span style={{ fontSize: 13, color: '#374151', fontWeight: bold ? 700 : 400 }}>{label}</span>
    <span style={{ fontSize: bold ? 16 : 14, fontWeight: bold ? 700 : 600, color }}>{value}</span>
  </div>
)

const DayClosing = () => {
  const [cashCount, setCashCount] = useState('')
  const [note, setNote] = useState('')
  const [closed, setClosed] = useState(false)

  const diff = cashCount ? parseFloat(cashCount) - MOCK_SUMMARY.closingCash : null

  const handleClose = () => {
    if (!cashCount) return alert('Please enter physical cash count before closing.')
    setClosed(true)
  }

  if (closed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PageHeader icon={BookOpen} title="Day Closing" subtitle={MOCK_SUMMARY.date} color="#16a34a" />
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 40, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={32} color="#16a34a" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Day Successfully Closed</h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>
            {MOCK_SUMMARY.date} · Closed at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div style={{ display: 'inline-flex', gap: 20, background: '#f9fafb', borderRadius: 10, padding: '16px 32px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Net Sales</p>
              <p style={{ margin: '3px 0 0', fontSize: 18, fontWeight: 700, color: '#0c3b73' }}>₹{MOCK_SUMMARY.netSales.toLocaleString()}</p>
            </div>
            <div style={{ width: 1, background: '#e5e7eb' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Transactions</p>
              <p style={{ margin: '3px 0 0', fontSize: 18, fontWeight: 700, color: '#0c3b73' }}>{MOCK_SUMMARY.transactions}</p>
            </div>
            <div style={{ width: 1, background: '#e5e7eb' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Closing Cash</p>
              <p style={{ margin: '3px 0 0', fontSize: 18, fontWeight: 700, color: '#16a34a' }}>₹{parseFloat(cashCount).toLocaleString()}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
            <button style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Printer size={14} /> Print Summary
            </button>
            <button onClick={() => setClosed(false)} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>
              New Day
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={BookOpen} title="Day Closing" subtitle={`${MOCK_SUMMARY.date} · Previous: ${MOCK_SUMMARY.previousClose}`} color="#0c3b73">
        <button onClick={() => window.print()} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Printer size={14} /> Print
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        {/* Sales Summary */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IndianRupee size={16} color="#0c3b73" /> Sales Summary
          </h3>
          <PayRow label="Total Transactions" value={MOCK_SUMMARY.transactions} border />
          <PayRow label="Gross Sales" value={`₹${MOCK_SUMMARY.totalSales.toLocaleString()}`} border />
          <PayRow label="Sales Returns" value={`-₹${MOCK_SUMMARY.salesReturns.toLocaleString()}`} color="#dc2626" border />
          <PayRow label="Net Sales" value={`₹${MOCK_SUMMARY.netSales.toLocaleString()}`} color="#0c3b73" bold />
        </div>

        {/* Payment Breakdown */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={16} color="#7c3aed" /> Payment Breakdown
          </h3>
          {[
            { label: '💵 Cash', value: MOCK_SUMMARY.payments.cash },
            { label: '📱 UPI', value: MOCK_SUMMARY.payments.upi },
            { label: '💳 Card', value: MOCK_SUMMARY.payments.card },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 13, color: '#374151' }}>{p.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>₹{p.value.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Total Collected</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0c3b73' }}>
              ₹{(MOCK_SUMMARY.payments.cash + MOCK_SUMMARY.payments.upi + MOCK_SUMMARY.payments.card).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Cash Tally */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IndianRupee size={16} color="#16a34a" /> Cash Tally
          </h3>
          <PayRow label="Opening Cash" value={`₹${MOCK_SUMMARY.openingCash.toLocaleString()}`} border />
          <PayRow label="Cash Sales" value={`₹${MOCK_SUMMARY.payments.cash.toLocaleString()}`} border />
          <PayRow label="Expenses" value={`-₹${MOCK_SUMMARY.expenses.toLocaleString()}`} color="#dc2626" border />
          <PayRow label="Expected Closing Cash" value={`₹${MOCK_SUMMARY.closingCash.toLocaleString()}`} color="#0c3b73" bold />

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Physical Cash Count *</label>
            <input
              type="number"
              value={cashCount}
              onChange={e => setCashCount(e.target.value)}
              placeholder="Enter actual cash in drawer"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {diff !== null && (
            <div style={{
              marginTop: 10, padding: '10px 14px', borderRadius: 8,
              background: diff === 0 ? '#f0fdf4' : diff > 0 ? '#f0f9ff' : '#fff1f2',
              border: `1px solid ${diff === 0 ? '#bbf7d0' : diff > 0 ? '#bae6fd' : '#fecdd3'}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {diff === 0 ? <CheckCircle2 size={14} color="#16a34a" /> : <AlertTriangle size={14} color={diff > 0 ? '#0891b2' : '#dc2626'} />}
              <span style={{ fontSize: 12, fontWeight: 600, color: diff === 0 ? '#16a34a' : diff > 0 ? '#0891b2' : '#dc2626' }}>
                {diff === 0 ? 'Cash matches perfectly' : diff > 0 ? `Excess ₹${Math.abs(diff).toLocaleString()}` : `Shortage ₹${Math.abs(diff).toLocaleString()}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notes & Close Button */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Closing Notes (optional)</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add any notes for this day closing…"
          rows={3}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            onClick={handleClose}
            style={{ padding: '11px 28px', borderRadius: 8, border: 'none', background: cashCount ? '#0c3b73' : '#9ca3af', fontSize: 14, cursor: cashCount ? 'pointer' : 'not-allowed', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <CheckCircle2 size={16} /> Close Day
          </button>
        </div>
      </div>
    </div>
  )
}

export default DayClosing
