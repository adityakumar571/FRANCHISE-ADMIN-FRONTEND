/* eslint-disable prettier/prettier */
/**
 * Tab 6 — Print Marksheet Class Wise
 * Select class → list all students with checkboxes → print selected marksheets.
 */
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Printer, Filter, CheckSquare, Square } from 'lucide-react'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import { AppContext } from '../../../../../Context/AppContext'
import Loader from '../../../../../components/Loading/Loader'
import Marksheet from '../../../../pages/Marks/Marksheet'
import { Empty, Pagination, Select } from 'antd'
import { useReactToPrint } from 'react-to-print'

const { Option } = Select

const PrintClassWiseTab = () => {
  const { currentSession } = useContext(SessionContext)
  const { tenantDetails } = useContext(AppContext)
  const printRef = useRef()

  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [streams, setStreams] = useState([])
  const [students, setStudents] = useState([])

  const [filters, setFilters] = useState({ classId: '', sectionId: '', streamId: '' })
  const [applied, setApplied] = useState(null)
  const [loading, setLoading] = useState(false)

  const [marksheets, setMarksheets] = useState([])
  const [fetchingMarksheets, setFetchingMarksheets] = useState(false)
  const [page, setPage] = useState(1)
  const limit = 10

  const [selectedIds, setSelectedIds] = useState(new Set())

  const selectedClass = classes.find((c) => c._id === filters.classId)
  const isStreamRequired = !!selectedClass?.isSenior

  const readyMarksheets = marksheets.filter((m) => m.data)
  const readyIds = new Set(readyMarksheets.map((m) => m.student._id))
  const selectedMarksheets = readyMarksheets.filter((m) => selectedIds.has(m.student._id))
  const allReadySelected = readyIds.size > 0 && [...readyIds].every((id) => selectedIds.has(id))
  const someSelected = selectedIds.size > 0 && !allReadySelected

  const handleSelectAll = () => {
    if (allReadySelected) setSelectedIds(new Set())
    else setSelectedIds(new Set([...readyIds]))
  }

  const handleToggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handlePrintSelected = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Class_Marksheets',
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .page-break { page-break-after: always; }
      }
    `,
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

  const fetchStudents = (f) => {
    if (!f?.classId) return
    setLoading(true)
    let url = `studentEnrollment?currentClass=${f.classId}&isPagination=false&status=Studying`
    if (f.sectionId) url += `&currentSection=${f.sectionId}`
    if (isStreamRequired && f.streamId) url += `&stream=${f.streamId}`
    getRequest(url)
      .then((r) => setStudents(r?.data?.data?.students || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }

  const fetchAllMarksheets = async (studentList) => {
    setFetchingMarksheets(true)
    setMarksheets([])
    setSelectedIds(new Set())
    const results = []
    for (const s of studentList) {
      try {
        const r = await getRequest(`marks/getFullMarksheet?studentId=${s._id}&sessionId=${currentSession._id}`)
        results.push({ student: s, data: r?.data?.data || null })
      } catch {
        results.push({ student: s, data: null })
      }
      setMarksheets([...results])
    }
    setFetchingMarksheets(false)
  }

  const handleApply = () => {
    if (!filters.classId) return
    setApplied({ ...filters })
    setPage(1)
    fetchStudents(filters)
  }

  useEffect(() => {
    if (students.length > 0 && applied) fetchAllMarksheets(students)
  }, [students])

  const paginatedStudents = students.slice((page - 1) * limit, page * limit)
  const selectedClassName = classes.find((c) => c._id === applied?.classId)?.name || ''
  const selectedSectionName = sections.find((s) => s._id === applied?.sectionId)?.name || 'All'

  return (
    <div>
      {/* Header Card */}
      <div className="bg-white rounded border px-4 py-3 mb-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Printer size={18} className="text-green-600" />
          Print Marksheet — Class Wise
        </h2>
        <p className="text-xs text-gray-500">Select class and print marksheets for all students</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Select Class</h3>
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
                setStudents([]); setMarksheets([]); setSelectedIds(new Set())
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
          <div className="flex items-end gap-2 flex-wrap">
            <button onClick={handleApply} disabled={!filters.classId}
              className="bg-[rgb(4,41,84)] hover:bg-[rgb(6,51,104)] text-white px-6 py-2 rounded h-[38px] text-sm disabled:bg-gray-300 disabled:cursor-not-allowed">
              Apply
            </button>
            <button onClick={() => {
              setFilters({ classId: '', sectionId: '', streamId: '' })
              setApplied(null); setStudents([]); setMarksheets([]); setSelectedIds(new Set())
            }} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded h-[38px] text-sm">
              Clear
            </button>
            {selectedMarksheets.length > 0 && (
              <button onClick={handlePrintSelected}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded h-[38px] text-sm">
                <Printer size={14} />
                Print Selected ({selectedMarksheets.length})
              </button>
            )}
          </div>
        </div>
        {fetchingMarksheets && (
          <p className="text-sm text-blue-600 mt-2 animate-pulse">
            Fetching marksheets... {marksheets.length}/{students.length}
          </p>
        )}
      </div>

      {/* Student list */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader /></div>
      ) : !applied ? (
        <div className="bg-white border rounded-lg p-10 text-center"><Empty description="Select class and click Apply" /></div>
      ) : students.length === 0 ? (
        <div className="bg-white border rounded-lg p-10 text-center"><Empty description="No students found" /></div>
      ) : (
        <>
          {/* Summary card */}
          <div className="bg-white border rounded-lg px-4 py-3 mb-4 flex flex-wrap items-center gap-6 text-sm">
            <div><span className="text-gray-500">Class:</span> <b>{selectedClassName}</b></div>
            <div><span className="text-gray-500">Section:</span> <b>{selectedSectionName}</b></div>
            <div><span className="text-gray-500">Total Students:</span> <b>{students.length}</b></div>
            <div><span className="text-gray-500">Marksheets Ready:</span> <b className="text-green-600">{readyMarksheets.length}</b></div>
            <div><span className="text-gray-500">Selected:</span> <b style={{ color: 'rgb(4,41,84)' }}>{selectedIds.size}</b></div>
            {readyMarksheets.length > 0 && !fetchingMarksheets && (
              <div className="ml-auto">
                <button
                  onClick={handleSelectAll}
                  style={allReadySelected
                    ? { backgroundColor: 'rgb(4,41,84)', color: '#fff', borderColor: 'rgb(4,41,84)' }
                    : { backgroundColor: '#fff', color: 'rgb(4,41,84)', borderColor: 'rgb(4,41,84)' }
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium border transition-colors hover:opacity-90">
                  {allReadySelected
                    ? <><CheckSquare size={13} /> Deselect All</>
                    : <><Square size={13} /> Select All ({readyMarksheets.length})</>
                  }
                </button>
              </div>
            )}
          </div>

          {/* Students table */}
          <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-3 py-2 text-center w-10">
                    {!fetchingMarksheets && readyMarksheets.length > 0 && (
                      <input
                        type="checkbox"
                        checked={allReadySelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected }}
                        onChange={handleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: 'rgb(4,41,84)' }}
                        title="Select / Deselect All"
                      />
                    )}
                  </th>
                  <th className="border px-3 py-2 text-center">Sr.</th>
                  <th className="border px-3 py-2 text-center">Roll No.</th>
                  <th className="border px-3 py-2 text-left">Student Name</th>
                  <th className="border px-3 py-2 text-center">Father Name</th>
                  <th className="border px-3 py-2 text-center">Section</th>
                  <th className="border px-3 py-2 text-center">Marksheet</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((s, i) => {
                  const ms = marksheets.find((m) => m.student._id === s._id)
                  const hasMarksheet = !!ms?.data
                  const isLoading = fetchingMarksheets && !ms
                  const isSelected = selectedIds.has(s._id)
                  return (
                    <tr key={s._id}
                      onClick={() => hasMarksheet && handleToggle(s._id)}
                      className={`transition-colors ${hasMarksheet ? 'cursor-pointer' : 'cursor-default'} ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}>
                      <td className="border px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        {hasMarksheet ? (
                          <input type="checkbox" checked={isSelected} onChange={() => handleToggle(s._id)}
                            className="w-4 h-4 cursor-pointer" style={{ accentColor: 'rgb(4,41,84)' }} />
                        ) : (
                          <input type="checkbox" disabled className="w-4 h-4 opacity-30" />
                        )}
                      </td>
                      <td className="border px-3 py-2 text-center text-gray-500">{(page - 1) * limit + i + 1}</td>
                      <td className="border px-3 py-2 text-center">{s.rollNumber || '-'}</td>
                      <td className="border px-3 py-2 font-medium">{s.firstName} {s.lastName}</td>
                      <td className="border px-3 py-2 text-center text-gray-600">{s.fatherName || '-'}</td>
                      <td className="border px-3 py-2 text-center">{s.currentSection?.name || '-'}</td>
                      <td className="border px-3 py-2 text-center">
                        {isLoading ? (
                          <span className="text-sm text-gray-400 animate-pulse">Loading...</span>
                        ) : hasMarksheet ? (
                          <span className="text-sm px-2 py-0.5 rounded font-medium text-white"
                            style={isSelected ? { backgroundColor: 'rgb(4,41,84)' } : { backgroundColor: '#16a34a' }}>
                            {isSelected ? '✓ Selected' : 'Ready'}
                          </span>
                        ) : (
                          <span className="text-sm bg-gray-100 text-gray-400 px-2 py-0.5 rounded">No Data</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t flex justify-end">
              <Pagination current={page} pageSize={limit} total={students.length}
                onChange={setPage} showSizeChanger={false} size="small" />
            </div>
          </div>

          {/* Hidden printable marksheets */}
          <div className="hidden print:block" ref={printRef}>
            {selectedMarksheets.map((item, i) => (
              <div key={item.student._id} className={i < selectedMarksheets.length - 1 ? 'page-break' : ''}>
                <Marksheet data={item.data} currentSession={currentSession} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default PrintClassWiseTab
