/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Filter } from 'lucide-react'
import { Select, Button, Empty } from 'antd'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'
import ExportButton from '../../../../ExportExcelButton'

const { Option } = Select

const ExamReport = () => {
  const { currentSession } = useContext(SessionContext)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const [isApplied, setIsApplied] = useState(false)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])

  /* ================= FILTER STATE ================= */

  const [draftFilters, setDraftFilters] = useState({
    sessionId: null,
    classId: null,
    sectionId: null,
  })

  const [appliedFilters, setAppliedFilters] = useState({
    sessionId: null,
    classId: null,
    sectionId: null,
  })

  /* ---------------- SESSION SET ---------------- */

  useEffect(() => {
    if (!currentSession?._id) return

    const base = {
      sessionId: currentSession._id,
      classId: null,
      sectionId: null,
    }

    setDraftFilters(base)
    setAppliedFilters(base)
  }, [currentSession])

  /* ---------------- LOAD CLASSES ---------------- */

  useEffect(() => {
    if (!currentSession?._id) return

    getRequest(`classes?session=${currentSession?._id}&isPagination=false`)
      .then((res) => setClasses(res?.data?.data?.classes || []))
      .catch(() => console.error('Failed to load classes'))
  }, [currentSession])

  /* ---------------- LOAD SECTIONS ---------------- */

  useEffect(() => {
    if (!draftFilters.classId) {
      setSections([])
      return
    }

    getRequest(`sections?classId=${draftFilters.classId}`)
      .then((res) => setSections(res?.data?.data?.sections || []))
      .catch(() => console.error('Failed to load sections'))
  }, [draftFilters.classId])

  /* ---------------- FETCH REPORT ---------------- */

  const fetchReport = async (filters) => {
    try {
      setLoading(true)

      const params = {
        sessionId: filters.sessionId,
        classId: filters.classId,
        sectionId: filters.sectionId,
      }

      Object.keys(params).forEach((k) => params[k] == null && delete params[k])

      const query = new URLSearchParams(params).toString()

      const res = await getRequest(`reports/exam-report?${query}`)

      setData(res?.data?.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!appliedFilters.sessionId) return
    fetchReport(appliedFilters)
  }, [appliedFilters])

  /* ---------------- HANDLERS ---------------- */

  const handleApply = () => {
    setIsApplied(true)
    setAppliedFilters({ ...draftFilters })
  }

  const handleClear = () => {
    const reset = {
      sessionId: currentSession?._id || null,
      classId: null,
      sectionId: null,
    }

    setIsApplied(false)
    setDraftFilters(reset)
    setAppliedFilters(reset)
    setSections([])
  }

  /* ================= EXPORT DATA ================= */

  const visibleData = data.map((item, index) => ({
    'Sr. No.': index + 1,
    'Student Name': item.studentName || '-',
    Section: item.sectionName || '-',
    Exams: Object.entries(item.exams || {})
      .map(([name, marks]) => `${name} (${marks}%)`)
      .join(', '),
    'Overall %': item.overallPercentage ?? '-',
    Present: item.totalPresent ?? '-',
    'Total Days': item.totalDays ?? '-',
    'Attendance %': item.attendancePercentage ?? '-',
  }))

  return (
    <div className="min-h-screen">
      
      {/* HEADER */}
      <div className="bg-white border rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">📊 Exam Report</h1>
            <p className="text-sm text-gray-500">
              Students exam performance & attendance
            </p>
          </div>

          <ExportButton
            data={visibleData}
            fileName="ExamReport.xlsx"
            sheetName="Exam Report"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
        </div>

        <div className="flex gap-4 items-end flex-wrap">
          
          {/* CLASS */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Class</label>
            <Select
              allowClear
              placeholder="Select Class"
              value={draftFilters.classId}
              className="w-[220px]"
              onChange={(value) =>
                setDraftFilters((p) => ({
                  ...p,
                  classId: value,
                  sectionId: null,
                }))
              }
            >
              {classes.map((cls) => (
                <Option key={cls._id} value={cls._id}>
                  {cls.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* SECTION */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Section</label>
            <Select
              allowClear
              placeholder="Select Section"
              value={draftFilters.sectionId}
              className="w-[220px]"
              onChange={(value) =>
                setDraftFilters((p) => ({ ...p, sectionId: value }))
              }
              disabled={!draftFilters.classId}
            >
              {sections.map((sec) => (
                <Option key={sec._id} value={sec._id}>
                  {sec.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* APPLY */}
          <Button
            loading={loading}
            className="bg-[#0c3b73] text-white"
            onClick={handleApply}
          >
            Apply
          </Button>

          {/* CLEAR */}
          {isApplied && <Button onClick={handleClear}>Clear</Button>}
        </div>
      </div>

      {/* TABLE */}
      <div className="relative bg-white border rounded-lg overflow-x-auto min-h-[300px]">
        
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center">
            <Loader />
          </div>
        )}

        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 text-center">Sr. No.</th>
              <th className="text-center">Student Name</th>
              <th className="text-center">Section</th>
              <th className="text-center">Exams</th>
              <th className="text-center">Overall %</th>
              <th className="text-center">Present</th>
              <th className="text-center">Total Days</th>
              <th className="text-center">Attendance %</th>
            </tr>
          </thead>

          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6">
                  <Empty description="No Records Found" />
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="text-center py-2">{index + 1}</td>

                  <td className="text-center font-semibold">
                    {item.studentName}
                  </td>

                  <td className="text-center">{item.sectionName}</td>

                  <td className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      {Object.entries(item.exams || {}).map(([name, marks], i) => (
                        <span key={i}>
                          {name} ({marks}%)
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="text-center font-semibold">
                    {item.overallPercentage}%
                  </td>

                  <td className="text-center">{item.totalPresent}</td>

                  <td className="text-center">{item.totalDays}</td>

                  <td className="text-center font-medium">
                    {item.attendancePercentage}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
    </div>
  )
}

export default ExamReport
