/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Search, Calendar, Filter } from 'lucide-react'
import { Pagination, Table, message } from 'antd'


import DateCalendarServerRequest from '../../../../../components/Calender/DateCalendarServerRequest'
import MarkAttendanceModal from '../Attendence/MarkAttendanceModal'
import { getRequest } from '../../../../../Helpers'
import ExportButton from '../../../../../components/ExportButton'
import { SessionContext } from '../../../../../Context/Seesion'
import { AppContext } from '../../../../../Context/AppContext'
/* ------------------ CONSTANTS ------------------ */
const today = new Date()
const dateStr = today.toISOString().split('T')[0]

const STATUS_STYLE = {
  P: 'text-emerald-500 font-bold',
  A: 'text-red-500 font-bold',
  H: 'text-sky-500 font-bold',
}

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()

/* ------------------ ATTENDANCE COLUMNS ------------------ */
const attendanceColumns = (totalDays, year, month, attendance, setSelectedStudent, showStream) => {
  const fixedColumns = [
    { title: 'Roll No', dataIndex: 'roll', width: 80, align: 'center', fixed: 'left' },
    {
      title: 'Student Name',
      dataIndex: 'name',
      width: 180,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <button
            onClick={() => setSelectedStudent(record)}
            className="text-indigo-600 font-semibold hover:underline block"
          >
            {record.name}
          </button>
          <span className="text-xs text-gray-500">S/O {record.father}</span>
        </div>
      ),
    },
    { title: 'Class', dataIndex: 'className', width: 80, align: 'center' },
    { title: 'Section', dataIndex: 'sectionName', width: 80, align: 'center' },
    ...(showStream
      ? [{ title: 'Stream', dataIndex: 'streamName', width: 100, align: 'center' }]
      : []),
  ]

  const dayColumns = Array.from({ length: totalDays }).map((_, i) => {
    const day = i + 1
    return {
      title: day,
      width: 36,
      align: 'center',
      key: `day-${day}`,
      render: (_, record) => {
        const key = `${record.studentId}-${year}-${month + 1}-${day}`
        const status = attendance[key]
        return status ? (
          <span className={STATUS_STYLE[status]}>{status}</span>
        ) : (
          <span className="text-gray-300">—</span>
        )
      },
    }
  })

  return [...fixedColumns, ...dayColumns]
}

/* ------------------ MAIN COMPONENT ------------------ */
export default function Attendance() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(today.getMonth())
  const [session, setSession] = useState('')
  const [total, setTotal] = useState(0)
  const [assignedClasses, setAssignedClasses] = useState([])
  const [assignedSections, setAssignedSections] = useState([])
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const totalDays = daysInMonth(year, month)
  const yearsList = Array.from({ length: 10 }, (_, i) => currentYear - i)
  const { currentSession, sessionsList } = useContext(SessionContext)
  const { user } = useContext(AppContext)
  const teacherProfile = user
  const [streamId, setStreamId] = useState('') // Selected Stream
  const [assignedStreams, setAssignedStreams] = useState([]) // Streams for selected class/section

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  })

  const selectedClass = assignedClasses.find((c) => c._id === classId)
  const showStream = selectedClass?.isSenior && assignedStreams.length > 0

  useEffect(() => {
    if (currentSession?._id) {
      setSession(currentSession._id)
    }
  }, [currentSession])

  useEffect(() => {
    if (!Array.isArray(user?.profile?.classesAssigned)) return
    const classMap = {}
    user.profile.classesAssigned.forEach((item) => {
      if (!item?.classId?._id || !item?.sectionId?._id) return
      const cId = item.classId._id
      const secId = item.sectionId._id
      if (!classMap[cId]) {
        classMap[cId] = { _id: cId, name: item.classId.name, sections: {} }
      }

      if (!classMap[cId].sections[secId]) {
        classMap[cId].sections[secId] = { _id: secId, name: item.sectionId.name, streams: [] }
      }

      // Add stream if exists
      if (
        item.stream &&
        !classMap[cId].sections[secId].streams.find((s) => s._id === item.stream._id)
      ) {
        classMap[cId].sections[secId].streams.push(item.stream)
      }
    })

    // Convert to array for assignedClasses
    const classList = Object.values(classMap).map((cls) => ({
      _id: cls._id,
      name: cls.name,
      sections: Object.values(cls.sections),
      // ✅ Dynamic isSenior: agar kisi bhi section me streams array empty nahi hai, to true
      isSenior: Object.values(cls.sections).some((sec) => sec.streams && sec.streams.length > 0),
    }))

    setAssignedClasses(classList)

    if (classList.length === 1) {
      setClassId(classList[0]._id)
      setAssignedSections(classList[0].sections)

      if (classList[0].sections.length === 1) {
        setSectionId(classList[0].sections[0]._id)
      }
    }
  }, [user])

  useEffect(() => {
    const selectedClass = assignedClasses.find((c) => c._id === classId)
    setAssignedSections(selectedClass ? selectedClass.sections : [])
    setSectionId('')
  }, [classId, assignedClasses])

  useEffect(() => {
    if (!classId || !sectionId) {
      setAssignedStreams([])
      setStreamId('')
      return
    }
    const streams = user.profile.classesAssigned
      .filter((c) => c.classId._id === classId && c.sectionId._id === sectionId && c.stream)
      .map((c) => c.stream)
      .filter(Boolean)
      .reduce((acc, curr) => {
        if (!acc.find((s) => s._id === curr._id)) acc.push(curr)
        return acc
      }, [])

    setAssignedStreams(streams)
    if (streams.length === 1) setStreamId(streams[0]._id)
    else setStreamId('')
  }, [classId, sectionId, user])

  const fetchStudents = async () => {
    // 🔴 VALIDATION
    if (!session) {
      message.error('Please select Session')
      return
    }
    if (!classId) {
      message.error('Please select Class')
      return
    }
    if (!sectionId) {
      message.error('Please select Section')
      return
    }
    // ✅ define selectedClass here
    const selectedClass = assignedClasses.find((c) => c._id === classId)

    // Stream validation only for senior classes
    if (selectedClass?.isSenior && assignedStreams.length > 0 && !streamId) {
      message.error('Please select Stream')
      return
    }
    setLoading(true)
    try {
      // Fetch enrolled students
      const enrolledRes = await getRequest(
        `studentEnrollment?session=${session}&currentClass=${classId}&currentSection=${sectionId}${selectedClass?.isSenior && streamId ? `&stream=${streamId}` : ''}&page=${filters.page}&limit=${filters.limit}&isPagination=false&sortBy=rollNumber`,
      )
     

      const enrolledStudents = (enrolledRes.data?.data?.students || []).map((s, i) => ({
        key: `${s._id}-${i}`,
        studentId: s._id,
        roll: s.rollNumber || '-',
        name: `${s.firstName} ${s.middleName || ''} ${s.lastName}`.trim(),
        father: s.fatherName || '-',
        className: s.currentClass?.name || '-',
        sectionName: s.currentSection?.name || '-',
        streamName: s.stream?.name || '-',
      }))

      // Fetch attendance for month
      const attendanceRes = await getRequest(
        `attendance/monthly-calendar?month=${month + 1}&year=${year}&sessionId=${session}&classId=${classId}&sectionId=${sectionId}`,
      )

      const attendanceMap = {} // <-- semicolon is critical!
      ;(attendanceRes.data?.data?.students || []).forEach((s) => {
        const studentId = s.studentId || s._id
        s.attendance?.forEach((a) => {
          const key = `${studentId}-${year}-${month + 1}-${a.day}`
          attendanceMap[key] = a.status || ''
        })
      })
      const totalRecords = enrolledRes?.data?.data?.total || 0
      setTotal(totalRecords)

      setStudents(enrolledStudents)
      setAttendance(attendanceMap)
    } catch (err) {
      console.error('Error fetching students or attendance:', err)
      alert('Failed to fetch students or attendance.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (classId && sectionId) {
      fetchStudents()
    }
  }, [filters.page, filters.limit])

  /* ------------------ FILTER STUDENTS ---------------- */
  const filteredStudents = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || String(s.roll).includes(search),
  )

  const attendanceExportData = filteredStudents.map((student) => {
    const row = {
      'Roll No': student.roll,
      'Student Name': student.name,
      'Father Name': student.father,
      Class: student.className,
      Section: student.sectionName,
    }

    // ✅ Day-wise attendance (STRING keys)
    for (let day = 1; day <= totalDays; day++) {
      const key = `${student.studentId}-${year}-${month + 1}-${day}`
      row[`Day ${day}`] = attendance[key] || '-'
    }

    return row
  })

  /* ------------------ JSX ---------------- */
  return (
    <div className="">
      {/* HEADER */}
      <div className="bg-white flex items-center justify-between  px-4 py-2 rounded border mb-6">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="text-red-500" />
            Attendance Management
          </h1>
          <p className="text-gray-600 text-sm mt-1 ">
            Track and manage student attendance efficiently
          </p>
        </div>

        {/* MARK ATTENDANCE BUTTON */}
        <div className="flex flex-wrap items-center text-sm gap-2 sm:gap-3">
          <button
            onClick={() => {
              // console.log('Mark Attendance clicked')
              setOpen(true)
            }}
            className="bg-[#0c3b73] text-white px-4 py-2 hover:bg-blue-800 flex items-center justify-center rounded-md text-sm   w-full sm:w-auto"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Mark Attendance
          </button>

          <ExportButton
            data={attendanceExportData}
            fileName={`Attendance_${month + 1}_${year}.xlsx`}
            sheetName="Attendance"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded border p-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-orange-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-800 mb-0">Filter Options</h2>
          </div>
          {/* Session */}
          <div>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full text-sm border border-gray-300 p-2.5 rounded-lg"
            >
              {sessionsList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.sessionName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full text-sm border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">Select Class</option>
              {assignedClasses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {/* Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              disabled={!classId}
              className="w-full text-sm border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">Select Section</option>
              {assignedSections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          {/* Stream dropdown (only for senior classes) */}
          {selectedClass?.isSenior && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stream</label>
              <select
                value={streamId}
                onChange={(e) => setStreamId(e.target.value)}
                className="w-full text-sm border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Select Stream</option>
                {assignedStreams.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(+e.target.value)}
              className="w-full text-sm border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          {/* YEAR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>

            <select
              value={year}
              onChange={(e) => setYear(+e.target.value)}
              className="w-full text-sm border border-gray-300 p-2.5 rounded-lg
               focus:ring-2 focus:ring-indigo-500 focus:border-transparent
               transition-all"
            >
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          {/* SEARCH */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Student</label>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ...."
                className="w-full text-sm pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg
                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                 transition-all"
              />
            </div>
          </div>
          {/* APPLY BUTTON */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
            <button
              onClick={fetchStudents}
              disabled={loading}
              className="w-full bg-[#1d4b82] text-white text-sm px-4 py-2.5 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <MarkAttendanceModal
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false)
            fetchStudents()
          }}
          sessionId={session}
          classId={classId}
          sectionId={sectionId}
          streamId={streamId}
          assignedClasses={assignedClasses}
        />
      )}

      {/* ATTENDANCE TABLE */}
      <Table
        bordered
        size="small"
        pagination={false}
        rowKey={(record) => record.key}
        dataSource={filteredStudents}
        columns={attendanceColumns(
          totalDays,
          year,
          month,
          attendance,
          setSelectedStudent,
          // selectedClass?.isSenior,
          showStream,
        )}
        scroll={{ x: 'max-content' }}
      />
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

      {/* STUDENT CALENDAR */}
      {selectedStudent && (
        <DateCalendarServerRequest
          student={selectedStudent}
          year={year}
          month={month}
          sessionId={session}
          classId={classId}
          sectionId={sectionId}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      <style jsx>{`
        .attendance-table .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
          text-align: center;
        }

        .attendance-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }

        .attendance-table .ant-table-cell {
          border-color: #e2e8f0;
        }

        .ant-table-wrapper .ant-table-thead > tr > th {
          background: #e5e7eb;
          color: #4a5565;
        }
      `}</style>
    </div>
  )
}
