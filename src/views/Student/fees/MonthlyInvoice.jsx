/* eslint-disable prettier/prettier */
import { useContext, useRef } from 'react'
import { Button } from 'antd'
import { useReactToPrint } from 'react-to-print'
import { AppContext } from '../../../Context/AppContext'

const MonthlyInvoice = ({ student, monthLedger }) => {
  const printRef = useRef()
  const { tenantDetails } = useContext(AppContext)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${student?.name}_${monthLedger?.period || 'Fee Receipt'}_Fee Receipt`,
    printStyles: `
@media print {
  @page { size: A4; margin: 10mm; }
  html, body { width: 210mm; margin: 0; padding: 0; }
  body * { visibility: hidden; }
  #print-section, #print-section * { visibility: visible; }
  #print-section {
    position: fixed; top: 10mm; left: 50%;
    transform: translateX(-50%);
    width: 190mm; padding: 0; box-sizing: border-box;
  }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`,
  })

  if (!student || !monthLedger) return null

  const receiptLabel =
    monthLedger.receiptNos?.length > 0 ? monthLedger.receiptNos.join(', ') : '-'

  const regularItems    = (monthLedger.items || []).filter((i) => i.type !== 'CONCESSION')
  const concessionItem  = (monthLedger.items || []).find((i) => i.type === 'CONCESSION')
  const concessionAmt   = concessionItem ? Math.abs(Number(concessionItem.dueAmount)) : 0

  // Latest payment date from items
  const paymentDates = (monthLedger.items || [])
    .map((i) => i.paymentDate || i.paidDate)
    .filter(Boolean)
  const latestDate = paymentDates.length
    ? new Date(Math.max(...paymentDates.map((d) => new Date(d)))).toLocaleDateString('en-GB')
    : null

  const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`

  return (
    <>
      <div className="bg-white p-4 text-[13px]" ref={printRef}>
        {/* Print button — hidden on print */}
        <div className="flex justify-end mb-3 print:hidden">
          <Button type="primary" style={{ background: '#0c3b73' }} onClick={handlePrint}>
            🖨️ Print / Download PDF
          </Button>
        </div>

        <div id="print-section">
          <div style={{ border: '2px solid #000', fontFamily: 'Arial, sans-serif', fontSize: 12 }}>

            {/* ── SCHOOL HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '3px solid #000', padding: '10px 14px', gap: 12 }}>
              {tenantDetails?.logo && (
                <img src={tenantDetails.logo} alt="logo" style={{ width: 60, height: 60, objectFit: 'contain', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', lineHeight: 1.2 }}>
                  {tenantDetails?.schoolName || 'Franchise Name'}
                </div>
                {tenantDetails?.schoolAddress && (
                  <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>
                    {tenantDetails.schoolAddress}
                  </div>
                )}
                {tenantDetails?.phone && (
                  <div style={{ fontSize: 11, color: '#444' }}>Ph: {tenantDetails.phone}</div>
                )}
              </div>
              {/* Receipt No box top-right */}
              <div style={{ textAlign: 'right', flexShrink: 0, fontSize: 11 }}>
                <div style={{ background: '#0c3b73', color: '#fff', padding: '3px 8px', borderRadius: 4, fontWeight: 'bold', marginBottom: 3 }}>
                  Receipt No
                </div>
                <div style={{ fontWeight: 'bold', fontSize: 13 }}>{receiptLabel}</div>
                {latestDate && <div style={{ color: '#555', marginTop: 2 }}>Date: {latestDate}</div>}
              </div>
            </div>

            {/* ── RECEIPT TITLE ── */}
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #000', letterSpacing: 1, background: '#f5f5f5' }}>
              FEE PAYMENT RECEIPT — {monthLedger.period}
            </div>

            {/* ── STUDENT DETAILS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px 8px', padding: '8px 14px', borderBottom: '1px solid #000', fontSize: 12 }}>
              <div><b>Form No :</b> {student.formNo || '-'}</div>
              <div><b>Student ID :</b> {student.studentId || '-'}</div>
              <div><b>Name :</b> {student.name}</div>
              <div><b>Father Name :</b> {student.fatherName || '-'}</div>
              <div><b>Phone :</b> {student.phone || '-'}</div>
              <div>
                <b>Class :</b> {student.class}
                {student.section ? `(${student.section})` : ''}
                {student.stream ? ` ${student.stream}` : ''}
              </div>
            </div>

            {/* ── FEE TABLE ── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#0c3b73', color: '#fff' }}>
                  {['Sr.No.', 'Fee Head', 'Due Date', 'Total', 'Paid', 'Balance'].map((h) => (
                    <th key={h} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regularItems.map((item, index) => {
                  const balance = Number(item.dueAmount || 0)
                  const isTuition = item.type === 'TUITION' || item.feeHead?.toLowerCase().includes('tuition')
                  const showConcession = isTuition && concessionAmt > 0
                  return (
                    <tr key={item.referenceId || index} style={{ background: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ border: '1px solid #ccc', padding: '5px 8px' }}>
                        {item.feeHead}
                        {item.isWaived && item.waiverReason && (
                          <span style={{ marginLeft: 4, fontSize: 10, color: '#7c3aed', fontStyle: 'italic' }}>
                            ({item.waiverReason})
                          </span>
                        )}
                        {showConcession && (
                          <span style={{ marginLeft: 4, fontSize: 10, color: '#1d4ed8', fontStyle: 'italic' }}>
                            (- ₹{concessionAmt} concession)
                          </span>
                        )}
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center' }}>
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB') : '-'}
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center' }}>
                        {item.isWaived ? '-' : fmt(item.totalAmount)}
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>
                        {item.isWaived ? '-' : fmt(item.paidAmount)}
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center', fontWeight: 600,
                        color: item.isWaived ? '#7c3aed' : balance > 0 ? '#dc2626' : '#16a34a',
                        textDecoration: item.isWaived ? 'line-through' : 'none' }}>
                        {item.isWaived ? fmt(item.totalAmount) : fmt(balance)}
                      </td>
                    </tr>
                  )
                })}

                {/* Grand Total */}
                <tr style={{ background: '#fef9c3', fontWeight: 'bold' }}>
                  <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontSize: 13 }}>
                    Grand Total
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                    {fmt(monthLedger.totalAmount)}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', color: '#16a34a' }}>
                    {fmt(monthLedger.totalPaid)}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', color: Number(monthLedger.totalDue) > 0 ? '#dc2626' : '#16a34a' }}>
                    {fmt(monthLedger.totalDue)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ── NOTE + SIGNATURE ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '8px 14px', borderTop: '1px solid #000', fontSize: 11 }}>
              <div>
                <b>Note:</b> Please keep this receipt for future reference.
              </div>
              <div style={{ textAlign: 'center', fontSize: 11 }}>
                <div style={{ borderTop: '1px solid #000', paddingTop: 4, width: 120 }}>
                  Authorised Signatory
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default MonthlyInvoice
