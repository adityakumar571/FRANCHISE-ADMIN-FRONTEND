/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../../../Context/AppContext'

const Marksheet = ({ data, currentSession }) => {
  const { tenantDetails } = useContext(AppContext)
  const [tileBg, setTileBg] = useState('')
  const [tileSize, setTileSize] = useState({ w: 220, h: 60 })

  // Generate tiled background using canvas whenever school name changes
  useEffect(() => {
    const name = tenantDetails?.schoolName
    if (!name) return

    const fontSize = 11
    const lineHeight = 18
    const cols = 4          // how many times name repeats per row
    const rows = 4          // rows per tile
    const gap = 10          // horizontal gap between names

    // Measure text width
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.font = `600 ${fontSize}px Arial, sans-serif`
    const nameWidth = tempCtx.measureText(name).width

    const tileW = Math.ceil((nameWidth + gap) * cols)
    const tileH = lineHeight * rows

    const canvas = document.createElement('canvas')
    canvas.width = tileW
    canvas.height = tileH
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, tileW, tileH)
    ctx.font = `600 ${fontSize}px Arial, sans-serif`
    ctx.fillStyle = 'rgba(24, 95, 165, 0.16)'
    ctx.textBaseline = 'top'

    // Fill rows and cols — offset every other row for stagger effect
    for (let r = 0; r < rows; r++) {
      const offsetX = r % 2 === 0 ? 0 : (nameWidth + gap) / 2
      for (let c = 0; c < cols + 1; c++) {
        const x = offsetX + c * (nameWidth + gap)
        const y = r * lineHeight
        ctx.fillText(name, x, y)
      }
    }

    setTileBg(canvas.toDataURL())
    setTileSize({ w: tileW, h: tileH })
  }, [tenantDetails?.schoolName])

  const { studentDetails, subjects, exams, overallSummary } = data

  const getMarks = (exam, subjectId) => {
    return exam.subjects.find((s) => s.subjectId === subjectId)
  }

  const sessionLabel =
    currentSession?.sessionName ||
    (currentSession?.fromYear && currentSession?.toYear
      ? `${currentSession.fromYear}-${currentSession.toYear}`
      : '')

  return (
    <div className="bg-gray-100 p-2 md:p-6 print:p-0 print:bg-white">
      <div
        className="bg-white border-2 border-black p-2 md:p-4 overflow-x-auto print:overflow-visible relative"
        style={
          tileBg
            ? {
                backgroundImage: `url(${tileBg})`,
                backgroundRepeat: 'repeat',
                backgroundSize: `${tileSize.w}px ${tileSize.h}px`,
              }
            : {}
        }
      >
        {/* ===== WATERMARK: Logo (center) — sits above tile text ===== */}
        {tenantDetails?.logo && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.15,
              pointerEvents: 'none',
              zIndex: 2,
              width: '55%',
              maxWidth: '380px',
            }}
          >
            <img
              src={tenantDetails.logo}
              alt="watermark"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        )}

        {/* ===== All content above watermarks ===== */}
        <div style={{ position: 'relative', zIndex: 3 }}>

          {/* ===== SCHOOL HEADER ===== */}
          <div className="w-full text-center px-3 py-2 md:px-6 md:py-3 print:px-3 print:py-1.5">
            {/* Logo + Affiliation + School Name + Medium */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {/* Logo */}
              <div
                className="flex-shrink-0 rounded-full border-2 border-[#0c3b73] overflow-hidden bg-white"
                style={{ width: 'clamp(50px, 8vw, 72px)', height: 'clamp(50px, 8vw, 72px)' }}
              >
                {tenantDetails?.logo ? (
                  <img
                    src={tenantDetails.logo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[9px] text-[#0c3b73]">Logo</span>
                )}
              </div>

              {/* Affiliation + Name + Medium */}
              <div className="text-left">
                {tenantDetails?.affiliationLine && (
                  <p
                    className="font-semibold text-[#0c3b73] leading-tight m-0"
                    style={{ fontSize: 'clamp(7px, 1.3vw, 9.5px)', letterSpacing: '0.03em' }}
                  >
                    {tenantDetails.affiliationLine}
                  </p>
                )}
                <h1
                  className="font-black uppercase text-[#0c3b73] leading-none m-0"
                  style={{ fontSize: 'clamp(15px, 3.8vw, 28px)', letterSpacing: '0.04em' }}
                >
                  {tenantDetails?.schoolName || ''}
                </h1>
                {tenantDetails?.schoolMedium && (
                  <p className="text-gray-500 m-0 p-0" style={{ fontSize: 'clamp(8px, 1.5vw, 11px)' }}>
                    {tenantDetails.schoolMedium}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            {tenantDetails?.schoolAddress && (
              <p className="text-[11px] text-gray-800 leading-snug text-center mt-1 mb-1">
                <span className="font-semibold text-[#0c3b73]">Address:</span>{' '}
                {tenantDetails.schoolAddress}
              </p>
            )}

            {/* Managed By */}
            {tenantDetails?.managedBy && (
              <p className="text-[10px] text-gray-600 text-center mt-0 mb-1 italic">
                {tenantDetails.managedBy}
              </p>
            )}

            {/* Registration Info */}
            {[tenantDetails?.msmeRegNo, tenantDetails?.isoRegNo, tenantDetails?.nitiAayog, tenantDetails?.regInfo]
              .filter(Boolean).length > 0 && (
              <p className="text-[9px] text-gray-500 text-center mt-0 mb-1 leading-tight tracking-wide">
                {[tenantDetails?.msmeRegNo, tenantDetails?.isoRegNo, tenantDetails?.nitiAayog, tenantDetails?.regInfo]
                  .filter(Boolean)
                  .join('  |  ')}
              </p>
            )}

            {/* Contact */}
            {(tenantDetails?.schoolContact || tenantDetails?.schoolContactAlt) && (
              <div className="flex flex-wrap justify-center items-center gap-2 text-[10px] text-gray-700 mt-0">
                <span className="text-gray-800 leading-snug">
                  <span className="font-semibold text-[#0c3b73]">Contact No.:</span>{' '}
                  {[...new Set([tenantDetails?.schoolContact, tenantDetails?.schoolContactAlt].filter(Boolean))].join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-black mt-2"></div>

          <div className="text-center font-bold border-b border-black py-1 text-sm md:text-base print:text-base">
            PROGRESS REPORT : {sessionLabel}
          </div>

          {/* ===== BASIC INFO ===== */}
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 border-b border-black text-xs md:text-sm print:text-sm">
            <span className="mb-0 pb-0 text-center border-r">
              <b>Admission No:</b> {studentDetails.admissionNo || '—'}
            </span>
            <span className="mb-0 pb-0 text-center border-r">
              <b>Class:</b> {studentDetails.class} ({studentDetails.section}) {studentDetails.stream}
            </span>
            <span className="mb-0 pb-0 text-center">
              <b>Roll No:</b> {studentDetails.rollNumber}
            </span>
          </div>

          {/* ===== STUDENT DETAILS ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-2 p-2 text-xs md:text-sm print:text-sm">
            <p><b>Student Name:</b> {studentDetails.name}</p>
            <p><b>Father Name:</b> {studentDetails.fatherName}</p>
            <p><b>Mother Name:</b> {studentDetails.motherName}</p>
            <p>
              <b>Date of Birth:</b>{' '}
              {new Date(studentDetails.dob).toLocaleDateString('en-GB')}
            </p>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full table-fixed border-collapse border-2 border-black text-[10px] md:text-sm print:text-xs">
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    className="border-2 border-black px-2 py-2 bg-gray-100 text-left"
                    style={{ width: '25%' }}
                  >
                    Subject
                  </th>
                  {exams.map((exam) => (
                    <th
                      key={exam.examId}
                      colSpan={2}
                      className="border-2 border-black text-center font-bold py-1"
                    >
                      {exam.examName}
                    </th>
                  ))}
                </tr>
                <tr>
                  {exams.map((exam) => (
                    <React.Fragment key={exam.examId + '-headers'}>
                      <th className="border border-black text-center py-1">Max</th>
                      <th className="border border-black text-center py-1">Obt.</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.subjectId}>
                    <td className="border border-black px-2 py-2 font-medium text-left">
                      {subject.name}
                    </td>
                    {exams.map((exam) => {
                      const marks = getMarks(exam, subject.subjectId)
                      return (
                        <React.Fragment key={exam.examId + '-' + subject.subjectId}>
                          <td className="border border-black text-center">
                            {marks?.maxMarks ?? '-'}
                          </td>
                          <td
                            className={`border border-black text-center ${
                              marks && marks.marksObtained < (marks.maxMarks * 33) / 100
                                ? 'text-red-600 font-bold'
                                : ''
                            }`}
                          >
                            {marks?.marksObtained ?? '-'}
                          </td>
                        </React.Fragment>
                      )
                    })}
                  </tr>
                ))}

                {/* ===== TOTAL ROW ===== */}
                <tr className="font-bold bg-gray-100">
                  <td className="border-2 border-black text-center py-2">Total</td>
                  {exams.map((exam) => (
                    <React.Fragment key={exam.examId + '-total'}>
                      <td className="border-2 border-black text-center">{exam.totalMarks}</td>
                      <td className="border-2 border-black text-center">{exam.totalObtained}</td>
                    </React.Fragment>
                  ))}
                </tr>

                {/* ===== RESULT ROW ===== */}
                <tr>
                  <td className="border-2 border-black text-center font-bold py-2">Result</td>
                  {exams.map((exam) => (
                    <td
                      key={exam.examId + '-result'}
                      colSpan={2}
                      className={`border-2 border-black text-center font-bold ${
                        exam.result === 'FAIL' ? 'text-red-600' : 'text-green-700'
                      }`}
                    >
                      {exam.result} ({exam.percentage?.toFixed(2)}%)
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto mt-4 print:overflow-visible">
            <table className="w-full border-collapse border-2 border-black text-xs md:text-sm print:text-sm">
              <tbody>
                <tr className="font-bold bg-gray-100">
                  <td className="border-2 border-black px-3 py-2 text-center">Overall Marks</td>
                  <td className="border-2 border-black px-3 py-2 text-center">Overall Percentage</td>
                  <td className="border-2 border-black px-3 py-2 text-center">Overall Result</td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-3 py-2 text-center">
                    {overallSummary.overallTotalObtained} / {overallSummary.overallTotalMarks}
                  </td>
                  <td className="border-2 border-black px-3 py-2 text-center">
                    {overallSummary.overallPercentage}%
                  </td>
                  <td
                    className={`border-2 border-black px-3 py-2 text-center font-bold ${
                      overallSummary.overallResult === 'FAIL' ? 'text-red-600' : 'text-green-700'
                    }`}
                  >
                    {overallSummary.overallResult}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===== SIGNATURES ===== */}
          <div className="grid grid-cols-3 mt-10 text-center text-xs md:text-sm print:text-sm">
            <p>Parents / Guardian Sign</p>
            <p>Class Teacher Sign</p>
            <p>Principal Sign & Stamp</p>
          </div>

        </div>{/* end zIndex:3 wrapper */}
      </div>
    </div>
  )
}

export default Marksheet
