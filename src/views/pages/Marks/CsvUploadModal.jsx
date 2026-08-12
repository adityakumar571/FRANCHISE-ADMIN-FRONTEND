/* eslint-disable prettier/prettier */
import { Modal } from 'antd'
import { useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Upload, Download, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { putRequest, getRequest } from '../../../Helpers'
import { SessionContext } from '../../../Context/Seesion'
import * as XLSX from 'xlsx'

const CsvUploadModal = ({ open, onClose, setUpdateStatus, userRole = 'admin', teacherData = null }) => {
  const { currentSession } = useContext(SessionContext)
  const fileRef = useRef(null)

  const [classList, setClassList] = useState([])
  const [sectionList, setSectionList] = useState([])
  const [streamList, setStreamList] = useState([])
  const [examList, setExamList] = useState([])
  const [subjectList, setSubjectList] = useState([])
  const [studentList, setStudentList] = useState([])
  const [sel, setSel] = useState({ classId: '', sectionId: '', streamId: '', examListId: '' })

  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState([])
  const [parseErrors, setParseErrors] = useState([])
  const [expandedStudent, setExpandedStudent] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const selectedClassData = classList.find((c) => c._id === sel.classId)
  const isStreamRequired = !!selectedClassData?.isSenior
  const isTeacher = userRole === 'teacher'

  useEffect(() => {
    if (!currentSession?._id || !open) return
    getRequest(`classes?session=${currentSession._id}&isPagination=false`)
      .then((res) => setClassList(res?.data?.data?.classes || []))
      .catch(() => {})
  }, [currentSession?._id, open])

  useEffect(() => {
    if (!isTeacher || !teacherData || !open) return
    setSel({ classId: teacherData.classId || '', sectionId: teacherData.sectionId || '', streamId: teacherData.streamId || '', examListId: '' })
  }, [isTeacher, teacherData, open])

  useEffect(() => {
    if (!sel.classId) { setSectionList([]); setStreamList([]); setExamList([]); setSubjectList([]); setStudentList([]); return }
    getRequest(`sections?classId=${sel.classId}&isPagination=false`).then((res) => setSectionList(res?.data?.data?.sections || [])).catch(() => {})
    getRequest(`examsList?classId=${sel.classId}&isActive=true&isPagination=false`).then((res) => setExamList(res?.data?.data?.examLists || [])).catch(() => {})
    getRequest(`studentEnrollment?currentClass=${sel.classId}&isPagination=false`).then((res) => setStudentList(res?.data?.data?.students || [])).catch(() => {})
    if (isStreamRequired) {
      getRequest(`streams?classId=${sel.classId}&isPagination=false`).then((res) => setStreamList(res?.data?.data?.streams || [])).catch(() => {})
    } else { setStreamList([]) }
  }, [sel.classId, isStreamRequired])

  useEffect(() => {
    if (!sel.classId) { setSubjectList([]); return }
    if (isStreamRequired && !sel.streamId) { setSubjectList([]); return }
    const url = isStreamRequired && sel.streamId
      ? `subjects?classId=${sel.classId}&streamId=${sel.streamId}&isPagination=false`
      : `subjects?classId=${sel.classId}&isPagination=false`
    getRequest(url).then((res) => setSubjectList(res?.data?.data?.subjects || [])).catch(() => {})
  }, [sel.classId, sel.streamId, isStreamRequired])

  const handleSelChange = (e) => {
    const { name, value } = e.target
    setSel((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'classId') { next.sectionId = ''; next.streamId = ''; next.examListId = '' }
      if (name === 'streamId') next.examListId = ''
      return next
    })
    setPreview([]); setParseErrors([]); setFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const getStudentKey = (student, index) => String(student.rollNumber ?? '').trim() || `__idx_${index}`
  const getFilteredStudents = () => sel.sectionId ? studentList.filter((s) => s.currentSection?._id === sel.sectionId) : studentList

  const buildAndDownloadXLSX = (students, marksMapByStudent, filename, maxMarks = 100) => {
    const subjectNames = subjectList.map((s) => s.name)
    const examName = examList.find((e) => e._id === sel.examListId)?.examMaster?.examName || ''
    const className = classList.find((c) => c._id === sel.classId)?.name || ''
    const sectionName = sectionList.find((s) => s._id === sel.sectionId)?.name || 'All'
    const sessionName = currentSession?.sessionName || currentSession?.name || ''
    const wb = XLSX.utils.book_new()
    const ws = {}
    const totalCols = 4 + subjectNames.length
    const lastCol = XLSX.utils.encode_col(totalCols - 1)
    ws['!cols'] = [{ wch: 7 }, { wch: 10 }, { wch: 28 }, { wch: 12 }, ...subjectNames.map(() => ({ wch: 15 }))]
    const C = (r, c) => XLSX.utils.encode_cell({ r, c })
    const S = (addr, value, style = {}) => { ws[addr] = { v: value, t: typeof value === 'number' ? 'n' : 's', s: style } }
    const DARK = '1E3A5F'; const MED = '2E75B6'; const LIGHT = 'D6E4F0'; const ALT = 'EBF3FB'; const HINT = 'F5F5F5'
    const center = { horizontal: 'center', vertical: 'center' }; const left = { horizontal: 'left', vertical: 'center' }
    const bdr = { top: { style: 'thin', color: { rgb: 'CCCCCC' } }, bottom: { style: 'thin', color: { rgb: 'CCCCCC' } }, left: { style: 'thin', color: { rgb: 'CCCCCC' } }, right: { style: 'thin', color: { rgb: 'CCCCCC' } } }
    S(C(0,0), 'MARKS SHEET', { font: { bold: true, sz: 18, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: DARK } }, alignment: center })
    for (let c = 1; c < totalCols; c++) S(C(0,c), '', { fill: { fgColor: { rgb: DARK } } })
    const meta = [`Class: ${className}`, `Section: ${sectionName}`, `Exam: ${examName}`, `Session: ${sessionName}`, `Date: ${new Date().toLocaleDateString('en-IN')}`, `Students: ${students.length}`]
    for (let c = 0; c < totalCols; c++) { const txt = c % 2 === 0 && meta[c / 2] ? meta[c / 2] : ''; S(C(1,c), txt, { font: { bold: !!txt, sz: 10, color: { rgb: DARK } }, fill: { fgColor: { rgb: LIGHT } }, alignment: left }) }
    for (let c = 0; c < totalCols; c++) S(C(2,c), '', {})
    const hdrs = ['S.No.', 'Roll No.', 'Student Name', 'Section', ...subjectNames]
    hdrs.forEach((h, c) => S(C(3,c), h, { font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: c >= 4 ? MED : DARK } }, alignment: center, border: bdr }))
    const hint = ['', '', '↓ Do not edit', '', ...subjectNames.map(() => `Max: ${maxMarks}`)]
    hint.forEach((h, c) => S(C(4,c), h, { font: { italic: true, sz: 9, color: { rgb: '888888' } }, fill: { fgColor: { rgb: HINT } }, alignment: center }))
    students.forEach((student, idx) => {
      const r = 5 + idx; const bg = idx % 2 === 1 ? ALT : 'FFFFFF'
      const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')
      const secName = student.currentSection?.name || sectionName
      const marks = marksMapByStudent[student._id] || {}
      const subMarks = subjectNames.map((n) => { const v = marks[n.toLowerCase().trim()]; return v !== undefined ? v : '' })
      const row = [idx + 1, student.rollNumber || getStudentKey(student, idx), fullName, secName, ...subMarks]
      row.forEach((val, c) => { S(C(r,c), val === '' ? '' : val, { font: { sz: 10 }, fill: { fgColor: { rgb: bg } }, alignment: c === 2 ? left : center, border: bdr }) })
    })
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }]
    ws['!ref'] = `A1:${lastCol}${6 + students.length}`
    ws['!rows'] = [{ hpt: 38 }, { hpt: 20 }, { hpt: 5 }, { hpt: 24 }, { hpt: 16 }, ...students.map(() => ({ hpt: 20 }))]
    XLSX.utils.book_append_sheet(wb, ws, 'Marks Sheet'); XLSX.writeFile(wb, filename)
  }

  const downloadTemplate = async () => {
    if (!sel.classId) { toast.error('Select a class first'); return }
    if (!sel.examListId) { toast.error('Select an exam first'); return }
    if (!subjectList.length) { toast.error('No subjects found'); return }
    if (!studentList.length) { toast.error('No students found'); return }
    setDownloading(true)
    try {
      const students = getFilteredStudents()
      if (!students.length) { toast.error('No students found'); return }
      const marksMap = {}
      for (const student of students) {
        marksMap[student._id] = {}
        try {
          const mRes = await getRequest(`marks?studentId=${student._id}&examListId=${sel.examListId}&sessionId=${currentSession._id}&isPagination=false`)
          const ms = mRes?.data?.data?.marksheets?.[0]
          if (ms) ms.subjects.forEach((s) => { marksMap[student._id][s.subjectName?.toLowerCase().trim()] = s.marksObtained })
        } catch { /* no marks yet */ }
      }
      buildAndDownloadXLSX(students, marksMap, `marks_template_${Date.now()}.xlsx`)
      toast.success('Template downloaded. Fill subject columns then upload.')
    } catch (e) { console.error(e); toast.error('Failed to download') }
    finally { setDownloading(false) }
  }

  const parseXLSX = (rows) => {
    let headerRowIdx = -1
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].map((c) => String(c).toLowerCase().trim())
      if (r.includes('student name') || r.includes('roll no.')) { headerRowIdx = i; break }
    }
    if (headerRowIdx === -1) return { data: [], errors: ['Header row not found. Use the downloaded template.'] }
    const rawHeaders = rows[headerRowIdx].map((c) => String(c).trim())
    const headers = rawHeaders.map((h) => h.toLowerCase().trim())
    const rollIdx = headers.findIndex((h) => ['roll no.', 'roll no', 'rollno.'].includes(h))
    const nameIdx = headers.findIndex((h) => h === 'student name')
    const maxIdx  = headers.findIndex((h) => h.includes('max marks'))
    const skipIdxs = new Set([rollIdx, nameIdx, maxIdx, headers.findIndex((h) => h === 's.no.'), headers.findIndex((h) => h === 'section'), headers.findIndex((h) => h === 'total obtained'), headers.findIndex((h) => h === 'percentage'), headers.findIndex((h) => h === 'result')])
    const subjectCols = rawHeaders.map((h, i) => ({ name: h, i })).filter(({ i }) => i >= 0 && !skipIdxs.has(i) && rawHeaders[i] !== '')
    if (!subjectCols.length) return { data: [], errors: ['No subject columns found. Use the downloaded template.'] }
    const rollMap = {}
    studentList.forEach((s, idx) => { const roll = String(s.rollNumber ?? '').trim(); if (roll) rollMap[roll] = s; rollMap[`__idx_${idx}`] = s })
    const nameMap = {}
    studentList.forEach((s) => { const fn = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ').toLowerCase().trim(); if (fn) nameMap[fn] = s })
    const studentMap = {}; const errors = []
    const dataRows = rows.slice(headerRowIdx + 1).filter((r) => { const first = String(r[0] || '').trim(); return first !== '' && !first.includes('↓') })
    dataRows.forEach((row, i) => {
      const rowNum = headerRowIdx + i + 3
      const rollRaw = String(row[rollIdx] ?? '').trim(); const nameRaw = String(row[nameIdx] ?? '').trim()
      const maxMarks = maxIdx >= 0 ? Number(row[maxIdx]) || 100 : 100
      let matched = rollRaw ? rollMap[rollRaw] : null
      if (!matched && nameRaw) matched = nameMap[nameRaw.toLowerCase().trim()]
      if (!matched) { errors.push(`Row ${rowNum}: Student "${rollRaw || nameRaw || '?'}" not found`); return }
      const subjects = []
      subjectCols.forEach(({ name, i: colIdx }) => {
        const val = String(row[colIdx] ?? '').trim(); if (val === '') return
        if (isNaN(Number(val))) { errors.push(`Row ${rowNum} "${name}": "${val}" not a number`); return }
        if (Number(val) > maxMarks) { errors.push(`Row ${rowNum} "${name}": ${val} > max (${maxMarks})`); return }
        const matchedSub = subjectList.find((s) => s.name.toLowerCase().trim() === name.toLowerCase().trim())
        if (!matchedSub) return
        subjects.push({ subjectName: matchedSub.name, marksObtained: Number(val), maxMarks })
      })
      if (!subjects.length) return
      const key = String(matched._id)
      if (!studentMap[key]) { const fullName = [matched.firstName, matched.middleName, matched.lastName].filter(Boolean).join(' '); studentMap[key] = { studentId: matched._id, rollNumber: matched.rollNumber || rollRaw || '', studentName: fullName, subjects: [] } }
      studentMap[key].subjects.push(...subjects)
    })
    return { data: Object.values(studentMap), errors }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]; if (!file) return
    setFileName(file.name); setPreview([]); setParseErrors([]); setExpandedStudent(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        const { data, errors } = parseXLSX(raw)
        setPreview(data); setParseErrors(errors)
      } catch { setParseErrors(['Failed to read file. Use the downloaded template.']) }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleSubmit = async () => {
    if (!preview.length) { toast.error('No valid data to submit'); return }
    if (!sel.classId || !sel.examListId) { toast.error('Class and Exam are required'); return }
    setSubmitting(true)

    const requests = preview.map((student) => {
      const subjects = student.subjects
        .map((s) => {
          const found = subjectList.find((sub) => sub.name.toLowerCase().trim() === s.subjectName.toLowerCase().trim())
          return found ? { subjectId: found._id, marksObtained: s.marksObtained, maxMarks: s.maxMarks } : null
        })
        .filter(Boolean)
      if (!subjects.length) return Promise.reject(new Error(`No subjects for ${student.studentName}`))
      return putRequest({
        url: 'marks/update-student-marks',
        cred: {
          studentId: student.studentId,
          examListId: sel.examListId,
          sessionId: currentSession._id,
          classId: sel.classId,
          sectionId: sel.sectionId || undefined,
          streamId: sel.streamId || undefined,
          subjects,
        },
      })
    })

    const results = await Promise.allSettled(requests)
    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failCount = results.filter((r) => r.status === 'rejected').length

    setSubmitting(false)
    if (successCount > 0) {
      toast.success(`${successCount} student(s) saved${failCount ? `, ${failCount} failed` : ''}`)
      setUpdateStatus((p) => !p)
      handleClose()
    } else {
      toast.error('All submissions failed. Please try again.')
    }
  }

  const handleClose = () => {
    if (!isTeacher) setSel({ classId: '', sectionId: '', streamId: '', examListId: '' })
    else setSel((prev) => ({ ...prev, examListId: '' }))
    setPreview([]); setParseErrors([]); setFileName(''); setExpandedStudent(null)
    if (fileRef.current) fileRef.current.value = ''
    onClose()
  }

  const hasBlockingErrors = parseErrors.length > 0
  const canDownload = sel.classId && sel.examListId && subjectList.length > 0
  const canSubmit = preview.length > 0 && !submitting && !hasBlockingErrors

  return (
    <Modal
      title="Upload Marks via Excel"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={750}
    >
      {/* ── Step 1 ── */}
      <div className="mb-3">
        <p className="form-label fw-semibold mb-3">
          <span className="badge me-2" style={{ backgroundColor: '#0c3b73' }}>Step 1</span>
          Select Class &amp; Exam
        </p>
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <label className="form-label">Class <span className="text-danger">*</span></label>
            <select name="classId" value={sel.classId} onChange={handleSelChange}
              disabled={isTeacher} className="form-select form-select-sm">
              <option value="">Select Class</option>
              {classList.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">Section</label>
            <select name="sectionId" value={sel.sectionId} onChange={handleSelChange}
              disabled={!sectionList.length || isTeacher} className="form-select form-select-sm">
              <option value="">All Sections</option>
              {sectionList.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          {isStreamRequired && (
            <div className="col-6 col-md-3">
              <label className="form-label">Stream</label>
              <select name="streamId" value={sel.streamId} onChange={handleSelChange}
                disabled={!streamList.length || isTeacher} className="form-select form-select-sm">
                <option value="">Select Stream</option>
                {streamList.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div className="col-6 col-md-3">
            <label className="form-label">Exam <span className="text-danger">*</span></label>
            <select name="examListId" value={sel.examListId} onChange={handleSelChange}
              disabled={!examList.length} className="form-select form-select-sm">
              <option value="">{sel.classId ? 'Select Exam' : 'Select class first'}</option>
              {examList.map((e) => <option key={e._id} value={e._id}>{e.examMaster?.examName} ({e.examMaster?.category})</option>)}
            </select>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3">
          <small className="text-muted">
            {canDownload ? `${subjectList.length} subject(s) · ${studentList.length} student(s) found` : 'Select class and exam to continue'}
          </small>
          <div className="d-flex gap-2">
            <button onClick={downloadTemplate} disabled={!canDownload || downloading}
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{ backgroundColor: '#0c3b73', borderColor: '#0c3b73', color: '#fff' }}>
              <Download size={13} />
              {downloading ? 'Downloading...' : 'Download Template'}
            </button>
          </div>
        </div>
      </div>

      <hr />

      {/* ── Step 2 ── */}
      <div className="mb-3">
        <p className="form-label fw-semibold mb-3">
          <span className="badge me-2" style={{ backgroundColor: '#e24028' }}>Step 2</span>
          Upload Filled Sheet (.xlsx)
        </p>
        <label className="d-flex align-items-center gap-3 border rounded p-3"
          style={{ cursor: 'pointer', borderStyle: 'dashed', borderColor: '#ced4da' }}>
          <Upload size={20} className="text-secondary flex-shrink-0" />
          <div>
            <div className="fw-medium" style={{ fontSize: '13px' }}>{fileName || 'Click to select .xlsx file'}</div>
            <small className="text-muted">Only .xlsx files accepted</small>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx" className="d-none" onChange={handleFileChange} />
        </label>

        {parseErrors.length > 0 && (
          <div className="alert alert-danger py-2 mt-2 mb-0">
            <div className="d-flex align-items-center gap-2 mb-1">
              <AlertTriangle size={14} />
              <span className="fw-semibold" style={{ fontSize: '13px' }}>{parseErrors.length} error(s) — fix and re-upload</span>
            </div>
            <ul className="mb-0 ps-3" style={{ fontSize: '12px', maxHeight: '80px', overflowY: 'auto' }}>
              {parseErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* ── Preview ── */}
      {preview.length > 0 && (
        <>
          <hr />
          <div className="d-flex align-items-center gap-2 mb-2">
            <CheckCircle size={15} className="text-success" />
            <span className="fw-semibold text-success" style={{ fontSize: '13px' }}>{preview.length} student(s) ready to save</span>
          </div>
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            <table className="table table-sm table-bordered table-hover mb-0" style={{ fontSize: '12px' }}>
              <thead className="table-dark">
                <tr>
                  <th>Roll</th><th>Student</th>
                  <th className="text-center">Subjects</th>
                  <th className="text-center">Obtained / Max</th>
                  <th className="text-center">%</th>
                  <th className="text-center"></th>
                </tr>
              </thead>
              <tbody>
                {preview.map((s, i) => {
                  const totalObtained = s.subjects.reduce((a, b) => a + b.marksObtained, 0)
                  const totalMax = s.subjects.reduce((a, b) => a + b.maxMarks, 0)
                  const pct = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0.0'
                  const isExpanded = expandedStudent === i
                  return (
                    <>
                      <tr key={i}>
                        <td className="fw-semibold">{s.rollNumber || '-'}</td>
                        <td>{s.studentName}</td>
                        <td className="text-center">{s.subjects.length}</td>
                        <td className="text-center fw-semibold text-primary">{totalObtained} / {totalMax}</td>
                        <td className="text-center">
                          <span className={`fw-semibold ${Number(pct) >= 33 ? 'text-success' : 'text-danger'}`}>{pct}%</span>
                        </td>
                        <td className="text-center">
                          <button className="btn btn-sm p-0 border-0 bg-transparent" onClick={() => setExpandedStudent(isExpanded ? null : i)}>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${i}-exp`} className="table-light">
                          <td colSpan={6} className="p-2 ps-4">
                            <table className="table table-sm mb-0" style={{ fontSize: '11px' }}>
                              <thead><tr className="text-muted"><th>Subject</th><th className="text-center">Obtained</th><th className="text-center">Max</th><th className="text-center">Result</th></tr></thead>
                              <tbody>
                                {s.subjects.map((sub, j) => {
                                  const pass = sub.maxMarks > 0 && (sub.marksObtained / sub.maxMarks) * 100 >= 33
                                  return (
                                    <tr key={j}>
                                      <td>{sub.subjectName}</td>
                                      <td className="text-center">{sub.marksObtained}</td>
                                      <td className="text-center">{sub.maxMarks}</td>
                                      <td className="text-center"><span className={`badge ${pass ? 'bg-success' : 'bg-danger'}`}>{pass ? 'PASS' : 'FAIL'}</span></td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Footer ── */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button onClick={handleClose} className="btn btn-secondary">Cancel</button>
        <button onClick={handleSubmit} disabled={!canSubmit}
          className="btn d-flex align-items-center gap-1"
          style={{ backgroundColor: '#0c3b73', borderColor: '#0c3b73', color: '#fff' }}>
          {submitting ? 'Saving...' : `Save Marks (${preview.length})`}
        </button>
      </div>
    </Modal>
  )
}

export default CsvUploadModal
