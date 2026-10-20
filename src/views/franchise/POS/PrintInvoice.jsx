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

const numberToWords = (num) => {
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
  
  if (num === 0) return 'Zero'
  if (num < 0) return 'Minus ' + numberToWords(Math.abs(num))
  
  let words = ''
  
  if (Math.floor(num / 10000000) > 0) {
    words += numberToWords(Math.floor(num / 10000000)) + ' Crore '
    num %= 10000000
  }
  if (Math.floor(num / 100000) > 0) {
    words += numberToWords(Math.floor(num / 100000)) + ' Lakh '
    num %= 100000
  }
  if (Math.floor(num / 1000) > 0) {
    words += numberToWords(Math.floor(num / 1000)) + ' Thousand '
    num %= 1000
  }
  if (Math.floor(num / 100) > 0) {
    words += a[Math.floor(num / 100)] + ' Hundred '
    num %= 100
  }
  if (num > 0) {
    if (words !== '') words += 'and '
    if (num < 20) words += a[num]
    else {
      words += b[Math.floor(num / 10)]
      if (num % 10 > 0) words += ' ' + a[num % 10]
    }
  }
  return words.trim()
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
            <div style={{ padding:'16px 28px', borderBottom:'3px double #0c3b73' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                {/* brand */}
                <div>
                  <p style={{ margin:'0 0 4px', fontSize:26, fontWeight:900, letterSpacing:'0.5px', color:'#0c3b73' }}>
                    {invoice?.franchiseName || invoice?.storeName || 'PARVATI MEDICINE'}
                  </p>
                  {invoice?.address && (
                    <p style={{ margin:'2px 0', fontSize:11, color:'#374151', lineHeight:1.5 }}>{invoice.address}</p>
                  )}
                  <p style={{ margin:'2px 0', fontSize:11, color:'#374151' }}>
                    {[invoice?.phone && `Phone: ${invoice.phone}`, invoice?.email && `Email: ${invoice.email}`].filter(Boolean).join(' | ')}
                  </p>
                  <div style={{ display:'flex', gap:14, marginTop:6, flexWrap:'wrap' }}>
                    {invoice?.gstNo && <span style={{ fontSize:10, color:'#6b7280', fontWeight:600 }}>GSTIN: <strong style={{ color:'#111827' }}>{invoice.gstNo}</strong></span>}
                    {invoice?.drugLicenseNo && <span style={{ fontSize:10, color:'#6b7280', fontWeight:600 }}>DL No: <strong style={{ color:'#111827' }}>{invoice.drugLicenseNo}</strong></span>}
                  </div>
                </div>

                {/* invoice badge */}
                <div style={{ textAlign:'right', border:'2px solid #0c3b73', borderRadius:8, padding:'12px 16px', minWidth:180 }}>
                  <p style={{ margin:'0 0 2px', fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:'1px', fontWeight:600 }}>GST INVOICE</p>
                  <p style={{ margin:'0 0 6px', fontSize:20, fontWeight:900, color:'#0c3b73', letterSpacing:'0.3px' }}>
                    {invoice?.invoiceNo || '—'}
                  </p>
                  <div style={{ borderTop:'1px solid #e5e7eb', marginTop:8, paddingTop:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:10, color:'#6b7280' }}>Date:</span>
                      <span style={{ fontSize:10, fontWeight:700, color:'#111827' }}>{date_(invoiceDate)}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:10, color:'#6b7280' }}>Time:</span>
                      <span style={{ fontSize:10, fontWeight:700, color:'#111827' }}>{time_(invoiceDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* === CUSTOMER + STATUS BAR ============================ */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', padding:'10px 28px', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div>
                  <p style={{ margin:'0 0 1px', fontSize:12, fontWeight:800, color:'#111827' }}>
                    {invoice?.customerName || 'Walk-In Customer'}
                  </p>
                  <p style={{ margin:0, fontSize:10, color:'#6b7280' }}>
                    {invoice?.customerPhone ? `Mobile: ${invoice.customerPhone}` : 'Cash Customer'}
                    {invoice?.customerId ? ` · Customer ID: ${invoice.customerId}` : ''}
                  </p>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:4,
                  background: '#dcfce7', color: '#15803d', border: '1px solid #86efac',
                }}>
                  {invoice?.paymentMode || 'CASH'}
                </span>
              </div>
            </div>

            {/* === ITEMS TABLE ====================================== */}
            <div style={{ padding:'0' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#fff', borderBottom:'2px solid #0c3b73' }}>
                    {[
                      { h:'S.No',    w:40,  align:'center' },
                      { h:'Description', w:'auto', align:'left'   },
                      { h:'Pack',    w:60,  align:'center' },
                      { h:'Batch No', w:80,  align:'center' },
                      { h:'Expiry',  w:60,  align:'center' },
                      { h:'Qty',     w:50,  align:'center' },
                      { h:'MRP',     w:80,  align:'right'  },
                      { h:'Disc%',   w:60,  align:'center' },
                      { h:'GST%',    w:60,  align:'center' },
                      { h:'Amount',  w:90,  align:'right'  },
                    ].map(col => (
                      <th key={col.h} style={{
                        width: col.w, padding:'10px 8px',
                        fontSize:10, textAlign:col.align,
                        fontWeight:800, color:'#111827',
                        textTransform:'uppercase', letterSpacing:'0.5px',
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
                      <tr key={i} style={{ borderBottom:'1px solid #e5e7eb' }}>
                        <td style={{ padding:'8px', fontSize:10, color:'#6b7280', textAlign:'center' }}>{i+1}</td>
                        <td style={{ padding:'8px' }}>
                          <p style={{ margin:'0 0 1px', fontSize:11, fontWeight:700, color:'#111827' }}>{name}</p>
                          {salt && <p style={{ margin:0, fontSize:9, color:'#9ca3af' }}>{salt}</p>}
                        </td>
                        <td style={{ padding:'8px', fontSize:10, color:'#374151', textAlign:'center' }}>1x10</td>
                        <td style={{ padding:'8px', fontSize:10, color:'#374151', fontFamily:'monospace', textAlign:'center' }}>{batch}</td>
                        <td style={{ padding:'8px', fontSize:10, color:'#374151', textAlign:'center', whiteSpace:'nowrap' }}>{expiry}</td>
                        <td style={{ padding:'8px', textAlign:'center' }}>
                          <span style={{ fontWeight:800, fontSize:12, color:'#0c3b73' }}>{qty}</span>
                        </td>
                        <td style={{ padding:'8px', fontSize:11, textAlign:'right', color:'#111827', fontWeight:600 }}>₹{mrp.toFixed(2)}</td>
                        <td style={{ padding:'8px', fontSize:10, textAlign:'center', color:'#6b7280' }}>
                          {disc > 0 ? `${disc}%` : '—'}
                        </td>
                        <td style={{ padding:'8px', fontSize:10, textAlign:'center', color:'#6b7280' }}>
                          {gstPct > 0 ? `${gstPct}%` : '—'}
                        </td>
                        <td style={{ padding:'8px', fontSize:12, fontWeight:800, textAlign:'right', color:'#111827' }}>
                          ₹{amount.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* === TOTALS + SIGNATURE ================================ */}
            <div style={{ borderTop:'2px solid #0c3b73', padding:'16px 28px 20px' }}>

              {/* Totals Grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24 }}>
                
                {/* Left - Terms & Signature */}
                <div>
                  <div style={{ marginBottom:16 }}>
                    <p style={{ margin:'0 0 6px', fontSize:10, fontWeight:700, color:'#111827', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                      Terms &amp; Conditions:
                    </p>
                    <p style={{ margin:'0 0 3px', fontSize:9, color:'#6b7280', lineHeight:1.4 }}>
                      1. Rs 2 Conditionel / TM Referre On Above Invoice Medice / Heeracken
                    </p>
                    <p style={{ margin:'0 0 3px', fontSize:9, color:'#6b7280', lineHeight:1.4 }}>
                      2. Pationate Not Cash & Cheque For Pationate Medicine
                    </p>
                    <p style={{ margin:0, fontSize:9, color:'#6b7280', lineHeight:1.4 }}>
                      3. Goods Once Sold Will Not Be Taken Back / Exchange / Cannot be Cancelled
                    </p>
                  </div>

                  <div style={{ marginTop:32 }}>
                    <p style={{ margin:'0 0 8px', fontSize:10, fontWeight:700, color:'#111827', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                      For {invoice?.franchiseName || 'PARVATI MEDICINE'}
                    </p>
                    <div style={{ marginTop:40, borderTop:'1px solid #111827', width:180, paddingTop:4 }}>
                      <p style={{ margin:0, fontSize:10, color:'#6b7280' }}>Authorised Signatory</p>
                    </div>
                  </div>
                </div>

                {/* Right - Bill Totals */}
                <div>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom:'1px solid #e5e7eb' }}>
                        <td style={{ padding:'6px 0', fontSize:11, color:'#374151', fontWeight:600 }}>Total</td>
                        <td style={{ padding:'6px 0', fontSize:11, textAlign:'right', color:'#111827', fontWeight:700 }}>₹{subtotal.toFixed(2)}</td>
                      </tr>
                      <tr style={{ borderBottom:'1px solid #e5e7eb' }}>
                        <td style={{ padding:'6px 0', fontSize:11, color:'#374151', fontWeight:600 }}>Round Off (+ / -)</td>
                        <td style={{ padding:'6px 0', fontSize:11, textAlign:'right', color:'#111827', fontWeight:700 }}>
                          {roundOff >= 0 ? '+' : ''}₹{roundOff.toFixed(2)}
                        </td>
                      </tr>
                      {discAmt > 0 && (
                        <tr style={{ borderBottom:'1px solid #e5e7eb' }}>
                          <td style={{ padding:'6px 0', fontSize:11, color:'#16a34a', fontWeight:600 }}>Discount</td>
                          <td style={{ padding:'6px 0', fontSize:11, textAlign:'right', color:'#16a34a', fontWeight:700 }}>
                            -₹{discAmt.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr style={{ background:'#0c3b73', color:'#fff' }}>
                        <td style={{ padding:'10px 8px', fontSize:13, fontWeight:800 }}>CASH MEMO</td>
                        <td style={{ padding:'10px 8px', fontSize:16, textAlign:'right', fontWeight:900 }}>
                          ₹{totalAmt.toFixed(2)}
                        </td>
                      </tr>
                      <tr style={{ borderTop:'2px solid #0c3b73' }}>
                        <td colSpan={2} style={{ padding:'8px 0 0' }}>
                          <p style={{ margin:'0 0 4px', fontSize:10, fontWeight:700, color:'#111827' }}>Amount in Words:</p>
                          <p style={{ margin:0, fontSize:10, color:'#374151', fontStyle:'italic' }}>
                            Rupees {numberToWords(totalAmt)} Only
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Payment Details */}
                  <div style={{ marginTop:12, padding:'8px', background:'#f9fafb', borderRadius:6, border:'1px solid #e5e7eb' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:10, color:'#6b7280' }}>Payment Mode:</span>
                      <span style={{ fontSize:10, fontWeight:700, color:'#0c3b73' }}>{invoice?.paymentMode || 'CASH'}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:10, color:'#6b7280' }}>Paid Amount:</span>
                      <span style={{ fontSize:10, fontWeight:700, color:'#16a34a' }}>₹{paidAmt.toFixed(2)}</span>
                    </div>
                    {dueAmt > 0 && (
                      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, paddingTop:4, borderTop:'1px solid #e5e7eb' }}>
                        <span style={{ fontSize:10, color:'#dc2626', fontWeight:600 }}>Due Amount:</span>
                        <span style={{ fontSize:10, fontWeight:800, color:'#dc2626' }}>₹{dueAmt.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* === FOOTER =========================================== */}
            <div style={{ borderTop:'1px solid #e5e7eb', padding:'8px 28px', display:'flex', justifyContent:'center', alignItems:'center' }}>
              <p style={{ margin:0, fontSize:9, color:'#9ca3af', textAlign:'center' }}>
                This is a computer generated invoice · No signature required · Get well soon!
              </p>
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
