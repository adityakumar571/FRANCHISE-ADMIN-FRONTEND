/* eslint-disable prettier/prettier */
/**
 * Tab 5 — Generate Marksheet (individual student)
 * Search student → fetch full marksheet → display + print
 */
import React, { useContext, useEffect, useRef, useState } from 'react'
import { BookOpen, Filter, Printer } from 'lucide-react'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'
import Marksheet from '../../../../pages/Marks/Marksheet'
import { Empty, Select } from 'antd'
import { useReactToPrint } from 'react-to-print'

const { Option } = Select

const GenerateMarksheetTab = () => {
  const { currentSession } = useContext(SessionContext)
  const printRef = useRef()

  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [streams, setStreams] = useState([])
  const [students, setStudents] = useState([])

  const [filters, setFilters] = useState({ classId: '', sectionId: '', streamId: '' })
  const [searchText, setSearchText] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const [marksheetData, setMarksheetData] = useState(null)
  const [loading, setLoading] = useState(false)

  const selectedClass = classes.find((c) => c._id === filters.classId)
  const isStreamRequired = !!selectedClass?.isSenior

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Marksheet',
    pageStyle: '@page { size: A4; margin: 10mm; } @media print { body { -webkit-print-color-adjust: exact; } }',
  })

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?session=${currentSession._id}&isPagination=false`)
      .then((r) => setClasses(r?.data?.data?.classes || []))
  }, [currentSession?._id])

  useEffect(() => {
    if (!filters.classId) { setSections([]); setStreams([]); setStudents([]); return }
    getRequest(`sections?classId=${filters.classId}&isPagination=false`).then((r) => setSections(r?.data?.data?.sections || []))
    if (isStreamRequired) {
      getRequest(`streams?classId=${filters.classId}&isPagination=false`).then((r) => setStreams(r?.data?.data?.streams || []))
    } else { setStreams([]) }
  }, [filters.classId, isStreamRequired])

  useEffect(() => {
    if (!filters.classId) return
    let url = `studentEnrollment?currentClass=${filters.classId}&isPagination=false`
    if (filters.sectionId) url += `&currentSection=${filters.sectionId}`
    if (isStreamRequired && filters.streamId) url += `&stream=${filters.streamId}`
    getRequest(url).then((r) => setStudents(r?.data?.data?.students || []))
  }, [filters.classId, filters.sectionId, filters.streamId, isStreamRequired])

  const filteredStudents = students.filter((s) => {
    const full = `${s.firstName} ${s.lastName} ${s.studentId} ${s.fatherName || ''}`.toLowerCase()
    return full.includes(searchText.toLowerCase())
  })

  const fetchMarksheet = (studentId) => {
    if (!studentId || !currentSession?._id) return
    setLoading(true)
    setMarksheetData(null)
    getRequest(`marks/getFullMarksheet?studentId=${studentId}&sessionId=${currentSession._id}`)
      .then((r) => setMarksheetData(r?.data?.data || null))
      .catch(() => setMarksheetData(null))
      .finally(() => setLoading(false))
  }

  return (
    <div>
      {/* Header Card */}
      <div className="bg-white rounded border px-4 py-3 mb-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <BookOpen size={18} className="text-blue-600" />
          Generate Marksheet
        </h2>
        <p className="text-xs text-gray-500">Search student and generate individual marksheet</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Select Student</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class <span className="text-red-500">*</span></label>
            <Select
              allowClear
              placeholder="Select Class"
              className="w-full"
              value={filters.classId || undefined}
              onChange={(value) => {
                setFilters({ classId: value || '', sectionId: '', streamId: '' })
                setSearchText(''); setSelectedStudentId(''); setMarksheetData(null)
              }}
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
          {/* Student search */}
          <div className="flex flex-col w-64 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
            <input
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type name or student ID"
              value={searchText}
              disabled={!filters.classId}
              onChange={(e) => { setSearchText(e.target.value); setShowDropdown(true); if (!e.target.value) { setSelectedStudentId(''); setMarksheetData(null) } }}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && filters.classId && filteredStudents.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border rounded shadow-lg z-50 max-h-44 overflow-y-auto">
                {filteredStudents.map((s) => (
                  <div key={s._id} className="px-2.5 py-1.5 text-sm hover:bg-blue-50 cursor-pointer"
                    onClick={() => {
                      const full = `${s.firstName} ${s.lastName} (${s.studentId})`
                      setSearchText(full); setSelectedStudentId(s._id)
                      setShowDropdown(false); fetchMarksheet(s._id)
                    }}>
                    <div className="font-medium">{s.firstName} {s.lastName} <span className="text-xs text-gray-400">({s.studentId})</span></div>
                    {s.fatherName && <div className="text-xs text-gray-500">{s.fatherName}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
          {marksheetData && (
            <div className="flex items-end">
              <button onClick={handlePrint} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded h-[38px] text-sm">
                <Printer size={14} /> Print
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Marksheet display */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader /></div>
      ) : !selectedStudentId ? (
        <div className="bg-white border rounded-lg p-10 text-center"><Empty description="Select a student to generate marksheet" /></div>
      ) : !marksheetData ? (
        <div className="bg-white border rounded-lg p-10 text-center"><Empty description="No marksheet found for this student" /></div>
      ) : (
        <div ref={printRef}>
          <Marksheet data={marksheetData} currentSession={currentSession} />
        </div>
      )}
    </div>
  )
}

export default GenerateMarksheetTab
