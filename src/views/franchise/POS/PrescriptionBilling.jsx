/* eslint-disable prettier/prettier */
/**
 * Screen 5 — Prescription Billing (API Integrated)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft, UploadCloud, Trash2, IndianRupee } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { Th, Td, BillRow, SBtn } from './posHelpers'
import { getRequest } from '../../../Helpers'

export default function PrescriptionBilling() {
  const navigate  = useNavigate()
  const [meds, setMeds]         = useState([])
  const [loading, setLoading]   = useState(false)
  const [prescFile, setPrescFile] = useState(null)
  const [searchQ, setSearchQ]   = useState('')
  const [searchRes, setSearchRes] = useState([])

  const subtotal  = meds.reduce((s,m) => s + (m.mrp||0) * (m.qty||1), 0)
  const discount  = subtotal * 0.03
  const taxable   = subtotal - discount
  // Use actual gstPct from each medicine item
  const gstAmt    = meds.reduce((s,m) => {
    const lineAmt = (m.mrp||0) * (m.qty||1) * 0.97          // after 3% disc
    return s + lineAmt * ((m.gst || m.gstPct || 0) / 100)
  }, 0)
  const total     = taxable + gstAmt

  const handleSearch = async (q) => {
    setSearchQ(q)
    if (q.length < 2) { setSearchRes([]); return }
    try {
      const res = await getRequest(`/franchise/pos/medicines/search?q=${encodeURIComponent(q)}`)
      // apiResponse wrapper: res.data.data.medicines
      const list = res?.data?.data?.medicines || res?.data?.medicines || []
      setSearchRes(Array.isArray(list) ? list : [])
    } catch { setSearchRes([]) }
  }

  const addMed = (m) => {
    const medId = m._id || m.id
    setMeds(p => [...p, { ...m, _id: medId, qty: 1 }])
    setSearchRes([])
    setSearchQ('')
  }

  const handleFileUpload = async (file) => {
    if (!file) return
    setPrescFile(file)
    setLoading(true)
    toast('Prescription uploaded. Add medicines manually below.', { icon: '📋' })
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={FileText} title="Prescription Billing" subtitle="Upload prescription and auto-detect medicines" color="#d97706">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#e0e7ff', color: '#0c3b73', border: '1px solid #c7d2fe', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <UploadCloud size={13} /> Upload Prescription
          <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFileUpload(e.target.files[0])} />
        </label>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 240px', gap: 16, alignItems: 'start' }}>
        {/* Prescription Preview */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#374151' }}>Prescription</p>
          </div>
          <div style={{ padding: 14 }}>
            <label style={{ display: 'block', cursor: 'pointer' }}>
              <div style={{ background: '#f9fafb', border: `2px dashed ${prescFile ? '#d97706' : '#e5e7eb'}`, borderRadius: 8, height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                {prescFile ? (
                  <>
                    <FileText size={28} color="#d97706" />
                    <p style={{ fontSize: 11, color: '#d97706', textAlign: 'center', margin: 0, fontWeight: 600 }}>{prescFile.name}</p>
                  </>
                ) : (
                  <>
                    <UploadCloud size={28} color="#9ca3af" />
                    <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: 0 }}>Click to upload or drag prescription here</p>
                  </>
                )}
              </div>
              <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFileUpload(e.target.files[0])} />
            </label>
            <p style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', margin: '8px 0 0' }}>Supports JPG, PNG, PDF</p>
          </div>
        </div>

        {/* Detected Medicines */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Detected Medicines ({meds.length})</p>
            <div style={{ position: 'relative' }}>
              <input value={searchQ} onChange={e => handleSearch(e.target.value)}
                placeholder="Search & add medicine..."
                style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', background: '#f9fafb', width: 200 }} />
              {searchRes.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, width: 240, maxHeight: 200, overflowY: 'auto' }}>
                  {searchRes.map((m, i) => (
                    <div key={i} onClick={() => addMed(m)}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}
                      onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background=''}>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <span style={{ color: '#6b7280', marginLeft: 6 }}>₹{m.mrp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Medicine Name','MRP','Stock','Qty','Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
              <tbody>
                {meds.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    Upload prescription or search medicines above
                  </td></tr>
                ) : meds.map((m,i) => (
                  <tr key={m.id || i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td style={{ fontWeight: 600 }}>{m.name}</Td>
                    <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹{(m.mrp||0).toFixed(2)}</Td>
                    <Td style={{ color: (m.stock||0) < 30 ? '#dc2626' : '#374151', fontWeight: 600 }}>{m.stock || 0}</Td>
                    <Td>
                      <input type="number" value={m.qty||1} min={1} onChange={e => setMeds(p => p.map((x,j) => j===i ? {...x, qty: +e.target.value||1} : x))}
                        style={{ width: 50, padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, textAlign: 'center', outline: 'none' }} />
                    </Td>
                    <Td>
                      <button onClick={() => setMeds(p => p.filter((_,j) => j!==i))}
                        style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer' }}>
                        <Trash2 size={12} color="#dc2626" />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill Summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', background: '#0c3b73', color: '#fff' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Bill Summary</p>
          </div>
          <div style={{ padding: '14px' }}>
            <BillRow label="Items"       value={meds.length} />
            <BillRow label="MRP Total"   value={`₹ ${subtotal.toFixed(2)}`} />
            <BillRow label="Discount (3%)" value={`- ₹ ${discount.toFixed(2)}`} color="#dc2626" />
            <BillRow label="Taxable"     value={`₹ ${taxable.toFixed(2)}`} />
            <BillRow label="GST"         value={`₹ ${gstAmt.toFixed(2)}`} />
            <div style={{ borderTop: '2px solid #0c3b73', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Total Amount</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0c3b73' }}>₹ {total.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ padding: '12px 14px', borderTop: '1px solid #f3f4f6' }}>
            <SBtn label="Proceed to Pay [F5]" icon={IndianRupee} full
              disabled={meds.length === 0}
              onClick={() => navigate('/franchise/pos/payment', { state: { cartItems: meds, total } })} />
          </div>
        </div>
      </div>
    </div>
  )
}
