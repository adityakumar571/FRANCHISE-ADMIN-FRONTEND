/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { Layers, Download, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { getRequest } from '../../Helpers'
import AppTable, { Td } from '../../components/AppTable'
import { SessionContext } from '../../Context/Seesion'

const Performance = () => {
  const { currentSession } = useContext(SessionContext)

  /* ---------------- FILTER ---------------- */
  const [tempClassId, setTempClassId] = useState('')
  const [tempStreamId, setTempStreamId] = useState('')
  const [tempSectionId, setTempSectionId] = useState('')

  const [classId, setClassId] = useState('')
  const [streamId, setStreamId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [isApplied, setIsApplied] = useState(false)

  /* ---------------- DATA ---------------- */
  const [data, setData] = useState({})
  const [classes, setClasses] = useState([])
  const [streams, setStreams] = useState([])
  const [sections, setSections] = useState([])

  const [loading, setLoading] = useState(false)

  /* ---------------- TAB ---------------- */
  const [activeTab, setActiveTab] = useState('top')

  const tabs = [
    { key: 'top', label: 'Topper Student' },
    { key: 'bottom', label: 'Average Student' },
    { key: 'ranking', label: 'Class Ranking' },
  ]

  /* ---------------- PAGINATION ---------------- */
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    if (!currentSession?._id) return

    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((res) => setClasses(res?.data?.data?.classes || []))
      .catch(() => toast.error('Failed to load classes'))
  }, [currentSession])

  /* ================= STREAM ================= */
  useEffect(() => {
    if (!tempClassId) return
    getRequest(`streams?classId=${tempClassId}`).then((res) =>
      setStreams(res?.data?.data?.streams || []),
    )
  }, [tempClassId])

  /* ================= SECTION ================= */
  useEffect(() => {
    if (!tempClassId) return
    getRequest(`sections?classId=${tempClassId}`).then((res) =>
      setSections(res?.data?.data?.sections || []),
    )
  }, [tempClassId])

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!isApplied || !classId || !currentSession?._id) return

    setLoading(true)

    const params = new URLSearchParams({
      sessionId: currentSession._id,
      classId,
    })

    if (streamId) params.append('streamId', streamId)
    if (sectionId) params.append('sectionId', sectionId)

    getRequest(`reports/performance?${params.toString()}`)
      .then((res) => setData(res?.data?.data || {}))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false))
  }, [isApplied, classId, streamId, sectionId, currentSession])

  /* ================= APPLY ================= */
  const applyFilter = () => {
    if (!tempClassId) return toast.error('Select Class')

    setClassId(tempClassId)
    setStreamId(tempStreamId)
    setSectionId(tempSectionId)
    setIsApplied(true)
    setPage(1)
  }

  const clearFilter = () => {
    setTempClassId('')
    setTempStreamId('')
    setTempSectionId('')
    setIsApplied(false)
    setData({})
    setPage(1)
  }

  /* ================= TAB DATA ================= */
  const getActiveData = () => {
    if (activeTab === 'top') return data?.topStudents || []
    if (activeTab === 'bottom') return data?.bottomStudents || []
    return data?.classRanking || []
  }

  const tableData = getActiveData()
  const paginatedData = tableData.slice((page - 1) * limit, page * limit)

  /* ================= EXPORT ================= */
  const exportExcel = () => {
    const wb = XLSX.utils.book_new()

    let exportData = []
    let sheetName = ''

    if (activeTab === 'top') {
      exportData = data?.topStudents || []
      sheetName = 'Topper Students'
    } else if (activeTab === 'bottom') {
      exportData = data?.bottomStudents || []
      sheetName = 'Average Students'
    } else {
      exportData = data?.classRanking || []
      sheetName = 'Class Ranking'
    }

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportData), sheetName)
    XLSX.writeFile(wb, `${sheetName}.xlsx`)
  }

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="bg-white rounded-lg border px-4 py-3 mb-6 flex items-center">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="text-[#e24028]" />
            Performance Report
          </h1>
        </div>

        {isApplied && tableData.length > 0 && (
          <div className="ml-auto">
            <button
              onClick={exportExcel}
              className="bg-[#0c3b73] text-white px-4 py-2 flex items-center gap-2 rounded"
            >
              <Download size={16} /> Export
            </button>
          </div>
        )}
      </div>

      {/* FILTER */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters & Search</h3>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
          {/* CLASS */}
          <div className="w-full sm:w-48">
            <label className="block text-sm mb-1">Class</label>
            <select
              value={tempClassId}
              onChange={(e) => setTempClassId(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* SECTION */}
          <div className="w-full sm:w-48">
            <label className="block text-sm mb-1">Section</label>
            <select
              value={tempSectionId}
              onChange={(e) => setTempSectionId(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* STREAM */}
          <div className="w-full sm:w-48">
            <label className="block text-sm mb-1">Stream</label>
            <select
              value={tempStreamId}
              onChange={(e) => setTempStreamId(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select Stream</option>
              {streams.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button onClick={applyFilter} className="bg-[#0c3b73] text-white px-6 py-2 rounded">
            Apply
          </button>

          <button onClick={clearFilter} className="bg-gray-500 text-white px-6 py-2 rounded">
            Reset
          </button>
        </div>
      </div>

      {/* TABS */}
      {isApplied && (
        <div className="bg-white border rounded mb-4 flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                setPage(1)
              }}
              className={`flex-1 py-3 text-sm font-semibold ${
                activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      {loading && <div className="flex justify-center py-4"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}
      {/* TABLE */}
      <AppTable
        columns={
          activeTab === 'ranking'
            ? [
                { key: 'sr', label: 'Sr. No.', align: 'center', width: 80 },
                { key: 'class', label: 'Class', align: 'center', width: 160 },
                { key: 'avg', label: 'Avg %', align: 'center', width: 120 },
              ]
            : [
                { key: 'sr', label: 'Sr. No.', align: 'center', width: 80 },
                { key: 'id', label: 'Student ID', align: 'center', width: 140 },
                { key: 'name', label: 'Student Name', align: 'left', width: 200 },
                { key: 'pct', label: 'Percentage', align: 'center', width: 120 },
              ]
        }
        data={isApplied ? paginatedData : []}
        loading={loading}
        emptyText={!isApplied ? 'Please select a class to view data' : 'No records found'}
        page={page}
        limit={limit}
        total={tableData.length}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => { setLimit(size); setPage(1) }}
        rowKey={(_, i) => i}
      >
        {(item, index) => (
          <>
            <Td align="center">{(page - 1) * limit + index + 1}</Td>
            {activeTab === 'ranking' ? (
              <>
                <Td align="center">{item?.classId?.name || 'Class'}</Td>
                <Td align="center" className="text-blue-600 font-semibold">{item.avgPercentage}%</Td>
              </>
            ) : (
              <>
                <Td align="center">{item.studentId}</Td>
                <Td>{item.name}</Td>
                <Td
                  align="center"
                  className={`font-semibold ${activeTab === 'top' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {item.percentage}%
                </Td>
              </>
            )}
          </>
        )}
      </AppTable>
    </div>
  )
}

export default Performance
