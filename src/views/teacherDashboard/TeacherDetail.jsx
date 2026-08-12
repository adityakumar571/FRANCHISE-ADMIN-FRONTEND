/* eslint-disable react/jsx-key */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext } from 'react'

import { FileText, User, IndianRupee, Clock, BookOpen, Briefcase } from 'lucide-react'

import toast from 'react-hot-toast'
import { getRequest } from '../../Helpers'
import { AppContext } from '../../Context/AppContext'
import Loader from '../../components/Loading/Loader'

export default function TeacherDetail() {
  const { user } = useContext(AppContext)

  const teacherId = user?.profile?._id
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [streams, setStreams] = useState([])
  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return '-'

    const date = new Date(dateString)

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return `${day}-${month}-${year}`
  }

  useEffect(() => {
    getRequest('streams?isPagination=false')
      .then((res) => {
        setStreams(res?.data?.data?.streams || [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!teacherId) {
      setLoading(true)
      return
    }
    const fetchTeacher = async () => {
      try {
        setLoading(true)
        const res = await getRequest(`teachers/${teacherId}`)
        setTeacher(res.data?.data)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch teacher')
      } finally {
        setLoading(false)
      }
    }

    fetchTeacher()
  }, [teacherId])


  if (loading)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="animate-pulse text-gray-500 text-lg">
          <Loader />
          Loading Teacher Profile...
        </div>
      </div>
    )

  if (!teacher)
    return (
      <div className=" min-h-screen flex justify-center items-center p-4 text-red-500">
        Teacher not found
      </div>
    )

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'classes', label: 'Classes', icon: <BookOpen size={16} /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase size={16} /> },
    // { id: 'exam', label: 'Exam', icon: <Award size={16} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <img
                src={
                  teacher.profilePic
                    ? teacher.profilePic
                    : teacher.gender === 'Male'
                      ? '/src/assets/male.png'
                      : teacher.gender === 'Female'
                        ? '/src/assets/woman.png'
                        : '/src/assets/man.png'
                }
                alt="Teacher"
                className="w-32 h-32 rounded-full mx-auto mb-4 border object-cover"
              />
              <h2 className="text-xl font-bold text-gray-800">
                {teacher.firstName} {teacher.middleName} {teacher.lastName}
              </h2>
              <p className="text-sm text-gray-500">{teacher.designation}</p>
            </div>

            <div className="space-y-3 border-t pt-4 text-sm">
              <InfoItem label="Employee ID" value={teacher.employeeId} />
              <InfoItem label="Password" value={teacher.userId.password} />
              <InfoItem label="Department" value={teacher.department} />
              <InfoItem label="Employment" value={teacher.employmentType} />
              <InfoItem label="Status" value={teacher.status} valueColor="text-green-600" />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3 text-sm">
          {/* TABS */}
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex border-b flex-wrap">
              {[
                { id: 'profile', label: 'Profile', icon: <User size={16} /> },
                { id: 'classes', label: 'Classes', icon: <BookOpen size={16} /> },
                { id: 'experience', label: 'Experience', icon: <Briefcase size={16} /> },
                { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 flex items-center gap-2 text-sm font-semibold
                  ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB CONTENT */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'profile' && (
              <ProfileTab teacher={teacher} formatDateToDDMMYYYY={formatDateToDDMMYYYY} />
            )}
            {activeTab === 'classes' && (
              <ClassesTab classes={teacher.classesAssigned || []} streams={streams} />
            )}
            {activeTab === 'experience' && <ExperienceTab experience={teacher.experience || []} />}
            {activeTab === 'documents' && <DocumentsTab documents={teacher.documents || []} />}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= PROFILE TAB ================= */
function ProfileTab({ teacher, formatDateToDDMMYYYY }) {
  return (
    <div className="space-y-6">
      <Section title="Personal Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataRow label="Phone" value={teacher.phone || '-'} />
          <DataRow label="Email" value={teacher.email || '-'} />
          <DataRow label="Gender" value={teacher.gender || '-'} />
          <DataRow label="DOB" value={formatDateToDDMMYYYY(teacher?.dob)} />
          <DataRow label="Category" value={teacher.category.name|| '-'} />
          <DataRow label="Religion" value={teacher.religion || '-'} />
        </div>
      </Section>

      <Section title="Address">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataRow
            label="Present Address"
            value={`${teacher.address?.present?.Address1 || ''}, ${teacher.address?.present?.City || ''},${teacher.address?.present?.State || ''} - ${teacher.address?.present?.Pin || ''}`}
          />
          <DataRow
            label="Permanent Address"
            value={`${teacher.address?.permanent?.Address1 || ''}, ${teacher.address?.permanent?.City || ''},${teacher.address?.permanent?.State || ''} - ${teacher.address?.permanent?.Pin || ''}`}
          />
        </div>
      </Section>
      <Section title="Employee  Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataRow label="Department" value={teacher?.department || '-'} />
          <DataRow label="Designation" value={teacher?.designation || '-'} />
          <DataRow label="Employment Type" value={teacher?.employmentType || '-'} />
          <DataRow label="Date of Joining" value={formatDateToDDMMYYYY(teacher?.dateOfJoining)} />
          <DataRow label="Medium" value={teacher?.medium || '-'} />
          {/* <DataRow label="Salary" value={teacher?.salary ? `₹${teacher.salary}` : '-'} /> */}
        </div>
      </Section>
      {/* <Section title="Bank Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataRow label="Bank Name" value={teacher.bankAccount?.bankName || '-'} />
          <DataRow label="Account No" value={teacher.bankAccount?.accountNumber || '-'} />
          <DataRow label="IFSC" value={teacher.bankAccount?.ifsc || '-'} />
        </div>
      </Section> */}
    </div>
  )
}

/* ================= CLASSES TAB ================= */
function ClassesTab({ classes = [], streams = [] }) {
  if (!classes?.length) {
    return <div className="text-center text-gray-500">No class assigned</div>
  }
  const getStreamName = (streamId) => {
    if (!streamId) return ''
    const stream = streams.find((s) => s._id === streamId)
    return stream?.name || ''
  }
  const grouped = classes.reduce((acc, item) => {
    const className = item.classId?.name || '-'
    const sectionName = item.sectionId?.name || '-'
    // const streamName = item.stream?.name || null
    const streamName = getStreamName(item.stream, streams)

    const key = `${className}-${sectionName}-${streamName || 'no-stream'}`

    if (!acc[key]) {
      acc[key] = {
        className,
        sectionName,
        streamName,
        isClassTeacher: false,
        subjects: [],
      }
    }

    if (item.isClassTeacher) {
      acc[key].isClassTeacher = true
    }

    if (item.subjectId?.name && !acc[key].subjects.includes(item.subjectId.name)) {
      acc[key].subjects.push(item.subjectId.name)
    }

    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.values(grouped).map((grp, index) => (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h5 className="font-semi text-gray-800">
              Class {grp.className} – Section {grp.sectionName}
              {grp.streamName && (
                <span className="ml-1 text-sm text-gray-600">({grp.streamName})</span>
              )}
            </h5>

            {grp.isClassTeacher && (
              <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 font-semibold">
                Class Teacher
              </span>
            )}
          </div>

          {/* Subjects inline */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="font-medium text-gray-600">Subjects:</span>

            <div className="flex flex-wrap gap-2">
              {grp.subjects.map((sub, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ================= EXPERIENCE TAB ================= */
function ExperienceTab({ experience }) {
  if (!experience?.length) {
    return <div className="text-center text-gray-500 py-10">No experience added yet</div>
  }

  // Latest experience first (Professional standard)
  const sortedExperience = [...experience].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate),
  )

  return (
    <div className="space-y-8">
      {sortedExperience.map((e, index) => (
        <div key={index} className="flex gap-4">
          {/* Left Sequence Circle */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-md">
              {index + 1}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 border-b pb-6">
            <h3 className="text-base font-semibold text-gray-900">{e.designation || '-'}</h3>

            <p className="text-sm font-medium text-gray-700">{e.schoolName || '-'}</p>

            <p className="text-xs text-gray-500 mt-1">
              {formatDate(e.startDate)} – {e.endDate ? formatDate(e.endDate) : 'Present'}
            </p>

            {e.subjects?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {e.subjects.map((sub, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/* Helper */
function formatDate(date) {
  if (!date) return 'Present'
  return new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  })
}

/* ================= DOCUMENTS TAB ================= */
function DocumentsTab({ documents }) {
  if (!documents.length)
    return <div className="text-center text-gray-500">No documents uploaded</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-red-600" size={24} />
                </div>
                <div>
                  <h5 className="font-semi text-gray-800">{doc.documentId?.name || 'Document'}</h5>
                  <p className="text-xs text-gray-500">Document No: {doc.documentNumber || '-'}</p>
                </div>
              </div>
              {doc.document && (
                <a
                  href={doc.document}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================= HELPERS ================= */
function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b">{title}</h3>
      {children}
    </div>
  )
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-right">{value || '-'}</span>
    </div>
  )
}

function InfoItem({ label, value, valueColor = 'text-gray-800' }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${valueColor}`}>{value || '-'}</span>
    </div>
  )
}
