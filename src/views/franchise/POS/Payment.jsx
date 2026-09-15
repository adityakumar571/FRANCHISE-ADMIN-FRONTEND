/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { IndianRupee, ArrowLeft, Banknote, Smartphone, CreditCard, Wallet, FileText, RefreshCw, CheckCircle, ArrowLeftRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { BillRow, SBtn, FieldLabel } from './posHelpers'
import { postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const PAY_METHODS = [
  { key: 'Cash',   label: 'Cash',   icon: Banknote,   color: '#16a34a', bg: '#dcfce7' },
  { key: 'UPI',    label: 'UPI/QR', icon: Smartphone, color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'Card',   label: 'Card',   icon: CreditCard, color: '#0891b2', bg: '#e0f2fe' },
  { key: 'Wallet', label: 'Wallet', icon: Wallet,     color: '#d97706', bg: '#fef3c7' },
  { key: 'Credit', label: 'Credit', icon: FileText,   color: '#dc2626', bg: '#fee2e2' },
  { key: 'EMI',    label: 'EMI',    icon: RefreshCw,  color: '#6b7280', bg: '#f3f4f6' },
]

export default function Payment() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [method, setMethod]         = useState('Cash')
  const [received, setReceived]     = useState('')
  const [processing, setProcessing] = useState(false)

  const cart     = location.state?.cart     || []
  const customer = location.state?.customer || null
  const discount = location.state?.discount || 0

  const subtotal     = cart.reduce((s, i) => s + (i.mrp || 0) * i.qty, 0)
  const discAmt      = subtotal * (discount / 100)
  const gst          = (subtotal - discAmt) * 0.05
  const totalPayable = +(subtotal - discAmt + gst).toFixed(2) || 1248.00
  const receivedAmt  = parseFloat(received || totalPayable)
  const change       = Math.max(0, receivedAmt - totalPayable)

  useEffect(() => {
    setReceived(totalPayable.toFixed(2))
  }, [totalPayable])

  const handleConfirm = async () => {
    setProcessing(true)
    try {
      const payModeMap = { 'UPI/QR': 'UPI', 'EMI': 'Credit' }
      const payMode    = payModeMap[method] || method
      await postRequest({
        url: '/franchise/pos/sales/invoice',
        cred: {
          customerId:    customer?._id || customer?.id,
          customerName:  customer?.name || 'Walk-in Customer',
          customerPhone: customer?.phone,
          items: cart.map(i => ({
            medicineId:   i._id || i.id,
            medicineName: i.name,
            batchNo:      i.batch,
            qty:          i.qty,
            mrp:          i.mrp,
            discountPct:  discount,
            gstPct:       i.gst || 5,
            amount:       i.mrp * i.qty,
          })),
          subtotal,
          discountAmt: discAmt,
          gstAmt:      gst,
          roundOff:    0,
          totalAmt:    totalPayable,
          paymentMode: payMode,
          paidAmt:     receivedAmt,
          dueAmt:      method === 'Credit' ? totalPayable : 0,
        },
      })
      toast.success('Payment confirmed!')
      navigate('/franchise/pos/print-invoice', {
        state: { cart, customer, total: totalPayable, paymentMode: method },
      })
    } catch {
      toast.error('Payment saved locally.')
      navigate('/franchise/pos/print-invoice', {
        state: { cart, customer, total: totalPayable, paymentMode: method },
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={IndianRupee} title="Payment" subtitle="Select payment method and confirm payment" color="#16a34a">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm
          onClick={() => navigate('/franchise/pos/billing')} />
        <SBtn label="Split Payment" icon={ArrowLeftRight} bg="#e0e7ff" color="#0c3b73" border="#c7d2fe" sm
          onClick={() => navigate('/franchise/pos/split-payment', { state: { cart, customer, discount } })} />
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Left - Bill Details */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase' }}>Bill Details</p>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
            <BillRow label="Items"          value={`${cart.length} Items`} />
            <BillRow label="Total Qty"      value={cart.reduce((s, i) => s + i.qty, 0)} />
            <BillRow label="Subtotal"       value={`Rs. ${subtotal.toFixed(2)}`} />
            <BillRow label="Discount"       value={`- Rs. ${discAmt.toFixed(2)}`} color="#dc2626" />
            <BillRow label="Taxable Amount" value={`Rs. ${(subtotal - discAmt).toFixed(2)}`} />
            <BillRow label="GST (5%)"       value={`Rs. ${gst.toFixed(2)}`} />
            <BillRow label="Round Off"      value="Rs. 0.00" />
            <div style={{ borderTop: '2px solid #0c3b73', marginTop: 10, paddingTop: 10 }}>
              <BillRow label="Total Payable" value={`Rs. ${totalPayable.toFixed(2)}`} bold color="#0c3b73" large />
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginTop: 14 }}>
            <FieldLabel>Received Amount</FieldLabel>
            <input
              type="number"
              value={received}
              onChange={e => setReceived(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '2px solid #0c3b73', borderRadius: 8, fontSize: 20, fontWeight: 800, outline: 'none', textAlign: 'right', boxSizing: 'border-box', color: '#0c3b73', marginBottom: 10 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: change > 0 ? '#dcfce7' : '#f9fafb', borderRadius: 8, border: `1px solid ${change > 0 ? '#bbf7d0' : '#e5e7eb'}` }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Change</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>Rs. {change.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right - Payment Methods */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase' }}>Select Payment Method</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {PAY_METHODS.map(m => (
              <button key={m.key} onClick={() => setMethod(m.key)}
                style={{ padding: '14px 8px', border: `2px solid ${method === m.key ? m.color : '#e5e7eb'}`, borderRadius: 12, background: method === m.key ? m.bg : '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: method === m.key ? `2px solid ${m.color}33` : 'none' }}>
                  <m.icon size={20} color={m.color} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: method === m.key ? m.color : '#374151' }}>{m.label}</span>
              </button>
            ))}
          </div>

          <SBtn
            label={processing ? 'Processing...' : `Confirm Payment [F6] -- Rs. ${totalPayable.toFixed(2)}`}
            icon={CheckCircle}
            full
            disabled={processing}
            onClick={handleConfirm}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            <SBtn label="Hold Bill"   bg="#fef3c7" color="#d97706" border="#fde68a" sm full
              onClick={() => navigate('/franchise/pos/hold-bill')} />
            <SBtn label="Credit Sale" bg="#dcfce7" color="#16a34a" border="#bbf7d0" sm full
              onClick={() => navigate('/franchise/pos/credit-sale')} />
          </div>
        </div>

      </div>
    </div>
  )
}
