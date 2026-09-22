/* eslint-disable prettier/prettier */
/**
 * PrintInvoice — Professional pharmacy invoice
 * Clean A4 layout · thermal-ready · print-safe
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Printer, ArrowLeft, Download, Plus, Minus, CheckCircle2, AlertCircle } from 'lucide-react'
import { getRequest } from '../../../Helpers'

/* ─── helpers ──────────────────────────────────────────────────── */
const Rs    = (n) => `₹${Number(n || 0).toFixed(2)}`
const date_ = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'
const time_ = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true }) : ''
const exp_  = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  return `${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getFullYear()).slice(-2)}`
}

/* ─── inline print CSS ─────────────────────────────────────────── */
const PRINT_CSS = `
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

    /* hide everything on the page */
    body * { visibility: hidden !important; }

    /* show only the invoice sheet */
    #inv-sheet, #inv-sheet * { visibility: visible !important; }
    #inv-sheet {
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
    }
    .no-print { display: none !important; }
    @page { size: A4; margin: 8mm 10mm; }
  }
  .no-print { }
  @keyframes spin { to { transform: rotate(360deg); } }
`

/* ─── component ────────────────────────────────────────────────── */
export default function PrintInvoice() {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const invoiceId     = params.get('id')
  const printRef      = useRef(null)

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [copies,  setCopies]  = useState(1)
  const [paper,   setPaper]   = useState('A4')

  /* fetch */
  useEffect(() => {
    if (!invoiceId) { setError('No invoice ID in URL'); setLoading(false); return }
    getRequest(`/franchise/pos/sales/invoice/${invoiceId}`)
      .then(res => {
        const d = res?.data?.data || res?.data
        if (d?._id || d?.invoiceNo) setInvoice(d)
        else setError('Invoice not found')
      })
      .catch(() => setError('Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [invoiceId])

  /* derived */
  const items    = invoice?.items    || []
  const subtotal = Number(invoice?.subtotal    || 0)
  const discAmt  = Number(invoice?.discountAmt || 0)
  const gstAmt   = Number(invoice?.gstAmt      || 0)
  const roundOff = Number(invoice?.roundOff    || 0)
  const totalAmt = Number(invoice?.totalAmt    || 0)
  const paidAmt  = Number(invoice?.paidAmt     || totalAmt)
  const dueAmt   = Number(invoice?.dueAmt      || 0)
  const invoiceDate = invoice?.invoiceDate || invoice?.createdAt

  const handlePrint = () => {
    for (let i = 0; i < copies; i++) window.print()
  }

  /* ── loading ── */
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, gap:12, color:'#6b7280' }}>
      <div style={{ width:22, height:22, border:'3px solid #e5e7eb', borderTopColor:'#0c3b73', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      Loading invoice…
    </div>
  )

  /* ── error ── */
  if (error) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:300, gap:14 }}>
      <AlertCircle size={40} color="#dc2626"/>
      <p style={{ color:'#dc2626', fontSize:15, fontWeight:700, margin:0 }}>{error}</p>
      <button onClick={() => navigate(-1)}
        style={{ padding:'9px 22px', border:'none', borderRadius:8, background:'#0c3b73', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
        ← Go Back
      </button>
    </div>
  )

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <>
      <style>{PRINT_CSS}</style>

      <div style={{ fontFamily:'Inter,-apple-system,sans-serif', display:'flex', flexDirection:'column', gap:16 }}>

        {/* ── toolbar ── */}
        <div className="no-print" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => navigate(-1)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:8, background:'#f9fafb', color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              <ArrowLeft size={14}/> Back
            </button>
            <div>
              <p style={{ margin:0, fontSize:17, fontWeight:800, color:'#111827' }}>Print Invoice</p>
              <p style={{ margin:0, fontSize:12, color:'#9ca3af' }}>{invoice?.invoiceNo} · {date_(invoiceDate)}</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {/* copies */}
            <div style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid #e5e7eb', borderRadius:8, padding:'4px 10px', background:'#f9fafb' }}>
              <button onClick={() => setCopies(c => Math.max(1,c-1))} style={{ background:'none', border:'none', cursor:'pointer', color:'#374151', display:'flex', padding:2 }}><Minus size={12}/></button>
              <span style={{ fontSize:13, fontWeight:700, minWidth:18, textAlign:'center' }}>{copies}</span>
              <button onClick={() => setCopies(c => c+1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#374151', display:'flex', padding:2 }}><Plus size={12}/></button>
              <span style={{ fontSize:11, color:'#9ca3af', marginLeft:2 }}>cop{copies>1?'ies':'y'}</span>
            </div>
            {/* paper */}
            <select value={paper} onChange={e => setPaper(e.target.value)}
              style={{ padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, background:'#f9fafb', outline:'none', color:'#374151' }}>
              {['A4','A5','Thermal 80mm','Thermal 58mm'].map(o => <option key={o}>{o}</option>)}
            </select>
            <button onClick={() => navigate('/franchise/pos/billing')}
              style={{ padding:'8px 16px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              + New Bill
            </button>
            <button onClick={handlePrint}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 20px', border:'none', borderRadius:8, background:'linear-gradient(135deg,#0c3b73,#1e40af)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(12,59,115,0.35)' }}>
              <Printer size={15}/> Print Invoice
            </button>
          </div>
        </div>

        {/* ── two-col layout ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 230px', gap:16, alignItems:'start' }}>

          {/* ══ INVOICE SHEET ════════════════════════════════════ */}
          <div ref={printRef} id="inv-sheet"
            style={{ background:'#fff', boxShadow:'0 2px 16px rgba(0,0,0,0.10)', borderRadius:12, overflow:'hidden' }}>

            {/* === TOP GRADIENT HEADER ============================= */}
            <div style={{ background:'linear-gradient(135deg,#0c3b73 0%,#1e40af 60%,#1d4ed8 100%)', padding:'22px 28px 18px', color:'#fff' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                {/* brand */}
                <div>
                  <p style={{ margin:'0 0 2px', fontSize:22, fontWeight:900, letterSpacing:'0.5px', color:'#fff' }}>
                    💊 {invoice?.franchiseName || invoice?.storeName || 'PharmaNexus'}
                  </p>
                  {invoice?.address && (
                    <p style={{ margin:'2px 0', fontSize:11, color:'rgba(255,255,255,0.75)' }}>{invoice.address}</p>
                  )}
                  <p style={{ margin:'2px 0', fontSize:11, color:'rgba(255,255,255,0.75)' }}>
                    {[invoice?.phone && `📞 ${invoice.phone}`, invoice?.email && `✉ ${invoice.email}`].filter(Boolean).join('   ')}
                  </p>
                  <div style={{ display:'flex', gap:14, marginTop:6, flexWrap:'wrap' }}>
                    {invoice?.gstNo && <span style={{ fontSize:10, background:'rgba(255,255,255,0.18)', borderRadius:4, padding:'2px 8px', fontWeight:700, letterSpacing:'0.3px' }}>GSTIN: {invoice.gstNo}</span>}
                    {invoice?.drugLicenseNo && <span style={{ fontSize:10, background:'rgba(255,255,255,0.18)', borderRadius:4, padding:'2px 8px', fontWeight:700 }}>DL: {invoice.drugLicenseNo}</span>}
                  </div>
                </div>

                {/* invoice badge */}
                <div style={{ textAlign:'right', background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'12px 16px', minWidth:160 }}>
                  <p style={{ margin:'0 0 2px', fontSize:10, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'1px' }}>Tax Invoice</p>
                  <p style={{ margin:'0 0 6px', fontSize:18, fontWeight:900, color:'#fff', letterSpacing:'0.3px' }}>
                    {invoice?.invoiceNo || '—'}
                  </p>
                  <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.8)' }}>
                    📅 {date_(invoiceDate)}
                  </p>
                  <p style={{ margin:'1px 0 0', fontSize:10, color:'rgba(255,255,255,0.65)' }}>
                    🕐 {time_(invoiceDate)}
                  </p>
                  {invoice?.cashierName && (
                    <p style={{ margin:'4px 0 0', fontSize:10, color:'rgba(255,255,255,0.6)' }}>
                      Cashier: {invoice.cashierName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* === CUSTOMER + STATUS BAR ============================ */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', padding:'12px 28px', background:'#f8faff', borderBottom:'2px solid #e0e7ff', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#0c3b73,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                  👤
                </div>
                <div>
                  <p style={{ margin:'0 0 1px', fontSize:13, fontWeight:800, color:'#111827' }}>
                    {invoice?.customerName || 'Walk-In Customer'}
                  </p>
                  <p style={{ margin:0, fontSize:11, color:'#6b7280' }}>
                    {invoice?.customerPhone ? `📱 ${invoice.customerPhone}` : 'No phone on record'}
                    {invoice?.customerId ? ` · ID: ${invoice.customerId}` : ''}
                  </p>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:20,
                  background: invoice?.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                  color: invoice?.status === 'Completed' ? '#15803d' : '#92400e',
                  border: `1px solid ${invoice?.status === 'Completed' ? '#86efac' : '#fde68a'}`,
                }}>
                  <CheckCircle2 size={11}/>
                  {invoice?.status || 'Completed'}
                </span>
                <span style={{ fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:20, background:'#ede9fe', color:'#6d28d9', border:'1px solid #c4b5fd' }}>
                  {invoice?.paymentMode || 'Cash'}
                </span>
              </div>
            </div>

            {/* === ITEMS TABLE ====================================== */}
            <div style={{ padding:'0 0 4px' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f1f5f9' }}>
                    {[
                      { h:'#',       w:32,  align:'center' },
                      { h:'Medicine / Salt', w:'auto', align:'left'   },
                      { h:'Batch',   w:80,  align:'left'   },
                      { h:'Expiry',  w:56,  align:'center' },
                      { h:'Qty',     w:44,  align:'center' },
                      { h:'MRP',     w:72,  align:'right'  },
                      { h:'Disc%',   w:54,  align:'center' },
                      { h:'GST%',    w:46,  align:'center' },
                      { h:'Amount',  w:82,  align:'right'  },
                    ].map(col => (
                      <th key={col.h} style={{
                        width: col.w, padding:'8px 10px',
                        fontSize:9, textAlign:col.align,
                        fontWeight:700, color:'#475569',
                        textTransform:'uppercase', letterSpacing:'0.4px',
                        borderBottom:'2px solid #0c3b73',
                        background:'#f1f5f9',
                        whiteSpace:'nowrap',
                      }}>{col.h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding:'28px 20px', textAlign:'center', color:'#9ca3af', fontSize:13 }}>
                        No items in this invoice
                      </td>
                    </tr>
                  ) : items.map((item, i) => {
                    const name   = item.medicineName || item.name || '—'
                    const salt   = item.salt || ''
                    const qty    = Number(item.qty || 0)
                    const mrp    = Number(item.mrp || 0)
                    const disc   = Number(item.discountPct || item.discount || 0)
                    const gstPct = Number(item.gstPct || item.gst || 0)
                    const amount = Number(item.amount || (mrp * qty * (1 - disc / 100)))
                    const batch  = item.batchNo || item.batch || '—'
                    const expiry = item.expiryDate ? exp_(item.expiryDate) : (item.exp || '—')
                    const isEven = i % 2 === 0

                    return (
                      <tr key={i}
                        style={{ background: isEven ? '#fff' : '#f8faff' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = isEven ? '#fff' : '#f8faff' }}>
                        <td style={{ padding:'8px 10px', fontSize:11, color:'#9ca3af', textAlign:'center', borderBottom:'1px solid #f1f5f9' }}>{i+1}</td>
                        <td style={{ padding:'8px 10px', borderBottom:'1px solid #f1f5f9' }}>
                          <p style={{ margin:'0 0 1px', fontSize:12, fontWeight:700, color:'#111827' }}>{name}</p>
                          {salt && <p style={{ margin:0, fontSize:9, color:'#9ca3af', fontStyle:'italic' }}>{salt}</p>}
                        </td>
                        <td style={{ padding:'8px 10px', fontSize:10, color:'#475569', fontFamily:'monospace', borderBottom:'1px solid #f1f5f9' }}>{batch}</td>
                        <td style={{ padding:'8px 10px', fontSize:10, color:'#6b7280', textAlign:'center', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' }}>{expiry}</td>
                        <td style={{ padding:'8px 10px', textAlign:'center', borderBottom:'1px solid #f1f5f9' }}>
                          <span style={{ fontWeight:800, fontSize:13, color:'#0c3b73' }}>{qty}</span>
                        </td>
                        <td style={{ padding:'8px 10px', fontSize:12, textAlign:'right', color:'#374151', borderBottom:'1px solid #f1f5f9' }}>₹{mrp.toFixed(2)}</td>
                        <td style={{ padding:'8px 10px', fontSize:11, textAlign:'center', borderBottom:'1px solid #f1f5f9' }}>
                          {disc > 0
                            ? <span style={{ background:'#dcfce7', color:'#15803d', borderRadius:4, padding:'2px 6px', fontWeight:700, fontSize:10 }}>{disc}%</span>
                            : <span style={{ color:'#d1d5db' }}>—</span>
                          }
                        </td>
                        <td style={{ padding:'8px 10px', fontSize:11, textAlign:'center', borderBottom:'1px solid #f1f5f9', color:'#6b7280' }}>
                          {gstPct > 0 ? `${gstPct}%` : '—'}
                        </td>
                        <td style={{ padding:'8px 10px', fontSize:13, fontWeight:800, textAlign:'right', color:'#111827', borderBottom:'1px solid #f1f5f9' }}>
                          ₹{amount.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* === TOTALS + SIGNATURE ================================ */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:0, borderTop:'2px solid #e0e7ff', padding:'16px 28px 20px' }}>

              {/* left — signature + note */}
              <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-between', paddingRight:24 }}>
                {invoice?.notes && (
                  <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'8px 12px', marginBottom:12 }}>
                    <p style={{ margin:0, fontSize:10, color:'#92400e' }}><strong>Note:</strong> {invoice.notes}</p>
                  </div>
                )}

                <div style={{ marginTop:'auto' }}>
                  <p style={{ margin:'0 0 4px', fontSize:10, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    Terms &amp; Conditions
                  </p>
                  <p style={{ margin:'0 0 2px', fontSize:10, color:'#6b7280' }}>• Goods once sold will not be taken back.</p>
                  <p style={{ margin:'0 0 2px', fontSize:10, color:'#6b7280' }}>• Exchange within 7 days with original invoice.</p>
                  <p style={{ margin:0, fontSize:10, color:'#6b7280' }}>• Subject to local jurisdiction.</p>

                  <div style={{ marginTop:20, display:'flex', gap:32 }}>
                    <div>
                      <div style={{ borderBottom:'1px solid #374151', width:120, marginBottom:4 }}/>
                      <p style={{ margin:0, fontSize:10, color:'#6b7280' }}>Customer Signature</p>
                    </div>
                    <div>
                      <div style={{ borderBottom:'1px solid #374151', width:120, marginBottom:4 }}/>
                      <p style={{ margin:0, fontSize:10, color:'#6b7280' }}>Authorised Signatory</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* right — bill summary */}
              <div style={{ background:'#f8faff', borderRadius:10, border:'1px solid #e0e7ff', padding:'14px 16px' }}>
                <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                  Bill Summary
                </p>

                {[
                  ['Items', `${items.length} medicine${items.length !== 1 ? 's' : ''}`],
                  ['Subtotal (MRP)', Rs(subtotal)],
                  discAmt > 0 && ['Discount', `− ${Rs(discAmt)}`],
                  gstAmt  > 0 && ['GST', Rs(gstAmt)],
                  roundOff !== 0 && ['Round Off', Rs(roundOff)],
                ].filter(Boolean).map(([l, v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:11, padding:'4px 0', borderBottom:'1px solid #e9edf5' }}>
                    <span style={{ color:'#6b7280' }}>{l}</span>
                    <span style={{ color: String(v).startsWith('−') ? '#16a34a' : '#374151', fontWeight:500 }}>{v}</span>
                  </div>
                ))}

                {/* grand total */}
                <div style={{ marginTop:8, padding:'10px 12px', background:'linear-gradient(135deg,#0c3b73,#1e40af)', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, fontWeight:800, color:'#fff' }}>TOTAL</span>
                  <span style={{ fontSize:20, fontWeight:900, color:'#fff' }}>{Rs(totalAmt)}</span>
                </div>

                {/* payment row */}
                <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:5 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                    <span style={{ color:'#6b7280' }}>Payment</span>
                    <span style={{ fontWeight:700, color:'#7c3aed' }}>{invoice?.paymentMode || 'Cash'}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                    <span style={{ color:'#6b7280' }}>Paid</span>
                    <span style={{ fontWeight:700, color:'#16a34a' }}>{Rs(paidAmt)}</span>
                  </div>
                  {dueAmt > 0 && (
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, background:'#fee2e2', borderRadius:6, padding:'4px 6px' }}>
                      <span style={{ color:'#dc2626', fontWeight:600 }}>Due Amount</span>
                      <span style={{ fontWeight:800, color:'#dc2626' }}>{Rs(dueAmt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* === FOOTER =========================================== */}
            <div style={{ background:'linear-gradient(135deg,#f8faff,#eff6ff)', borderTop:'1px solid #e0e7ff', padding:'12px 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ margin:'0 0 2px', fontSize:12, fontWeight:700, color:'#0c3b73' }}>
                  Thank you for choosing us! 💙
                </p>
                <p style={{ margin:0, fontSize:10, color:'#9ca3af' }}>
                  Get well soon · This is a computer generated invoice
                </p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ margin:'0 0 2px', fontSize:10, color:'#9ca3af' }}>
                  {items.reduce((s, i) => s + (i.qty || 0), 0)} units · {items.length} item{items.length !== 1 ? 's' : ''}
                </p>
                <p style={{ margin:0, fontSize:10, color:'#9ca3af' }}>
                  Printed: {date_(new Date())} {time_(new Date())}
                </p>
              </div>
            </div>

          </div>
          {/* end #inv-sheet */}

          {/* ══ SIDEBAR PRINT OPTIONS ═══════════════════════════════ */}
          <div className="no-print" style={{ display:'flex', flexDirection:'column', gap:14, position:'sticky', top:80 }}>

            {/* quick stats */}
            {invoice && (
              <div style={{ background:'linear-gradient(135deg,#0c3b73,#1e40af)', borderRadius:12, padding:'16px 18px', color:'#fff' }}>
                <p style={{ margin:'0 0 4px', fontSize:11, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Invoice</p>
                <p style={{ margin:'0 0 6px', fontSize:15, fontWeight:800 }}>{invoice.invoiceNo}</p>
                <p style={{ margin:'0 0 2px', fontSize:12, color:'rgba(255,255,255,0.85)' }}>{invoice.customerName || 'Walk-In'}</p>
                <p style={{ margin:'0 0 10px', fontSize:11, color:'rgba(255,255,255,0.65)' }}>{date_(invoiceDate)}</p>
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.2)', paddingTop:10 }}>
                  <p style={{ margin:0, fontSize:22, fontWeight:900 }}>{Rs(totalAmt)}</p>
                </div>
              </div>
            )}

            {/* options */}
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'16px' }}>
              <p style={{ margin:'0 0 12px', fontSize:13, fontWeight:700, color:'#374151' }}>Print Options</p>

              <div style={{ marginBottom:12 }}>
                <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase' }}>Paper Size</p>
                <select value={paper} onChange={e => setPaper(e.target.value)}
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:7, fontSize:13, background:'#f9fafb', outline:'none' }}>
                  {['A4','A5','Thermal 80mm','Thermal 58mm'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              <div style={{ marginBottom:16 }}>
                <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:600, color:'#6b7280', textTransform:'uppercase' }}>Copies</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <button onClick={() => setCopies(c => Math.max(1,c-1))}
                    style={{ width:32, height:32, borderRadius:7, border:'1px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Minus size={13}/>
                  </button>
                  <span style={{ fontSize:20, fontWeight:800, minWidth:28, textAlign:'center', color:'#0c3b73' }}>{copies}</span>
                  <button onClick={() => setCopies(c => c+1)}
                    style={{ width:32, height:32, borderRadius:7, border:'1px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Plus size={13}/>
                  </button>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <button onClick={handlePrint}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 0', border:'none', borderRadius:9, background:'linear-gradient(135deg,#0c3b73,#1e40af)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(12,59,115,0.3)' }}>
                  <Printer size={15}/> Print Invoice
                </button>
                <button
                  onClick={() => alert('PDF download coming soon')}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px 0', border:'1px solid #bbf7d0', borderRadius:9, background:'#f0fdf4', color:'#15803d', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  <Download size={14}/> Download PDF
                </button>
                <button
                  onClick={() => navigate('/franchise/pos/billing')}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px 0', border:'1px solid #e5e7eb', borderRadius:9, background:'#fff', color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  + New Bill
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  )
}
