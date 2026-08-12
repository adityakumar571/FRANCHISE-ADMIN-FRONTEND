/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Select, Button, Empty } from 'antd'
import { Filter, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { getRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'

const { Option } = Select

const THRESHOLDS = [90, 80, 70, 60, 50, 40, 33]

const ResultAnalysis = () => {
  const { currentSession } = useContext(SessionContext)

  const [exams, setExams] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)

  const [examMasterId, setExamMasterId] = useState(null)
  const [fromClassId, setFromClassId] = useState(null)
  const [toClassId, setToClassId] = useState(null)

  const [list, setList] = useState([])
  const [grandTotal, setGrandTotal] = useState(null)
  const [isApplied, setIsApplied] = useState(false)

  // Load exams
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`exams?session=${currentSession._id}&isPagination=false`)
      .then((res) => setExams(res?.data?.data?.exams || res?.data?.data || []))
      .catch(() => {})
  }, [currentSession])

  // Load classes
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?session=${currentSession._id}&isPagination=false`)
      .then((res) => setClasses(res?.data?.data?.classes || []))
      .catch(() => {})
  }, [currentSession])

  const handleShow = async () => {
    if (!currentSession?._id || !examMasterId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ sessionId: currentSession._id, examMasterId })
      if (fromClassId) params.append('fromClassId', fromClassId)
      if (toClassId) params.append('toClassId', toClassId)

      const res = await getRequest(`reports/result-analysis?${params.toString()}`)
      setList(res?.data?.data?.list || [])
      setGrandTotal(res?.data?.data?.grandTotal || null)
      setIsApplied(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setExamMasterId(null)
    setFromClassId(null)
    setToClassId(null)
    setList([])
    setGrandTotal(null)
    setIsApplied(false)
  }

  const handleExcel = () => {
    if (!list.length) return
    const rows = list.map((r, i) => ({
      'S.No': i + 1,
      Class: r.className,
      Sec: r.sectionName,
      'Total Student': r.totalStudents,
      'Passed Student': r.passedStudents,
      'Passed (%)': r.passedPct,
      'Above 90%': r.above90,
      'Above 80%': r.above80,
      'Above 70%': r.above70,
      'Above 60%': r.above60,
      'Above 50%': r.above50,
      'Above 40%': r.above40,
      'Above 33%': r.above33,
    }))
    if (grandTotal) {
      rows.push({
        'S.No': '',
        Class: 'GRAND TOTAL',
        Sec: '',
        'Total Student': grandTotal.totalStudents,
        'Passed Student': grandTotal.passedStudents,
        'Passed (%)': grandTotal.passedPct,
        'Above 90%': grandTotal.above90,
        'Above 80%': grandTotal.above80,
        'Above 70%': grandTotal.above70,
        'Above 60%': grandTotal.above60,
        'Above 50%': grandTotal.above50,
        'Above 40%': grandTotal.above40,
        'Above 33%': grandTotal.above33,
      })
    }
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Result Analysis')
    XLSX.writeFile(wb, 'ResultAnalysis.xlsx')
  }

  const examName = exams.find((e) => e._id === examMasterId)?.examName || ''

  return (
    <div className="min-h-screen p-2">
      {/* Title */}
      <div
        className="text-center font-bold text-white py-2 mb-4 rounded"
        style={{ background: '#0c3b73', fontSize: 15 }}
      >
        RESULT ANALYSIS
        {examName ? ` OF ${examName.toUpperCase()}` : ''}
        {currentSession?.name ? `  —  ${currentSession.name}` : ''}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-3 mb-4">
        <div className="flex items-center gap-1 mb-3">
          <Filter className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-gray-700">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          {/* Exam */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Select Exam</label>
            <Select
              placeholder="Select Exam"
              value={examMasterId}
              className="w-[180px]"
              onChange={setExamMasterId}
              allowClear
            >
              {exams.map((e) => (
                <Option key={e._id} value={e._id}>{e.examName}</Option>
              ))}
            </Select>
          </div>

          {/* From Class */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">From Class</label>
            <Select
              placeholder="From Class"
              value={fromClassId}
              className="w-[150px]"
              onChange={setFromClassId}
              allowClear
            >
              {classes.map((c) => (
                <Option key={c._id} value={c._id}>{c.name}</Option>
              ))}
            </Select>
          </div>

          {/* To Class */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">To Class</label>
            <Select
              placeholder="To Class"
              value={toClassId}
              className="w-[150px]"
              onChange={setToClassId}
              allowClear
            >
              {classes.map((c) => (
                <Option key={c._id} value={c._id}>{c.name}</Option>
              ))}
            </Select>
          </div>

          <Button
            type="primary"
            loading={loading}
            style={{ background: '#0c3b73' }}
            onClick={handleShow}
            disabled={!examMasterId}
          >
            Show
          </Button>

          {isApplied && (
            <Button
              icon={<Download className="w-4 h-4" />}
              onClick={handleExcel}
              style={{ borderColor: '#16a34a', color: '#16a34a' }}
            >
              Excel
            </Button>
          )}

          {isApplied && <Button onClick={handleClear}>Close</Button>}
        </div>
      </div>

      {/* Table */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10">
            <Loader />
          </div>
        )}

        {!loading && isApplied && list.length === 0 ? (
          <div className="py-10 flex justify-center">
            <Empty description="No Records Found" />
          </div>
        ) : (
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: '#0c3b73', color: '#fff' }}>
                <th className="border border-blue-900 px-2 py-2 text-center">S.No</th>
                <th className="border border-blue-900 px-2 py-2 text-left">Class</th>
                <th className="border border-blue-900 px-2 py-2 text-center">Sec.</th>
                <th className="border border-blue-900 px-2 py-2 text-center">Total<br />Student</th>
                <th className="border border-blue-900 px-2 py-2 text-center">Passed<br />Student</th>
                <th className="border border-blue-900 px-2 py-2 text-center">Passed<br />(%)</th>
                {THRESHOLDS.map((t) => (
                  <th key={t} className="border border-blue-900 px-2 py-2 text-center">
                    Student With<br />Above {t}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((row, i) => (
                <tr
                  key={i}
                  style={{ background: i % 2 === 0 ? '#dbeafe' : '#fff' }}
                >
                  <td className="border border-blue-200 px-2 py-1 text-center">{i + 1}</td>
                  <td className="border border-blue-200 px-2 py-1 font-medium">{row.className}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{row.sectionName}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{row.totalStudents}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{row.passedStudents}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{row.passedPct}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{row.above90}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{row.above80}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{row.above70}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{row.above60}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{row.above50}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{row.above40}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{row.above33}</td>
                </tr>
              ))}

              {/* Grand Total */}
              {grandTotal && list.length > 0 && (
                <tr style={{ background: '#fef9c3', fontWeight: 700 }}>
                  <td className="border border-blue-200 px-2 py-1" colSpan={3} style={{ textAlign: 'center' }}>
                    GRAND TOTAL
                  </td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{grandTotal.totalStudents}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{grandTotal.passedStudents}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{grandTotal.passedPct}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{grandTotal.above90}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{grandTotal.above80}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{grandTotal.above70}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{grandTotal.above60}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{grandTotal.above50}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{grandTotal.above40}</td>
                  <td className="border border-blue-200 px-2 py-1 text-center">{grandTotal.above33}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ResultAnalysis
