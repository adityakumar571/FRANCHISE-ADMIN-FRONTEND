/* eslint-disable prettier/prettier */
/**
 * receiptUtils.js
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth for ALL fee receipt HTML across the app.
 *
 * Exports:
 *  buildFeeReceiptHTML      — universal receipt (works for both ledger-row
 *                             AND payment-history item)
 *  buildSingleMonthReceiptHTML — alias kept for backward compat
 *  generateReceiptPdfBlob   — renders HTML → PDF Blob via html2canvas + jsPDF
 *  downloadBlob             — triggers browser file-download
 *  sharePdfOnWhatsApp       — WhatsApp share (mobile native / desktop fallback)
 * ─────────────────────────────────────────────────────────────────
 */

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/* ─────────────────────────────────────────────────────────────────
   HELPER — amount in words (Indian numbering system)
───────────────────────────────────────────────────────────────── */
const amountToWords = (amount) => {
  const num = Math.round(Number(amount) || 0)
  if (num === 0) return 'Zero Rupees Only'
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ]
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const toWords = (n) => {
    if (n === 0) return ''
    if (n < 20) return ones[n] + ' '
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' '
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + toWords(n % 100)
    if (n < 100000) return toWords(Math.floor(n / 1000)) + 'Thousand ' + toWords(n % 1000)
    if (n < 10000000) return toWords(Math.floor(n / 100000)) + 'Lakh ' + toWords(n % 100000)
    return toWords(Math.floor(n / 10000000)) + 'Crore ' + toWords(n % 10000000)
  }
  return toWords(num).trim().replace(/\s+/g, ' ') + ' Rupees Only'
}

/* ─────────────────────────────────────────────────────────────────
   SHARED HEADER BLOCK  (same for every receipt variant)
───────────────────────────────────────────────────────────────── */
const buildHeaderHTML = ({ tenantDetails, receiptNo, receiptDate }) => {
  const logoHTML = tenantDetails?.logo
    ? `<img src="${tenantDetails.logo}" alt="logo"
         style="width:70px;height:70px;object-fit:contain;flex-shrink:0;border-radius:4px;"/>`
    : `<div style="width:70px;height:70px;border-radius:50%;background:#1e4d8c;
         display:flex;align-items:center;justify-content:center;
         color:#fff;font-weight:bold;font-size:26px;flex-shrink:0;">
         ${(tenantDetails?.schoolName || 'S').charAt(0)}
       </div>`

  return `
  <div style="display:flex;align-items:center;padding:14px 18px 12px;gap:14px;background:#fff;">
    ${logoHTML}
    <div style="flex:1;text-align:center;">
      <div style="font-size:21px;font-weight:700;color:#1e3a5f;line-height:1.3;">
        ${tenantDetails?.schoolName || 'School Name'}
      </div>
      ${tenantDetails?.schoolAddress
        ? `<div style="font-size:11px;color:#666;margin-top:3px;">${tenantDetails.schoolAddress}</div>`
        : ''}
      ${tenantDetails?.phone
        ? `<div style="font-size:11px;color:#666;margin-top:1px;">Ph: ${tenantDetails.phone}</div>`
        : ''}
    </div>
    <div style="text-align:center;flex-shrink:0;min-width:135px;">
      <div style="background:#1e4d8c;color:#fff;padding:4px 10px;border-radius:4px;
                  font-weight:600;font-size:9.5px;letter-spacing:1.5px;margin-bottom:5px;">
        RECEIPT NO.
      </div>
      <div style="font-weight:700;font-size:12.5px;color:#1e3a5f;">${receiptNo || '-'}</div>
      <div style="color:#555;font-size:10.5px;margin-top:3px;">
        Date: <strong>${receiptDate || '-'}</strong>
      </div>
    </div>
  </div>
  <div style="height:1px;background:#c8d8ea;"></div>`
}

/* ─────────────────────────────────────────────────────────────────
   SHARED STUDENT INFO BLOCK
───────────────────────────────────────────────────────────────── */
const buildStudentInfoHTML = ({ student, paymentMode, collectedByName, transactionId }) => `
  <div style="padding:0;">
    <div style="background:#eef3f9;padding:6px 16px;border-bottom:1px solid #c8d8ea;">
      <span style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:1px;text-transform:uppercase;">
        Student Details
      </span>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed;">
      <colgroup>
        <col style="width:22%"/>
        <col style="width:28%"/>
        <col style="width:22%"/>
        <col style="width:28%"/>
      </colgroup>
      <tr>
        <td style="border:1px solid #dce6f0;padding:7px 12px;background:#f5f8fc;font-weight:600;color:#2c4a6e;word-break:break-word;vertical-align:middle;">Student Name</td>
        <td style="border:1px solid #dce6f0;padding:7px 12px;color:#222;word-break:break-word;vertical-align:middle;">${student?.name || '-'}</td>
        <td style="border:1px solid #dce6f0;padding:7px 12px;background:#f5f8fc;font-weight:600;color:#2c4a6e;word-break:break-word;vertical-align:middle;">Father Name</td>
        <td style="border:1px solid #dce6f0;padding:7px 12px;color:#222;word-break:break-word;vertical-align:middle;">${student?.fatherName || '-'}</td>
      </tr>
      <tr>
        <td style="border:1px solid #dce6f0;padding:7px 12px;background:#f5f8fc;font-weight:600;color:#2c4a6e;vertical-align:middle;">Class / Section</td>
        <td style="border:1px solid #dce6f0;padding:7px 12px;color:#222;vertical-align:middle;">
          ${student?.class || student?.className || '-'}${student?.section || student?.sectionName ? ' — ' + (student.section || student.sectionName) : ''}${student?.stream ? ' (' + student.stream + ')' : ''}
        </td>
        <td style="border:1px solid #dce6f0;padding:7px 12px;background:#f5f8fc;font-weight:600;color:#2c4a6e;vertical-align:middle;">Phone</td>
        <td style="border:1px solid #dce6f0;padding:7px 12px;color:#222;vertical-align:middle;">${student?.phone || '-'}</td>
      </tr>
      <tr>
        <td style="border:1px solid #dce6f0;padding:7px 12px;background:#f5f8fc;font-weight:600;color:#2c4a6e;vertical-align:middle;">Student ID</td>
        <td style="border:1px solid #dce6f0;padding:7px 12px;color:#222;vertical-align:middle;">${(() => {
          const sid = student?.studentIdNumber || student?.admissionNo || student?.rollNo
          if (sid) return sid
          const raw = student?.studentId || ''
          const isMongoId = /^[a-f0-9]{24}$/i.test(String(raw).trim())
          return (!raw || raw === '-' || isMongoId) ? '-' : raw
        })()}</td>
        <td style="border:1px solid #dce6f0;padding:7px 12px;background:#f5f8fc;font-weight:600;color:#2c4a6e;vertical-align:middle;">Form No</td>
        <td style="border:1px solid #dce6f0;padding:7px 12px;color:#222;vertical-align:middle;">${student?.formNo || '-'}</td>
      </tr>
      <tr>
        <td style="border:1px solid #dce6f0;padding:7px 12px;background:#f5f8fc;font-weight:600;color:#2c4a6e;vertical-align:middle;">Payment Mode</td>
        <td style="border:1px solid #dce6f0;padding:7px 12px;vertical-align:middle;">
          <span style="background:#e8f5e9;color:#1b5e20;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600;border:1px solid #a5d6a7;">
            ${paymentMode || '-'}
          </span>
        </td>
        <td style="border:1px solid #dce6f0;padding:7px 12px;background:#f5f8fc;font-weight:600;color:#2c4a6e;vertical-align:middle;">Received By</td>
        <td style="border:1px solid #dce6f0;padding:7px 12px;color:#222;vertical-align:middle;">${collectedByName || '-'}</td>
      </tr>
      ${transactionId ? `
      <tr>
        <td style="border:1px solid #dce6f0;padding:7px 12px;background:#f5f8fc;font-weight:600;color:#2c4a6e;vertical-align:middle;">Transaction ID</td>
        <td colspan="3" style="border:1px solid #dce6f0;padding:7px 12px;color:#222;font-family:monospace;word-break:break-all;vertical-align:middle;">${transactionId}</td>
      </tr>` : ''}
    </table>
  </div>`

/* ─────────────────────────────────────────────────────────────────
   SHARED FEE TABLE BLOCK — works for both month rows AND simple rows
───────────────────────────────────────────────────────────────── */
const buildFeeTableHTML = ({ rows, totalAmount, totalPaid, totalDue, period }) => {
  const rowsHTML = rows.map((r, i) => {
    const balColor = r.isWaived ? '#7c3aed' : Number(r.dueAmount) > 0 ? '#dc2626' : '#16a34a'
    return `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f7fafd'}">
      <td style="border:1px solid #dce6f0;padding:7px 10px;text-align:center;vertical-align:middle;font-size:12px;color:#555;">${i + 1}</td>
      <td style="border:1px solid #dce6f0;padding:7px 12px;font-size:12px;color:#222;vertical-align:middle;word-break:break-word;">
        ${r.feeHead || '-'}
        ${r.concessionNote ? `<span style="font-size:10px;color:#1d4ed8;font-style:italic;"> ${r.concessionNote}</span>` : ''}
        ${r.waiverNote ? `<span style="font-size:10px;color:#7c3aed;font-style:italic;"> ${r.waiverNote}</span>` : ''}
      </td>
      ${r.showDueDate !== false
        ? `<td style="border:1px solid #dce6f0;padding:7px 10px;text-align:center;vertical-align:middle;font-size:11.5px;color:#555;">
             ${r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-GB') : '-'}
           </td>`
        : ''}
      <td style="border:1px solid #dce6f0;padding:7px 10px;text-align:right;vertical-align:middle;font-size:12px;color:#333;white-space:nowrap;">
        ${r.isWaived ? '—' : '&#8377;' + Number(r.totalAmount || 0).toFixed(2)}
      </td>
      <td style="border:1px solid #dce6f0;padding:7px 10px;text-align:right;vertical-align:middle;color:#1a7a3c;font-weight:600;font-size:12px;white-space:nowrap;">
        ${r.isWaived ? '—' : '&#8377;' + Number(r.paidAmount || 0).toFixed(2)}
      </td>
      <td style="border:1px solid #dce6f0;padding:7px 10px;text-align:right;vertical-align:middle;font-weight:600;white-space:nowrap;
                 color:${balColor};font-size:12px;${r.isWaived ? 'text-decoration:line-through' : ''}">
        ${r.isWaived
          ? '&#8377;' + Number(r.totalAmount || 0).toFixed(2)
          : '&#8377;' + Number(r.dueAmount || 0).toFixed(2)}
      </td>
    </tr>`
  }).join('')

  const hasDueDate = rows.length === 0 || rows[0].showDueDate !== false
  const colspan = hasDueDate ? 3 : 2

  return `
  <div style="padding:0;margin-top:0;">
    <div style="background:#eef3f9;padding:6px 16px;border-bottom:1px solid #c8d8ea;border-top:1px solid #c8d8ea;">
      <span style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:1px;text-transform:uppercase;">
        Fee Details${period ? ' — ' + period : ''}
      </span>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed;">
      <colgroup>
        <col style="width:6%"/>
        <col style="${hasDueDate ? '43%' : '56%'}"/>
        ${hasDueDate ? '<col style="width:13%"/>' : ''}
        <col style="width:14%"/>
        <col style="width:12%"/>
        <col style="width:12%"/>
      </colgroup>
      <thead>
        <tr style="background:#1e4d8c;color:#fff;">
          <th style="border:1px solid #163d72;padding:8px 10px;text-align:center;vertical-align:middle;font-size:11.5px;font-weight:600;">Sr.</th>
          <th style="border:1px solid #163d72;padding:8px 12px;text-align:left;vertical-align:middle;font-size:11.5px;font-weight:600;">Fee Head</th>
          ${hasDueDate ? `<th style="border:1px solid #163d72;padding:8px 10px;text-align:center;vertical-align:middle;font-size:11.5px;font-weight:600;">Due Date</th>` : ''}
          <th style="border:1px solid #163d72;padding:8px 10px;text-align:right;vertical-align:middle;font-size:11.5px;font-weight:600;">Total (&#8377;)</th>
          <th style="border:1px solid #163d72;padding:8px 10px;text-align:right;vertical-align:middle;font-size:11.5px;font-weight:600;">Paid (&#8377;)</th>
          <th style="border:1px solid #163d72;padding:8px 10px;text-align:right;vertical-align:middle;font-size:11.5px;font-weight:600;">Balance (&#8377;)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML || `<tr><td colspan="6" style="text-align:center;padding:12px;border:1px solid #dce6f0;font-style:italic;color:#888;">No fee breakdown available</td></tr>`}
        <tr style="background:#fdfaf0;">
          <td colspan="${colspan}" style="border:1px solid #e0cc70;padding:9px 12px;text-align:right;vertical-align:middle;font-size:13px;font-weight:700;color:#7a5c00;">
            Grand Total
          </td>
          <td style="border:1px solid #e0cc70;padding:9px 10px;text-align:right;vertical-align:middle;font-weight:600;font-size:13px;color:#222;white-space:nowrap;">
            &#8377;${Number(totalAmount || 0).toFixed(2)}
          </td>
          <td style="border:1px solid #e0cc70;padding:9px 10px;text-align:right;vertical-align:middle;font-weight:700;font-size:13px;color:#1a7a3c;white-space:nowrap;">
            &#8377;${Number(totalPaid || 0).toFixed(2)}
          </td>
          <td style="border:1px solid #e0cc70;padding:9px 10px;text-align:right;vertical-align:middle;font-weight:700;font-size:13px;white-space:nowrap;
                     color:${Number(totalDue) > 0 ? '#c0392b' : '#1a7a3c'};">
            &#8377;${Number(totalDue || 0).toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
    <div style="border:1px solid #dce6f0;border-top:none;padding:7px 14px;background:#f8fafc;font-size:11.5px;color:#444;">
      <b style="color:#1e3a5f;">Amount in Words:</b> <i style="color:#2c5282;">${amountToWords(totalPaid)}</i>
    </div>
  </div>`
}

/* ─────────────────────────────────────────────────────────────────
   SHARED FOOTER BLOCK
───────────────────────────────────────────────────────────────── */
const buildFooterHTML = ({ collectedByName, remark }) => `
  <div style="display:flex;justify-content:space-between;align-items:flex-end;
              padding:12px 18px 16px;margin-top:0;font-size:11px;color:#444;
              border-top:1px solid #dce6f0;background:#fff;">
    <div style="max-width:52%;">
      <div style="background:#fffbeb;border-left:3px solid #d4a017;padding:6px 10px;border-radius:0 4px 4px 0;font-size:11px;">
        <b>Note:</b> This is a computer-generated receipt. Please keep it for future reference.
      </div>
      ${remark ? `<div style="margin-top:6px;font-size:11px;"><b>Remark:</b> ${remark}</div>` : ''}
    </div>
    <div style="display:flex;gap:36px;text-align:center;">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;">
        <div style="height:32px;"></div>
        <div style="border-top:1px solid #555;width:115px;padding-top:5px;font-size:10.5px;color:#555;">
          Parent / Guardian
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;">
        <div style="font-size:11.5px;font-weight:700;color:#1e3a5f;margin-bottom:5px;line-height:1.4;white-space:nowrap;">
          ${collectedByName || ''}
        </div>
        <div style="border-top:1px solid #555;width:125px;padding-top:5px;font-size:10.5px;color:#555;">
          Cashier / Accountant
        </div>
      </div>
    </div>
  </div>`

/* ─────────────────────────────────────────────────────────────────
   WRAPPER  — full A4 page with one receipt copy
───────────────────────────────────────────────────────────────── */
const wrapReceipt = (bodyHTML, copyLabel) => `
<div style="width:794px;max-width:794px;
            border:1.5px solid #1e4d8c;border-radius:6px;
            box-sizing:border-box;font-family:Arial,sans-serif;font-size:12px;
            page-break-inside:avoid;overflow:hidden;background:#fff;">
  ${bodyHTML}
</div>`

/* ═════════════════════════════════════════════════════════════════
   buildFeeReceiptHTML — UNIVERSAL RECEIPT BUILDER
   ─────────────────────────────────────────────────────────────────
   TWO modes:

   MODE A — month-wise (ledger row):
     pass `month` object  { period, items, receiptNos,
                            totalAmount, totalPaid, totalDue }

   MODE B — payment-wise (collection report row):
     pass `paymentItem`   { receiptNo, createdAt, amountPaid,
                            paymentMode, className, sectionName,
                            clerkName, gatewayOrderId, ... }
     pass `breakdown`     array  [{ feeHead, amount }]
                          (may be empty — shows summary row then)

   Common params:
     student              { name, fatherName, class, section, stream,
                            studentId, formNo, phone }
     tenantDetails        { schoolName, schoolAddress, phone, logo }
     collectedByName      string
     copyLabel            'OFFICE COPY' | 'STUDENT COPY' | undefined
     remark               optional string
═════════════════════════════════════════════════════════════════ */
export const buildFeeReceiptHTML = ({
  // MODE A
  month,
  // MODE B
  paymentItem,
  breakdown = [],
  // common
  student,
  tenantDetails,
  collectedByName,
  copyLabel,
  remark,
}) => {
  /* ── determine receiptNo and date ── */
  let receiptNo, receiptDate, paymentMode, transactionId, period

  if (month) {
    /* ── MODE A ── */
    period      = month.period
    receiptNo   = month.receiptNos?.length ? month.receiptNos.join(', ') : '-'
    paymentMode = month.paymentMode || '-'

    const dates = (month.items || []).map((i) => i.paymentDate || i.paidDate).filter(Boolean)
    receiptDate = dates.length
      ? new Date(Math.max(...dates.map((d) => new Date(d)))).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB')
  } else {
    /* ── MODE B ── */
    receiptNo     = paymentItem?.receiptNo || '-'
    receiptDate   = paymentItem?.createdAt
      ? new Date(paymentItem.createdAt).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB')
    paymentMode   = paymentItem?.paymentMode || '-'
    transactionId = paymentItem?.gatewayOrderId || null
    collectedByName = collectedByName
      || paymentItem?.clerkName
      || (paymentItem?.paymentType === 'ONLINE' || paymentItem?.gatewayOrderId ? 'Online Payment' : '-')
  }

  /* ── build fee rows ── */
  let feeRows = []
  let totalAmount, totalPaid, totalDue

  if (month) {
    const concessionItem = (month.items || []).find((i) => i.type === 'CONCESSION')
    const concessionAmt  = concessionItem ? Math.abs(Number(concessionItem.dueAmount)) : 0

    feeRows = (month.items || [])
      .filter((i) => i.type !== 'CONCESSION')
      .map((fee) => {
        const isTuition = fee.type === 'TUITION' || (fee.feeHead || '').toLowerCase().includes('tuition')
        return {
          feeHead:       fee.feeHead,
          dueDate:       fee.dueDate,
          totalAmount:   fee.totalAmount,
          paidAmount:    fee.paidAmount,
          dueAmount:     fee.dueAmount,
          isWaived:      fee.isWaived,
          concessionNote: isTuition && concessionAmt > 0
            ? `(- ₹${concessionAmt} concession)` : null,
          waiverNote:    fee.isWaived && fee.waiverReason ? `(${fee.waiverReason})` : null,
          showDueDate:   true,
        }
      })

    totalAmount = month.totalAmount
    totalPaid   = month.totalPaid
    totalDue    = month.totalDue
  } else {
    feeRows = breakdown.map((b) => ({
      feeHead:     b.feeHead || b.feeName || '-',
      totalAmount: b.amount || 0,
      paidAmount:  b.amount || 0,
      dueAmount:   0,
      isWaived:    false,
      showDueDate: false,
    }))

    totalAmount = paymentItem?.amountPaid || 0
    totalPaid   = paymentItem?.amountPaid || 0
    totalDue    = 0
  }

  /* ── assemble receipt ── */
  const headerHTML     = buildHeaderHTML({ tenantDetails, receiptNo, receiptDate })
  const titleHTML      = `
    <div style="display:block;width:100%;text-align:center;font-weight:700;font-size:12px;
                padding:7px 0;letter-spacing:3px;background:#1e4d8c;color:#fff;
                text-transform:uppercase;box-sizing:border-box;">
      FEE PAYMENT RECEIPT${period ? '  —  ' + period : ''}
    </div>`
  const studentHTML    = buildStudentInfoHTML({ student, paymentMode, collectedByName, transactionId })
  const tableHTML      = buildFeeTableHTML({ rows: feeRows, totalAmount, totalPaid, totalDue, period })
  const footerHTML     = buildFooterHTML({ collectedByName, remark })

  const bodyHTML = headerHTML + titleHTML + studentHTML + tableHTML + footerHTML

  return wrapReceipt(bodyHTML, copyLabel || 'FEE RECEIPT')
}

/* ─────────────────────────────────────────────────────────────────
   buildFeeReceiptPageHTML  — wraps 2 copies in a printable A4 page
   (Office Copy on top, Student Copy below, dashed tear line)
───────────────────────────────────────────────────────────────── */
export const buildFeeReceiptPageHTML = (params) => {
  const officeCopy  = buildFeeReceiptHTML({ ...params, copyLabel: 'OFFICE COPY' })
  const studentCopy = buildFeeReceiptHTML({ ...params, copyLabel: 'STUDENT COPY' })

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Fee Receipt${params.month?.period ? ' — ' + params.month.period : ''}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 8mm; }
  html, body { font-family: Arial, sans-serif; background: #fff; width: 794px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  .tear {
    border: none; border-top: 2px dashed #aaa;
    margin: 12px 0; position: relative;
  }
  .tear::after {
    content: '✂  Tear Here';
    position: absolute; left: 50%;
    transform: translateX(-50%) translateY(-50%);
    background: #fff; padding: 0 10px;
    color: #aaa; font-size: 11px; white-space: nowrap;
  }
</style>
</head>
<body style="padding:0;">
  <div style="width:794px;margin:0 auto;padding:0;box-sizing:border-box;">
    ${officeCopy}
    <hr class="tear"/>
    ${studentCopy}
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 600);
    };
  <\/script>
</body>
</html>`
}

/* ─────────────────────────────────────────────────────────────────
   buildSingleMonthReceiptHTML — BACKWARD COMPAT alias
   (AddCollection.jsx, Feecollection.jsx use this)
───────────────────────────────────────────────────────────────── */
export const buildSingleMonthReceiptHTML = ({ student, month, tenantDetails, collectedByName, remark }) => {
  const body = buildFeeReceiptHTML({
    month, student, tenantDetails, collectedByName, remark, copyLabel: 'STUDENT COPY',
  })

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Fee Receipt</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; width: 794px; }
  body { font-family: Arial, sans-serif; font-size: 12px; padding: 0; }
  #receipt, #receipt > div { width: 100% !important; }
</style>
</head>
<body>
<div id="receipt" style="width:794px;margin:0 auto;">
  ${body}
</div>
</body>
</html>`
}

/* ═════════════════════════════════════════════════════════════════
   generateReceiptPdfBlob
   Renders an HTML string → PDF Blob via html2canvas + jsPDF
   Strategy: extract only the receipt body HTML, inject into a
   fixed-width off-screen div in the CURRENT document so that
   html2canvas works without cross-origin / sandbox issues.
════════════════════════════════════════════════════════════════= */

/**
 * Converts an external image URL to a base64 data URI.
 * Uses a canvas proxy approach to avoid CORS issues on live servers.
 * Falls back to empty string on failure so receipt still renders.
 */
const toBase64DataURI = async (url) => {
  try {
    // Try fetch with cors mode first
    const res = await fetch(url, { mode: 'cors', cache: 'force-cache' })
    if (!res.ok) throw new Error('fetch failed')
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror  = () => resolve('')
      reader.readAsDataURL(blob)
    })
  } catch {
    // CORS blocked — try no-cors via Image + canvas (tainted but works for same-origin)
    return await new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          const c = document.createElement('canvas')
          c.width  = img.naturalWidth  || img.width
          c.height = img.naturalHeight || img.height
          c.getContext('2d').drawImage(img, 0, 0)
          resolve(c.toDataURL('image/png'))
        } catch {
          resolve('') // still blocked — skip logo
        }
      }
      img.onerror = () => resolve('')
      img.src = url + (url.includes('?') ? '&' : '?') + '_cb=' + Date.now()
    })
  }
}

export const generateReceiptPdfBlob = async (htmlString) => {
  // Use 820px so the 794px receipt (+ 2px border each side) never clips on the right
  const RENDER_W = 820   // px — slightly wider than receipt to avoid right-side clipping

  // Step 1: Extract just the inner body content from the HTML string.
  let bodyContent = htmlString
  const bodyMatch = htmlString.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    bodyContent = bodyMatch[1].trim()
  }

  // Step 2: Create a fixed-width off-screen container
  const container = document.createElement('div')
  container.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    `width:${RENDER_W}px`,
    'min-height:100px',
    'background:#fff',
    'box-sizing:border-box',
    'overflow:visible',
    'font-family:Arial,sans-serif',
    'font-size:12px',
    'z-index:-9999',
  ].join(';')
  container.innerHTML = bodyContent
  document.body.appendChild(container)

  // Step 3: Convert all external <img> src to base64 to avoid CORS errors in html2canvas
  const imgEls = Array.from(container.querySelectorAll('img'))
  await Promise.all(
    imgEls.map(async (img) => {
      const src = img.getAttribute('src') || ''
      // Only convert http/https URLs (skip data: URIs and relative paths)
      if (!src.startsWith('http://') && !src.startsWith('https://')) return
      const b64 = await toBase64DataURI(src)
      if (b64) {
        img.removeAttribute('crossorigin')
        img.src = b64
      } else {
        // Could not load — hide the broken image so it doesn't block rendering
        img.style.display = 'none'
      }
    })
  )

  // Small settle delay for layout
  await new Promise((r) => setTimeout(r, 300))

  // Step 4: Measure actual rendered dimensions
  const contentW = Math.max(container.scrollWidth, RENDER_W)
  const contentH = container.scrollHeight || container.offsetHeight

  // Step 5: Capture with html2canvas
  const canvas = await html2canvas(container, {
    scale:           2,
    useCORS:         true,
    allowTaint:      true,
    backgroundColor: '#ffffff',
    logging:         false,
    width:           contentW,
    height:          contentH,
    windowWidth:     contentW,
    windowHeight:    contentH,
    scrollX:         0,
    scrollY:         0,
    x:               0,
    y:               0,
  })

  document.body.removeChild(container)

  // Step 6: Build PDF sized to the captured content
  // At 96dpi scale:2 → 1mm = (96/25.4)*2 = 7.559 canvas-px
  const DPM    = (96 / 25.4) * 2
  const imgW   = canvas.width  / DPM   // mm
  const imgH   = canvas.height / DPM   // mm
  const MARGIN = 4                     // mm

  const pdf = new jsPDF({
    orientation: imgW > imgH ? 'landscape' : 'portrait',
    unit:        'mm',
    format:      [imgW + MARGIN * 2, imgH + MARGIN * 2],
  })

  pdf.addImage(
    canvas.toDataURL('image/jpeg', 0.95),
    'JPEG',
    MARGIN, MARGIN,
    imgW, imgH,
    undefined,
    'FAST',
  )
  return pdf.output('blob')
}

/* ─────────────────────────────────────────────────────────────────
   downloadBlob
───────────────────────────────────────────────────────────────── */
export const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ─────────────────────────────────────────────────────────────────
   sharePdfOnWhatsApp
───────────────────────────────────────────────────────────────── */
export const sharePdfOnWhatsApp = async (pdfBlob, fileName, phone, studentName, receiptInfo) => {
  // ── Normalize phone number to international format ──
  const raw    = (phone || '').toString().trim()
  const digits = raw.replace(/\D/g, '')
  let normalized = ''
  if      (digits.length === 10)                            normalized = '91' + digits
  else if (digits.length === 11 && digits.startsWith('0')) normalized = '91' + digits.slice(1)
  else if (digits.length === 12 && digits.startsWith('91'))normalized = digits
  else if (digits.length > 0)                              normalized = digits

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  const msg =
    `*${receiptInfo?.schoolName || 'School'}*\n` +
    `--------------------------------\n` +
    `*FEE PAYMENT RECEIPT*\n` +
    `--------------------------------\n\n` +
    `Dear Parent,\n\n` +
    `Fee payment received for your ward.\n\n` +
    `*Student    :* ${studentName}\n` +
    `*Amount     :* Rs. ${receiptInfo?.amountPaid || receiptInfo?.totalPaid || ''}\n` +
    (receiptInfo?.paymentMode ? `*Mode       :* ${receiptInfo.paymentMode}\n` : '') +
    (receiptInfo?.receiptNo   ? `*Receipt No :* ${receiptInfo.receiptNo}\n`   : '') +
    `*Date       :* ${today}\n\n` +
    `--------------------------------\n` +
    `*Status: PAID* ✅\n\n` +
    `Thank you!`

  const file = new File([pdfBlob], fileName, { type: 'application/pdf' })

  // ── MOBILE: use Web Share API to attach the PDF file ──
  // This opens the native share sheet so the user can pick WhatsApp
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `Fee Receipt — ${studentName}`,
        text:  msg,
      })
      return  // done — user picked WhatsApp (or any app) from share sheet
    } catch (err) {
      if (err.name === 'AbortError') return  // user cancelled — do nothing
      // Fall through to desktop fallback if share failed for other reasons
    }
  }

  // ── DESKTOP / fallback ──
  // 1. Auto-download the PDF
  downloadBlob(pdfBlob, fileName)

  // 2. Open WhatsApp Web with the pre-filled message
  //    (user pastes/attaches PDF manually on WhatsApp Web)
  const waUrl = normalized
    ? `https://wa.me/${normalized}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`

  const waTab = window.open(waUrl, '_blank')
  if (!waTab) window.location.href = waUrl
}
