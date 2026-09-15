/* eslint-disable prettier/prettier */
/**
 * Screen 62 — Payment History (API Integrated)
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CreditCard, ArrowLeft, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest } from '../../../Helpers'

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

  const [sup, setSup]     = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [from, setFrom]   = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [to, setTo]       = useState(new Date().toISOString().split('T')[0])
  const [modeFilter, setModeFilter] = useState('All Payment Modes')
  const [page, setPage]   = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const PER = 10

  useEffect(() => {
    fetchData()
  }, [id, page, from, to, modeFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [supRes, payRes] = await Promise.all([
        getRequest(`franchise/suppliers/${id}`),
        getRequest(`franchise/suppliers/${id}/payments?page=${page}&limit=${PER}&from=${from}&to=${to}${modeFilter !== 'All Payment Modes' ? `&mode=${modeFilter}` : ''}`),
      ])
      setSup(supRes?.data || supRes || null)
      setPayments(payRes?.data || [])
      setTotal(payRes?.total || 0)
    } catch {
      toast.error('Failed to load payment history')
    } finally {
      setLoading(false)
    }
  }

  const totalPayments  = payments.reduce((s,r) => s + (r.amount||0), 0)
  const lastPayment    = payments[0]
  const totalPages     = Math.max(1, Math.ceil(total / PER))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={CreditCard} title="Payment History" subtitle="All payments made to this supplier" color="#0c3b73">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={modeFilter} onChange={e => { setModeFilter(e.target.value); setPage(1) }}
            style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', background: '#f9fafb' }}>
            {['All Payment Modes','Cash','Cheque','NEFT','UPI'].map(o=><option key={o}>{o}</option>)}
          </select>
          <input type="date" value={from} onChange={e=>{ setFrom(e.target.value); setPage(1) }} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
          <input type="date" value={to} onChange={e=>{ setTo(e.target.value); setPage(1) }} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
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
      {sup && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 200 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#d97706', flexShrink: 0 }}>
              {(sup.name||'S')[0]}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{sup.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>{sup.supplierId || sup._id}</p>
            </div>
          </div>
          {[
            { label: 'Total Payments',  value: `₹${totalPayments.toLocaleString('en-IN',{minimumFractionDigits:2})}`, color: '#16a34a' },
            { label: 'Last Payment',    value: lastPayment ? `₹${(lastPayment.amount||0).toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—', color: '#0c3b73', sub: lastPayment?.date ? new Date(lastPayment.date).toLocaleDateString('en-IN') : '' },
            { label: 'Next Due Date',   value: sup.nextDueDate ? new Date(sup.nextDueDate).toLocaleDateString('en-IN') : 'N/A', color: '#d97706' },
            { label: 'Current Balance', value: `₹${(sup.outstanding||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`, color: '#dc2626' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 18px', background: '#f9fafb', borderRadius: 10, textAlign: 'center', minWidth: 140 }}>
              <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase' }}>{s.label}</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              {s.sub && <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>{s.sub}</p>}
            </div>
          ))}
          <button onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#0c3b73', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
            <Plus size={13} /> Add Payment
          </button>
        </div>
      )}

      {/* Payment Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Date" /><Th c="Payment No." /><Th c="Mode" /><Th c="Txn Reference" />
              <Th c="Amount (₹)" align="right" /><Th c="Narration" /><Th c="Action" />
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No payments found</td></tr>
              ) : payments.map((r, i) => {
                const cfg = MODE_CFG[r.mode] || { bg: '#f3f4f6', color: '#6b7280' }
                return (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.date ? new Date(r.date).toLocaleDateString('en-IN') : ''}</Td>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: '#0c3b73' }}>{r.paymentNo || r._id?.slice(-8)}</span></Td>
                    <Td><span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{r.mode}</span></Td>
                    <Td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{r.txnRef || r.reference || '—'}</Td>
                    <Td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{(r.amount||0).toLocaleString('en-IN',{minimumFractionDigits:2})}</Td>
                    <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.narration || r.notes || ''}</Td>
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
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {payments.length} of {total} entries</span>
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

      {/* Add Payment Modal */}
      {showAddModal && <AddPaymentModal supplierId={id} onClose={() => setShowAddModal(false)} onSaved={fetchData} />}
    </div>
  )
}

function AddPaymentModal({ supplierId, onClose, onSaved }) {
  const [form, setForm] = useState({ amount: '', mode: 'Cash', txnRef: '', narration: '', date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)
  const s = k => v => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount) { toast.error('Amount required'); return }
    setSaving(true)
    try {
      await postRequest(`franchise/suppliers/${supplierId}/payments`, { ...form, amount: parseFloat(form.amount) })
      toast.success('Payment added successfully')
      onSaved()
      onClose()
    } catch {
      toast.error('Failed to add payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Add Payment</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Amount (₹)', key: 'amount', type: 'number', placeholder: '0.00' },
            { label: 'Txn Reference', key: 'txnRef', type: 'text', placeholder: 'UTR/Cheque no.' },
            { label: 'Narration', key: 'narration', type: 'text', placeholder: 'Notes...' },
            { label: 'Date', key: 'date', type: 'date' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>{f.label}</label>
              <input type={f.type} value={form[f.key]} placeholder={f.placeholder} onChange={e => s(f.key)(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#f9fafb' }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Payment Mode</label>
            <select value={form.mode} onChange={e => s('mode')(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
              {['Cash','Cheque','NEFT','UPI'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '9px 18px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', background: '#0c3b73', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
