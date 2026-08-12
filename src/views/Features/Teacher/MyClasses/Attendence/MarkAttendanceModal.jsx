/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Modal, Radio, Button, message, Select, Divider, Tag, Spin, Table } from 'antd'
import { CalendarDays, Filter, Users, CheckCircle2, XCircle, Umbrella } from 'lucide-react'
import { getRequest, postRequest } from '../../../../../Helpers'
import dayjs from 'dayjs'
import { DatePicker } from 'antd'
import { SessionContext } from '../../../../../Context/Seesion'
import { AppContext } from '../../../../../Context/AppContext'

const { Option } = Select

/* ------------------ CONSTANTS ------------------ */
const STATUS_OPTIONS = [
  { label: 'Present', value: 'P' },
  { label: 'Absent', value: 'A' },
  { label: 'Holiday', value: 'H' },
]

export default function MarkAttendanceModal({
  open,
  onClose,
  sessionId,
  classId,
  sectionId,
  streamId,
  assignedClasses,
  onSuccess,
}) {
  const today = new Date().toISOString().split('T')[0]
  const formattedDate = new Date(today).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  /* ------------------ STATES ------------------ */
  const [loading, setLoading] = useState(false)
  const [studentsLoading, setStudentsLoading] = useState(false)

  const { currentSession, sessionsList } = useContext(SessionContext)
  const { user } = useContext(AppContext)

  const [students, setStudents] = useState([])
  const [attendanceMap, setAttendanceMap] = useState({})

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const [attendanceDate, setAttendanceDate] = useState(dayjs())

  const [localSessionId, setLocalSessionId] = useState(sessionId || null)
  const [localClassId, setLocalClassId] = useState(classId || null)
  const [localSectionId, setLocalSectionId] = useState(sectionId || null)
  const [localStreamId, setLocalStreamId] = useState(streamId || null)
  const [assignedStreams, setAssignedStreams] = useState([])

  const selectedClass = assignedClasses.find((c) => c._id === localClassId)

  const sections = selectedClass?.sections || []
  useEffect(() => {
    if (open) {
      setLocalSessionId(sessionId || null)
      setLocalClassId(classId || null)
      setLocalSectionId(sectionId || null)
      setLocalStreamId(streamId || null)
    }
  }, [open, sessionId, classId, sectionId, streamId])

  useEffect(() => {
    if (!localClassId || !localSectionId) {
      setAssignedStreams([])
      setLocalStreamId(null)
      return
    }

    const streams = user?.profile?.classesAssigned
      ?.filter(
        (c) => c.classId._id === localClassId && c.sectionId._id === localSectionId && c.stream,
      )
      ?.map((c) => c.stream)
      ?.filter(Boolean)
      ?.reduce((acc, curr) => {
        if (!acc.find((s) => s._id === curr._id)) acc.push(curr)
        return acc
      }, [])

    setAssignedStreams(streams)

    // if only one stream auto select
    if (streams.length === 1) {
      setLocalStreamId(streams[0]._id)
    } else {
      setLocalStreamId(null)
    }
  }, [localClassId, localSectionId, user])

  const classTeacherAssignment = user?.profile?.classesAssigned?.find(
    (item) => item.isClassTeacher === true,
  )

  // useEffect(() => {
  //   if (!classTeacherAssignment) return

  //   setLocalClassId(classTeacherAssignment.classId?._id)
  //   setLocalSectionId(classTeacherAssignment.sectionId?._id)

  //   // auto load students
  //   setTimeout(() => {
  //     applyHandler()
  //   }, 300)
  // }, [classTeacherAssignment])

  useEffect(() => {
    if (
      localSessionId &&
      localClassId &&
      localSectionId &&
      (assignedStreams.length === 0 || localStreamId !== null)
    ) {
      applyHandler()
    }
  }, [localSessionId, localClassId, localSectionId, localStreamId])

  /* ------------------ APPLY FILTER ------------------ */
  const applyHandler = async () => {
    if (!localSessionId || !localClassId || !localSectionId) {
      message.warning('Please select Session, Class & Section')
      return
    }
    if (assignedStreams.length > 0 && !localStreamId) {
      message.warning('Please select Stream')
      return
    }

    try {
      setStudentsLoading(true)
      const url =
        `studentEnrollment?session=${localSessionId}` +
        `&currentClass=${localClassId}` +
        `&currentSection=${localSectionId}` +
        (localStreamId ? `&stream=${localStreamId}` : '') +
        `&isPagination=false&sortBy=rollNumber`

      const enrollRes = await getRequest(url)

      // console.log('API URL:', url)

      const enrolled = enrollRes?.data?.data?.students || []

      const mappedStudents = enrolled.map((s) => ({
        key: s._id,
        studentId: s._id,
        roll: s.rollNumber || '-',
        name: `${s.firstName} ${s.middleName || ''} ${s.lastName}`.trim(),
        father: s.fatherName || '-',
        className: s.currentClass?.name || '-',
        sectionName: s.currentSection?.name || '-',
        streamName: s.stream?.name || '-',
      }))

      setStudents(mappedStudents)
      setAttendanceMap({})
    } catch (err) {
      console.error(err)
      message.error('Failed to load students')
    } finally {
      setStudentsLoading(false)
    }
  }

  /* ------------------ ATTENDANCE CHANGE ------------------ */
  const handleAttendanceChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async () => {
    if (!students.length) {
      message.warning('No students to mark attendance')
      return
    }
    const payload = {
      sessionId: localSessionId,
      classId: localClassId,
      sectionId: localSectionId,
      date: attendanceDate.format('YYYY-MM-DD'),
      attendance: students.map((s) => ({
        studentId: s.studentId,
        status: attendanceMap[s.studentId] || 'A',
      })),
    }
    try {
      setLoading(true)
     const res = await postRequest({
      url: 'attendance',
      cred: payload,
    })
      message.success(res?.message || 'Attendance saved successfully')
      onSuccess()
    } catch (err) {
      console.error(err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Something went wrong'
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  /* ------------------ STATS ------------------ */
  const stats = {
    total: students.length,
    present: Object.values(attendanceMap).filter((s) => s === 'P').length,
    absent: Object.values(attendanceMap).filter((s) => s === 'A').length,
    holiday: Object.values(attendanceMap).filter((s) => s === 'H').length,
    unmarked: students.length - Object.keys(attendanceMap).length,
  }

  /* ------------------ QUICK ACTIONS ------------------ */
  const markAllAs = (status) => {
    const newMap = {}
    students.forEach((s) => {
      newMap[s.studentId] = status
    })
    setAttendanceMap(newMap)
    message.success(
      `All students marked as ${status === 'P' ? 'Present' : status === 'A' ? 'Absent' : 'Holiday'}`,
    )
  }

  /* ------------------ TABLE COLUMNS ------------------ */
  const columns = [
    {
      title: <span className="font-semibold text-gray-600">Roll No</span>,
      dataIndex: 'roll',
      width: 90,
      align: 'center',
      render: (text) => (
        <span className="font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded">{text}</span>
      ),
    },
    {
      title: <span className="font-semibold text-gray-600">Student Name</span>,
      dataIndex: 'name',
      width: 200,
      render: (text) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: <span className="font-semibold text-gray-600">Father Name</span>,
      dataIndex: 'father',
      width: 180,
      render: (text) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: <span className="font-semibold text-gray-600">Class</span>,
      dataIndex: 'className',
      width: 90,
      align: 'center',
      render: (text) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: <span className="font-semibold text-gray-600">Section</span>,
      dataIndex: 'sectionName',
      width: 90,
      align: 'center',
      render: (text) => <span className="text-gray-600">{text}</span>,
    },
    ...(assignedStreams.length > 0
      ? [
          {
            title: <span className="font-semibold text-gray-600">Stream</span>,
            dataIndex: 'streamName',
            width: 120,
            align: 'center',
          },
        ]
      : []),

    {
      title: <span className="font-semibold text-gray-600">Attendance Status</span>,
      width: 280,
      align: 'center',
      render: (_, record) => (
        <Radio.Group
          options={STATUS_OPTIONS}
          optionType="button"
          buttonStyle="solid"
          value={attendanceMap[record.studentId]}
          onChange={(e) => handleAttendanceChange(record.studentId, e.target.value)}
          className="custom-radio-group"
        />
      ),
    },
  ]

  /* ------------------ JSX ------------------ */
  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        width={1100}
        zIndex={10000}
        destroyOnClose
        maskClosable={false}
        centered
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 ">
              <div className=" ">
                <CalendarDays className="text-red-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 m-0">Mark Daily Attendance</h2>
                <p className="text-sm font-[400] text-gray-500 m-0">
                  Record student attendance for today
                </p>
              </div>
            </div>

            {/* <Select
              placeholder="Select Session"
              value={localSessionId}
              onChange={setLocalSessionId}
              allowClear
              size="middle"
              className="blue-select"
            >
              {sessionsList.map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.sessionName}
                </Option>
              ))}
            </Select> */}
          </div>
        }
        footer={[
          <Button key="cancel" onClick={onClose} size="medium" danger ghost className="px-6 ">
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            size="medium"
            className="px-8 bg-gradient[#0c3b73] border-0 hover:[#0c3b73]"
            icon={<CheckCircle2 size={16} />}
          >
            Save Attendance
          </Button>,
        ]}
        className="custom-attendance-modal"
      >
        {/* FILTERS */}
        <div className="bg-gray-50 px-4 py-4 rounded-xl mb-4 border border-gray-200">
          {/* <div className="flex items-center gap-2 mb-2">
            <Filter className="text-orange-500" size={18} />
            <h3 className="text-base font-semibold text-gray-800 m-0">Filter Students</h3>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            {/* CLASS */}
            <div className="text-sm">
              <label className="block text-sm font-medium text-gray-600 mb-1">Class</label>

              <Select
                value={localClassId}
                disabled={!!classTeacherAssignment}
                className="custom-select w-full"
              >
                {user?.profile?.classesAssigned?.map((c) => (
                  <Option key={c.classId._id} value={c.classId._id}>
                    {c.classId.name}
                  </Option>
                ))}
              </Select>
            </div>

            {/* SECTION */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Section</label>

              <Select
                value={localSectionId}
                disabled={!!classTeacherAssignment}
                className="custom-select w-full"
              >
                {user?.profile?.classesAssigned
                  ?.filter((c) => c.classId._id === localClassId)
                  ?.map((c) => (
                    <Option key={c.sectionId._id} value={c.sectionId._id}>
                      {c.sectionId.name}
                    </Option>
                  ))}
              </Select>
            </div>
            {assignedStreams.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Stream</label>

                <Select
                  value={localStreamId}
                  disabled={!!classTeacherAssignment}
                  onChange={setLocalStreamId}
                  className="custom-select w-full"
                >
                  <Option value="">Select Stream</Option>
                  {assignedStreams.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </div>
            )}

            {/* DATE */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Attendance Date
              </label>
              <DatePicker
                value={attendanceDate}
                onChange={setAttendanceDate}
                format="DD MMM YYYY"
                size="medium"
                className="w-full text-sm"
                allowClear={false}
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </div>

            {/* APPLY BUTTON */}
            <div className="flex  items-end">
              <Button
                type="primary"
                icon={<Filter size={16} />}
                onClick={applyHandler}
                size="large"
                className="w-full items-center text-sm bg-[#1d4b82] border-0"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <Spin spinning={studentsLoading} tip="Loading students...">
          {/* QUICK ACTIONS */}
          {students.length > 0 && (
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex gap-2">
                <Button
                  size="small"
                  type="primary"
                  className="bg-green-600 border-0"
                  onClick={() => markAllAs('P')}
                >
                  Mark All Present
                </Button>
                <Button size="small" danger onClick={() => markAllAs('A')}>
                  Mark All Absent
                </Button>
                <Button size="small" onClick={() => markAllAs('H')}>
                  Mark All Holiday
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                Total: <b>{stats.total}</b> | Present:{' '}
                <b className="text-green-600">{stats.present}</b> | Absent:{' '}
                <b className="text-red-500">{stats.absent}</b> | Unmarked: <b>{stats.unmarked}</b>
              </div>
            </div>
          )}

          {students.length === 0 && !studentsLoading ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Users className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500 font-medium">No students found</p>
              <p className="text-sm text-gray-400">
                Please select filters and click Apply to load students
              </p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={students}
              pagination={false}
              bordered
              scroll={{ y: 400 }}
              className="custom-attendance-table"
            />
          )}
        </Spin>
      </Modal>

      <style jsx global>{`
        .custom-attendance-modal .ant-modal-header {
          // background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          // border-bottom: 2px solid #e2e8f0;
          padding: 20px 24px;
        }

        .custom-attendance-modal .ant-modal-body {
          // padding: 24px;
        }

        .custom-attendance-modal .ant-modal-footer {
          border-top: 2px solid #e2e8f0;
          padding: 16px 24px;
        }

        .custom-attendance-table .ant-table-thead > tr > th {
          background: #e5e7eb;
          color: #4a5565;
          font-weight: 600;
          padding: 14px 12px !important;
          border-color: #ffffff !important;
        }

        .custom-attendance-table .ant-table-tbody > tr:hover > td {
          background: #faf5ff !important;
        }

        .custom-attendance-table .ant-table-cell {
          padding: 12px !important;
          border-color: #e5e7eb;
        }

        .custom-radio-group .ant-radio-button-wrapper {
          border-radius: 6px !important;
          margin: 0 3px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .custom-radio-group .ant-radio-button-wrapper-checked {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .custom-radio-group .ant-radio-button-wrapper:first-child {
          border-radius: 6px !important;
        }

        .custom-radio-group .ant-radio-button-wrapper:last-child {
          border-radius: 6px !important;
        }

        .custom-select .ant-select-selector {
          border-radius: 8px !important;
          border: 1.5px solid #e5e7eb !important;
          transition: all 0.3s ease !important;
        }

        .custom-select .ant-select-selector:hover {
          border-color: #6366f1 !important;
        }

        .custom-select.ant-select-focused .ant-select-selector {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
        }
        .blue-select .ant-select-selector {
          border: 2px solid #2563eb !important; /* blue-600 */
          border-radius: 8px;
          color: #2563eb;
        }

        .blue-select:hover .ant-select-selector {
          border-color: #1d4ed8 !important; /* blue-700 */
        }

        .blue-select.ant-select-focused .ant-select-selector {
          border-color: #1d4ed8 !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }

        .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):active {
          color: #fff;
          background: #09d925;
          border-color: #09d960;
        }

        :where(.css-dev-only-do-not-override-1odpy5d).ant-btn-variant-solid {
          color: #fff;
          background: #0c3b73;
        }

        .ant-radio-group-solid
          :where(.css-dev-only-do-not-override-1odpy5d).ant-radio-button-wrapper-checked:not(
            .ant-radio-button-wrapper-disabled
          ) {
          color: #fff;
          background: #0c3b73;
          border-color: #0c3b73;
        }
      `}</style>
    </>
  )
}
