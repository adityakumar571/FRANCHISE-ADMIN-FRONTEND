/* eslint-disable prettier/prettier */
/**
 * Screen 8 — Hold Bill
 * Real API integration
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pause, ArrowLeft, Trash2, Play, Loader2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Th, Td, SBtn, TextInput, FieldLabel } from './posHelpers'
import { getRequest, postRequest, deleteRequest } from '../../../Helpers/index'
import toast from 'react-hot-toast'

export default function HoldBill() {
  const navigate = useNavigate()
  const [customer, setCustomer]   = useState('Walk-In Customer')
  const [note, setNote]           = useState('')
  const [bills, setBills]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [resumingId, setResumingId] = useState(null)  // tracks which bill is being resumed

  const fetchHoldBills = async () => {
    setLoading(true)
    try {
      const res = await getRequest('/franchise/pos/hold-bills')
      // Backend returns apiResponse(200, result) where result is the array directly
      const list = res?.data?.data || res?.data || []
      setBills(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Failed to load hold bills')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHoldBills() }, [])

  const handleResume = async (billId, billName) => {
    const id = String(billId)   // ensure string for API URL
    setResumingId(id)
    try {
      const res = await getRequest(`/franchise/pos/hold-bills/${id}`)
      console.log('[handleResume] raw res.data:', JSON.stringify(res?.data))

      const fullBill = res?.data?.data || res?.data
      console.log('[handleResume] fullBill:', fullBill)
      console.log('[handleResume] items count:', fullBill?.items?.length)

      if (!fullBill) { toast.error('Could not load hold bill'); return }

      navigate('/franchise/pos/billing', {
        state: {
          resumeHoldBill: {
            holdId:       fullBill.holdId,
            id:           String(fullBill._id || fullBill.id),
            customerName: fullBill.customerName,
            customerId:   fullBill.customerId  ? String(fullBill.customerId) : null,
            items:        fullBill.items        || [],
            totalAmt:     fullBill.totalAmt,
            note:         fullBill.note,
          }
        }
      })
    } catch (err) {
      console.error('[handleResume] error:', err)
      toast.error('Failed to resume hold bill')
    } finally {
      setResumingId(null)
    }
  }

  const handleHold = async () => {
    setSaving(true)
    try {
      await postRequest({ url: '/franchise/pos/hold-bills', cred: {
        customerName: customer || 'Walk-In Customer',
        items: [], subtotal: 0, totalAmt: 0, note,
      }})
      toast.success('Bill held successfully')
      navigate('/franchise/pos/billing')
    } catch {
      toast.error('Failed to hold bill')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteRequest(`/franchise/pos/hold-bills/${id}`)
      setBills(p => p.filter(b => (b._id || b.id) !== id))
      toast.success('Hold bill removed')
    } catch {
      toast.error('Failed to delete hold bill')
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Pause} title="Hold Bill" subtitle="Hold current bill and manage held bills" color="#d97706">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 18, alignItems: 'start' }}>

        {/* Hold Form */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10 }}>
            <Pause size={18} color="#d97706" />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#92400e' }}>Hold Current Bill</p>
              <p style={{ margin: 0, fontSize: 11, color: '#a16207' }}>Bill will be saved and can be resumed later</p>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <FieldLabel>Customer Name</FieldLabel>
            <TextInput value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Customer name or Walk-In" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <FieldLabel>Note (Optional)</FieldLabel>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note for this held bill..."
              rows={3}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <SBtn label={saving ? 'Holding...' : 'Hold Bill [F3]'} icon={Pause} full bg="#fef3c7" color="#d97706" border="#fde68a" disabled={saving} onClick={handleHold} />
        </div>

        {/* Hold Bills List */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
              Hold Bills (Today) — {bills.length} Bills
            </p>
            <button onClick={fetchHoldBills} style={{ fontSize: 12, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer' }}>Refresh</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Bill Name', 'Items', 'Amount', 'Time', 'Note', 'Action'].map(h => <Th key={h} c={h} />)}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(4).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(6).fill(0).map((_, j) => (
                        <td key={j} style={{ padding: '10px' }}>
                          <div style={{ height: 14, background: '#f3f4f6', borderRadius: 4 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                  : bills.map(b => (
                    <tr key={b.id || b._id}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{b.name || b.customerName || 'Walk-In'}</p>
                        <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{b.holdId}</p>
                      </Td>
                      <Td style={{ fontWeight: 600 }}>{b.items ?? 0}</Td>
                      <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹ {(b.amount || b.totalAmt || 0).toFixed(2)}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{b.time}</Td>
                      <Td style={{ color: '#9ca3af', fontSize: 12 }}>{b.note || '—'}</Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleResume(b.id || b._id, b.name || b.customerName)}
                            disabled={resumingId === String(b.id || b._id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '5px 10px', border: 'none', borderRadius: 6, background: '#e0e7ff', color: '#0c3b73', cursor: resumingId === String(b.id || b._id) ? 'not-allowed' : 'pointer', opacity: resumingId === String(b.id || b._id) ? 0.7 : 1 }}>
                            {resumingId === String(b.id || b._id)
                              ? <Loader2 size={10} style={{ animation: 'spin 0.8s linear infinite' }} />
                              : <Play size={10} />
                            }
                            {resumingId === String(b.id || b._id) ? 'Loading...' : 'Resume'}
                          </button>
                          <button
                            onClick={() => handleDelete(b.id || b._id)}
                            style={{ padding: '5px 7px', border: 'none', borderRadius: 6, background: '#fee2e2', cursor: 'pointer' }}>
                            <Trash2 size={11} color="#dc2626" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                }
                {!loading && bills.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                      No held bills today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 18px', borderTop: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Bills are automatically cleared at day close</p>
          </div>
        </div>
      </div>
    </div>
  )
}
