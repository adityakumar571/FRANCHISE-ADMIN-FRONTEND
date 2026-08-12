/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import {
  Calendar,
  DollarSign,
  FileText,
  User,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Users,
  Award,
  Clock,
  IndianRupee,
  GraduationCap,
} from 'lucide-react'
import { getRequest } from '../../Helpers'
import { useNavigate, useParams } from 'react-router-dom'
import Loader from '../../components/Loading/Loader'

const dummyStudent = {
  id: 1,
  name: 'Mahima Singh',
  photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  admissionNo: '5445',
  rollNumber: '01',
  class: 'Class 5',
  section: 'A',
  session: '2025-26',
  admissionDate: '2020/07/13',
  dateOfBirth: '2020/07/02',
  category: 'General',
  mobileNumber: '3213820912',
  caste: 'Hindu',
  religion: 'religion',
  email: 'sample@gmail.com',
  aadhar: '1',
  currentAddress: '123, ABC Street, Model Town',
  permanentAddress: '123, ABC Street, Model Town, New Delhi - 110001',
  fatherName: 'Amar ',
  fatherPhone: '3454324',
  fatherOccupation: '',
  motherName: 'Mrs. XYZ Singh',
  motherPhone: '+91 9876543210',
  guardianName: 'Mr. ABC Singh',
  guardianPhone: '+91 9876543211',
  bloodGroup: 'O+',
  gender: 'Female',
}

const dummyAttendance = Array.from({ length: 30 }).map((_, i) => {
  const statuses = ['P', 'A', 'H', 'L']
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  return {
    key: i + 1,
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7],
    status: status,
  }
})

const dummyFees = [
  {
    key: 1,
    month: 'April 2024',
    dueDate: '2024-04-05',
    paidDate: '2024-04-03',
    amount: 5000,
    discount: 0,
    fine: 0,
    paid: 5000,
    balance: 0,
    status: 'Paid',
  },
  {
    key: 2,
    month: 'May 2024',
    dueDate: '2024-05-05',
    paidDate: '2024-05-04',
    amount: 5000,
    discount: 0,
    fine: 0,
    paid: 5000,
    balance: 0,
    status: 'Paid',
  },
  {
    key: 3,
    month: 'June 2024',
    dueDate: '2024-06-05',
    paidDate: null,
    amount: 5000,
    discount: 0,
    fine: 250,
    paid: 0,
    balance: 5250,
    status: 'Pending',
  },
  {
    key: 4,
    month: 'July 2024',
    dueDate: '2024-07-05',
    paidDate: null,
    amount: 5000,
    discount: 0,
    fine: 0,
    paid: 0,
    balance: 5000,
    status: 'Pending',
  },
]

const dummyExams = [
  { key: 1, exam: 'Mid Term', subject: 'Mathematics', maxMarks: 100, obtained: 85, grade: 'A' },
  { key: 2, exam: 'Mid Term', subject: 'Science', maxMarks: 100, obtained: 78, grade: 'B+' },
  { key: 3, exam: 'Mid Term', subject: 'English', maxMarks: 100, obtained: 92, grade: 'A+' },
  { key: 4, exam: 'Mid Term', subject: 'Social Studies', maxMarks: 100, obtained: 88, grade: 'A' },
  { key: 5, exam: 'Mid Term', subject: 'Hindi', maxMarks: 100, obtained: 80, grade: 'B+' },
]

const dummyDocuments = [
  { key: 1, title: 'Birth Certificate', uploadDate: '2020-07-15', type: 'PDF' },
  { key: 2, title: 'Aadhar Card', uploadDate: '2020-07-15', type: 'PDF' },
  { key: 3, title: 'Transfer Certificate', uploadDate: '2020-07-15', type: 'PDF' },
  { key: 4, title: 'Marksheet', uploadDate: '2024-01-10', type: 'PDF' },
]

export default function StudentDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('profile')
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  // console.log('🆔 Student ID from URL:', id)
  const navigate = useNavigate()

  useEffect(() => {
    if (id) fetchStudent()
  }, [id])

  const fetchStudent = async () => {
    try {
      setLoading(true)
      const res = await getRequest(`studentEnrollment/${id}`)
      setStudent(res.data?.data || null)
    } catch (error) {
      console.error(error)
      setStudent(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
        <Loader /> Loading Student Data ....
      </div>
    )
  // console.log('🎯 Student state before render:', student)

  if (!student) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <GraduationCap className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-sm">No students found</p>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'sibling', label: 'Sibling', icon: <Users size={16} /> },
    { id: 'fees', label: 'Fees', icon: <IndianRupee size={16} /> },
    { id: 'exam', label: 'Exam', icon: <Award size={16} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
    { id: 'marksheet', label: 'Marksheet', icon: <Award size={16} /> }, // ✅ add
  ]

  const presentDays = dummyAttendance.filter((s) => s.status === 'P').length
  const totalDays = dummyAttendance.length
  const attendancePercentage = ((presentDays / totalDays) * 100).toFixed(1)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mb-4">
        <button
          onClick={() => navigate('/student/enrollment')}
          className="flex items-center gap-2 px-4 py-2  text-gray rounded-md hover:text-blue-700 transition"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Profile Image */}
            <div className="text-center mb-6">
              <img
                src={
                  student.profilePic
                    ? student.profilePic
                    : student.gender === 'MALE'
                      ? '/src/assets/male.png'
                      : student.gender === 'FEMALE'
                        ? '/src/assets/woman.png'
                        : '/src/assets/man.png'
                }
                alt={student.firstName}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-100 object-cover"
              />
              <h2 className="text-xl font-bold text-gray-800">
                {student.firstName} {student.middleName} {student.lastName}
              </h2>
            </div>

            {/* Quick Info */}
            <div className="space-y-3 border-t pt-4 text-sm">
              <InfoItem label="Student ID" value={student.studentId} />
              <InfoItem label="Password" value={student.userId?.password} />
              <InfoItem label="Class" value={student.currentClass?.name} />
              <InfoItem label="Section" value={student.currentSection?.name} />
              <InfoItem label="Session" value={student.session?.sessionName} />
              <InfoItem label="Roll no." value={student.rollNumber} />
              <InfoItem label="Status" value={student.status} valueColor="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 text-sm">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex border-b overflow-x-auto">
              {[
                { id: 'profile', label: 'Profile', icon: <User size={16} /> },
                { id: 'sibling', label: 'Sibling', icon: <Users size={16} /> },
                // { id: "fees", label: "Fees", icon: <IndianRupee size={16} /> },
                // { id: "exam", label: "Exam", icon: <Award size={16} /> },
                { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
                { id: 'marksheet', label: 'Marksheet', icon: <Award size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'marksheet') {
                      navigate(`/marks/viewMarks/${id}`) // ✅ route change
                    } else {
                      setActiveTab(tab.id)
                    }
                  }}
                  className={`px-5 py-3 flex items-center gap-2 text-sm font-semibold
    ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'profile' && <ProfileTab student={student} />}
            {activeTab === 'sibling' && <SiblingTab siblings={student.sibling || []} />}
            {activeTab === 'fees' && <FeesTab fees={dummyFees} />}
            {activeTab === 'exam' && <ExamTab exams={dummyExams} />}
            {activeTab === 'documents' && <DocumentsTab documents={student.documents || []} />}
          </div>
        </div>
      </div>
    </div>
  )
}

/* Profile Tab */
function ProfileTab({ student }) {
  return (
    <div className="space-y-6">
      {/* Personal Details */}
      <Section title="Personal Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataRow label="Phone" value={student.phone || '-'} />
          <DataRow label="Gender" value={student.gender || '-'} />
          <DataRow label="DOB" value={student.dob?.slice(0, 10) || '-'} />
          <DataRow label="Category" value={student.category || '-'} />
          <DataRow label="Religion" value={student.religion || '-'} />
        </div>
      </Section>

      {/* Address */}
      <Section title="Address">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataRow
            label="Present Address"
            value={`${student.address?.present?.Address1 || ''}, ${student.address?.present?.City || ''}, ${student.address?.present?.State || ''} - ${student.address?.present?.Pin || ''}`}
          />
          <DataRow
            label="Permanent Address"
            value={`${student.address?.permanent?.Address1 || ''}, ${student.address?.permanent?.City || ''}, ${student.address?.permanent?.State || ''} - ${student.address?.permanent?.Pin || ''}`}
          />
        </div>
      </Section>

      {/* Parent/Guardian Details */}
      <Section title="Parent Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataRow label="Father Name" value={student.fatherName || '-'} />
          <DataRow label="Father Occupation" value={student.fatherOccupation || '-'} />
          <DataRow label="Mother Name" value={student.motherName || '-'} />
          <DataRow label="Mother Occupation" value={student.motherOccupation || '-'} />
        </div>
      </Section>

      <Section title="Academic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataRow label="School Name" value={student.schoolName || '-'} />
          <DataRow label="Medium" value={student.medium || '-'} />
          <DataRow label="Class" value={student.currentClass?.name || '-'} />
          <DataRow label="Section" value={student.currentSection?.name || '-'} />
          {/* <DataRow label="Session" value={student.session?.sessionName || '-'} /> */}
        </div>
      </Section>
    </div>
  )
}

function SiblingTab({ siblings }) {
  if (!siblings?.length) {
    return (
      <div className="text-center text-gray-500 py-10 text-sm">No sibling details available</div>
    )
  }

  return (
    <div className="space-y-8">
      {siblings.map((sib, index) => {
        const s = sib.siblingStudentId

        return (
          <div key={index} className="flex gap-4">
            {/* Left Sequence Circle */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                {index + 1}
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 border-b pb-6">
              {/* Student Name */}
              <h3 className="text-base font-semibold text-gray-900">
                {`${s?.firstName || ''} ${s?.middleName || ''} ${s?.lastName || ''}`}
              </h3>

              <p className="text-sm text-gray-600 mt-1">
                Student ID: <span className="font-medium">{s?.studentId || '-'}</span>
              </p>

              {/* Class & Section */}
              <p className="text-sm text-gray-500 mt-1">
                {sib.class?.name || '-'} • Section {sib.section?.name || '-'}
              </p>

              {/* Father Name */}
              <p className="text-sm text-gray-500 mt-2">Father: {s?.fatherName || '-'}</p>

              {/* Status Badge */}
              <div className="mt-3">
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    s?.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {s?.status || '-'}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* Fees Tab */
function FeesTab({ fees }) {
  const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0)
  const totalPaid = fees.reduce((sum, f) => sum + f.paid, 0)
  const totalBalance = fees.reduce((sum, f) => sum + f.balance, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-600 text-sm font-medium mb-1">Total Fees</p>
          <p className="text-2xl font-bold text-blue-700">₹{totalAmount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 text-sm font-medium mb-1">Paid Amount</p>
          <p className="text-2xl font-bold text-green-700">₹{totalPaid}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm font-medium mb-1">Balance</p>
          <p className="text-2xl font-bold text-red-700">₹{totalBalance}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Month
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Discount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Fine
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Paid
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Balance
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fees.map((fee) => (
              <tr key={fee.key} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">{fee.month}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{fee.dueDate}</td>
                <td className="px-4 py-3 text-sm text-gray-800">₹{fee.amount}</td>
                <td className="px-4 py-3 text-sm text-gray-600">₹{fee.discount}</td>
                <td className="px-4 py-3 text-sm text-red-600">₹{fee.fine}</td>
                <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{fee.paid}</td>
                <td className="px-4 py-3 text-sm text-red-600 font-medium">₹{fee.balance}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      fee.status === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {fee.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* Exam Tab */
function ExamTab({ exams }) {
  const totalMarks = exams.reduce((sum, e) => sum + e.obtained, 0)
  const maxTotalMarks = exams.reduce((sum, e) => sum + e.maxMarks, 0)
  const percentage = ((totalMarks / maxTotalMarks) * 100).toFixed(2)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3 text-base">Overall Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Marks</p>
            <p className="text-xl font-bold text-gray-800">
              {totalMarks}/{maxTotalMarks}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Percentage</p>
            <p className="text-xl font-bold text-purple-600">{percentage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Highest</p>
            <p className="text-xl font-bold text-green-600">
              {Math.max(...exams.map((e) => e.obtained))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average</p>
            <p className="text-xl font-bold text-blue-600">
              {(totalMarks / exams.length).toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Exam
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Subject
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Max Marks
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Obtained
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Percentage
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {exams.map((exam) => (
              <tr key={exam.key} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{exam.exam}</td>
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">{exam.subject}</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">{exam.maxMarks}</td>
                <td className="px-4 py-3 text-sm text-blue-600 font-bold text-center">
                  {exam.obtained}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 text-center">
                  {((exam.obtained / exam.maxMarks) * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                    {exam.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* Documents Tab */
function DocumentsTab({ documents }) {
  if (!documents.length) {
    return <div className="text-center text-gray-500 text-sm">No documents uploaded</div>
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-red-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    {' '}
                    {doc.documentId?.name || 'Document'}
                  </h4>
                  <p className="text-xs text-gray-500">Document No: {doc.documentNumber || '-'}</p>
                  {/* <p className="text-sm text-gray-500">Uploaded: {doc.uploadDate}</p> */}
                  {/* <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs rounded
                  ${
                    doc.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}
                  >
                    {doc.verified ? 'Verified' : 'Not Verified'}
                  </span> */}
                </div>
              </div>
              {doc.document && (
                <a
                  href={doc.document}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline text-sm font-medium"
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

/* Helper Components */
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
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right">{value}</span>
    </div>
  )
}

function InfoItem({ label, value, valueColor = 'text-gray-800' }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${valueColor}`}>{value}</span>
    </div>
  )
}
