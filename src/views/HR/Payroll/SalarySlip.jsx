import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Loader from '../../../components/Loading/Loader'

/* ─── helpers ──────────────────────────────────────────────── */
const fmt = (n) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const monthLabel = (m) => {
  if (!m) return ''
  const [y, mo] = m.split('-')
  return new Date(Number(y), Number(mo) - 1, 1)
    .toLocaleString('en-IN', { month: 'long', year: 'numeric' })
}

/* number → words */
const ones  = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
const tensW = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
const _nw = (n) => {
  if (!n) return ''
  if (n < 20)  return ones[n]
  if (n < 100) return tensW[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '')
  return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' '+_nw(n%100) : '')
}
const numWords = (n) => {
  n = Math.floor(Math.abs(n))
  if (!n) return 'Zero Rupees Only'
  const cr  = Math.floor(n/10000000); n %= 10000000
  const lac = Math.floor(n/100000);   n %= 100000
  const th  = Math.floor(n/1000);     n %= 1000
  const parts = []
  if (cr)  parts.push(_nw(cr)  + ' Crore')
  if (lac) parts.push(_nw(lac) + ' Lakh')
  if (th)  parts.push(_nw(th)  + ' Thousand')
  if (n)   parts.push(_nw(n))
  return parts.join(' ') + ' Rupees Only'
}

/* ─── shared inline styles ─────────────────────────────────── */
const BASE = { fontFamily: "'Arial','Helvetica',sans-serif", fontSize: '11px' }

const TD = (extra = {}) => ({
  padding: '7px 12px',
  fontSize: '11px',
  verticalAlign: 'middle',
  borderBottom: '1px solid #ebebeb',
  ...extra,
})

const SECTION_HDR = {
  background: '#2c3e50',
  color: '#fff',
  fontWeight: '700',
  fontSize: '10px',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  padding: '6px 12px',
}

/* ─── component ─────────────────────────────────────────────── */
const SalarySlip = () => {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [slip, setSlip]       = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getRequest(`hr/salary-slip/${id}`)
      .then((r) => setSlip(r?.data?.data))
      .catch(() => toast.error('Failed to load salary slip'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><Loader /><p className="text-sm text-gray-500 mt-2">Loading...</p></div>
    </div>
  )
  if (!slip) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
      Salary slip not found.
    </div>
  )

  const s    = slip.staff || {}
  const gross = (slip.monthlySalary || 0) + (slip.extraEarning || 0)
  const net   = slip.netSalary || 0
  const daysInMonth = (() => {
    if (!slip.salaryMonth) return 31
    const [y, m] = slip.salaryMonth.split('-').map(Number)
    return new Date(y, m, 0).getDate()
  })()

  const eRows = [
    { label: 'Basic Salary',    amount: slip.monthlySalary || 0 },
    { label: 'Special Allowance / Extra', amount: slip.extraEarning  || 0 },
  ]
  const dRows = [
    { label: 'Absent Deduction',   amount: slip.absentDeduction  || 0 },
    { label: 'Unpaid Leave (LOP)', amount: slip.leaveDeduction   || 0 },
    { label: 'Advance Recovery',   amount: slip.advanceDeduction || 0 },
    { label: 'Other Deduction',    amount: slip.otherDeduction   || 0 },
  ]
  const maxR = Math.max(eRows.length, dRows.length)
  while (eRows.length < maxR) eRows.push(null)
  while (dRows.length < maxR) dRows.push(null)

  const empInfo = [
    [['Employee Name',   s.employeeName],      ['Employee ID',     s.employeeCode]],
    [['Designation',     s.designation?.name], ['Department',      s.department?.name]],
    [['Employment Type', s.staffType],          ['Date of Joining', s.dateOfJoining?.slice(0,10)]],
    [['Bank Name',       s.bankName || '—'],   ['Account No.',
      s.accountNumber ? '•••• ' + s.accountNumber.slice(-4) : '—']],
  ]

  return (
    <div style={{ background:'#d4d4d4', minHeight:'100vh', ...BASE }}>

      {/* ── Action bar (print hidden) ── */}
      <div className="print:hidden" style={{
        background:'#fff', borderBottom:'1px solid #ddd',
        padding:'10px 24px', display:'flex', alignItems:'center',
        justifyContent:'space-between', position:'sticky', top:0, zIndex:10,
        boxShadow:'0 1px 4px rgba(0,0,0,.08)',
      }}>
        <button onClick={() => navigate(-1)} style={{
          display:'flex', alignItems:'center', gap:'6px',
          fontSize:'13px', color:'#555', cursor:'pointer',
          border:'none', background:'none', fontWeight:'500',
        }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'12px', color:'#888' }}>
            {s.employeeName} &mdash; {monthLabel(slip.salaryMonth)}
          </span>
          <button onClick={() => window.print()} style={{
            display:'flex', alignItems:'center', gap:'6px',
            background:'#2c3e50', color:'#fff', border:'none',
            padding:'8px 20px', borderRadius:'4px',
            fontSize:'12px', fontWeight:'600', cursor:'pointer',
          }}>
            <Printer size={14} /> Print / PDF
          </button>
        </div>
      </div>

      {/* ── A4 Paper ── */}
      <div style={{ padding:'28px 16px' }} className="print:p-0">
        <div id="salary-slip-print" style={{
          background:'#fff', margin:'0 auto',
          width:'210mm', minHeight:'297mm',
          boxShadow:'0 2px 16px rgba(0,0,0,.18)',
          ...BASE,
        }}>

          {/* ══ COMPANY HEADER ══ */}
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'20px 20px 16px', borderBottom:'3px solid #2c3e50',
          }}>
            {/* Logo + name */}
            <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
              {slip.schoolLogo
                ? <img src={slip.schoolLogo} alt="logo"
                    style={{ height:'52px', width:'52px', objectFit:'contain' }} />
                : <div style={{
                    height:'52px', width:'52px', background:'#2c3e50',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    borderRadius:'6px', color:'#fff', fontWeight:'900', fontSize:'22px',
                  }}>
                    {(slip.schoolName || 'S').charAt(0)}
                  </div>
              }
              <div>
                <div style={{ fontWeight:'800', fontSize:'16px', color:'#1a1a1a', lineHeight:'1.2' }}>
                  {slip.schoolName || 'Franchise'}
                </div>
                <div style={{ fontSize:'10px', color:'#888', marginTop:'3px', letterSpacing:'0.3px' }}>
                  HR &amp; Payroll Department
                </div>
              </div>
            </div>

            {/* Pay Slip title */}
            <div style={{ textAlign:'right' }}>
              <div style={{
                fontSize:'20px', fontWeight:'900', color:'#2c3e50',
                letterSpacing:'2px', textTransform:'uppercase',
              }}>
                Pay Slip
              </div>
              <div style={{ fontSize:'11px', color:'#555', marginTop:'4px' }}>
                Period: <strong>{monthLabel(slip.salaryMonth)}</strong>
              </div>
              <div style={{ fontSize:'9px', color:'#aaa', marginTop:'3px' }}>
                Generated on {new Date().toLocaleDateString('en-IN',
                  { day:'2-digit', month:'short', year:'numeric' })}
              </div>
            </div>
          </div>

          {/* ══ EMPLOYEE DETAILS ══ */}
          <div style={SECTION_HDR}>Employee Information</div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <tbody>
              {empInfo.map(([L, R], i) => (
                <tr key={i} style={{ background: i%2===0 ? '#fff' : '#fafafa' }}>
                  <td style={TD({ width:'18%', color:'#666', fontWeight:'500' })}>{L[0]}</td>
                  <td style={TD({ width:'32%', fontWeight:'700', color:'#1a1a1a',
                    borderRight:'1px solid #e0e0e0' })}>
                    {L[1] || '—'}
                  </td>
                  <td style={TD({ width:'18%', color:'#666', fontWeight:'500' })}>{R[0]}</td>
                  <td style={TD({ width:'32%', fontWeight:'700', color:'#1a1a1a' })}>
                    {R[1] || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ ATTENDANCE ══ */}
          <div style={SECTION_HDR}>Attendance Summary</div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f7f7f7', borderBottom:'1px solid #ddd' }}>
                {['Days in Month','Days Present','Days Absent','Paid Leave','Unpaid Leave','LOP Days']
                  .map((h, i) => (
                    <th key={i} style={TD({
                      fontWeight:'600', color:'#555', textAlign:'center',
                      fontSize:'10px', letterSpacing:'0.3px',
                      borderRight: i<5 ? '1px solid #e8e8e8' : 'none',
                      borderBottom:'1px solid #ddd', padding:'6px 4px',
                    })}>
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {[
                  daysInMonth,
                  slip.presentDays  ?? 0,
                  slip.absentDays   ?? 0,
                  slip.paidLeave    ?? 0,
                  slip.unpaidLeave  ?? 0,
                  slip.unpaidLeave  ?? 0,
                ].map((v, i) => (
                  <td key={i} style={TD({
                    textAlign:'center', fontWeight:'800', fontSize:'16px',
                    color:'#1a1a1a', padding:'10px 4px',
                    borderRight: i<5 ? '1px solid #e8e8e8' : 'none',
                  })}>
                    {v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* ══ EARNINGS & DEDUCTIONS ══ */}
          <div style={SECTION_HDR}>Earnings &amp; Deductions</div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f7f7f7', borderBottom:'1px solid #ddd' }}>
                <th style={TD({ fontWeight:'600', color:'#333', width:'35%',
                  fontSize:'10px', letterSpacing:'0.5px', textTransform:'uppercase' })}>
                  Earnings Component
                </th>
                <th style={TD({ fontWeight:'600', color:'#333', textAlign:'right',
                  width:'15%', borderRight:'2px solid #ccc',
                  fontSize:'10px', letterSpacing:'0.5px', textTransform:'uppercase' })}>
                  Amount (₹)
                </th>
                <th style={TD({ fontWeight:'600', color:'#333', width:'35%',
                  fontSize:'10px', letterSpacing:'0.5px', textTransform:'uppercase' })}>
                  Deductions Component
                </th>
                <th style={TD({ fontWeight:'600', color:'#333', textAlign:'right',
                  width:'15%', fontSize:'10px', letterSpacing:'0.5px',
                  textTransform:'uppercase' })}>
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {eRows.map((e, i) => {
                const d = dRows[i]
                const bg = i%2===0 ? '#fff' : '#fafafa'
                return (
                  <tr key={i} style={{ background: bg }}>
                    <td style={TD({ color:'#444' })}>{e?.label || ''}</td>
                    <td style={TD({ textAlign:'right', fontFamily:'monospace',
                      borderRight:'2px solid #ccc',
                      color: e?.amount ? '#1a1a1a' : '#ccc', fontWeight: e?.amount ? '600':'400' })}>
                      {e ? (e.amount ? fmt(e.amount) : '—') : ''}
                    </td>
                    <td style={TD({ color:'#444' })}>{d?.label || ''}</td>
                    <td style={TD({ textAlign:'right', fontFamily:'monospace',
                      color: d?.amount ? '#1a1a1a' : '#ccc', fontWeight: d?.amount ? '600':'400' })}>
                      {d ? (d.amount ? fmt(d.amount) : '—') : ''}
                    </td>
                  </tr>
                )
              })}

              {/* ── Totals row ── */}
              <tr style={{ background:'#f0f0f0', borderTop:'2px solid #aaa' }}>
                <td style={TD({ fontWeight:'800', color:'#1a1a1a', fontSize:'12px' })}>
                  Gross Earnings
                </td>
                <td style={TD({ textAlign:'right', fontWeight:'800', fontFamily:'monospace',
                  color:'#1a1a1a', fontSize:'12px', borderRight:'2px solid #ccc' })}>
                  {fmt(gross)}
                </td>
                <td style={TD({ fontWeight:'800', color:'#1a1a1a', fontSize:'12px' })}>
                  Total Deductions
                </td>
                <td style={TD({ textAlign:'right', fontWeight:'800', fontFamily:'monospace',
                  color:'#1a1a1a', fontSize:'12px' })}>
                  {fmt(slip.totalDeduction || 0)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ NET PAY ══ */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'14px 12px',
            background:'#2c3e50',
            borderTop:'none',
          }}>
            <div>
              <div style={{ color:'#adc8e8', fontSize:'9px', fontWeight:'600',
                letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'4px' }}>
                Net Salary Payable
              </div>
              <div style={{ color:'#fff', fontSize:'24px', fontWeight:'900',
                fontFamily:'monospace', letterSpacing:'1px' }}>
                ₹ {fmt(net)}
              </div>
            </div>
            <div style={{ textAlign:'center', flex:1, padding:'0 20px' }}>
              <div style={{ color:'#c5d8ec', fontSize:'10px', fontStyle:'italic',
                lineHeight:'1.5' }}>
                {numWords(net)}
              </div>
            </div>
            <div>
              <span style={{
                border: '1.5px solid rgba(255,255,255,0.6)',
                color: '#fff',
                padding: '5px 14px',
                fontSize: '10px',
                fontWeight: '700',
                borderRadius: '3px',
                letterSpacing: '0.5px',
              }}>
                {slip.paymentStatus || 'Unpaid'}
              </span>
            </div>
          </div>

          {/* ══ PAYMENT HISTORY ══ */}
          {slip.payments?.length > 0 && (
            <>
              <div style={SECTION_HDR}>Payment History</div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f7f7f7', borderBottom:'1px solid #ddd' }}>
                    {['#','Date','Mode','Reference / UTR No.','Amount Paid (₹)'].map((h,i) => (
                      <th key={i} style={TD({
                        fontWeight:'600', color:'#555',
                        textAlign: i===4 ? 'right' : 'left',
                        fontSize:'10px', letterSpacing:'0.3px',
                      })}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slip.payments.map((p, i) => (
                    <tr key={i} style={{ background: i%2===0 ? '#fff' : '#fafafa' }}>
                      <td style={TD({ color:'#aaa', width:'4%' })}>{i+1}</td>
                      <td style={TD({ width:'16%' })}>{p.paymentDate?.slice(0,10)}</td>
                      <td style={TD({ width:'14%' })}>
                        <span style={{ border:'1px solid #ccc', padding:'2px 7px',
                          borderRadius:'3px', fontSize:'10px', background:'#f9f9f9' }}>
                          {p.paymentMode}
                        </span>
                      </td>
                      <td style={TD({ fontFamily:'monospace', fontSize:'10px',
                        color:'#555', width:'36%' })}>
                        {p.transactionReference || '—'}
                      </td>
                      <td style={TD({ textAlign:'right', fontFamily:'monospace',
                        fontWeight:'700', color:'#1a1a1a', width:'18%' })}>
                        {fmt(p.paidAmount)}
                      </td>
                    </tr>
                  ))}
                  {slip.payments.length > 1 && (
                    <tr style={{ background:'#f0f0f0', borderTop:'2px solid #aaa' }}>
                      <td colSpan={4} style={TD({ textAlign:'right', fontWeight:'700',
                        fontSize:'12px', color:'#1a1a1a' })}>
                        Total Paid
                      </td>
                      <td style={TD({ textAlign:'right', fontWeight:'800',
                        fontFamily:'monospace', fontSize:'12px', color:'#1a1a1a' })}>
                        {fmt(slip.totalPaid || 0)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* ══ NOTE ══ */}
          <div style={{
            margin:'0', padding:'10px 12px',
            background:'#fffbea', borderTop:'1px solid #e8e0cc',
            borderBottom:'1px solid #e8e0cc',
          }}>
            <p style={{ fontSize:'9px', color:'#7a6a3a', margin:0, lineHeight:'1.7' }}>
              <strong>Important:</strong> This is a computer-generated salary slip. No physical
              signature is required. For any discrepancies in the salary components or deductions,
              please contact the HR department within <strong>7 working days</strong> of receipt.
            </p>
          </div>

          {/* ══ SIGNATURE ══ */}
          <div style={{ padding:'24px 20px 18px' }}>
            <table style={{ width:'100%' }}>
              <tbody>
                <tr>
                  <td style={{ width:'38%', textAlign:'center', paddingTop:'40px' }}>
                    <div style={{ borderTop:'1.5px solid #555', paddingTop:'7px' }}>
                      <div style={{ fontSize:'11px', fontWeight:'700', color:'#1a1a1a' }}>
                        Employee Signature
                      </div>
                      <div style={{ fontSize:'10px', color:'#888', marginTop:'3px' }}>
                        {s.employeeName}
                      </div>
                    </div>
                  </td>
                  <td style={{ width:'24%' }} />
                  <td style={{ width:'38%', textAlign:'center', paddingTop:'40px' }}>
                    <div style={{ borderTop:'1.5px solid #555', paddingTop:'7px' }}>
                      <div style={{ fontSize:'11px', fontWeight:'700', color:'#1a1a1a' }}>
                        Authorized Signatory
                      </div>
                      <div style={{ fontSize:'10px', color:'#888', marginTop:'3px' }}>
                        {slip.schoolName || 'HR Department'}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ══ FOOTER ══ */}
          <div style={{
            borderTop:'3px solid #2c3e50',
            padding:'7px 12px',
            display:'flex', justifyContent:'space-between', alignItems:'center',
            background:'#f5f5f5',
          }}>
            <span style={{ fontSize:'9px', color:'#888', letterSpacing:'0.3px' }}>
              Confidential — For authorized personnel only. Do not share.
            </span>
            <span style={{ fontSize:'9px', color:'#888' }}>
              Franchise Management System HR &nbsp;·&nbsp; {slip.salaryMonth}
            </span>
          </div>

        </div>
      </div>

      {/* ── Print CSS ── */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0 !important; background: #fff !important; }
          .print\\:hidden  { display: none !important; }
          .print\\:p-0     { padding: 0 !important; }
          #salary-slip-print {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>
    </div>
  )
}

export default SalarySlip
