/* eslint-disable prettier/prettier */
/**
 * Tab 3 — Upload Marks via Excel/CSV
 * After saving marks, shows a Cross List verification table inline.
 */
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Upload, Download, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, RefreshCw, TableProperties, Filter } from 'lucide-react'
import { putRequest, getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { Select } from 'antd'

const { Option } = Select

const UploadMarksTab = () => {
  const { currentSession } = useContext(SessionContext)

  const [classList, setClassList] = useState([])
  const [sectionList, setSectionList] = useState([])
  const [streamList, setStreamList] = useState([])
  const [examList, setExamList] = useState([])
  const [subjectList, setSubjectList] = useState([])
  const [studentList, setStudentList] = useState([])
  const [sel, setSel] = useState({ classId: '', sectionId: '', streamId: '', examListId: '' })

  const [selectedFile, setSelectedFile] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState([])
  const [parseErrors, setParseErrors] = useState([])
  const [expandedStudent, setExpandedStudent] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // ── Cross List Verification ──
  const [crossData, setCrossData] = useState([])         // fetched from API after save
  const [crossLoading, setCrossLoading] = useState(false)
  const [crossSavedSel, setCrossSavedSel] = useState(null) // snapshot of sel used for cross list
  const crossRef = useRef(null)

  const selectedClassData = classList.find((c) => c._id === sel.classId)
  const isStreamRequired = !!selectedClassData?.isSenior

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?session=${currentSession._id}&isPagination=false`)
      .then((res) => setClassList(res?.data?.data?.classes || []))
      .catch(() => {})
  }, [currentSession?._id])

  useEffect(() => {
    if (!sel.classId) { setSectionList([]); setStreamList([]); setExamList([]); setSubjectList([]); setStudentList([]); return }
    getRequest(`sections?classId=${sel.classId}&isPagination=false`).then((r) => setSectionList(r?.data?.data?.sections || [])).catch(() => {})
    getRequest(`examsList?classId=${sel.classId}&sessionId=${currentSession?._id}&isActive=true&isPagination=false`).then((r) => setExamList(r?.data?.data?.examLists || [])).catch(() => {})
    getRequest(`studentEnrollment?currentClass=${sel.classId}&session=${currentSession?._id}&isPagination=false`).then((r) => setStudentList(r?.data?.data?.students || [])).catch(() => {})
    if (isStreamRequired) {
      getRequest(`streams?classId=${sel.classId}&isPagination=false`).then((r) => setStreamList(r?.data?.data?.streams || [])).catch(() => {})
    } else { setStreamList([]) }
  }, [sel.classId, isStreamRequired, currentSession?._id])

  useEffect(() => {
    if (!sel.classId) { setSubjectList([]); return }
    if (isStreamRequired && !sel.streamId) { setSubjectList([]); return }
    const url = isStreamRequired && sel.streamId
      ? `subjects?classId=${sel.classId}&streamId=${sel.streamId}&isPagination=false`
      : `subjects?classId=${sel.classId}&isPagination=false`
    getRequest(url).then((r) => setSubjectList(r?.data?.data?.subjects || [])).catch(() => {})
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
    // clear cross list when selection changes
    setCrossData([]); setCrossSavedSel(null)
  }

  const handleAntSelChange = (name, value) => {
    setSel((prev) => {
      const next = { ...prev, [name]: value || '' }
      if (name === 'classId') { next.sectionId = ''; next.streamId = ''; next.examListId = '' }
      if (name === 'streamId') next.examListId = ''
      return next
    })
    setPreview([]); setParseErrors([]); setFileName('')
    setCrossData([]); setCrossSavedSel(null)
  }

  const getFilteredStudents = () => sel.sectionId
    ? studentList.filter((s) => s.currentSection?._id === sel.sectionId)
    : studentList

  /* ── Fetch Cross List from API ── */
  const fetchCrossData = async (snapshot) => {
    if (!snapshot?.classId || !snapshot?.examListId) return
    setCrossLoading(true)
    try {
      const q = new URLSearchParams({
        classId: snapshot.classId,
        sessionId: currentSession._id,
        ...(snapshot.sectionId && { sectionId: snapshot.sectionId }),
        ...(snapshot.streamId && { streamId: snapshot.streamId }),
        ...(snapshot.examListId && { examListId: snapshot.examListId }),
        isPagination: 'false',
      }).toString()
      const r = await getRequest(`marks/getClassWiseMarksSummary?${q}`)
      setCrossData(r?.data?.data?.students || [])
    } catch {
      setCrossData([])
      toast.error('Could not fetch cross list')
    } finally {
      setCrossLoading(false)
    }
  }

  /* ── Download Template ── */
  const downloadTemplate = async () => {
    if (!sel.classId || !sel.examListId || !subjectList.length) {
      toast.error('Select class and exam first'); return
    }
    setDownloading(true)
    try {
      const students = getFilteredStudents()
      if (!students.length) { toast.error('No students found'); return }

      const marksMap = {}
      const subjectMaxMap = {}
      subjectList.forEach((s) => { subjectMaxMap[s.name.toLowerCase().trim()] = 100 })

      for (const s of students) {
        marksMap[s._id] = {}
        try {
          const r = await getRequest(`marks?studentId=${s._id}&examListId=${sel.examListId}&sessionId=${currentSession._id}&isPagination=false`)
          const ms = r?.data?.data?.marksheets?.[0]
          if (ms) {
            ms.subjects.forEach((sub) => {
              marksMap[s._id][sub.subjectName?.toLowerCase().trim()] = sub.marksObtained
              if (sub.maxMarks) subjectMaxMap[sub.subjectName?.toLowerCase().trim()] = sub.maxMarks
            })
          }
        } catch { /* no marks */ }
      }

      const subjectNames = subjectList.map((s) => s.name)
      const wb = XLSX.utils.book_new()
      const wsData = [
        ['S.No.', 'Roll No.', 'Student Name', 'Section', ...subjectNames],
        ['', '', '↓ Do not edit', '', ...subjectNames.map((n) => `Max: ${subjectMaxMap[n.toLowerCase().trim()] || 100}`)],
        ...students.map((s, i) => {
          const full = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')
          const sec = s.currentSection?.name || ''
          const marks = marksMap[s._id] || {}
          return [i + 1, s.rollNumber || '', full, sec, ...subjectNames.map((n) => marks[n.toLowerCase().trim()] ?? '')]
        }),
      ]
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      ws['!cols'] = [{ wch: 6 }, { wch: 10 }, { wch: 28 }, { wch: 12 }, ...subjectNames.map(() => ({ wch: 15 }))]
      XLSX.utils.book_append_sheet(wb, ws, 'Marks Sheet')

      const className = selectedClassData?.name || sel.classId
      const selectedSection = sectionList.find((s) => s._id === sel.sectionId)
      const sectionName = selectedSection ? selectedSection.name : 'AllSections'
      const selectedExam = examList.find((e) => e._id === sel.examListId)
      const examName = selectedExam ? `${selectedExam.examMaster?.examName}_${selectedExam.examMaster?.category}` : sel.examListId
      const safeFileName = `${className}_${sectionName}_${examName}`.replace(/[^a-zA-Z0-9_\-]/g, '_')
      XLSX.writeFile(wb, `${safeFileName}.xlsx`)
      toast.success('Template downloaded. Fill marks and upload back.')
    } catch { toast.error('Failed to download') }
    finally { setDownloading(false) }
  }

  /* ── Parse XLSX ── */
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
    const skipIdxs = new Set([rollIdx, nameIdx, headers.findIndex((h) => h === 's.no.'), headers.findIndex((h) => h === 'section')])
    const subjectCols = rawHeaders.map((h, i) => ({ name: h, i })).filter(({ i }) => !skipIdxs.has(i) && rawHeaders[i] !== '')

    if (!subjectCols.length) return { data: [], errors: ['No subject columns found.'] }

    const hintRow = rows[headerRowIdx + 1] || []
    const maxMarksMap = {}
    subjectCols.forEach(({ name, i: colIdx }) => {
      const hint = String(hintRow[colIdx] ?? '').trim().toLowerCase()
      const match = hint.match(/max[:\s]*(\d+)/)
      maxMarksMap[name.toLowerCase().trim()] = match ? Number(match[1]) : 100
    })

    const rollMap = {}; const nameMap = {}
    studentList.forEach((s, idx) => {
      const roll = String(s.rollNumber ?? '').trim()
      if (roll) rollMap[roll] = s
      rollMap[`__idx_${idx}`] = s
      const fn = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ').toLowerCase().trim()
      if (fn) nameMap[fn] = s
    })

    const errors = []; const studentMap = {}
    const dataRows = rows.slice(headerRowIdx + 2).filter((r) => {
      const first = String(r[0] || '').trim()
      return first !== '' && !first.includes('↓')
    })

    dataRows.forEach((row, i) => {
      const rowNum = headerRowIdx + i + 4
      const rollRaw = String(row[rollIdx] ?? '').trim()
      const nameRaw = String(row[nameIdx] ?? '').trim()
      let matched = rollRaw ? rollMap[rollRaw] : null
      if (!matched && nameRaw) matched = nameMap[nameRaw.toLowerCase().trim()]
      if (!matched) { errors.push(`Row ${rowNum}: Student "${rollRaw || nameRaw}" not found`); return }

      const subjects = []
      subjectCols.forEach(({ name, i: colIdx }) => {
        const val = String(row[colIdx] ?? '').trim()
        if (val === '' || val.toLowerCase().startsWith('max')) return
        if (isNaN(Number(val))) { errors.push(`Row ${rowNum} "${name}": "${val}" not a number`); return }
        const subKey = name.toLowerCase().trim()
        const maxMarks = maxMarksMap[subKey] || 100
        if (Number(val) > maxMarks) { errors.push(`Row ${rowNum} "${name}": ${val} exceeds max (${maxMarks})`); return }
        const matchedSub = subjectList.find((s) => s.name.toLowerCase().trim() === subKey)
        if (!matchedSub) return
        subjects.push({ subjectName: matchedSub.name, marksObtained: Number(val), maxMarks })
      })
      if (!subjects.length) return

      const key = String(matched._id)
      if (!studentMap[key]) {
        const fullName = [matched.firstName, matched.middleName, matched.lastName].filter(Boolean).join(' ')
        studentMap[key] = { studentId: matched._id, rollNumber: matched.rollNumber || '', studentName: fullName, subjects: [] }
      }
      studentMap[key].subjects.push(...subjects)
    })
    return { data: Object.values(studentMap), errors }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedFile(file)
    setFileName(file.name)
    setPreview([])
    setParseErrors([])
    setExpandedStudent(null)
  }

  const handleUpload = () => {
    if (!selectedFile) return
    setParsing(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        const { data, errors } = parseXLSX(raw)
        setPreview(data)
        const allErrors = [...errors]
        if (data.length === 0 && allErrors.length === 0) {
          allErrors.push('No matching students found. Make sure you selected the correct Class/Section/Exam before uploading, and that the file was downloaded from this same selection.')
        }
        setParseErrors(allErrors)
      } catch {
        setParseErrors(['Failed to read file. Make sure it is a valid .xlsx file.'])
      } finally {
        setParsing(false)
      }
    }
    reader.readAsArrayBuffer(selectedFile)
  }

  const handleSubmit = async () => {
    if (!preview.length || !sel.classId || !sel.examListId) { toast.error('Select class, exam and upload file'); return }
    setSubmitting(true)
    const requests = preview.map((student) => {
      const subjects = student.subjects.map((s) => {
        const found = subjectList.find((sub) => sub.name.toLowerCase().trim() === s.subjectName.toLowerCase().trim())
        return found ? { subjectId: found._id, marksObtained: s.marksObtained, maxMarks: s.maxMarks } : null
      }).filter(Boolean)
      if (!subjects.length) return Promise.reject(new Error('No subjects'))
      return putRequest({ url: 'marks/update-student-marks', cred: { studentId: student.studentId, examListId: sel.examListId, sessionId: currentSession._id, classId: sel.classId, sectionId: sel.sectionId || undefined, streamId: sel.streamId || undefined, subjects } })
    })
    const results = await Promise.allSettled(requests)
    const ok = results.filter((r) => r.status === 'fulfilled').length
    const fail = results.filter((r) => r.status === 'rejected').length
    setSubmitting(false)
    if (ok > 0) {
      toast.success(`${ok} student(s) saved${fail ? `, ${fail} failed` : ''}`)
      // snapshot current selection, then fetch cross list
      const snapshot = { ...sel }
      setCrossSavedSel(snapshot)
      setPreview([]); setFileName(''); setSelectedFile(null); setParseErrors([])
      await fetchCrossData(snapshot)
      // scroll to cross list
      setTimeout(() => crossRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    } else { toast.error('All submissions failed') }
  }

  // labels for cross list header
  const crossClassName  = classList.find((c) => c._id === crossSavedSel?.classId)?.name || ''
  const crossSectionName = sectionList.find((s) => s._id === crossSavedSel?.sectionId)?.name || 'All Sections'
  const crossExamName   = examList.find((e) => e._id === crossSavedSel?.examListId)?.examMaster?.examName || ''

  const canDownload = sel.classId && sel.examListId && subjectList.length > 0
  const canUpload   = !!selectedFile && !parsing
  const canSubmit   = preview.length > 0 && !submitting && parseErrors.length === 0

  return (
    <div>
      {/* Header Card */}
      <div className="bg-white rounded border px-4 py-3 mb-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Upload size={18} className="text-purple-600" />
          Upload Marks via Excel / CSV
        </h2>
        <p className="text-xs text-gray-500">Download template, fill marks and upload back</p>
      </div>

      {/* ── Step 1 ── */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Step 1 — Select Class &amp; Exam</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class <span className="text-red-500">*</span>
            </label>
            <Select
              allowClear
              placeholder="Select Class"
              className="w-full"
              value={sel.classId || undefined}
              onChange={(value) => handleAntSelChange('classId', value)}
            >
              {classList.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <Select
              allowClear
              placeholder="All Sections"
              className="w-full"
              disabled={!sectionList.length}
              value={sel.sectionId || undefined}
              onChange={(value) => handleAntSelChange('sectionId', value)}
            >
              {sectionList.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
            </Select>
          </div>
          {isStreamRequired && (
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
              <Select
                allowClear
                placeholder="Select Stream"
                className="w-full"
                value={sel.streamId || undefined}
                onChange={(value) => handleAntSelChange('streamId', value)}
              >
                {streamList.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
              </Select>
            </div>
          )}
          <div className="w-full sm:w-56">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam <span className="text-red-500">*</span>
            </label>
            <Select
              allowClear
              placeholder="Select class first"
              className="w-full"
              disabled={!examList.length}
              value={sel.examListId || undefined}
              onChange={(value) => handleAntSelChange('examListId', value)}
            >
              {examList.map((e) => <Option key={e._id} value={e._id}>{e.examMaster?.examName} ({e.examMaster?.category})</Option>)}
            </Select>
          </div>
          <div className="flex items-end gap-2 flex-wrap">
            <button onClick={downloadTemplate} disabled={!canDownload || downloading}
              className="flex items-center gap-1.5 bg-[rgb(4,41,84)] hover:bg-[rgb(6,51,104)] text-white px-6 py-2 rounded h-[38px] text-sm disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
              <Download size={14} />
              {downloading ? 'Downloading...' : 'Download Template'}
            </button>
            <button
              onClick={() => {
                if (!sel.classId || !sel.examListId) { toast.error('Select class and exam first'); return }
                const snapshot = { ...sel }
                setCrossSavedSel(snapshot)
                fetchCrossData(snapshot)
                setTimeout(() => crossRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
              }}
              disabled={!canDownload}
              className="flex items-center gap-1.5 bg-[rgb(4,41,84)] hover:bg-[rgb(6,51,104)] text-white px-6 py-2 rounded h-[38px] text-sm disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
              <TableProperties size={14} />
              Show Cross List
            </button>
          </div>
        </div>
        {canDownload && (
          <p className="text-sm text-gray-400 mt-2">{subjectList.length} subject(s) · {getFilteredStudents().length} student(s)</p>
        )}
      </div>

      {/* ── Step 2 ── */}
      <div className="bg-white rounded border p-4 mb-4">
        <p className="text-sm font-semibold text-[rgb(4,41,84)] mb-3">Step 2 — Upload Filled Sheet (.xlsx)</p>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-lg px-6 py-7 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors w-full max-w-sm sm:max-w-md bg-white">
            <Upload size={22} className="text-gray-400 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="text-sm text-gray-700 font-medium truncate">
                {fileName || 'Click to select .xlsx file'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Only .xlsx files accepted</p>
            </div>
            <input type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
          </label>

          {selectedFile && (
            <button onClick={handleUpload} disabled={!canUpload}
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white bg-[rgb(16,185,129)] hover:bg-[rgb(13,168,116)] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm h-[38px]">
              <Upload size={15} />
              {parsing ? 'Reading file...' : 'Upload & Preview'}
            </button>
          )}
        </div>

        {parseErrors.length > 0 && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-red-600" />
              <span className="text-sm font-semibold text-red-700">{parseErrors.length} error(s) — fix and re-upload</span>
            </div>
            <ul className="text-sm text-red-600 list-disc pl-4 max-h-24 overflow-y-auto">
              {parseErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* ── Preview (before save) ── */}
      {preview.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={15} className="text-green-600" />
            <span className="text-sm font-semibold text-green-700">{preview.length} student(s) ready to save</span>
          </div>
          <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto max-h-64 mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="border px-3 py-2 text-center">Roll</th>
                  <th className="border px-3 py-2 text-left">Student</th>
                  <th className="border px-3 py-2 text-center">Subjects</th>
                  <th className="border px-3 py-2 text-center">Obtained/Max</th>
                  <th className="border px-3 py-2 text-center">%</th>
                  <th className="border px-3 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {preview.map((s, i) => {
                  const totalObtained = s.subjects.reduce((a, b) => a + b.marksObtained, 0)
                  const totalMax      = s.subjects.reduce((a, b) => a + b.maxMarks, 0)
                  const pct           = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0.0'
                  const isExp         = expandedStudent === i
                  return (
                    <React.Fragment key={i}>
                      <tr className="hover:bg-gray-50">
                        <td className="border px-3 py-2 text-center font-medium">{s.rollNumber || '-'}</td>
                        <td className="border px-3 py-2">{s.studentName}</td>
                        <td className="border px-3 py-2 text-center">{s.subjects.length}</td>
                        <td className="border px-3 py-2 text-center font-semibold text-blue-600">{totalObtained}/{totalMax}</td>
                        <td className="border px-3 py-2 text-center">
                          <span className={`font-semibold ${Number(pct) >= 33 ? 'text-green-600' : 'text-red-600'}`}>{pct}%</span>
                        </td>
                        <td className="border px-3 py-2 text-center">
                          <button onClick={() => setExpandedStudent(isExp ? null : i)} className="text-gray-500 hover:text-gray-800">
                            {isExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {isExp && (
                        <tr className="bg-blue-50">
                          <td colSpan={6} className="px-4 py-2">
                            <div className="flex flex-wrap gap-2">
                              {s.subjects.map((sub, j) => (
                                <span key={j} className="text-sm bg-white border rounded px-2 py-1">
                                  {sub.subjectName}: <b>{sub.marksObtained}</b>/{sub.maxMarks}
                                  <span className={`ml-1 font-semibold ${(sub.marksObtained / sub.maxMarks) * 100 >= 33 ? 'text-green-600' : 'text-red-600'}`}>
                                    {(sub.marksObtained / sub.maxMarks) * 100 >= 33 ? '✓' : '✗'}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => { setPreview([]); setFileName(''); setSelectedFile(null); setParseErrors([]) }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded h-[38px] text-sm">
              Clear
            </button>
            <button onClick={handleSubmit} disabled={!canSubmit}
              className="bg-[rgb(4,41,84)] hover:bg-[rgb(6,51,104)] text-white px-6 py-2 rounded h-[38px] text-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
              {submitting ? 'Saving...' : `Save Marks (${preview.length} students)`}
            </button>
          </div>
        </>
      )}

      {/* ── Cross List Verification (after save) ── */}
      {(crossSavedSel || crossLoading) && (
        <div ref={crossRef} className="mt-6 border-t pt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TableProperties size={15} className="text-[#0c3b73]" />
              <span className="text-sm font-semibold text-[#0c3b73]">
                Marks Verification — Cross List
              </span>
              {crossSavedSel && (
                <span className="text-sm text-gray-500 ml-1">
                  ({crossClassName} · {crossSectionName} · {crossExamName})
                </span>
              )}
            </div>
            <button
              onClick={() => fetchCrossData(crossSavedSel)}
              disabled={crossLoading}
              className="flex items-center gap-1 text-sm text-[#0c3b73] border border-[#0c3b73] rounded px-2.5 py-1 hover:bg-blue-50 disabled:opacity-50">
              <RefreshCw size={13} className={crossLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {crossLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-500 gap-2">
              <RefreshCw size={15} className="animate-spin text-[#0c3b73]" />
              Loading cross list...
            </div>
          ) : crossData.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400 border rounded-lg bg-gray-50">
              No marks data found for this selection.
            </div>
          ) : (
            <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-[#0c3b73] text-white">
                  <tr>
                    <th className="border border-blue-900 px-3 py-2 text-center whitespace-nowrap">Rank</th>
                    <th className="border border-blue-900 px-3 py-2 text-center whitespace-nowrap">Roll No.</th>
                    <th className="border border-blue-900 px-3 py-2 text-left whitespace-nowrap">Student Name</th>
                    <th className="border border-blue-900 px-3 py-2 text-center whitespace-nowrap">Sec</th>
                    {subjectList.map((s) => {
                      let maxMarks = 100
                      const sampleSubject = crossData.find((st) =>
                        st.subjects?.find((sub) => sub.subjectName?.toLowerCase().trim() === s.name.toLowerCase().trim())
                      )
                      if (sampleSubject) {
                        const found = sampleSubject.subjects.find((sub) => sub.subjectName?.toLowerCase().trim() === s.name.toLowerCase().trim())
                        if (found?.maxMarks) maxMarks = found.maxMarks
                      }
                      return (
                        <th key={s._id} className="border border-blue-900 px-3 py-2 text-center whitespace-nowrap">
                          {s.name} ({maxMarks})
                        </th>
                      )
                    })}
                    <th className="border border-blue-900 px-3 py-2 text-center whitespace-nowrap">Total</th>
                    <th className="border border-blue-900 px-3 py-2 text-center whitespace-nowrap">%</th>
                    <th className="border border-blue-900 px-3 py-2 text-center whitespace-nowrap">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {crossData
                    .slice()
                    .sort((a, b) => b.percentage - a.percentage)
                    .map((student, i) => {
                      const rank = i + 1
                      const subMap = {}
                      ;(student.subjects || []).forEach((s) => {
                        subMap[s.subjectName?.toLowerCase().trim()] = s
                      })
                      return (
                        <tr key={student.studentId} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border px-3 py-2 text-center font-bold text-blue-700">{rank}</td>
                          <td className="border px-3 py-2 text-center">{student.rollNumber || '-'}</td>
                          <td className="border px-3 py-2 font-medium whitespace-nowrap">{student.name}</td>
                          <td className="border px-3 py-2 text-center text-gray-600">{student.section || '-'}</td>
                          {subjectList.map((sub) => {
                            const key = sub.name.toLowerCase().trim()
                            const entry = subMap[key]
                            return (
                              <td key={sub._id} className="border px-3 py-2 text-center">
                                {entry
                                  ? <span className={entry.marksObtained / entry.maxMarks < 0.33 ? 'text-red-600 font-semibold' : 'font-medium'}>
                                      {entry.marksObtained}
                                    </span>
                                  : <span className="text-gray-300">—</span>
                                }
                              </td>
                            )
                          })}
                          <td className="border px-3 py-2 text-center font-semibold text-blue-700">
                            {student.totalObtained}/{student.totalMarks}
                          </td>
                          <td className="border px-3 py-2 text-center">
                            <span className={`font-semibold ${Number(student.percentage) >= 33 ? 'text-green-600' : 'text-red-600'}`}>
                              {student.percentage}%
                            </span>
                          </td>
                          <td className={`border px-3 py-2 text-center font-bold ${student.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                            {student.result}
                          </td>
                        </tr>
                      )                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UploadMarksTab
