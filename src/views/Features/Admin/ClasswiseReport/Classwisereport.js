/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Trophy, Filter } from 'lucide-react'
import { Select, Button, Empty, Avatar } from 'antd'
import { getRequest } from '../../../../Helpers'
import ExportButton from '../../../ExportExcelButton'
import { SessionContext } from '../../../../Context/Seesion'
import Loader from '../../../../components/Loading/Loader'

const { Option } = Select

const ClasswiseReport = () => {
  const { currentSession } = useContext(SessionContext)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const [isApplied, setIsApplied] = useState(false)

  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [exams, setExams] = useState([])

  const [top3, setTop3] = useState([])

  /* ================= FILTER STATE ================= */

  const [draftFilters, setDraftFilters] = useState({
    sessionId: null,
    classId: null,
    sectionId: null,
    examListId: null,
  })

  const [appliedFilters, setAppliedFilters] = useState({
    sessionId: null,
    classId: null,
    sectionId: null,
    examListId: null,
  })

  /* ================= SESSION SET ================= */

  useEffect(() => {
    if (!currentSession?._id) return

    const base = {
      sessionId: currentSession._id,
      classId: null,
      sectionId: null,
      examListId: null,
    }

    setDraftFilters(base)
    setAppliedFilters(base)
  }, [currentSession])

  useEffect(() => {
    if (!appliedFilters.sessionId) return

    fetchReport(appliedFilters)
  }, [appliedFilters])
  /* ================= LOAD CLASSES ================= */

  useEffect(() => {
    if (!currentSession?._id) return

    getRequest(`classes?session=${currentSession?._id}&isPagination=false`)
      .then((res) => setClasses(res?.data?.data?.classes || []))
      .catch(() => console.error('Failed to load classes'))
  }, [currentSession])

  /* ================= LOAD SECTIONS ================= */

  useEffect(() => {
    if (!draftFilters.classId) {
      setSections([])
      return
    }

    getRequest(`sections?classId=${draftFilters.classId}`)
      .then((res) => setSections(res?.data?.data?.sections || []))
      .catch(() => console.error('Failed to load sections'))
  }, [draftFilters.classId])

  /* ================= LOAD EXAMS ================= */

  /* ================= LOAD EXAMS ================= */

  useEffect(() => {
    if (!currentSession?._id || !draftFilters.classId) return

    getRequest(
      `examsList?page=1&limit=100&sessionId=${currentSession._id}&classId=${draftFilters.classId}`,
    )
      .then((res) => {
        console.log('EXAM LIST RESPONSE =>', res?.data?.data?.examLists)

        setExams(res?.data?.data?.examLists || [])
      })
      .catch(() => console.error('Failed to load exams'))
  }, [currentSession, draftFilters.classId])

  /* ================= FETCH REPORT ================= */

  const fetchReport = async (filters) => {
    try {
      setLoading(true)

      const params = {
        sessionId: filters.sessionId,
        classId: filters.classId,
        sectionId: filters.sectionId,
        examListId: filters.examListId,
      }

      Object.keys(params).forEach((k) => params[k] == null && delete params[k])

      const query = new URLSearchParams(params).toString()

      const res = await getRequest(`marks/class-wise-topper?${query}`)

      setData(res?.data?.data?.toppers || [])
      setTop3(res?.data?.data?.top3 || [])
    } catch (err) {
      console.error(err)
      setData([])
      setTop3([])
    } finally {
      setLoading(false)
    }
  }

  //   useEffect(() => {
  //     if (!appliedFilters.sessionId) return
  //     fetchReport(appliedFilters)
  //   }, [appliedFilters])

  /* ================= HANDLERS ================= */
  const handleApply = async () => {
    setIsApplied(true)

    const updatedFilters = {
      ...draftFilters,
    }

    setAppliedFilters(updatedFilters)

    await fetchReport(updatedFilters)
  }
  const handleClear = () => {
    const reset = {
      sessionId: currentSession?._id || null,
      classId: null,
      sectionId: null,
      examListId: null,
    }

    setIsApplied(false)
    setDraftFilters(reset)
    setAppliedFilters(reset)

    setSections([])
    setData([])
    setTop3([])
  }

  /* ================= EXPORT DATA ================= */

  const visibleData = data.map((item) => ({
    Rank: item.rank,
    'Student Name': item.student?.name || '-',
    Roll: item.student?.rollNumber || '-',
    Class: item.class?.className || '-',
    Section: item.section?.sectionName || '-',
    Percentage: item.percentage || '-',
    'Obtained Marks': item.totalObtainedMarks || '-',
    'Total Marks': item.totalMarks || '-',
    Result: item.result || '-',
  }))

  return (
    <div className="min-h-screen">
      {/* ================= HEADER ================= */}

      <div className="bg-white border rounded-xl px-4 py-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0c3b73] flex items-center gap-2">
              🏆 Class Wise Topper Report
            </h1>

            <p className="text-gray-500 text-sm mt-1">View class toppers and rankings</p>
          </div>

          <ExportButton
            data={visibleData}
            fileName="ClassWiseTopperReport.xlsx"
            sheetName="Class Wise Topper"
          />
        </div>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="bg-white rounded border p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-orange-500" />

          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {/* CLASS */}

          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-600">Class</label>

            <Select
              allowClear
              placeholder="Select Class"
              className="w-[220px]"
              value={draftFilters.classId}
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
            <label className="text-sm mb-1 text-gray-600">Section</label>

            <Select
              allowClear
              placeholder="Select Section"
              className="w-[220px]"
              value={draftFilters.sectionId}
              disabled={!draftFilters.classId}
              onChange={(value) =>
                setDraftFilters((p) => ({
                  ...p,
                  sectionId: value,
                }))
              }
            >
              {sections.map((sec) => (
                <Option key={sec._id} value={sec._id}>
                  {sec.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* EXAM */}

          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-600">Exam</label>

            <Select
              allowClear
              placeholder="Select Exam"
              className="w-[220px]"
              value={draftFilters.examListId}
              onChange={(value) =>
                setDraftFilters((p) => ({
                  ...p,
                  examListId: value,
                }))
              }
            >
              {exams.map((exam) => (
                <Option key={exam._id} value={exam._id}>
                  {exam?.examMaster?.examName || 'Exam'}
                </Option>
              ))}
            </Select>
          </div>

          {/* APPLY */}

          <Button loading={loading} className="bg-[#0c3b73] text-white" onClick={handleApply}>
            Apply
          </Button>

          {/* CLEAR */}

          {isApplied && <Button onClick={handleClear}>Clear</Button>}
        </div>
      </div>

      {/* ================= TOP 3 ================= */}

      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {top3.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-[#0c3b73] to-[#124d94] text-white rounded-2xl p-5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">
                    {index === 0
                      ? '🥇 1st Topper'
                      : index === 1
                        ? '🥈 2nd Topper'
                        : '🥉 3rd Topper'}
                  </p>

                  <h2 className="text-xl font-bold mt-1">{item.student?.name}</h2>

                  <p className="text-sm mt-1">Roll : {item.student?.rollNumber}</p>

                  <p className="text-lg font-bold mt-2">{item.percentage}%</p>
                </div>

                <Avatar size={70} src={item.student?.profilePic}>
                  {item.student?.name?.charAt(0)}
                </Avatar>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TABLE ================= */}

      <div className="relative bg-white border rounded-xl overflow-x-auto shadow-sm">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-50">
            <Loader />
          </div>
        )}

        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              {/* SR NO */}

              <th className="py-3 px-3 text-center">Sr. No.</th>

              {/* RANK */}

              <th className="text-center">Student</th>

              <th className="text-center">Roll No.</th>

              <th className="text-center">Class</th>

              <th className="text-center">Section</th>

              <th className="text-center">Obtained</th>

              <th className="text-center">Total</th>
              <th className="py-3 px-3 text-center">Rank</th>
              <th className="text-center">Percentage</th>

              <th className="text-center">Result</th>
            </tr>
          </thead>

          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-8 text-center">
                  <Empty description="No Topper Data Found" />
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="border-b hover:bg-blue-50 transition-all">
                  {/* SR NO */}

                  <td className="text-center py-3 font-medium">{index + 1}</td>

                  {/* RANK */}

                  <td className="text-center font-semibold">{item.student?.name}</td>

                  <td className="text-center">{item.student?.rollNumber}</td>

                  <td className="text-center">{item.class?.className}</td>

                  <td className="text-center">{item.section?.sectionName}</td>

                  <td className="text-center font-medium">{item.totalObtainedMarks}</td>

                  <td className="text-center">{item.totalMarks}</td>
                  <td className="text-center py-3 font-bold">{item.rank}</td>
                  <td className="text-center font-bold text-[#0c3b73]">{item.percentage}%</td>

                  <td
                    className={`text-center font-semibold ${
                      item.result === 'PASS' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {item.result}
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

export default ClasswiseReport
