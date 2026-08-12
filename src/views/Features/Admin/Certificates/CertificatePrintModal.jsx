import { useRef, useContext } from 'react'
import { Modal } from 'antd'
import { Printer } from 'lucide-react'
import { AppContext } from '../../../../Context/AppContext'

/* ─────────────────────────────────────
   DATE HELPERS
───────────────────────────────────── */
const fmtDate = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  } catch { return d }
}

const fmtDateLong = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    })
  } catch { return d }
}

/* ─────────────────────────────────────
   PRINT HANDLER
───────────────────────────────────── */
const handlePrint = (ref) => {
  const html = ref.current?.innerHTML
  if (!html) return
  const w = window.open('', '_blank', 'width=900,height=1000')
  w.document.open()
  w.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Transfer Certificate</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body {
      width: 210mm;
      background: #fff;
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
      font-size: 11pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      html, body { margin:0 !important; padding:0 !important; }
      @page { size: A4 portrait; margin: 3mm; }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      /* Prevent browser from darkening row divider lines */
      div[style*="border-bottom: 2px solid"] {
        border-bottom-color: #ccc !important;
        border-bottom-width: 2px !important;
      }
      /* Signature lines - light on print */
      div[style*="border-top"] {
        border-top-color: #707070ff !important;
        border-top-width: 2.8px !important;
      }
    }
  </style>
</head>
<body>${html}</body>
</html>`)
  w.document.close()
  w.focus()
  setTimeout(() => { w.print(); w.close() }, 600)
}

/* ─────────────────────────────────────
   DEFAULT LOGO
───────────────────────────────────── */
const DefaultLogo = () => (
  <div style={{
    width: 80, height: 80, border: '2px solid #aaa', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f4f4f4', flexShrink: 0,
  }}>
    <svg width="50" height="50" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="28" stroke="#666" strokeWidth="1.5" fill="#fff" />
      <path d="M30 8 L48 18 L48 36 C48 46 39.5 54 30 54 C20.5 54 12 46 12 36 L12 18 Z"
        fill="#eee" stroke="#666" strokeWidth="1.2" />
      <rect x="20" y="26" width="9" height="12" rx="1" fill="#777" />
      <rect x="31" y="26" width="9" height="12" rx="1" fill="#aaa" />
      <path d="M30 13 L31.5 17.5 L36 17.5 L32.5 20 L34 24.5 L30 22 L26 24.5 L27.5 20 L24 17.5 L28.5 17.5 Z"
        fill="#f5a623" />
    </svg>
  </div>
)

/* ═══════════════════════════════════════════════════════
   TRANSFER CERTIFICATE — exact match to target image
   Font   : Times New Roman, serif
   Label  : font-weight 600 (semi-bold), ~12px
   Value  : font-weight 700 (bold), ~12px
   Row    : borderBottom only, padding 6px 0
   Row2   : label 35% | value 15% | label 30% | value 20%
   Row1   : label 42% | value 58%
═══════════════════════════════════════════════════════ */
const TCTemplate = ({
  cert, logo, schoolName, schoolAddress, schoolContact, schoolSubtitle,
  affiliationNo, schoolCode,
}) => {

  const FONT = "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, serif"
  const FS   = 12.5   // base font-size px

  const rowBase = {
    display: 'flex',
    alignItems: 'flex-start',
    borderBottom: '2px solid #ccc',
    padding: '4.5px 0',
    fontSize: FS,
    fontFamily: FONT,
    lineHeight: 1.45,
    color: '#111',
  }

  /* Two-column pair row */
  const Row2 = ({ n1, l1, v1, n2, l2, v2 }) => (
    <div style={{ ...rowBase, borderBottom: 'none', padding: '0', alignItems: 'stretch' }}>
      {/* Col 1: Left label */}
      <div style={{ width: '26%', flexShrink: 0, fontWeight: 600, fontFamily: FONT, fontSize: FS,
        borderBottom: '2px solid #ccc', padding: '4.5px 4px 4.5px 0' }}>
        {n1}.&nbsp;{l1}:
      </div>
      {/* Col 2: Left value */}
      <div style={{ width: '24%', flexShrink: 0, fontWeight: 500, fontFamily: FONT, fontSize: FS,
        borderBottom: '2px solid #ccc', padding: '4.5px 8px 4.5px 0' }}>
        {v1 || '\u00A0'}
      </div>
      {/* Gap — no border */}
      <div style={{ width: 16, flexShrink: 0 }} />
      {/* Col 3: Right label */}
      <div style={{ width: '26%', flexShrink: 0, fontWeight: 600, fontFamily: FONT, fontSize: FS,
        borderBottom: '2px solid #ccc', padding: '4.5px 4px 4.5px 0' }}>
        {n2}.&nbsp;{l2}:
      </div>
      {/* Col 4: Right value */}
      <div style={{ flex: 1, fontWeight: 500, fontFamily: FONT, fontSize: FS,
        borderBottom: '2px solid #ccc', padding: '4.5px 0' }}>
        {v2 || '\u00A0'}
      </div>
    </div>
  )

  /* Full-width row */
  const Row1 = ({ num, label, value }) => (
    <div style={rowBase}>
      <div style={{ width: '42%', flexShrink: 0, fontWeight: 600, fontFamily: FONT, fontSize: FS }}>
        {num}.&nbsp;{label}:
      </div>
      <div style={{ flex: 1, fontWeight: 500, fontFamily: FONT, fontSize: FS }}>
        {value || ''}
      </div>
    </div>
  )

  return (
    <div style={{
      width: '210mm',
      height: '297mm',
      fontFamily: FONT,
      background: '#fff',
      color: '#111',
      padding: '4mm',
      boxSizing: 'border-box',
    }}>
    <div style={{
      width: '100%',
      height: '100%',
      border: '2px solid #333',
      padding: '4mm 6mm',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* TOP BAR */}
      {(affiliationNo || schoolCode || cert.affiliationNo || cert.schoolCode) && (
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 9.5, color: '#444', marginBottom: 5,
          fontFamily: FONT,
        }}>
          <span>Affiliation No.: <strong>{affiliationNo || cert.affiliationNo || '—'}</strong></span>
          <span>School Code: <strong>{schoolCode || cert.schoolCode || '—'}</strong></span>
        </div>
      )}

      {/* HEADER */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingBottom: 6, marginBottom: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        {logo
          ? <img src={logo} alt="logo" style={{ width: 90, height: 90, objectFit: 'contain', flexShrink: 0, borderRadius: '50%', border: '2px solid #ccc' }} />
          : <DefaultLogo />
        }
        <div style={{ textAlign: 'left' }}>
          <div style={{
            fontSize: 17, fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontFamily: FONT,
            marginBottom: 3,
            color: '#111',
          }}>
            {schoolName || 'YOUR SCHOOL NAME'}
          </div>
          {schoolAddress && (
            <div style={{ fontSize: 11.5, color: '#333', fontFamily: FONT, marginBottom: 2 }}>
              {schoolAddress}
            </div>
          )}
          {schoolContact && (
            <div style={{ fontSize: 11.5, color: '#333', fontFamily: FONT, marginBottom: 2 }}>
              PHONE: {schoolContact}{cert.email ? ` | EMAIL: ${cert.email}` : ''}
            </div>
          )}
          {schoolSubtitle && (
            <div style={{ fontSize: 11, color: '#444', fontFamily: FONT, fontStyle: 'italic' }}>
              ({schoolSubtitle})
            </div>
          )}
        </div>
        </div>
      </div>

      {/* TITLE */}
      <div style={{ textAlign: 'center', margin: '6px 0 8px' }}>
        <span style={{
          fontSize: 25,
          fontWeight: 900,
          textDecoration: 'underline',
          textDecorationThickness: '2px',
          textUnderlineOffset: '3px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontFamily: FONT,
          color: '#111',
        }}>
          Transfer Certificate (TC)
        </span>
      </div>

      {/* ── ROWS ── */}
      <div style={{ flex: 1 }}>
        <Row2 n1="1"  l1="Certificate No."                  v1={cert.certificateNo}
              n2="2"  l2="Admission No."                    v2={cert.admissionNo} />
        <Row2 n1="3"  l1="PEN No."                          v1={cert.penNo}
              n2="4"  l2="APAAR No."                        v2={cert.apaarNo} />
        <Row2 n1="5"  l1="Student's Name"                   v1={cert.studentName}
              n2="6"  l2="Father's Name"                    v2={cert.fatherName} />
        <Row2 n1="7"  l1="Mother's Name"                    v1={cert.motherName}
              n2="8"  l2="Guardian's Name (if applicable)"  v2={cert.guardianName || 'Not Applicable'} />
        <Row2 n1="9"  l1="Nationality"                      v1={cert.nationality || 'Indian'}
              n2="10" l2="Religion"                         v2={cert.religion} />
        <Row2 n1="11" l1="Caste & Category (Gen/OBC/SC/ST)" v1={cert.category || cert.scheduleCasteTribe}
              n2="12" l2="Date of Birth"                    v2={fmtDate(cert.dateOfBirth)} />
        <Row2 n1="13" l1="Place of Birth"                   v1={cert.placeOfBirth}
              n2="14" l2="Date of Admission"                v2={fmtDate(cert.dateOfAdmission)} />

        <Row1 num="15" label="Class in Which Admitted"
          value={cert.admittedClass || cert.className} />
        <Row1 num="16" label="Class Last Attended"
          value={[
            cert.className || '',
            cert.section ? `– ${cert.section}` : '',
            cert.rollNo   ? `| Roll No.: ${cert.rollNo}` : '',
          ].filter(Boolean).join(' ')} />
        <Row1 num="17" label="Subjects Studied"                              value={cert.subjectStudied} />
        <Row1 num="18" label="Date of Leaving the School"                    value={fmtDateLong(cert.dateOfLeaving)} />
        <Row1 num="19" label="Whether Failed in Any Class"                   value={cert.failedTimes || 'No'} />
        <Row1 num="20" label="Reason for Leaving the School"                 value={cert.reasonOfLeaving} />
        <Row1 num="21" label="Whether Qualified for Promotion to Higher Class"
          value={cert.promotedClass ? `Yes — Promoted to Class ${cert.promotedClass}` : 'Yes'} />
        <Row1 num="22" label="Attendance Record"
          value={`Total Working Days: ${cert.totalWorkingDays || '—'} | Days Attended: ${cert.totalPresent || '—'}`} />
        <Row1 num="23" label="Board Exam Details"                            value={cert.boardExamResult || cert.lastExamResult} />
        <Row1 num="24" label="Conduct & Behavior"                            value={cert.conduct || 'Good'} />
        <Row1 num="25" label="Fee Dues Status"                               value={cert.feesStatus || 'Cleared'} />
        <Row1 num="26" label="Any Outstanding Fees/Dues"                     value={cert.anyDues || 'None'} />
        <Row1 num="27" label="Disciplinary Actions Taken (if any)"           value="None" />
        <Row1 num="28" label="Participation in Co-Curricular Activities"     value={cert.extraCurricular || '—'} />
        <Row1 num="29" label="Games & Sports Participation"                  value={cert.nccScoutGuide || '—'} />
        <Row1 num="30" label="Medium of Instruction"                         value={cert.medium || 'English'} />
        <Row1 num="31" label="Migration Certificate Issued"                  value={cert.migrationCertIssued || '—'} />
        <Row1 num="32" label="Character Certificate Issued"                  value={cert.characterCertIssued || '—'} />
        {cert.remarks && (
          <Row1 num="33" label="Additional Remarks"                          value={cert.remarks} />
        )}
      </div>

      {/* SIGNATURES — normal flow, always at bottom after content */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: FONT,
        fontSize: 12,
        color: '#111',
        marginTop: 20,
        paddingTop: 10,
      }}>
        {['Signature of Class Teacher:', 'Signature of Principal with Seal:', 'Date of Issue:'].map((lbl, i) => (
          <div key={i} style={{ textAlign: 'center', width: '30%' }}>
            <div style={{ borderTop: '2.5px solid #747474ff', paddingTop: 5 }}>{lbl}</div>
          </div>
        ))}
      </div>

    </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   CHARACTER CERTIFICATE
═══════════════════════════════════════════════════════ */
const CCTemplate = ({ cert, logo, schoolName, schoolAddress, schoolContact, schoolSubtitle }) => {
  const FONT = "'Times New Roman', Times, serif"
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div style={{
      width: '210mm',
      minHeight: '297mm',
      fontFamily: FONT,
      background: '#fff',
      color: '#111',
      padding: '10mm 14mm 10mm',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── HEADER: logo left, school info center ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 6 }}>
        {logo
          ? <img src={logo} alt="logo" style={{ width: 90, height: 90, objectFit: 'contain', flexShrink: 0 }} />
          : <DefaultLogo />
        }
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: FONT, color: '#111' }}>
            {schoolName || 'YOUR SCHOOL NAME'}
          </div>
          {schoolSubtitle && (
            <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 2, fontFamily: FONT }}>
              {schoolSubtitle}
            </div>
          )}
          {(cert.affiliationNo || cert.schoolCode) && (
            <div style={{ fontSize: 11, marginTop: 2, fontFamily: FONT }}>
              Affiliation No.: {cert.affiliationNo || '—'}
              {cert.schoolCode ? `  |  School Code: ${cert.schoolCode}` : ''}
            </div>
          )}
          {schoolAddress && (
            <div style={{ fontSize: 11.5, marginTop: 2, fontFamily: FONT, fontWeight: 600 }}>
              {schoolAddress}
            </div>
          )}
          {schoolContact && (
            <div style={{ fontSize: 11, marginTop: 2, fontFamily: FONT }}>
              Tel.: {schoolContact}
              {cert.email ? `  |  E-mail: ${cert.email}` : ''}
            </div>
          )}
          {cert.website && (
            <div style={{ fontSize: 11, marginTop: 1, fontFamily: FONT }}>
              Web: {cert.website}
            </div>
          )}
        </div>
      </div>

      {/* ── REF NO + DATE row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18, marginTop: 4 }}>
        <div style={{ fontSize: 12, fontFamily: FONT }}>
          Ref. No. <span style={{ display: 'inline-block', borderBottom: '1px solid #555', minWidth: 140 }}>&nbsp;</span>
        </div>
        <div style={{ fontSize: 13, fontFamily: FONT, textAlign: 'right' }}>
          <span style={{ fontWeight: 700 }}>{today}</span>
          <br />
          <span style={{ fontSize: 10, borderTop: '1px solid #555', display: 'inline-block', paddingTop: 1 }}>Date</span>
        </div>
      </div>

      {/* ── TITLE ── */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <span style={{
          fontSize: 20,
          fontWeight: 900,
          textDecoration: 'underline',
          textDecorationThickness: '2px',
          textUnderlineOffset: '4px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontFamily: FONT,
          color: '#111',
        }}>
          Character Certificate
        </span>
      </div>

      {/* ── BODY PARAGRAPH ── */}
      <div style={{ fontSize: 17, lineHeight: 2.2, fontFamily: FONT, textAlign: 'justify', flex: 1 }}>

        <p style={{ marginBottom: 16 }}>
          {'This is to certify that '}
          <strong>{cert.studentName || '______________________________'}</strong>
          {cert.fatherName ? (
            <>{' '}{cert.gender === 'Female' ? 'D/O' : 'S/O'}{' MR. '}
              <strong>{cert.fatherName.toUpperCase()}</strong>
            </>
          ) : null}
          {cert.motherName ? (
            <>{' and MRS. '}<strong>{cert.motherName.toUpperCase()}</strong></>
          ) : null}
          {' was a bonafide student of this school'}
          {cert.affiliationNo ? ` affiliated to CBSE (${cert.affiliationNo})` : ''}
          {cert.session ? ` from ${cert.session}` : ''}
          {cert.className ? ` and passed class ${cert.className}${cert.section ? ' – ' + cert.section : ''}` : ''}
          {cert.lastExamAppeared ? ` in the year ${cert.lastExamAppeared}` : ''}
          {'.'}
        </p>

        <p style={{ marginBottom: 16 }}>
          {'Her/His date of birth as per the Admission Register is '}
          <strong>{cert.dateOfBirth ? fmtDate(cert.dateOfBirth) : '______________'}</strong>
          {'.'}
          {cert.admissionNo
            ? <>{' Her/His Admission No. is '}<strong>{cert.admissionNo}</strong>{'.'}</>
            : null}
        </p>

        <p style={{ marginBottom: 16 }}>
          {'During her/his stay in this school, she/he was found to be sincere, hardworking and a student of good conduct. '
          + 'She/He has always shown a positive attitude towards studies and co-curricular activities. '}
          {cert.extraCurricular
            ? <>{'She/He actively participated in '}<strong>{cert.extraCurricular}</strong>{'. '}</>
            : null}
          {cert.conduct
            ? <>{'Her/His overall conduct and behavior has been '}<strong>{cert.conduct}</strong>{'.'}</>
            : 'Her/His overall conduct and behavior has been Good.'}
        </p>

        <p style={{ marginBottom: 16 }}>
          {'She/He bears a good moral character and is well-disciplined. '
          + 'We wish her/him all the very best for her/his future endeavors.'}
        </p>

        {cert.remarks && (
          <p style={{ marginBottom: 0 }}>
            <strong>Remarks:</strong> {cert.remarks}
          </p>
        )}
      </div>

      {/* ── SIGNATURE ── */}
      <div style={{ marginTop: 48, fontFamily: FONT }}>
        <div style={{ fontSize: 13, fontStyle: 'italic', marginBottom: 4 }}>
          &nbsp;
        </div>
        <div style={{ display: 'inline-block' }}>
          <div style={{ borderTop: '1.5px solid #333', paddingTop: 4, minWidth: 180, fontSize: 16, fontFamily: FONT }}>
            Principal (with Seal)
          </div>
        </div>
      </div>

    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN MODAL
═══════════════════════════════════════════════════════ */
const CertificatePrintModal = ({ open, certificate, onClose }) => {
  const printRef = useRef(null)
  const { user, tenantDetails } = useContext(AppContext)

  const schoolName     = tenantDetails?.schoolName    || tenantDetails?.name        || user?.schoolName  || ''
  const schoolAddress  = tenantDetails?.schoolAddress || (typeof tenantDetails?.address === 'string' ? tenantDetails.address : '') || ''
  const schoolContact  = tenantDetails?.schoolContact || tenantDetails?.phone       || tenantDetails?.contact || ''
  const schoolSubtitle = tenantDetails?.schoolSubtitle|| tenantDetails?.description || ''
  const schoolLogo     = tenantDetails?.logo          || user?.tenantId?.logo       || user?.logo        || ''

  const isTC = certificate?.type === 'transfer'

  const sharedProps = {
    cert:          certificate || {},
    logo:          schoolLogo,
    schoolName, schoolAddress, schoolContact, schoolSubtitle,
    affiliationNo: certificate?.affiliationNo || '',
    schoolCode:    certificate?.schoolCode    || '',
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={940}
      destroyOnHidden
      styles={{ body: { padding: 0 } }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1f2937', margin: 0 }}>
              {isTC ? 'Transfer Certificate (TC)' : 'Character Certificate'} — Preview
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
              Review carefully before printing
            </p>
          </div>
          <button
            onClick={() => handlePrint(printRef)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#0c3b73', color: '#fff',
              border: 'none', borderRadius: 8,
              padding: '7px 16px', fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>
      }
    >
      {/* Preview area */}
      <div style={{ overflowY: 'auto', maxHeight: '78vh', background: '#e5e7eb', padding: 16 }}>
        <div ref={printRef} style={{ display: 'flex', justifyContent: 'center', width: '100%', minWidth: '210mm' }}>
          {isTC ? <TCTemplate {...sharedProps} /> : <CCTemplate {...sharedProps} />}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 10,
        padding: '10px 20px', borderTop: '1px solid #f0f0f0',
      }}>
        <button onClick={onClose} style={{
          padding: '7px 20px', fontSize: 13, borderRadius: 6,
          border: '1px solid #d1d5db', background: '#fff',
          color: '#374151', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Close
        </button>
        <button onClick={() => handlePrint(printRef)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 20px', fontSize: 13, borderRadius: 6,
          background: '#0c3b73', color: '#fff',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <Printer size={14} /> Print / Save as PDF
        </button>
      </div>
    </Modal>
  )
}

export default CertificatePrintModal
