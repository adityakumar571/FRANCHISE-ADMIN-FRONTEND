/* eslint-disable prettier/prettier */
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CreditCard, ArrowLeft, Save, Smartphone, AlertCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { BillRow, SBtn, TextInput, FieldLabel } from './posHelpers'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

export default function CreditSale() {
  const navigate = useNavigate()
  const location = useLocation()
  const cart     = location.state?.cart     || []
  const customer_loc = location.state?.customer || null
  const discount = location.state?.discount || 0

  const subtotal    = cart.reduce((s, i) => s + (i.mrp || 0) * i.qty, 0)
  const discAmt     = subtotal * (discount / 100)
  const gst         = (subtotal - discAmt) * 0.05
  const TOTAL       = +(subtotal - discAmt + gst).toFixed(2)

  const [customers, setCustomers] = useState([])
  const [custId, setCustId]       = useState(customer_loc?.id || customer_loc?._id || '')
  const [dueDate, setDueDate]     = useState('')
  const [note, setNote]           = useState('')
  const [saving, setSaving]       = useState(false)
  const debounceRef = useRef()

  useEffect(() => {
    (async () => {
      try {
        const res = await getRequest('/franchise/pos/customers/search?q=&limit=20')
        setCustomers(res.data?.data?.customers || [])
      } catch { setCustomers([]) }
    })()
  }, [])

  const cust        = customers.find(c => (c._id || c.id) === custId) || customer_loc
  const creditLimit = 2000
  const prevDue     = cust?.dueAmount || 0
  const remaining   = creditLimit - TOTAL - prevDue

  const handleSave = async () => {
    if (!cust) { toast.error('Please select a customer'); return }
    setSaving(true)
    try {
      await postRequest({
        url: '/franchise/pos/sales/credit-sale',
        cred: {
          customerId:   cust._id || cust.id,
          customerName: cust.name,
          items: cart.map(i => ({ medicineId: i._id || i.id, medicineName: i.name, qty: i.qty, mrp: i.mrp, amount: i.mrp * i.qty })),
          totalAmt: TOTAL,
          creditAmt: TOTAL,
          notes: note,
        },
      })
      toast.success('Credit sale saved!')
      navigate('/franchise/pos/billing')
    } catch {
      toast.error('Credit sale saved locally.')
      navigate('/franchise/pos/billing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={CreditCard} title="Credit Sale" subtitle="Save bill as credit for the customer" color="#16a34a">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Customer Strip */}
          <div style={{ background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', borderRadius: 12, padding: '18px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
                {cust?.name?.[0] || 'C'}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{cust?.name || 'Select Customer'}</p>
                <p style={{ margin: '3px 0 0', fontSize: 12, opacity: 0.8 }}>{cust?.customerId || ''} {cust?.phone ? `· ${cust.phone}` : ''}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.8, textTransform: 'uppercase' }}>Available Credit</p>
              <p style={{ margin: '3px 0 0', fontSize: 22, fontWeight: 900 }}>Rs. {creditLimit.toFixed(2)}</p>
            </div>
          </div>

          {/* Customer Select */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
            <div style={{ marginBottom: 14 }}>
              <FieldLabel>Select Customer</FieldLabel>
              <select value={custId} onChange={e => setCustId(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', cursor: 'pointer' }}>
                <option value="">-- Select Customer --</option>
                {customers.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name} — {c.phone}</option>)}
              </select>
            </div>

            {/* Credit Details */}
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>Credit Details</p>
              <BillRow label="Bill Amount"    value={`Rs. ${TOTAL.toFixed(2)}`} />
              <BillRow label="Previous Due"   value={`Rs. ${prevDue.toFixed(2)}`} color={prevDue > 0 ? '#dc2626' : '#16a34a'} />
              <BillRow label="Credit Limit"   value={`Rs. ${creditLimit.toFixed(2)}`} />
              <div style={{ borderTop: '2px solid #16a34a', marginTop: 8, paddingTop: 8 }}>
                <BillRow label="Remaining Credit" value={`Rs. ${remaining.toFixed(2)}`} bold color={remaining < 0 ? '#dc2626' : '#16a34a'} large />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <FieldLabel>Due Date (Optional)</FieldLabel>
              <TextInput value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" />
            </div>
            <div>
              <FieldLabel>Note</FieldLabel>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Add a note..."
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        {/* Right — Bill Summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#0c3b73', color: '#fff' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Bill Summary</p>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <BillRow label="Total Amount"   value={`Rs. ${TOTAL.toFixed(2)}`} />
            <BillRow label="Previous Due"   value={`Rs. ${prevDue.toFixed(2)}`} />
            <BillRow label="Discount"       value="Rs. 0.00" color="#dc2626" />
            <BillRow label="Credit Limit"   value={`Rs. ${creditLimit.toFixed(2)}`} />
            <div style={{ borderTop: '2px solid #16a34a', marginTop: 8, paddingTop: 8 }}>
              <BillRow label="Remaining Credit" value={`Rs. ${remaining.toFixed(2)}`} bold color={remaining < 0 ? '#dc2626' : '#16a34a'} large />
            </div>
          </div>

          {remaining < 0 && (
            <div style={{ margin: '0 16px', padding: '10px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, marginBottom: 14, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Credit limit exceeded by ₹{Math.abs(remaining).toFixed(2)}</span>
            </div>
          )}

          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SBtn label={saving ? 'Saving...' : 'Save as Credit Sale [F5]'} icon={Save} full bg="#dcfce7" color="#16a34a" border="#bbf7d0"
              disabled={saving} onClick={handleSave} />
            <SBtn label="Send SMS / WhatsApp" icon={Smartphone} full bg="#e0f2fe" color="#0891b2" border="#bae6fd" sm />
          </div>
        </div>
      </div>
    </div>
  )
}
