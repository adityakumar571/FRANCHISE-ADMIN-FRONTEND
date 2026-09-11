/* eslint-disable prettier/prettier */
/**
 * DayClosing — Real API integration
 */
import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle2, IndianRupee, CreditCard, AlertTriangle, Printer } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest } from '../../../Helpers/index'
import toast from 'react-hot-toast'

const PayRow = ({ label, value, color = '#111827', bold = false, border = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: border ? '1px solid #e5e7eb' : 'none' }}>
    <span style={{ fontSize: 13, color: '#374151', fontWeight: bold ? 700 : 400 }}>{label}</span>
    <span style={{ fontSize: bold ? 16 : 14, fontWeight: bold ? 700 : 600, color }}>{value}</span>
  </div>
)

const SkeletonRow = () => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
    <div style={{ height: 14, width: '40%', background: '#f3f4f6', borderRadius: 4 }} />
    <div style={{ height: 14, width: '25%', background: '#f3f4f6', borderRadius: 4 }} />
  </div>
)

const DayClosing = () => {
  const [summary, setSummary]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [cashCount, setCashCount] = useState('')
  const [note, setNote]         = useState('')
  const [closed, setClosed]     = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/pos/day-closing/summary')
        setSummary(res.data?.data)
      } catch {
        toast.error('Failed to load day closing summary')
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  const diff = summary && cashCount ? parseFloat(cashCount) - summary.closingCash : null

  const handleClose = async () => {
    if (!cashCount) { toast.error('Please enter physical cash count'); return }
    setSubmitting(true)
    try {
      await postRequest({ url: '/franchise/pos/day-closing', cred: { physicalCash: cashCount, closingNote: note } })
      toast.success('Day closed successfully')
      setClosed(true)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to close day')
    } finally {
      setSubmitting(false)
    }
  }

  const S = summary || {}

  if (closed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PageHeader icon={BookOpen} title="Day Closing" subtitle={S.date} color="#16a34a" />
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 40, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={32} color="#16a34a" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Day Successfully Closed</h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>
            {S.date} · Closed at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div style={{ display: 'inline-flex', gap: 20, background: '#f9fafb', borderRadius: 10, padding: '16px 32px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Net Sales</p>
              <p style={{ margin: '3px 0 0', fontSize: 18, fontWeight: 700, color: '#0c3b73' }}>₹{(S.netSales || 0).toLocaleString('en-IN')}</p>
            </div>
            <div style={{ width: 1, background: '#e5e7eb' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Transactions</p>
              <p style={{ margin: '3px 0 0', fontSize: 18, fontWeight: 700, color: '#0c3b73' }}>{S.transactions}</p>
            </div>
            <div style={{ width: 1, background: '#e5e7eb' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Closing Cash</p>
              <p style={{ margin: '3px 0 0', fontSize: 18, fontWeight: 700, color: '#16a34a' }}>₹{parseFloat(cashCount).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
            <button onClick={() => window.print()} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Printer size={14} /> Print Summary
            </button>
            <button onClick={() => { setClosed(false); setCashCount(''); setNote('') }} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>
              New Day
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={BookOpen} title="Day Closing" subtitle={loading ? '...' : `${S.date} · Previous: ${S.previousClose}`} color="#0c3b73">
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
          {loading ? <>{Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)}</> : <>
            <PayRow label="Total Transactions" value={S.transactions} border />
            <PayRow label="Gross Sales"        value={`₹${(S.totalSales || 0).toLocaleString('en-IN')}`} border />
            <PayRow label="Sales Returns"      value={`-₹${(S.salesReturns || 0).toLocaleString('en-IN')}`} color="#dc2626" border />
            <PayRow label="Net Sales"          value={`₹${(S.netSales || 0).toLocaleString('en-IN')}`} color="#0c3b73" bold />
          </>}
        </div>

        {/* Payment Breakdown */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={16} color="#7c3aed" /> Payment Breakdown
          </h3>
          {loading ? <>{Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)}</> : <>
            {[
              { label: '💵 Cash', value: S.payments?.cash || 0 },
              { label: '📱 UPI',  value: S.payments?.upi  || 0 },
              { label: '💳 Card', value: S.payments?.card || 0 },
            ].map(p => (
              <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{p.label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>₹{p.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Total Collected</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0c3b73' }}>
                ₹{((S.payments?.cash || 0) + (S.payments?.upi || 0) + (S.payments?.card || 0)).toLocaleString('en-IN')}
              </span>
            </div>
          </>}
        </div>

        {/* Cash Tally */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IndianRupee size={16} color="#16a34a" /> Cash Tally
          </h3>
          {loading ? <>{Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)}</> : <>
            <PayRow label="Opening Cash"           value={`₹${(S.openingCash || 0).toLocaleString('en-IN')}`} border />
            <PayRow label="Cash Sales"             value={`₹${(S.payments?.cash || 0).toLocaleString('en-IN')}`} border />
            <PayRow label="Expenses"               value={`-₹${(S.expenses || 0).toLocaleString('en-IN')}`} color="#dc2626" border />
            <PayRow label="Expected Closing Cash"  value={`₹${(S.closingCash || 0).toLocaleString('en-IN')}`} color="#0c3b73" bold />
          </>}

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
            <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8,
              background: diff === 0 ? '#f0fdf4' : diff > 0 ? '#f0f9ff' : '#fff1f2',
              border: `1px solid ${diff === 0 ? '#bbf7d0' : diff > 0 ? '#bae6fd' : '#fecdd3'}`,
              display: 'flex', alignItems: 'center', gap: 8 }}>
              {diff === 0
                ? <CheckCircle2 size={14} color="#16a34a" />
                : <AlertTriangle size={14} color={diff > 0 ? '#0891b2' : '#dc2626'} />
              }
              <span style={{ fontSize: 12, fontWeight: 600, color: diff === 0 ? '#16a34a' : diff > 0 ? '#0891b2' : '#dc2626' }}>
                {diff === 0 ? 'Cash matches perfectly' : diff > 0 ? `Excess ₹${Math.abs(diff).toLocaleString('en-IN')}` : `Shortage ₹${Math.abs(diff).toLocaleString('en-IN')}`}
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
            disabled={!cashCount || submitting}
            style={{ padding: '11px 28px', borderRadius: 8, border: 'none', background: cashCount && !submitting ? '#0c3b73' : '#9ca3af', fontSize: 14, cursor: cashCount && !submitting ? 'pointer' : 'not-allowed', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <CheckCircle2 size={16} /> {submitting ? 'Closing...' : 'Close Day'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DayClosing
