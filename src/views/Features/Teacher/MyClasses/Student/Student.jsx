/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useContext } from 'react'
import { Search, Eye, Users, BookOpen, AlertTriangle, X, Filter, Calendar } from 'lucide-react'
import { Empty, message, Modal, Pagination } from 'antd'

import { getRequest } from '../../../../../Helpers'
import { AppContext } from '../../../../../Context/AppContext'
import { SessionContext } from '../../../../../Context/Seesion'
import Loader from '../../../../../components/Loading/Loader'

const TeacherStudentsView = () => {
  const { user } = useContext(AppContext)
  const { currentSession, sessionsList } = useContext(SessionContext)
  const [session, setSession] = useState('')
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [streams, setStreams] = useState([])
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [streamId, setStreamId] = useState('')
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const [filters, setFilters] = useState({ page: 1, limit: 10 })
  const hasActiveFilters = isApplied
  useEffect(() => {
    if (currentSession?._id) {
      setSession(currentSession._id)
    }
  }, [currentSession])

  // Load teacher's assigned classes from profile
  useEffect(() => {
    if (Array.isArray(user?.profile?.classesAssigned)) {
      const assignedClasses = user.profile.classesAssigned
        .filter((item) => item?.classId?._id) // 🛡️ safety
        .map((item) => ({
          _id: item.classId._id,
          name: item.classId.name,
          isSenior: item.classId.isSenior,
        }))
      const uniqueClasses = assignedClasses.filter(
        (cls, index, self) => index === self.findIndex((c) => c._id === cls._id),
      )
      setClasses(uniqueClasses)
    }
  }, [user])

  /* ---------------- LOAD SECTIONS ---------------- */
  useEffect(() => {
    if (!classId || !Array.isArray(user?.profile?.classesAssigned)) {
      setSections([])
      return
    }
    const sectionsForClass = user.profile.classesAssigned
      .filter((item) => item?.classId?._id === classId && item?.sectionId?._id)
      .map((item) => ({
        _id: item.sectionId._id,
        name: item.sectionId.name,
      }))
    const uniqueSections = sectionsForClass.filter(
      (sec, index, self) => index === self.findIndex((s) => s._id === sec._id),
    )
    setSections(uniqueSections)
  }, [classId, user])

  useEffect(() => {
    if (!classId || !Array.isArray(user?.profile?.classesAssigned)) {
      setStreams([])
      return
    }
    const streamsForClass = user.profile.classesAssigned
      .filter((item) => item?.classId?._id === classId && item?.stream?._id)
      .map((item) => ({
        _id: item.stream._id,
        name: item.stream.name,
      }))
    const uniqueStreams = streamsForClass.filter(
      (stream, index, self) => index === self.findIndex((s) => s._id === stream._id),
    )
    setStreams(uniqueStreams)
  }, [classId, user])

  // Fetch students API call
  const fetchStudents = async () => {
    if (!session || !classId || !sectionId) {
      message.error('Please select all filters')
      return
    }
    if (streams.length > 0 && !streamId) {
      message.error('Please select stream')
      return
    }
    setLoading(true)
    try {
      let url = `studentEnrollment?session=${session}&currentClass=${classId}&currentSection=${sectionId}&page=${filters.page}&limit=${filters.limit}&isPagination=true`

      if (streamId) {
        url += `&stream=${streamId}`
      }
      const enrolledRes = await getRequest(url)
      const enrolledStudents = (enrolledRes.data?.data?.students || []).map((s, i) => ({
        key: `${s._id}-${i}`,
        studentId: s._id,
        rollNumber: s.rollNumber || '-',
        firstName: s.firstName || '',
        middleName: s.middleName || '',
        lastName: s.lastName || '',
        fatherName: s.fatherName || '-',
        motherName: s.motherName || '-',
        phone: s.phone || '-',
        gender: s.gender || 'N/A',
        email: s.address?.present?.Email || '-',
        status: s.status || 'N/A',
        currentClass: s.currentClass?.name || '-',
        currentSection: s.currentSection?.name || '-',
        stream: s.stream?.name || '-',
        attendance: Math.floor(Math.random() * 30) + 70,
      }))
      const totalRecords = enrolledRes?.data?.data?.total || 0
      setStudents(enrolledStudents)
      setTotal(totalRecords)
      message.success(`${enrolledStudents.length} students loaded successfully`)
    } catch (err) {
      console.error('Error fetching students:', err)
      message.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isApplied) {
      fetchStudents()
    }
  }, [filters.page])
  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase()
    const roll = student.rollNumber.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase()) || roll.includes(searchTerm.toLowerCase())
  })

  const clearFilters = () => {
    setSearchTerm('')
    setClassId('')
    setSectionId('')
    setStreamId('')
    setSession(currentSession?._id || '')
    setStudents([])
    setTotal(0)
    setFilters({ page: 1, limit: 10 })
    setIsApplied(false)
  }

  return (
    <div className="">
      {/* Header */}
      <div className="bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 rounded border mb-4 sm:mb-6 gap-2">
        {/* Left Side */}
        <div>
          <h1 className="flex items-center gap-2 text-base sm:text-lg font-semibold">
            <Calendar className="text-red-500" size={20} />
            Student Management
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Track and manage student</p>
        </div>

        {/* Right Side - Employee ID */}
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
          <span className="text-xs sm:text-sm text-gray-600 font-medium">EMP ID:</span>
          <span className="text-xs sm:text-sm font-semibold text-blue-900">
            {user?.profile?.employeeId || 'N/A'}
          </span>
        </div>
      </div>

      <div className=" space-y-4 sm:space-y-6">
        {/* Filter Options Card */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Filter className="text-orange-500" size={20} sm:size={24} />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Filter Options</h2>
          </div>

          <div className="space-y-4">
            {/* Filters Grid */}
            <div className="flex flex-wrap gap-4 items-end">
              {/* Search Student */}
              <div
                className={`transition-all duration-300 ${
                  hasActiveFilters ? 'w-60' : 'flex-1 min-w-[260px]'
                }`}
              >
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Search Student
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />

                  <input
                    type="text"
                    placeholder="Search ...."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg 
pl-10 pr-3 py-2 sm:py-2.5 text-sm 
focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Class Dropdown */}
              <div className="w-44">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  value={classId}
                  onChange={(e) => {
                    const selected = e.target.value
                    setClassId(selected)
                    setSectionId('')
                    setStreamId('') // ✅ IMPORTANT
                    setStreams([]) // ✅ IMPORTANT
                    setStudents([])
                    // setFilters((prev) => ({ ...prev, page: 1 }))
                  }}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Dropdown */}
              <div className="w-44">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => {
                    setSectionId(e.target.value)
                    setStudents([])
                  }}
                  disabled={!classId}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Section</option>
                  {sections.map((sec) => (
                    <option key={sec._id} value={sec._id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Stream */}
              {streams.length > 0 && (
                <div className="w-44">
                  <label className="block text-sm mb-2">Stream</label>
                  <select
                    value={streamId}
                    onChange={(e) => setStreamId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select</option>
                    {streams.map((stream) => (
                      <option key={stream._id} value={stream._id}>
                        {stream.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* <div className="lg:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Session
                </label>
                <select
                  value={session}
                  onChange={(e) => {
                    setSession(e.target.value)
                    setClassId('')
                    setSectionId('')
                    setStudents([])
                  }}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 text-sm
             focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Session</option>
                  {sessionsList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.sessionName}
                    </option>
                  ))}
                </select>
              </div> */}
              {/* Apply Filters Button */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsApplied(true)
                    fetchStudents()
                  }}
                  // disabled={!classId || !sectionId || loading}
                  className="min-w-[140px] bg-blue-900 text-white px-4 py-2 sm:py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Apply'}
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="min-w-[100px] border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-4 py-2 sm:py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {/* <X size={16} /> */}
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Students Table Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 sm:py-20">
              <div className="p-2 text-center">
                <Loader />
                <p>Loding records...</p>
              </div>{' '}
            </div>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] max-w-[1600px] mx-auto">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm">
                      Roll No
                    </th>
                    <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm">
                      Student Name
                    </th>
                    <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm">
                      Class
                    </th>
                    <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm">
                      Section
                    </th>
                    <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm">
                      Stream
                    </th>
                    <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm">
                      Father's Name
                    </th>
                    {/* <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm">
                      Attendance
                    </th> */}
                    <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm">
                      Gender
                    </th>
                    <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-gray-700 text-xs sm:text-sm">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.key}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-3 sm:py-4 sm:px-6 text-gray-700 text-xs sm:text-sm">
                        {student.rollNumber}
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6">
                        <div className="font-medium text-gray-800 text-xs sm:text-sm">
                          {student.firstName} {student.middleName} {student.lastName}
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6 text-gray-700 text-xs sm:text-sm">
                        {student.currentClass}
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6 text-gray-700 text-xs sm:text-sm">
                        {student.currentSection}
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6 text-gray-700 text-xs sm:text-sm">
                        {student.stream}
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6 text-gray-700 text-xs sm:text-sm">
                        {student.fatherName}
                      </td>

                      <td>
                        <span
                          className={`px-2 py-1 mx-3 rounded text-xs font-semibold ${
                            student.gender === 'Male'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>

                      <td className="py-3 px-3 sm:py-4 sm:px-6">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="bg-blue-900 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-900 transition-colors text-xs sm:text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20">
              <Empty />
            </div>
          )}
          {/* PAGINATION */}
          {!loading && students?.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="text-sm text-gray-700">
                  Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                  {Math.min(filters.page * filters.limit, total)} of {total} results
                </div>

                <Pagination
                  current={filters.page}
                  pageSize={filters.limit}
                  total={total}
                  pageSizeOptions={['5', '10', '15']}
                  showSizeChanger={true}
                  onChange={(page) => {
                    setFilters((prev) => ({ ...prev, page }))
                  }}
                  onShowSizeChange={(current, size) => {
                    setFilters({ page: 1, limit: size })
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Detail Modal - Fixed Size */}
      <Modal
        open={!!selectedStudent}
        onCancel={() => setSelectedStudent(null)}
        footer={null}
        width={680}
        destroyOnClose
        closable={false}
        styles={{ body: { padding: 0 } }}
      >
        {selectedStudent && (
          <div>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-900 text-white p-1 sm:p-5 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-lg sm:text-xl font-bold">Student Details</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Personal Information */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="text-blue-600" size={18} />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Roll Number</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selectedStudent.rollNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selectedStudent.firstName} {selectedStudent.middleName}{' '}
                      {selectedStudent.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Father's Name</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selectedStudent.fatherName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Mother's Name</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selectedStudent.motherName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Contact</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-800 text-sm break-all">
                      {selectedStudent.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen className="text-blue-600" size={18} />
                  Academic Information
                </h3>
                <div className="grid grid-cols-2 gap-3 bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Class</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selectedStudent.currentClass}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Section</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selectedStudent.currentSection}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Gender</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-lg font-semibold text-xs ${
                        selectedStudent.gender === 'Male'
                          ? 'bg-blue-100 text-blue-700'
                          : selectedStudent.gender === 'Female'
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {selectedStudent.gender}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-lg font-semibold text-xs ${
                        selectedStudent.status === 'Studying'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default TeacherStudentsView
