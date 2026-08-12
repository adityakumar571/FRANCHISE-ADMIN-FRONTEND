/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Users, ArrowRight, ArrowRightCircle } from 'lucide-react'
import { getRequest, postRequest } from '../../Helpers'
import { SessionContext } from '../../Context/Seesion'
import toast, { Toaster } from 'react-hot-toast'
import { Pagination } from 'antd'

const StudentTransfer = () => {
  /* -------------------- STATES -------------------- */
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0])
  const [isTransferring, setIsTransferring] = useState(false)
const [page, setPage] = useState(1)
const [limit, setLimit] = useState(10)
const [total, setTotal] = useState(0)
  // const [sessionsList, setSessionsList] = useState([])
  const [classesList, setClassesList] = useState([])
  const [sectionsList, setSectionsList] = useState([])
  const [session, setSession] = useState([])
  const [fromClass, setFromClass] = useState('')
  const [fromSection, setFromSection] = useState('')
  const [fromSession, setFromSession] = useState('')
  const [toClass, setToClass] = useState('')
  const [toSection, setToSection] = useState('')
  const [toSession, setToSession] = useState('')
  const [studentList, setStudentList] = useState([])
  const [transferredStudents, setTransferredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const { currentSession, sessionsList, sessionsList1 } = useContext(SessionContext)
  const [fromSectionsList, setFromSectionsList] = useState([])
  const [toSectionsList, setToSectionsList] = useState([])

  const [streamsList, setStreamsList] = useState([])
  const [fromStream, setFromStream] = useState('')
  const [toStream, setToStream] = useState('')
  const [fromStreamsList, setFromStreamsList] = useState([])
  const [toStreamsList, setToStreamsList] = useState([])

  const [fromClassesList, setFromClassesList] = useState([])
const [toClassesList, setToClassesList] = useState([])

  // useEffect(() => {
  //   if (!currentSession?._id) return
  //   getRequest(`classes?session=${currentSession?._id}&isPagination=false`)
  //     .then((res) => setClassesList(res.data?.data?.classes || []))
  //     .catch(console.error)
  // }, [currentSession])

  useEffect(() => {
  if (!fromSession) {
    setFromClassesList([])
    return
  }

  getRequest(`classes?session=${fromSession}&isPagination=false`)
    .then((res) => {
      setFromClassesList(res.data?.data?.classes || [])
    })
    .catch(console.error)
}, [fromSession])

useEffect(() => {
  if (!currentSession?._id) return

  getRequest(`classes?session=${currentSession._id}&isPagination=false`)
    .then((res) => {
      setToClassesList(res.data?.data?.classes || [])
      setToSession(currentSession._id) // auto set current session
    })
    .catch(console.error)
}, [currentSession])

  useEffect(() => {
    if (fromClass) {
      getRequest(`sections?isPagination=false&classId=${fromClass}`)
        .then((res) => {
          setFromSectionsList(res.data?.data?.sections || [])
        })
        .catch(console.error)
    }
  }, [fromClass])

 
  useEffect(() => {
    if (toClass) {
      getRequest(`sections?isPagination=false&classId=${toClass}`)
        .then((res) => {
          setToSectionsList(res.data?.data?.sections || [])
        })
        .catch(console.error)
    }
  }, [toClass])

  useEffect(() => {
    if (!fromClass) {
      setFromStreamsList([])
      setFromStream('')
      return
    }

    const selectedClass = fromClassesList.find((c) => c._id === fromClass)

    if (selectedClass?.isSenior) {
      // <-- use API property instead of static array
      getRequest(`streams?isPagination=false&classId=${fromClass}`)
        .then((res) => {
          setFromStreamsList(res.data?.data?.streams || [])
        })
        .catch(console.error)
    } else {
      setFromStreamsList([])
      setFromStream('')
    }
  }, [fromClass, fromClassesList])

  useEffect(() => {
    if (!toClass) {
      setToStreamsList([])
      setToStream('')
      return
    }

    const selectedClass = toClassesList.find((c) => c._id === toClass)

    if (selectedClass?.isSenior) {
      // <-- use API property instead of static array
      getRequest(`streams?isPagination=false&classId=${toClass}`)
        .then((res) => {
          setToStreamsList(res.data?.data?.streams || [])
        })
        .catch(console.error)
    } else {
      setToStreamsList([])
      setToStream('')
    }
  }, [toClass, toClassesList])

  /* -------------------- LOAD STUDENTS -------------------- */
useEffect(() => {
  if (fromClass && fromSection && fromSession) {
    getRequest(
      `studentEnrollment?page=${page}&limit=${limit}&status=Studying&session=${fromSession}&currentClass=${fromClass}&currentSection=${fromSection}${fromStream ? `&stream=${fromStream}` : ''}`
    )
      .then((res) => {
        const studentsArray = Array.isArray(res.data?.data?.students)
          ? res.data.data.students
          : []
        const filtered = studentsArray.map((s) => ({ ...s, selected: false }))
        setStudentList(filtered)
        setTotal(res.data?.data?.pagination?.totalRows || studentsArray.length)
      })
      .catch(console.error)
  } else {
    setStudentList([])
  }
}, [fromClass, fromSection, fromSession, fromStream, page, limit])

  /* -------------------- STUDENT SELECTION -------------------- */
  const toggleStudent = (id) => {
    setStudentList((prev) => prev.map((s) => (s._id === id ? { ...s, selected: !s.selected } : s)))
  }

  const selectAll = (checked) => {
    setStudentList((prev) => prev.map((s) => ({ ...s, selected: checked })))
  }

  const selectedCount = studentList.filter((s) => s.selected).length

  const filteredStudents = studentList.filter((s) =>
    `${s.firstName} ${s.middleName || ''} ${s.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  )

  /* -------------------- ARROW CLICK -------------------- */
  const handleArrowClick = () => {
    if (!toClass || !toSection || !toSession) {
      toast.error('Select destination class, section & session', 'error')
      return
    }
    const selectedToClass = classesList.find((c) => c._id === toClass)
    if (selectedToClass?.isSenior && !toStream) {
      toast.error('Select Stream', 'error')
      return
    }
    const selected = studentList.filter((s) => s.selected)
    if (!selected.length) {
      toast.error('Select at least one student', 'error')
      return
    }

    const mapped = selected.map((s) => ({
      ...s,
      toClass,
      toSection,
      toSession,
      toStream,
      status: 'PASS',
    }))

    setTransferredStudents((prev) => {
      const ids = prev.map((p) => p._id)
      return [...prev, ...mapped.filter((m) => !ids.includes(m._id))]
    })

    setStudentList((prev) => prev.map((s) => ({ ...s, selected: false })))
    toast.success('Students moved successfully')
  }

  //TRANSFER API
  const handleTransfer = async () => {
    if (!transferredStudents.length) {
      toast.error('No students to transfer', 'error')
      return
    }

    if (!toClass || !toSection) {
      toast.error('Select destination class, section & session', 'error')
      return
    }

    const payload = {
      students: transferredStudents.map((s) => s._id),
      toSession: currentSession._id,
      toClass,
      toSection,
      toStream: toStream || null,
      transferDate,
    }

    setIsTransferring(true)
    postRequest({ url: `studentTransfer`, cred: payload })
      .then((res) => {
        // console.log(res)
        toast.success(res?.data?.message || 'Students transferred successfully')
        // remove transferred from From list
        const transferredIds = transferredStudents.map((s) => s._id)

        // clear TO list
        setTransferredStudents([])
        setToClass('')
        setToSection('')
        setToSession('')
      })
      .catch((err) => {
        console.error(err)
        const errorData = err?.response?.data

        if (errorData?.data?.duplicates?.length) {
          toast.error(errorData.data.duplicates.join('\n'), { duration: 6000 })
        } else {
          toast.error(errorData?.message || 'Transfer failed')
        }
      })
      .finally(() => {
        setIsTransferring(false)
      })
  }

  const handleReset = () => {
    setFromClass('')
    setFromSection('')
    setFromSession('')
    setToClass('')
    setToSection('')
    setToSession('')
    setStudentList([])
    setTransferredStudents([])
    setSearchTerm('')
  }
  const classHierarchy = [
    'Nursery',
    'LKG',
    'UKG',
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
    '9th',
    '10th',
    '11th',
    '12th',
  ]

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded-lg border border-blue-100 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <Users className="text-[#e24028]" size={32} />
            Student Transfer Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 mb-0">
            Transfer students between classes and sections
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Transfer Date</label>
            <input
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              className="text-sm border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* FROM + TO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        {/* ================= TRANSFER FROM ================= */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-200 px-6 py-2">
            <h2 className="font-semibold text-sm text-gray-600">Transfer From</h2>
          </div>

          <div className="p-6">
            <div className="flex gap-3 mb-4">
               <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Session</label>
                <select
                  value={fromSession}
                  onChange={(e) => setFromSession(e.target.value)}
                  className="text-sm border px-4 py-2 rounded-lg w-full bg-white"
                >
                  <option value="">Select Session</option>
                 {sessionsList1
                  .filter((s) => {
                    if (!currentSession?._id) return false

                    const currentIndex = sessionsList1.findIndex(
                      (sess) => sess._id === currentSession._id
                    )

                    const sessionIndex = sessionsList1.findIndex(
                      (sess) => sess._id === s._id
                    )

                    return sessionIndex < currentIndex 
                  })
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.sessionName}
                      {s.isCurrent ? ' (Current)' : ''}
                    </option>
                  ))}
                </select>

              </div>

              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Class</label>
                <select
                  value={fromClass}
                  onChange={(e) => setFromClass(e.target.value)}
                  className="text-sm border px-4 py-2 rounded-lg w-full bg-white"
                >
                  <option value="">Select Class</option>
                  {fromClassesList.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Section</label>
                <select
                  value={fromSection}
                  onChange={(e) => setFromSection(e.target.value)}
                  className="text-sm border px-4 py-2 rounded-lg w-full bg-white"
                >
                  <option value="">Select Section</option>
                  {fromSectionsList.map((sec) => (
                    <option key={sec._id} value={sec._id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {fromClassesList.find((c) => c._id === fromClass)?.isSenior && (
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Stream</label>
                  <select
                    value={fromStream}
                    onChange={(e) => setFromStream(e.target.value)}
                    className="text-sm border px-4 py-2 rounded-lg w-full bg-white"
                  >
                    <option value="">Select Stream</option>
                    {fromStreamsList.map((stream) => (
                      <option key={stream._id} value={stream._id}>
                        {stream.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            </div>

            {fromClass && fromSection && fromSession ? (
              <>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border px-4 py-2 rounded-lg mb-4"
                />

                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="p-2">
                          <input
                            type="checkbox"
                            checked={studentList.length > 0 && studentList.every((s) => s.selected)}
                            onChange={(e) => selectAll(e.target.checked)}
                          />
                        </th>
                        <th className="p-2 text-left">Student ID</th>
                        <th className="p-2 text-left">Student Name</th>
                        <th className="p-2 text-center">Father's Name</th>
                        <th className="p-2 text-center">Class</th>
                        <th className="p-2 text-center">Section</th>
                        <th className="p-2 text-center">Stream</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length ? (
                        filteredStudents.map((s) => (
                          <tr
                            key={s._id}
                            onClick={() => toggleStudent(s._id)}
                            className={`border-t cursor-pointer ${s.selected ? 'bg-blue-50' : ''}`}
                          >
                            <td className="p-2">
                              <input type="checkbox" checked={s.selected} readOnly />
                            </td>
                            <td className="p-2">{s.studentId}</td>
                            <td className="p-2 font-medium">
                              {s.firstName} {s.middleName} {s.lastName}
                            </td>
                            <td className="p-2 text-center">{s.fatherName}</td>
                            <td className="p-2 text-center">{s.currentClass?.name}</td>
                            <td className="p-2 text-center">{s.currentSection?.name}</td>
                            <td className="p-2 text-center">{s.stream?.name || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-gray-400">
                            No students found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="mt-4 flex justify-end">
                    <Pagination
                      current={page}
                      pageSize={limit}
                      total={total}
                      pageSizeOptions={['5', '10', '20', '50']}
                      showSizeChanger
                      onChange={(p) => setPage(p)}
                      onShowSizeChange={(p, size) => {
                        setLimit(size)
                        setPage(1)
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                Select class, section & session
              </div>
            )}
          </div>
        </div>

        {/* ================= TRANSFER TO ================= */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-200 px-6 py-2">
            <h2 className="font-semibold text-sm text-gray-600">Transfer To</h2>
          </div>

          <div className="p-6">
            <div className="flex gap-3 mb-4">
               {/* To Session */}
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Session</label>
                <select
                  value={currentSession?._id || ''}
                  disabled
                  className="text-sm border px-4 py-2 rounded-lg w-full bg-white bg-gray-100 cursor-not-allowed"
                >
                  <option value={currentSession?._id}>
                    {currentSession?.sessionName} (Current)
                  </option>
                </select>

              </div>
              {/* To Class */}
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Class</label>
                <select
                  value={toClass}
                  onChange={(e) => setToClass(e.target.value)}
                  className="text-sm border px-4 py-2 rounded-lg w-full bg-white"
                >
                  <option value="">Select Class</option>
                  {[...toClassesList]
                    .sort((a, b) => classHierarchy.indexOf(a.name) - classHierarchy.indexOf(b.name)) // sort by hierarchy
                    .filter((cls) => {
                      if (!fromClass) return true
                      const sorted = [...toClassesList].sort(
                        (a, b) => classHierarchy.indexOf(a.name) - classHierarchy.indexOf(b.name),
                      )
                      const fromIndex = sorted.findIndex((c) => c._id === fromClass)
                      const clsIndex = sorted.findIndex((c) => c._id === cls._id)
                      return clsIndex > fromIndex
                    })
                    .map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* To Section */}
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Section</label>
                <select
                  value={toSection}
                  onChange={(e) => setToSection(e.target.value)}
                  className="text-sm border px-4 py-2 rounded-lg w-full bg-white"
                >
                  <option value="">Select Section</option>
                  {toSectionsList
                    .filter((sec) => {
                      if (!toClass) return false // agar To Class select nahi kiya to section empty
                      return true // class ke sections show honge
                    })
                    .map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.name}
                      </option>
                    ))}
                </select>
              </div>
              
              {toClassesList.find((c) => c._id === toClass)?.isSenior && (
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Stream</label>
                  <select
                    value={toStream}
                    onChange={(e) => setToStream(e.target.value)}
                    className="text-sm border px-4 py-2 rounded-lg w-full bg-white"
                  >
                    <option value="">Select Stream</option>
                    {toStreamsList.map((stream) => (
                      <option key={stream._id} value={stream._id}>
                        {stream.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

             
            </div>
            {transferredStudents.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ArrowRight className="w-10 h-10 mx-auto mb-2 opacity-40" />
                No students selected
              </div>
            ) : (
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={transferredStudents.length > 0}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              setTransferredStudents([])
                            }
                          }}
                        />
                      </th>

                      <th className="p-2 text-left">Student ID</th>
                      <th className="p-2 text-left">Student Name</th>
                      <th className="p-2 text-center">Father's Name</th>
                      <th className="p-2 text-center">To Class</th>
                      <th className="p-2 text-center">To Section</th>
                      <th className="p-2 text-center">To Stream</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transferredStudents.map((s) => (
                      <tr key={s._id} className="border-t">
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={true}
                            onChange={() =>
                              setTransferredStudents((prev) =>
                                prev.filter((st) => st._id !== s._id),
                              )
                            }
                          />
                        </td>

                        <td className="p-2">{s.studentId}</td>
                        <td className="p-2 font-medium">
                          {s.firstName} {s.middleName} {s.lastName}
                        </td>
                        <td className="p-2 text-center">{s.fatherName}</td>
                        <td className="p-2 text-center">
                          {toClassesList.find((c) => c._id === s.toClass)?.name}
                        </td>
                        <td className="p-2 text-center">
                          {toSectionsList.find((sec) => sec._id === s.toSection)?.name}
                        </td>
                        <td className="p-2 text-center">
                          {s.toStream
                            ? toStreamsList.find((st) => st._id === s.toStream)?.name
                            : '-'}{' '}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex justify-end">
                  <Pagination
                    current={page}
                    pageSize={limit}
                    total={total}
                    pageSizeOptions={['5', '10', '20', '50']}
                    showSizeChanger
                    onChange={(p) => setPage(p)}
                    onShowSizeChange={(p, size) => {
                      setLimit(size)
                      setPage(1)
                    }}
                  />
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ARROW */}
      <div className="flex justify-center py-4">
        <ArrowRightCircle
          className="h-10 w-10 text-red-600 cursor-pointer"
          onClick={handleArrowClick}
        />
      </div>

      {/* ACTIONS */}
      <div className="bg-white p-6 flex text-sm justify-end gap-3">
        {/* <button onClick={handleReset} className="border px-6 py-2 rounded">
          Reset
        </button> */}
        <button
          onClick={handleTransfer}
          disabled={isTransferring}
          className={`bg-[#0c3b73] text-white px-8 py-2 rounded transition-all
    ${isTransferring ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800'}
  `}
        >
          {isTransferring ? 'Transferring...' : 'Transfer'}
        </button>
      </div>
    </div>
  )
}

export default StudentTransfer
