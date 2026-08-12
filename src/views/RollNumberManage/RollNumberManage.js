/* eslint-disable prettier/prettier */
import React, { use, useEffect, useState } from 'react'
import { GraduationCap, Users } from 'lucide-react'
import { getRequest, postRequest } from '../../Helpers'
import { useContext } from 'react'
import { SessionContext } from '../../Context/Seesion'
import toast from 'react-hot-toast'
import Loader from '../../components/Loading/Loader'
import { Pagination } from 'antd'

const RollNumberManage = () => {
  const [classList, setClassList] = useState([])
  const [sectionList, setSectionList] = useState([])
  const [students, setStudents] = useState([])
  const [session, setSession] = useState('')
  const [currentClass, setCurrentClass] = useState('')
  const [currentSection, setCurrentSection] = useState('')
  const [type, setType] = useState('')
  const [isApplied, setIsApplied] = useState(false)
  const [manualRolls, setManualRolls] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [streamList, setStreamList] = useState([])
  const [stream, setStream] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const { currentSession, sessionsList, loading } = useContext(SessionContext)
  const selectedClassObj = classList.find((c) => c._id === currentClass)
  const isStreamClass = selectedClassObj?.isSenior || false
  const [generateInfo, setGenerateInfo] = useState(null)
  // Note: generateInfo kept for backward compatibility but pagination now uses total/page states
  useEffect(() => {
    // console.log('Sessions List:', sessionsList)
    // console.log('Current Session:', currentSession)
  }, [sessionsList, currentSession])

  /* ---------------- LOAD CLASSES ---------------- */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?session=${currentSession?._id}&isPagination=false`)
      .then((res) => setClassList(res.data?.data?.classes || []))
      .catch(console.error)
  }, [currentSession])

  /* ---------------- LOAD SECTIONS (CLASS WISE) ---------------- */
  useEffect(() => {
    if (!currentClass) {
      setSectionList([])
      return
    }
    getRequest(`sections?classId=${currentClass}&isPagination=false`)
      .then((res) => setSectionList(res.data?.data?.sections || []))
      .catch(console.error)
  }, [currentClass])

  /* ---------------- LOAD STREAMS (CLASS WISE) ---------------- */
  useEffect(() => {
    if (!currentClass) {
      setStreamList([])
      return
    }
    getRequest(`streams?classId=${currentClass}&isPagination=false`)
      .then((res) => setStreamList(res.data?.data?.streams || []))
      .catch(console.error)
  }, [currentClass])

  useEffect(() => {
    if (!isStreamClass) {
      setStream(null)
    }
  }, [currentClass, isStreamClass])

  const handleReset = () => {
    setCurrentClass('')
    setCurrentSection('')
    setStream(null)
    // setType('ascending')
    setType()
    setStudents([])
    setIsApplied(false)
    setManualRolls({})
    setGenerateInfo(null)
    setPage(1)
    setTotal(0)
  }
  useEffect(() => {
    if (type === 'manual' && students.length > 0) {
      const rolls = {}
      students.forEach((s) => {
        rolls[s._id] = s.rollNumber || ''
      })
      setManualRolls(rolls)
    }
  }, [type, students])

  /* ---------------- APPLY FILTER ---------------- */
  const handleApply = () => {
    if (!currentClass || !currentSection) {
      toast.error('Please select Class and Section')
      return
    }
    setIsLoading(true) // ✅ START LOADER

    let url = `studentEnrollment?isPagination=true&session=${currentSession._id}&currentClass=${currentClass}&currentSection=${currentSection}&type=${type}&page=${page}&limit=${limit}`

    if (stream) {
      url += `&stream=${stream}`
    }

    getRequest(url)
      .then((res) => {
        const studentList = res.data?.data?.students || []
        setStudents(studentList)
        setTotal(res.data?.data?.pagination?.totalRows || studentList.length)
        setIsApplied(true)
        if (type === 'manual') {
          // Manual me prefill roll numbers
          const rolls = {}
          studentList.forEach((s) => {
            rolls[s._id] = s.rollNumber || ''
          })
          setManualRolls(rolls)
        }

        if (studentList.length === 0) {
          toast.error('Student not found')
        }
      })
      .catch((err) => {
        console.error(err)
        toast.error(err?.response?.data?.message || 'Error fetching students')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleGenerateRollNo = async () => {
    if (!currentClass || !currentSection) {
      toast.error('Class and Section required')
      return
    }
    setIsGenerating(true)

    try {
      const payload = {
        session: currentSession?._id,
        currentClass,
        currentSection,
        stream,
      }

      const res = await postRequest({
        url: 'studentEnrollment/assignRollNumbersByName',
        cred: payload,
      })

      if (res.data?.success) {
        toast.success(res.data?.message || 'Roll numbers generated')
        // ✅ yaha store karo totalStudents
        setGenerateInfo({
          type: 'ascending',
          count: res.data?.data?.totalStudents || 0,
        })
        handleApply()
      } else {
        toast.error(res.data?.message || 'Failed to generate roll numbers')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error generating roll numbers')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleManualGenerate = async () => {
    if (!currentClass || !currentSection) {
      toast.error('Class and Section required')
      return
    }

    setIsGenerating(true)

    try {
      const studentsPayload = students
        .filter((s) => manualRolls[s._id])
        .map((s) => ({
          studentId: s._id,
          rollNumber: Number(manualRolls[s._id]),
        }))

      if (studentsPayload.length === 0) {
        toast.error('Please enter roll numbers')
        return
      }

      const payload = {
        session: currentSession?._id,
        currentClass,
        currentSection,
        students: studentsPayload,
        stream,
      }

      const res = await postRequest({
        url: 'studentEnrollment/assignBulkManualRollNumbers',
        cred: payload,
      })

      if (res.data?.success) {
        toast.success(res.data?.message || 'Roll numbers updated')
        // ✅ yaha store karo totalUpdated
        setGenerateInfo({
          type: 'manual',
          count: res.data?.data?.totalUpdated || 0,
        })
        // ✅ Fresh student API recall
        await handleApply()
      } else {
        toast.error(res.data?.message || 'Failed')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'API error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 py-3 bg-white rounded-lg border mb-6">
        {/* <h1 className="text-lg font-semibold flex items-center gap-2"> */}
        <h1 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2">
          <Users className="text-[#e24028]" size={32} />
          Student Roll No. Generate
        </h1>
        <p className="text-sm text-gray-500 mb-0">Generate Roll Numbers</p>
      </div>

      <div className="bg-white rounded border p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-sm font-semibold">Class</label>
            <select
              value={currentClass}
              onChange={(e) => setCurrentClass(e.target.value)}
              className="w-full text-sm border px-3 py-2 rounded"
            >
              <option value="">Select</option>
              {classList.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Section</label>
            <select
              value={currentSection}
              onChange={(e) => setCurrentSection(e.target.value)}
              className="w-full text-sm border px-3 py-2 rounded"
              disabled={!currentClass}
            >
              <option value="">Select</option>
              {sectionList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Stream</label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              disabled={!isStreamClass}
              className={`w-full text-sm border px-3 py-2 rounded ${
                !isStreamClass ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Select</option>
              {streamList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* TYPE */}
          <div>
            <label className="text-sm font-semibold">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-sm border px-3 py-2 rounded"
            >
              <option value="">Select Type</option>
              <option value="ascending">Ascending Order</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {/* APPLY */}
          <div className="flex flex-col sm:flex-row gap-2">
            {' '}
            <button
              onClick={handleApply}
              className="w-full bg-[#0c3b73] text-white text-sm px-4 py-2 rounded hover:bg-blue-800"
            >
              Apply
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-gray-500 text-white text-sm px-4 py-2 rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded border p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
            <Loader />
            <p className="mt-2 text-sm font-medium">Loading Student Data ....</p>
          </div>
        )}

        {!isApplied && (
          <div className="flex flex-col justify-center items-center py-20">
            <span className="text-gray-500 text-sm">Please Select class, section & stream</span>
            <GraduationCap className="w-16 h-16 text-gray-300 mb-2" />
            <span className="text-gray-500 text-sm">No students found</span>
          </div>
        )}

        {isApplied && (
          <>
            {students.length === 0 ? (
              <p className="text-center text-red-500 py-10">No students found</p>
            ) : (
              <>
                <div className="w-full overflow-x-auto">
                  <table className="min-w-[900px] w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-3 py-2">Student ID</th>
                        <th className="border px-3 py-2">Name</th>
                        <th className="border px-3 py-2">Father Name</th>
                        <th className="border px-3 py-2">Class</th>
                        <th className="border px-3 py-2">Section</th>
                        <th className="border px-3 py-2">Stream</th>
                        <th className="border px-3 py-2">Roll No</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s._id}>
                          <td className="border px-3 py-2">{s.studentId || '-'}</td>
                          <td className="border px-3 py-2">
                            {s.firstName} {s.middleName || ''} {s.lastName}
                          </td>
                          <td className="border px-3 py-2">{s.fatherName || '-'}</td>
                          <td className="border px-3 py-2">{s.currentClass?.name || '-'}</td>
                          <td className="border px-3 py-2">{s.currentSection?.name || '-'}</td>
                          <td className="border px-3 py-2">{s.stream?.name || '-'}</td>
                          <td className="border px-3 py-2 text-center">
                            {type === 'manual' ? (
                              <input
                                type="number"
                                min={1}
                                value={manualRolls[s._id] || ''}
                                onChange={(e) => {
                                  const val = e.target.value
                                  if (/^\d*$/.test(val)) {
                                    setManualRolls((prev) => ({
                                      ...prev,
                                      [s._id]: val,
                                    }))
                                  }
                                }}
                                className="w-20 border rounded px-2 py-1 text-center"
                              />
                            ) : (
                              s.rollNumber || '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 overflow-x-auto">
                  <button
                    onClick={type === 'manual' ? handleManualGenerate : handleGenerateRollNo}
                    disabled={isGenerating}
                    className={`w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 rounded transition-all text-sm sm:text-base
    ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
  `}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Roll No'}
                  </button>

                  {total > 0 && (
                    <Pagination
                      current={page}
                      pageSize={limit}
                      total={total}
                      showSizeChanger
                      pageSizeOptions={['10', '20', '50', '100']}
                      onChange={(p) => { setPage(p); setIsApplied(false) }}
                      onShowSizeChange={(_, size) => { setLimit(size); setPage(1); setIsApplied(false) }}
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default RollNumberManage
