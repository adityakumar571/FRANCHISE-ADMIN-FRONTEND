/* eslint-disable prettier/prettier */
/**
 * Screen 62 — Payment History
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CreditCard, ArrowLeft, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { SUPPLIERS, PAYMENT_HISTORY } from './supplierMockData'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

const MODE_CFG = {
  Cheque: { bg: '#e0e7ff', color: '#0c3b73' },
  NEFT:   { bg: '#dcfce7', color: '#16a34a' },
  UPI:    { bg: '#f5f3ff', color: '#7c3aed' },
  Cash:   { bg: '#fef3c7', color: '#d97706' },
}

export default function PaymentHistory() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const sup       = SUPPLIERS.find(s => s.id === id) || SUPPLIERS[0]
  const [from, setFrom] = useState('2025-05-01')
  const [to, setTo]     = useState('2025-05-31')
  const [page, setPage] = useState(1)
  const PER = 10

  const totalPayments  = PAYMENT_HISTORY.reduce((s,r) => s + r.amount, 0)
  const lastPayment    = PAYMENT_HISTORY[0]
  const nextDueDate    = '25 May 2025'
  const currentBalance = sup.outstanding

  const totalPages = Math.max(1, Math.ceil(PAYMENT_HISTORY.length / PER))
  const paged      = PAYMENT_HISTORY.slice((page-1)*PER, page*PER)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={CreditCard} title="Payment History" subtitle="All payments made to this supplier" color="#0c3b73">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select defaultValue="All Payment Modes" style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', background: '#f9fafb' }}>
            {['All Payment Modes','Cash','Cheque','NEFT','UPI'].map(o=><option key={o}>{o}</option>)}
          </select>
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
          <input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
            <Download size={12} /> Export
          </button>
        </div>
        <button onClick={() => navigate('/franchise/suppliers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
      </PageHeader>

      {/* Supplier + Summary Card */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 200 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#d97706', flexShrink: 0 }}>
            {sup.name[0]}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{sup.name}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>{sup.id}</p>
          </div>
        </div>
        {[
          { label: 'Total Payments',  value: `₹${totalPayments.toLocaleString('en-IN',{minimumFractionDigits:2})}`, color: '#16a34a' },
          { label: 'Last Payment',    value: `₹${lastPayment?.amount.toLocaleString('en-IN',{minimumFractionDigits:2})}`, color: '#0c3b73', sub: `${lastPayment?.date || ''}` },
          { label: 'Next Due Date',   value: nextDueDate, color: '#d97706' },
          { label: 'Current Balance', value: `₹${currentBalance.toLocaleString('en-IN',{minimumFractionDigits:2})}`, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ padding: '10px 18px', background: '#f9fafb', borderRadius: 10, textAlign: 'center', minWidth: 140 }}>
            <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            {s.sub && <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>{s.sub}</p>}
          </div>
        ))}
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#0c3b73', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
          <Plus size={13} /> Add Payment
        </button>
      </div>

      {/* Payment Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Date" /><Th c="Payment No." /><Th c="Mode" /><Th c="Txn Reference" />
              <Th c="Amount (₹)" align="right" /><Th c="Narration" /><Th c="Action" />
            </tr></thead>
            <tbody>
              {paged.map((r, i) => {
                const cfg = MODE_CFG[r.mode] || { bg: '#f3f4f6', color: '#6b7280' }
                return (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.date}</Td>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: '#0c3b73' }}>{r.paymentNo}</span></Td>
                    <Td>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{r.mode}</span>
                    </Td>
                    <Td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{r.txnRef}</Td>
                    <Td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{r.amount.toLocaleString('en-IN',{minimumFractionDigits:2})}</Td>
                    <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.narration}</Td>
                    <Td>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#e0e7ff', color: '#0c3b73', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        View
                      </button>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing 1 to {paged.length} of {PAYMENT_HISTORY.length} entries</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page===1?'default':'pointer', background: 'none', color: page===1?'#d1d5db':'#374151' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)}
                style={{ background:page===p?'#0c3b73':'none', border:`1px solid ${page===p?'#0c3b73':'#e5e7eb'}`, borderRadius:6, padding:'5px 10px', cursor:'pointer', color:page===p?'#fff':'#374151', fontSize:12 }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: page===totalPages?'default':'pointer', background: 'none', color: page===totalPages?'#d1d5db':'#374151' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
