/* eslint-disable prettier/prettier */
/**
 * Tab 4 — Cross List Marksheet
 * Class-wise marks summary table: all students × all terms in one view.
 * "All Exams" mode → term-wise columns (Obt / Max / %) — standard school format
 * Single exam mode → flat subject-wise columns
 */
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Printer, Filter, Eye, X, FileText } from 'lucide-react'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import { AppContext } from '../../../../../Context/AppContext'
import Loader from '../../../../../components/Loading/Loader'
import { Empty, Select } from 'antd'
import { useReactToPrint } from 'react-to-print'
import Marksheet from '../../../../pages/Marks/Marksheet'

const { Option } = Select

const CrossListMarksheetTab = () => {
  const { currentSession } = useContext(SessionContext)
  const { tenantDetails } = useContext(AppContext)
  const printRef = useRef()

  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [streams, setStreams] = useState([])
  const [exams, setExams] = useState([])
  const [subjects, setSubjects] = useState([])

  const [filters, setFilters] = useState({ classId: '', sectionId: '', streamId: '', examListId: '' })
  const [applied, setApplied] = useState(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // ── Marksheet View Modal ──
  const [viewStudent, setViewStudent] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [fullMarksheet, setFullMarksheet] = useState(null)
  const modalPrintRef = useRef()

  const selectedClass = classes.find((c) => c._id === filters.classId)
  const isStreamRequired = !!selectedClass?.isSenior

  /* ── Load classes ── */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?session=${currentSession._id}&isPagination=false`)
      .then((r) => setClasses(r?.data?.data?.classes || []))
  }, [currentSession?._id])

  /* ── Load sections & exams on class change ── */
  useEffect(() => {
    if (!filters.classId) { setSections([]); setExams([]); setStreams([]); setSubjects([]); return }
    getRequest(`sections?classId=${filters.classId}&isPagination=false`).then((r) => setSections(r?.data?.data?.sections || []))
    getRequest(`examsList?classId=${filters.classId}&sessionId=${currentSession?._id}&isActive=true&isPagination=false`).then((r) => setExams(r?.data?.data?.examLists || []))
    if (isStreamRequired) {
      getRequest(`streams?classId=${filters.classId}&isPagination=false`).then((r) => setStreams(r?.data?.data?.streams || []))
    } else { setStreams([]) }
  }, [filters.classId, isStreamRequired])

  /* ── Load subjects ── */
  useEffect(() => {
    if (!filters.classId) { setSubjects([]); return }
    if (isStreamRequired && !filters.streamId) { setSubjects([]); return }
    const url = isStreamRequired && filters.streamId
      ? `subjects?classId=${filters.classId}&streamId=${filters.streamId}&isPagination=false`
      : `subjects?classId=${filters.classId}&isPagination=false`
    getRequest(url).then((r) => setSubjects(r?.data?.data?.subjects || []))
  }, [filters.classId, filters.streamId, isStreamRequired])

  /* ── Fetch data ── */
  useEffect(() => {
    if (!applied) return
    setLoading(true)
    const q = new URLSearchParams({
      classId: applied.classId,
      sessionId: currentSession._id,
      ...(applied.sectionId && { sectionId: applied.sectionId }),
      ...(applied.streamId && { streamId: applied.streamId }),
      ...(applied.examListId && { examListId: applied.examListId }),
      isPagination: 'false',
    }).toString()
    getRequest(`marks/getClassWiseMarksSummary?${q}`)
      .then((r) => setData(r?.data?.data?.students || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [applied])

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Cross_List_Marksheet',
    pageStyle: '@page { size: A3 landscape; margin: 8mm; } @media print { body { -webkit-print-color-adjust: exact; } }',
  })

  const handleViewMarksheet = async (student) => {
    setViewStudent(student)
    setViewLoading(true)
    setFullMarksheet(null)
    try {
      const r = await getRequest(`marks/getFullMarksheet?studentId=${student.studentId}&sessionId=${currentSession._id}`)
      setFullMarksheet(r?.data?.data || null)
    } catch {
      setFullMarksheet(null)
    } finally {
      setViewLoading(false)
    }
  }

  const handleModalPrint = useReactToPrint({
    contentRef: modalPrintRef,
    documentTitle: `Marksheet_${viewStudent?.name || ''}`,
    pageStyle: '@page { size: A4; margin: 10mm; } @media print { body { -webkit-print-color-adjust: exact; } }',
  })

  const selectedExamName = exams.find((e) => e._id === applied?.examListId)?.examMaster?.examName || 'All Terms'
  const selectedClassName = classes.find((c) => c._id === applied?.classId)?.name || ''
  const selectedSectionName = sections.find((s) => s._id === applied?.sectionId)?.name || 'All'

  // ── Mode: All Terms vs Single Exam ──
  const isAllExams = !applied?.examListId

  // Build ordered unique terms — collect from ALL students to ensure coverage
  // (some students may have marks in terms others don't)
  const termsListRaw = (() => {
    if (!isAllExams || data.length === 0) return []
    const map = new Map()
    data.forEach((student) => {
      (student.terms || []).forEach((t) => {
        if (!map.has(t.examListId)) map.set(t.examListId, t)
      })
    })
    return [...map.values()]
  })()

  // Fallback: if backend didn't return terms yet (old cache), build from subjects
  const termsList = termsListRaw.length > 0
    ? termsListRaw
    : (() => {
        if (!isAllExams || data.length === 0) return []
        const map = new Map()
        data.forEach((student) => {
          (student.subjects || []).forEach((sub) => {
            const eid = sub.examListId?.toString()
            if (eid && !map.has(eid)) {
              map.set(eid, {
                examListId: eid,
                examName: sub.examName || 'Unknown Exam',
                obtained: 0, maxMarks: 0, percentage: 0,
              })
            }
          })
        })
        // fill obtained/maxMarks per student per term from subjects
        if (map.size > 0) {
          data.forEach((student) => {
            const tmap = {}
            ;(student.subjects || []).forEach((sub) => {
              const eid = sub.examListId?.toString()
              if (!eid) return
              if (!tmap[eid]) tmap[eid] = { obtained: 0, maxMarks: 0 }
              tmap[eid].obtained += sub.marksObtained || 0
              tmap[eid].maxMarks += sub.maxMarks || 0
            })
            // attach to student as terms if missing
            if (!student.terms || student.terms.length === 0) {
              student.terms = [...map.keys()].map((eid) => ({
                examListId: eid,
                examName: map.get(eid).examName,
                obtained: tmap[eid]?.obtained || 0,
                maxMarks: tmap[eid]?.maxMarks || 0,
                percentage: tmap[eid]?.maxMarks > 0
                  ? Number(((tmap[eid].obtained / tmap[eid].maxMarks) * 100).toFixed(2))
                  : 0,
              }))
            }
          })
        }
        return [...map.values()]
      })()

  return (
    <div>
      {/* Header Card */}
      <div className="bg-white rounded border px-4 py-3 mb-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <FileText size={18} className="text-indigo-600" />
          Cross List Marksheet
        </h2>
        <p className="text-xs text-gray-500">Class-wise marks summary across all terms</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class <span className="text-red-500">*</span></label>
            <Select
              allowClear
              placeholder="Select Class"
              className="w-full"
              value={filters.classId || undefined}
              onChange={(value) => setFilters((p) => ({ ...p, classId: value || '', sectionId: '', streamId: '', examListId: '' }))}
            >
              {classes.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <Select
              allowClear
              placeholder="All Sections"
              className="w-full"
              disabled={!sections.length}
              value={filters.sectionId || undefined}
              onChange={(value) => setFilters((p) => ({ ...p, sectionId: value || '' }))}
            >
              {sections.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
            </Select>
          </div>
          {isStreamRequired && (
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
              <Select
                allowClear
                placeholder="Select Stream"
                className="w-full"
                value={filters.streamId || undefined}
                onChange={(value) => setFilters((p) => ({ ...p, streamId: value || '' }))}
              >
                {streams.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
              </Select>
            </div>
          )}
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam / Term</label>
            <Select
              allowClear
              placeholder="All Terms"
              className="w-full"
              disabled={!exams.length}
              value={filters.examListId || undefined}
              onChange={(value) => setFilters((p) => ({ ...p, examListId: value || '' }))}
            >
              {exams.map((e) => <Option key={e._id} value={e._id}>{e.examMaster?.examName}</Option>)}
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => { if (!filters.classId) return; setApplied({ ...filters }) }}
              disabled={!filters.classId}
              className="bg-[rgb(4,41,84)] hover:bg-[rgb(6,51,104)] text-white px-6 py-2 rounded h-[38px] text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >Apply</button>
            <button
              onClick={() => { setFilters({ classId: '', sectionId: '', streamId: '', examListId: '' }); setApplied(null); setData([]) }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded h-[38px] text-sm"
            >Clear</button>
            {data.length > 0 && (
              <button onClick={handlePrint} className="flex items-center gap-1.5 px-6 py-2 rounded h-[38px] text-sm text-white bg-green-600 hover:bg-green-700">
                <Printer size={14} /> Print
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader /></div>
      ) : !applied ? (
        <div className="bg-white border rounded-lg p-10 text-center"><Empty description="Select class and click Apply" /></div>
      ) : data.length === 0 ? (
        <div className="bg-white border rounded-lg p-10 text-center"><Empty description="No marks data found" /></div>
      ) : (
        <div ref={printRef} className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">

          {/* Print Header (visible on print only) */}
          <div className="p-4 border-b hidden print:block">
            <h2 className="text-center font-bold text-lg">{tenantDetails?.schoolName}</h2>
            <p className="text-center text-sm text-gray-500">{tenantDetails?.schoolAddress}</p>
            <p className="text-center text-sm font-semibold mt-1">
              Cross List Marksheet — Class: {selectedClassName} | Section: {selectedSectionName} | {selectedExamName}
            </p>
          </div>

          {/* Info Bar (screen only) */}
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-blue-50 border-b print:hidden">
            <span className="text-sm text-gray-500 font-medium">Showing:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[rgb(4,41,84)] text-white text-sm font-semibold">
              Class: {selectedClassName}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
              Section: {selectedSectionName}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
              {isAllExams ? `All Terms${termsList.length > 0 ? ` (${termsList.length})` : ''}` : selectedExamName}
            </span>
            <span className="ml-auto text-sm text-gray-400">{data.length} students</span>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              {isAllExams && termsList.length > 0 ? (
                /* ── All Terms mode: term-wise grouped header ── */
                <>
                  {/* Row 1: fixed cols + term names (colspan 3 each) + grand total */}
                  <tr className="bg-[#0c3b73] text-white">
                    <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap" rowSpan={2}>Rank</th>
                    <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap" rowSpan={2}>Roll No.</th>
                    <th className="border border-gray-300 px-2 py-2 text-left whitespace-nowrap" rowSpan={2}>Student Name</th>
                    <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap" rowSpan={2}>Sec</th>
                    {termsList.map((term) => (
                      <th key={term.examListId}
                        colSpan={3}
                        className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap font-bold">
                        {term.examName}
                      </th>
                    ))}
                    <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap" rowSpan={2}>Grand Total</th>
                    <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap" rowSpan={2}>%</th>
                    <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap" rowSpan={2}>Result</th>
                    <th className="border border-gray-300 px-2 py-2 text-center whitespace-nowrap print:hidden" rowSpan={2}>Action</th>
                  </tr>
                  {/* Row 2: Obt / Max / % under each term */}
                  <tr className="bg-blue-900 text-blue-100">
                    {termsList.map((term) => (
                      <React.Fragment key={term.examListId}>
                        <th className="border border-gray-300 px-2 py-1.5 text-center whitespace-nowrap font-normal">Obt</th>
                        <th className="border border-gray-300 px-2 py-1.5 text-center whitespace-nowrap font-normal">Max</th>
                        <th className="border border-gray-300 px-2 py-1.5 text-center whitespace-nowrap font-normal">%</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </>
              ) : (
                /* ── Single Exam mode: flat subject columns ── */
                <tr className="bg-gray-200">
                  <th className="border px-2 py-2 text-center whitespace-nowrap">Rank</th>
                  <th className="border px-2 py-2 text-center whitespace-nowrap">Roll No.</th>
                  <th className="border px-2 py-2 text-left whitespace-nowrap">Student Name</th>
                  <th className="border px-2 py-2 text-center whitespace-nowrap">Sec</th>
                  {subjects.map((s) => {
                    let maxMarks = 100
                    const sample = data.find((st) => st.subjects?.find((sub) => sub.subjectName?.toLowerCase().trim() === s.name.toLowerCase().trim()))
                    if (sample) {
                      const found = sample.subjects.find((sub) => sub.subjectName?.toLowerCase().trim() === s.name.toLowerCase().trim())
                      if (found?.maxMarks) maxMarks = found.maxMarks
                    }
                    return <th key={s._id} className="border px-2 py-2 text-center whitespace-nowrap">{s.name} ({maxMarks})</th>
                  })}
                  <th className="border px-2 py-2 text-center whitespace-nowrap">Total</th>
                  <th className="border px-2 py-2 text-center whitespace-nowrap">%</th>
                  <th className="border px-2 py-2 text-center whitespace-nowrap">Result</th>
                  <th className="border px-2 py-2 text-center whitespace-nowrap">Action</th>
                </tr>
              )}
            </thead>

            <tbody>
              {data
                .slice()
                .sort((a, b) => b.percentage - a.percentage)
                .map((student, i) => {
                  const rank = i + 1
                  // Build termMap for quick lookup: examListId → term data
                  const termMap = {}
                  ;(student.terms || []).forEach((t) => { termMap[t.examListId?.toString()] = t })
                  // Build subMap for single-exam mode
                  const subMap = {}
                  ;(student.subjects || []).forEach((s) => { subMap[s.subjectName?.toLowerCase().trim()] = s })

                  return (
                    <tr key={student.studentId} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border px-2 py-2 text-center font-bold text-blue-700">{rank}</td>
                      <td className="border px-2 py-2 text-center">{student.rollNumber || '-'}</td>
                      <td className="border px-2 py-2 font-medium">{student.name}</td>
                      <td className="border px-2 py-2 text-center text-gray-600">{student.section || '-'}</td>

                      {isAllExams && termsList.length > 0 ? (
                        /* ── All Terms: 3 cells per term ── */
                        termsList.map((termDef) => {
                          const t = termMap[termDef.examListId?.toString()]
                          const pct = t ? t.percentage : 0
                          const isLow = pct < 33
                          return (
                            <React.Fragment key={termDef.examListId}>
                              <td className="border px-2 py-2 text-center">
                                {t ? <span className={isLow ? 'text-red-600 font-semibold' : 'font-medium'}>{t.obtained}</span> : <span className="text-gray-300">—</span>}
                              </td>
                              <td className="border px-2 py-2 text-center text-gray-500">{t ? t.maxMarks : '—'}</td>
                              <td className="border px-2 py-2 text-center">
                                {t
                                  ? <span className={`font-semibold ${isLow ? 'text-red-500' : 'text-green-600'}`}>{t.percentage}%</span>
                                  : <span className="text-gray-300">—</span>}
                              </td>
                            </React.Fragment>
                          )
                        })
                      ) : (
                        /* ── Single Exam: flat subject cells ── */
                        subjects.map((s) => {
                          const entry = subMap[s.name.toLowerCase().trim()]
                          return (
                            <td key={s._id} className="border px-2 py-2 text-center">
                              {entry
                                ? <span className={entry.marksObtained / entry.maxMarks < 0.33 ? 'text-red-600 font-semibold' : 'font-medium'}>{entry.marksObtained}</span>
                                : <span className="text-gray-300">—</span>}
                            </td>
                          )
                        })
                      )}

                      {/* Grand Total */}
                      <td className="border px-2 py-2 text-center font-semibold text-blue-700">
                        {student.totalObtained}/{student.totalMarks}
                      </td>
                      {/* Overall % */}
                      <td className="border px-2 py-2 text-center">
                        <span className={`font-semibold ${Number(student.percentage) >= 33 ? 'text-green-600' : 'text-red-600'}`}>
                          {student.percentage}%
                        </span>
                      </td>
                      {/* Result */}
                      <td className={`border px-2 py-2 text-center font-bold ${student.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                        {student.result}
                      </td>
                      {/* Action */}
                      <td className="border px-2 py-2 text-center print:hidden">
                        <button
                          onClick={() => handleViewMarksheet(student)}
                          className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-full mx-auto flex items-center justify-center">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Marksheet View Modal ── */}
      {viewStudent && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b rounded-t-xl flex-shrink-0" style={{ backgroundColor: 'rgb(4,41,84)' }}>
              <div>
                <h3 className="text-white font-semibold text-base">{viewStudent.name}</h3>
                <p className="text-blue-200 text-xs mt-0.5">
                  Roll No: {viewStudent.rollNumber || '—'} · Section: {viewStudent.section || '—'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {fullMarksheet && (
                  <button onClick={handleModalPrint}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors">
                    <Printer size={12} /> Print
                  </button>
                )}
                <button onClick={() => { setViewStudent(null); setFullMarksheet(null) }}
                  className="text-white hover:text-red-300 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1">
              {viewLoading ? (
                <div className="flex justify-center py-10"><Loader /></div>
              ) : !fullMarksheet ? (
                <div className="text-center py-10 text-gray-400 text-sm">No marksheet data found</div>
              ) : (
                <div ref={modalPrintRef}>
                  <Marksheet data={fullMarksheet} currentSession={currentSession} />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t flex justify-end bg-white rounded-b-xl flex-shrink-0">
              <button onClick={() => { setViewStudent(null); setFullMarksheet(null) }}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CrossListMarksheetTab
