/* eslint-disable prettier/prettier */
/**
 * PrintInvoice — Pharmacy invoice matching physical Parvati Medicine format
 * Classic tabular layout · GST Invoice + Cash Memo header · print-safe
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Printer, ArrowLeft, Download, Plus, Minus, AlertCircle } from 'lucide-react'
import { getRequest } from '../../../Helpers'

/* ─── helpers ──────────────────────────────────────────────────── */
const Rs    = (n) => `₹${Number(n || 0).toFixed(2)}`
const date_ = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—'
const time_ = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:false }) : ''
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
  const n1 = Math.round(num)
  let rem = n1
  if (Math.floor(rem / 10000000) > 0) { words += numberToWords(Math.floor(rem / 10000000)) + ' Crore '; rem %= 10000000 }
  if (Math.floor(rem / 100000) > 0)   { words += numberToWords(Math.floor(rem / 100000)) + ' Lakh '; rem %= 100000 }
  if (Math.floor(rem / 1000) > 0)     { words += numberToWords(Math.floor(rem / 1000)) + ' Thousand '; rem %= 1000 }
  if (Math.floor(rem / 100) > 0)      { words += a[Math.floor(rem / 100)] + ' Hundred '; rem %= 100 }
  if (rem > 0) {
    if (words !== '') words += 'and '
    if (rem < 20) words += a[rem]
    else { words += b[Math.floor(rem / 10)]; if (rem % 10 > 0) words += ' ' + a[rem % 10] }
  }
  return words.trim()
}

/* ─── inline print CSS ─────────────────────────────────────────── */
const PRINT_CSS = `
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body * { visibility: hidden !important; }
    #inv-sheet, #inv-sheet * { visibility: visible !important; }
    #inv-sheet {
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
    }
    .no-print { display: none !important; }
    @page { size: A4; margin: 6mm 8mm; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`

/* ─── shared cell style ─────────────────────────────────────────── */
const cell = (extra = {}) => ({
  border: '1px solid #000',
  padding: '3px 5px',
  fontSize: 10,
  color: '#000',
  ...extra,
})

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
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
  const items      = invoice?.items    || []
  const subtotal   = Number(invoice?.subtotal    || 0)
  const discAmt    = Number(invoice?.discountAmt || 0)
  const discPct    = Number(invoice?.discountPct || 0)
  const gstAmt     = Number(invoice?.gstAmt      || 0)
  const roundOff   = Number(invoice?.roundOff    || 0)
  const totalAmt   = Number(invoice?.totalAmt    || 0)
  const paidAmt    = Number(invoice?.paidAmt     || totalAmt)
  const dueAmt     = Number(invoice?.dueAmt      || 0)
  const netTotal   = totalAmt - roundOff
  const invoiceDate = invoice?.invoiceDate || invoice?.createdAt

  /* HSN/GST summary */
  const hsnGroups = {}
  items.forEach(item => {
    const hsn  = item.hsnCode || item.hsn || '—'
    const gst  = Number(item.gstPct || item.gst || 0)
    const amt  = Number(item.amount || 0)
    const key  = `${hsn}-${gst}`
    if (!hsnGroups[key]) hsnGroups[key] = { hsn, gst, taxable: 0, cgst: 0, sgst: 0 }
    const taxable = amt / (1 + gst / 100)
    const half    = (amt - taxable) / 2
    hsnGroups[key].taxable += taxable
    hsnGroups[key].cgst    += half
    hsnGroups[key].sgst    += half
  })

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

  const storeName = invoice?.franchiseName || invoice?.storeName || 'PARVATI MEDICINE'

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <>
      <style>{PRINT_CSS}</style>

      <div style={{ fontFamily: 'Arial, sans-serif', display:'flex', flexDirection:'column', gap:16 }}>

        {/* ── TOOLBAR ─────────────────────────────────────────── */}
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
            <div style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid #e5e7eb', borderRadius:8, padding:'4px 10px', background:'#f9fafb' }}>
              <button onClick={() => setCopies(c => Math.max(1,c-1))} style={{ background:'none', border:'none', cursor:'pointer', color:'#374151', display:'flex', padding:2 }}><Minus size={12}/></button>
              <span style={{ fontSize:13, fontWeight:700, minWidth:18, textAlign:'center' }}>{copies}</span>
              <button onClick={() => setCopies(c => c+1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#374151', display:'flex', padding:2 }}><Plus size={12}/></button>
              <span style={{ fontSize:11, color:'#9ca3af', marginLeft:2 }}>cop{copies>1?'ies':'y'}</span>
            </div>
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

        {/* ── TWO-COL LAYOUT ──────────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 230px', gap:16, alignItems:'start' }}>

          {/* ══ INVOICE SHEET ════════════════════════════════════ */}
          <div ref={printRef} id="inv-sheet"
            style={{ background:'#fff', boxShadow:'0 2px 16px rgba(0,0,0,0.10)', borderRadius:8, overflow:'hidden', padding:'12px 14px', border:'1px solid #ccc' }}>

            {/* ══════════════════════════════════════════════════
                TOP HEADER — 3 columns like physical invoice
                [Store Info] | [GST INVOICE box] | [CASH MEMO box]
            ══════════════════════════════════════════════════ */}
            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:6 }}>
              <tbody>
                <tr>
                  {/* Store Info */}
                  <td style={{ ...cell(), verticalAlign:'top', width:'45%', padding:'6px 8px' }}>
                    <div style={{ fontSize:16, fontWeight:900, color:'#000', letterSpacing:'0.5px', marginBottom:3 }}>
                      {storeName}
                    </div>
                    {invoice?.address && (
                      <div style={{ fontSize:9, color:'#000', lineHeight:1.5 }}>{invoice.address}</div>
                    )}
                    <div style={{ fontSize:9, color:'#000', lineHeight:1.6 }}>
                      {invoice?.phone && <div>Phone : {invoice.phone}</div>}
                      {invoice?.email && <div>E-Mail : {invoice.email}</div>}
                      {invoice?.drugLicenseNo && <div>D.L NO : {invoice.drugLicenseNo}</div>}
                      {invoice?.gstNo && <div>GSTIN : {invoice.gstNo}</div>}
                    </div>
                  </td>

                  {/* GST Invoice Box */}
                  <td style={{ ...cell(), verticalAlign:'top', width:'28%', padding:'4px 8px' }}>
                    <div style={{ textAlign:'center', fontWeight:700, fontSize:11, borderBottom:'1px solid #000', paddingBottom:3, marginBottom:4 }}>
                      GST INVOICE
                    </div>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontSize:9, padding:'1px 0', fontWeight:600 }}>Inv No :</td>
                          <td style={{ fontSize:9, padding:'1px 0', fontWeight:700 }}>{invoice?.invoiceNo || '—'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontSize:9, padding:'1px 0', fontWeight:600 }}>Date :</td>
                          <td style={{ fontSize:9, padding:'1px 0' }}>{date_(invoiceDate)}</td>
                        </tr>
                        <tr>
                          <td style={{ fontSize:9, padding:'1px 0', fontWeight:600 }}>Time :</td>
                          <td style={{ fontSize:9, padding:'1px 0' }}>{time_(invoiceDate)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  {/* Cash Memo Box */}
                  <td style={{ ...cell(), verticalAlign:'top', width:'27%', padding:'4px 8px' }}>
                    <div style={{ textAlign:'center', fontWeight:700, fontSize:11, borderBottom:'1px solid #000', paddingBottom:3, marginBottom:4 }}>
                      CASH MEMO
                    </div>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontSize:9, padding:'1px 0', fontWeight:600, whiteSpace:'nowrap' }}>Patient Name</td>
                          <td style={{ fontSize:9, padding:'1px 0', fontWeight:700 }}>
                            {invoice?.customerName || invoice?.patientName || 'WALK-IN'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontSize:9, padding:'1px 0', fontWeight:600 }}>Address</td>
                          <td style={{ fontSize:9, padding:'1px 0' }}>{invoice?.customerAddress || ''}</td>
                        </tr>
                        <tr>
                          <td style={{ fontSize:9, padding:'1px 0', fontWeight:600, whiteSpace:'nowrap' }}>Doctor Name</td>
                          <td style={{ fontSize:9, padding:'1px 0' }}>{invoice?.doctorName || ''}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ══════════════════════════════════════════════════
                ITEMS TABLE — SR | DESCRIPTION | PACK | BATCH | EXP | TAB | MRP | DIS | AMOUNT
            ══════════════════════════════════════════════════ */}
            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:0 }}>
              <thead>
                <tr style={{ background:'#f0f0f0' }}>
                  <th style={{ ...cell(), textAlign:'center', width:28, fontSize:9, fontWeight:700 }}>SR.</th>
                  <th style={{ ...cell(), textAlign:'left',   fontSize:9, fontWeight:700 }}>DESCRIPTION</th>
                  <th style={{ ...cell(), textAlign:'center', width:50, fontSize:9, fontWeight:700 }}>Pack</th>
                  <th style={{ ...cell(), textAlign:'center', width:70, fontSize:9, fontWeight:700 }}>Batch</th>
                  <th style={{ ...cell(), textAlign:'center', width:40, fontSize:9, fontWeight:700 }}>Exp.</th>
                  <th style={{ ...cell(), textAlign:'center', width:36, fontSize:9, fontWeight:700 }}>Tab.</th>
                  <th style={{ ...cell(), textAlign:'right',  width:58, fontSize:9, fontWeight:700 }}>M.R.P</th>
                  <th style={{ ...cell(), textAlign:'right',  width:40, fontSize:9, fontWeight:700 }}>DIS</th>
                  <th style={{ ...cell(), textAlign:'right',  width:62, fontSize:9, fontWeight:700 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ ...cell(), padding:'20px', textAlign:'center', color:'#888', fontSize:11 }}>
                      No items in this invoice
                    </td>
                  </tr>
                ) : items.map((item, i) => {
                  const name   = item.medicineName || item.name || '—'
                  const salt   = item.salt || item.composition || ''
                  const qty    = Number(item.qty || 0)
                  const mrp    = Number(item.mrp || 0)
                  const disc   = Number(item.discountPct || item.discount || 0)
                  const amount = Number(item.amount || (mrp * qty * (1 - disc / 100)))
                  const batch  = item.batchNo || item.batch || '—'
                  const expiry = item.expiryDate ? exp_(item.expiryDate) : (item.exp || '—')
                  const pack   = item.pack || item.packing || '1x10'

                  return (
                    <tr key={i}>
                      <td style={{ ...cell(), textAlign:'center', fontSize:10 }}>{i + 1}</td>
                      <td style={{ ...cell(), fontSize:10 }}>
                        <div style={{ fontWeight:600 }}>{name}</div>
                        {salt && (
                          <div style={{ fontSize:8, color:'#555', marginTop:1 }}>
                            OLD MRP : {mrp.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td style={{ ...cell(), textAlign:'center', fontSize:10 }}>{pack}</td>
                      <td style={{ ...cell(), textAlign:'center', fontSize:9, fontFamily:'monospace' }}>{batch}</td>
                      <td style={{ ...cell(), textAlign:'center', fontSize:10 }}>{expiry}</td>
                      <td style={{ ...cell(), textAlign:'center', fontWeight:700, fontSize:11 }}>{qty}</td>
                      <td style={{ ...cell(), textAlign:'right', fontSize:10 }}>{mrp.toFixed(2)}</td>
                      <td style={{ ...cell(), textAlign:'right', fontSize:10 }}>{disc > 0 ? disc.toFixed(2) : '0.00'}</td>
                      <td style={{ ...cell(), textAlign:'right', fontWeight:700, fontSize:10 }}>{amount.toFixed(2)}</td>
                    </tr>
                  )
                })}
                {/* Empty rows to fill space */}
                {items.length < 8 && Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} style={{ height: 18 }}>
                    <td style={cell()}>&nbsp;</td>
                    <td style={cell()}></td>
                    <td style={cell()}></td>
                    <td style={cell()}></td>
                    <td style={cell()}></td>
                    <td style={cell()}></td>
                    <td style={cell()}></td>
                    <td style={cell()}></td>
                    <td style={cell()}></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ══════════════════════════════════════════════════
                BOTTOM SECTION — HSN info left | Totals right
            ══════════════════════════════════════════════════ */}
            <table style={{ width:'100%', borderCollapse:'collapse', marginTop:0 }}>
              <tbody>
                <tr>
                  {/* Left: HSN summary + Terms + Signature */}
                  <td style={{ ...cell(), verticalAlign:'top', width:'55%', padding:'6px 8px' }}>
                    {/* HSN line */}
                    {Object.keys(hsnGroups).length > 0 && (
                      <div style={{ fontSize:8, color:'#333', marginBottom:6, lineHeight:1.6 }}>
                        {Object.values(hsnGroups).map((g, i) => (
                          <span key={i}>
                            HSN:{g.hsn} GST {g.taxable.toFixed(2)}*{g.gst}%={((g.cgst+g.sgst)).toFixed(2)}
                            {g.gst > 0 && ` CGST:${g.cgst.toFixed(2)} SGST:${g.sgst.toFixed(2)}`}
                            {i < Object.keys(hsnGroups).length - 1 ? ' | ' : ''}
                          </span>
                        ))}
                        {invoice?.salespersonName && (
                          <span> | {invoice.salespersonName}</span>
                        )}
                      </div>
                    )}

                    {/* Amount in words */}
                    <div style={{ fontSize:9, color:'#333', marginBottom:8, fontStyle:'italic' }}>
                      <strong>Rs.</strong> {numberToWords(Math.round(totalAmt))} Only
                    </div>

                    {/* Terms & Conditions */}
                    <div style={{ borderTop:'1px solid #ccc', paddingTop:4, marginBottom:10 }}>
                      <div style={{ fontSize:9, fontWeight:700, marginBottom:3, textDecoration:'underline' }}>
                        Terms &amp; Conditions
                      </div>
                      <div style={{ fontSize:8, lineHeight:1.6, color:'#333' }}>
                        {(invoice?.termsAndConditions || [
                          'PLEASE CONSULT DOCTOR BEFORE USING MEDICINE.',
                          'REFRIGERATOR GOODS WILL NOT BE TAKEN BACK/EXCHANGED.',
                          'STRIP CUT MEDICINES WILL NOT BE CHANGED.',
                        ]).map((t, i) => (
                          <div key={i}>{t}</div>
                        ))}
                      </div>
                    </div>

                    {/* For store + Signature */}
                    <div style={{ marginTop:4 }}>
                      <div style={{ fontSize:9, fontWeight:700, marginBottom:28 }}>
                        For {storeName}
                      </div>
                      <div style={{ borderTop:'1px solid #000', width:140, paddingTop:3 }}>
                        <div style={{ fontSize:9, color:'#333' }}>Authorised Signatory</div>
                      </div>
                    </div>

                    {/* Footer note */}
                    <div style={{ marginTop:8, fontSize:8, color:'#888', borderTop:'1px solid #eee', paddingTop:4 }}>
                      This is a computer generated invoice · Get well soon!
                    </div>
                  </td>

                  {/* Right: Totals */}
                  <td style={{ ...cell(), verticalAlign:'top', width:'45%', padding:'6px 8px' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <tbody>
                        {/* Subtotal */}
                        <tr>
                          <td style={{ fontSize:10, padding:'3px 2px', fontWeight:600 }}>TOTAL</td>
                          <td style={{ fontSize:10, padding:'3px 2px', textAlign:'right', fontWeight:700 }}>{subtotal.toFixed(2)}</td>
                        </tr>

                        {/* Discount */}
                        {discPct > 0 && (
                          <tr>
                            <td style={{ fontSize:10, padding:'3px 2px', color:'#333' }}>Discount {discPct}%</td>
                            <td style={{ fontSize:10, padding:'3px 2px', textAlign:'right', color:'#333' }}>{discAmt.toFixed(2)}</td>
                          </tr>
                        )}
                        {discAmt > 0 && discPct === 0 && (
                          <tr>
                            <td style={{ fontSize:10, padding:'3px 2px', color:'#333' }}>Discount</td>
                            <td style={{ fontSize:10, padding:'3px 2px', textAlign:'right', color:'#333' }}>{discAmt.toFixed(2)}</td>
                          </tr>
                        )}

                        {/* Round Off */}
                        <tr>
                          <td style={{ fontSize:10, padding:'3px 2px', color:'#333' }}>Round Off</td>
                          <td style={{ fontSize:10, padding:'3px 2px', textAlign:'right', color:'#333' }}>
                            {roundOff !== 0 ? `${roundOff >= 0 ? '+' : ''}${roundOff.toFixed(2)}` : '0.00'}
                          </td>
                        </tr>

                        {/* Net Total */}
                        <tr style={{ borderTop:'1px solid #000', borderBottom:'1px solid #000' }}>
                          <td style={{ fontSize:10, padding:'4px 2px', fontWeight:700 }}>NET TOTAL</td>
                          <td style={{ fontSize:10, padding:'4px 2px', textAlign:'right', fontWeight:700 }}>{netTotal.toFixed(2)}</td>
                        </tr>

                        {/* Party / Paid total */}
                        <tr>
                          <td style={{ fontSize:10, padding:'3px 2px', fontWeight:600 }}>PARTY TOTAL</td>
                          <td style={{ fontSize:10, padding:'3px 2px', textAlign:'right', fontWeight:600 }}>{paidAmt.toFixed(2)}</td>
                        </tr>

                        {/* Due amount if any */}
                        {dueAmt > 0 && (
                          <tr>
                            <td style={{ fontSize:10, padding:'3px 2px', color:'#c00', fontWeight:600 }}>DUE</td>
                            <td style={{ fontSize:10, padding:'3px 2px', textAlign:'right', color:'#c00', fontWeight:700 }}>{dueAmt.toFixed(2)}</td>
                          </tr>
                        )}

                        {/* Grand Total */}
                        <tr style={{ borderTop:'2px solid #000', background:'#f0f0f0' }}>
                          <td style={{ fontSize:13, padding:'6px 2px', fontWeight:900, letterSpacing:'0.3px' }}>Grand Total</td>
                          <td style={{ fontSize:13, padding:'6px 2px', textAlign:'right', fontWeight:900 }}>{totalAmt.toFixed(2)}</td>
                        </tr>

                        {/* Payment Mode */}
                        <tr style={{ borderTop:'1px solid #ccc' }}>
                          <td style={{ fontSize:9, padding:'3px 2px', color:'#555' }}>Payment Mode:</td>
                          <td style={{ fontSize:9, padding:'3px 2px', textAlign:'right', fontWeight:600 }}>{invoice?.paymentMode || 'Cash'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontSize:9, padding:'3px 2px', color:'#555' }}>Paid Amount:</td>
                          <td style={{ fontSize:9, padding:'3px 2px', textAlign:'right', fontWeight:600 }}>₹{paidAmt.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

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
