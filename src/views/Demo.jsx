/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Users, ArrowRightCircle } from 'lucide-react'
import { getRequest, postRequest } from '../Helpers'

const StudentTransfer = () => {
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0])
  const [session, setSession] = useState('')

  // FROM
  const [fromClass, setFromClass] = useState('')
  const [fromSection, setFromSection] = useState('')
  const [fromSession, setFromSession] = useState('')

  // TO
  const [toClass, setToClass] = useState('')
  const [toSection, setToSection] = useState('')
  const [toSession, setToSession] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [notification, setNotification] = useState(null)
  const [studentList, setStudentList] = useState([])
  const [transferStatus, setTransferStatus] = useState('PASS')
  const [transferredStudents, setTransferredStudents] = useState([])

  // API dropdowns
  const [sessionsList, setSessionsList] = useState([])
  const [classesList, setClassesList] = useState([])
  const [sectionsList, setSectionsList] = useState([])

  /* ------------------ LOAD CLASSES, SECTIONS, SESSIONS ------------------ */
  useEffect(() => {
    getRequest('classes?isPagination=false')
      .then((res) => setClassesList(res.data?.data?.classes || []))
      .catch(console.error)

    getRequest('sections?isPagination=false')
      .then((res) => setSectionsList(res.data?.data?.sections || []))
      .catch(console.error)

    getRequest('sessions?isPagination=false')
      .then((res) => setSessionsList(res.data?.data?.sessions || []))
      .catch(console.error)
  }, [])

  /* ------------------ LOAD STUDENTS FROM SOURCE ------------------ */
  useEffect(() => {
    if (fromClass && fromSection && fromSession) {
      getRequest(
        `studentEnrollment?limit=100&status=Studying&currentClass=${fromClass}&currentSection=${fromSection}`,
      )
        .then((res) => {
          const studentsArray = Array.isArray(res.data?.data?.students)
            ? res.data.data.students
            : []
          const filtered = studentsArray.map((s) => ({ ...s, selected: false }))
          setStudentList(filtered)
        })
        .catch(console.error)
    } else {
      setStudentList([])
    }
  }, [fromClass, fromSection, fromSession])

  /* ------------------ FILTER STUDENTS BASED ON SEARCH ------------------ */
  const filteredStudents = studentList.filter((s) =>
    `${s.firstName} ${s.middleName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredTransferred = transferredStudents.filter((s) =>
    `${s.firstName} ${s.middleName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  /* ------------------ HELPERS ------------------ */
  const toggleStudent = (id) => {
    setStudentList(studentList.map((s) => (s._id === id ? { ...s, selected: !s.selected } : s)))
  }

  const selectAll = (checked) => {
    setStudentList(studentList.map((s) => ({ ...s, selected: checked })))
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  /* ------------------ MOVE SELECTED TO TRANSFER TO ------------------ */
  const handleArrowClick = () => {
    const selected = studentList.filter((s) => s.selected)
    if (selected.length === 0) {
      showNotification('Select at least one student to move', 'error')
      return
    }

    const newTransferred = selected.map((s) => ({ ...s, status: transferStatus }))

    setTransferredStudents((prev) => {
      const alreadyTransferredIds = prev.map((s) => s._id)
      const unique = newTransferred.filter((s) => !alreadyTransferredIds.includes(s._id))
      return [...prev, ...unique]
    })

    // unselect in From list
    setStudentList((prev) => prev.map((s) => (s.selected ? { ...s, selected: false } : s)))
    showNotification(' tranfer  from student')
  }

  /* ------------------ TRANSFER LOGIC ------------------ */
  const handleTransfer = () => {
    if (!toClass || !toSection || !toSession) {
      showNotification('Please select TO Class, Section, Session', 'error')
      return
    }

    if (transferredStudents.length === 0) {
      showNotification('No students to transfer', 'error')
      return
    }

    const payload = {
      students: transferredStudents.map((s) => s._id),
      toSession,
      toClass,
      toSection,
    }

    postRequest({url:`studentTransfer`,cred: payload})
      .then((res) => {
       
        // remove transferred from From list
        const transferredIds = transferredStudents.map((s) => s._id)
        setStudentList((prev) => prev.filter((s) => !transferredIds.includes(s._id)))

        // clear TO list
        setTransferredStudents([])
      })
      .catch((err) => {
        console.error(err) 
      })
  }

  const selectedCount = studentList.filter((s) => s.selected).length

  const handleReset = () => {
    setFromClass('')
    setFromSection('')
    setFromSession('')
    setToClass('')
    setToSection('')
    setToSession('')
    setSearchTerm('')
    setStudentList([])
    setTransferredStudents([])
    showNotification('Form reset successfully', 'success')
  }

  /* ------------------ RENDER ------------------ */
  return (
    <div className="min-h-screen">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-100 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg animate-slide-in ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mx-auto">
        <div className="px-4 py-2 bg-white rounded-lg border border-blue-100 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <Users className="text-[#e24028]" size={36} />
              Student Transfer Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 ">
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

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 mb-1">Academic Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="text-sm border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">Select Session</option>
                {sessionsList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.sessionName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* FROM & TO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FROM */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-200 px-6 py-2">
              <h2 className="font-semibold text-sm text-gray-600 mb-0">Transfer From</h2>
            </div>
            <div className="p-6">
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Class</label>
                  <select
                    value={fromClass}
                    onChange={(e) => setFromClass(e.target.value)}
                    className="text-sm border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">Select Class</option>
                    {classesList.map((cls) => (
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
                    className="text-sm border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">Select Section</option>
                    {sectionsList.map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Session</label>
                  <select
                    value={fromSession}
                    onChange={(e) => setFromSession(e.target.value)}
                    className="text-sm border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Session</option>
                    {sessionsList.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.sessionName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {fromClass && fromSection && fromSession && (
                <>
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">
                      {selectedCount} student{selectedCount !== 1 ? 's' : ''} selected
                    </span>
                    <span className="text-sm text-blue-600">{filteredStudents.length} total</span>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                        <tr>
                          <th className="p-3 text-left">
                            <input
                              type="checkbox"
                              onChange={(e) => selectAll(e.target.checked)}
                              checked={
                                studentList.length > 0 && studentList.every((s) => s.selected)
                              }
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </th>
                          <th className="p-3 text-left font-semibold text-gray-700">Student ID</th>
                          <th className="p-3 text-left font-semibold text-gray-700">
                            Student Name
                          </th>
                          <th className="p-3 text-left font-semibold text-gray-700">Class</th>
                          <th className="p-3 text-left font-semibold text-gray-700">Section</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((s) => (
                            <tr
                              key={s._id}
                              className={`border-t border-gray-100 hover:bg-blue-50 transition cursor-pointer ${s.selected ? 'bg-blue-50' : ''}`}
                              onClick={() => toggleStudent(s._id)}
                            >
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  checked={s.selected}
                                  onChange={() => toggleStudent(s._id)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="p-3 text-gray-600">{s.studentId}</td>
                              <td className="p-3 font-medium text-gray-800">{`${s.firstName} ${s.middleName} ${s.lastName}`}</td>
                              <td className="p-3">{s.currentClassName}</td>
                              <td className="p-3">{s.currentSectionName}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-gray-400">
                              No students found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center items-center mt-4 lg:mt-0">
            <ArrowRightCircle
              className="h-10 w-10 text-red-600 cursor-pointer"
              onClick={handleArrowClick}
            />
          </div>

          {/* TO */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-200 px-6 py-2">
              <h2 className="font-semibold text-sm text-gray-600 mb-0">Transfer To</h2>
            </div>

            <div className="p-6">
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Class</label>
                  <select
                    value={toClass}
                    onChange={(e) => setToClass(e.target.value)}
                    className="text-sm border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">Select Class</option>
                    {classesList.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Section</label>
                  <select
                    value={toSection}
                    onChange={(e) => setToSection(e.target.value)}
                    className="text-sm border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">Select Section</option>
                    {sectionsList.map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Session</label>
                  <select
                    value={toSession}
                    onChange={(e) => setToSession(e.target.value)}
                    className="text-sm border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                  >
                    <option value="">Select Session</option>
                    {sessionsList.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.sessionName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <input
                type="text"
                placeholder="Search transferred students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />

              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-semibold text-gray-700">Student ID</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Student Name</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransferred.length > 0 ? (
                      filteredTransferred.map((s) => (
                        <tr
                          key={s._id}
                          className="border-t border-gray-100 hover:bg-green-50 transition"
                        >
                          <td className="p-3 text-gray-600">{s.studentId}</td>
                          <td className="p-3 font-medium text-gray-800">{`${s.firstName} ${s.middleName} ${s.lastName}`}</td>
                          <td className="p-3">
                            <select
                              value={s.status || 'PASS'}
                              onChange={(e) =>
                                setTransferredStudents((prev) =>
                                  prev.map((st) =>
                                    st._id === s._id ? { ...st, status: e.target.value } : st,
                                  ),
                                )
                              }
                              className="text-sm border border-gray-300 px-3 py-1 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            >
                              <option value="PASS">PASS</option>
                              <option value="DETENTION">DETENTION</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="p-8 text-center text-gray-400">
                          No transferred students
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end py-4 gap-3">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
          >
            Reset
          </button>
          <button
            onClick={handleTransfer}
            className="px-8 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            Transfer Students
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  )
}

export default StudentTransfer
