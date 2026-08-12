import React, { useState, useEffect, useContext, useCallback } from 'react'
import {
  User,
  BookOpen,
  MapPin,
  Users,
  Bus,
} from 'lucide-react'
import { getRequest } from '../../Helpers'
import { AppContext } from '../../Context/AppContext'
import Loader from '../../components/Loading/Loader'

// Date Formatter Helper
const formatDateDMY = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d)) return '-'

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  return `${day}-${month}-${year}`
}

export default function StudentDetail() {
  const { user } = useContext(AppContext)
  const studentId = user?.profile?._id

  const [activeTab, setActiveTab] = useState('profile')
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getRequest(`studentEnrollment/${studentId}`)
      setStudent(res?.data?.data || null)
    } catch (error) {
      console.error(error)
      setStudent(null)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchStudent()
  }, [fetchStudent])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-gray-600 gap-3 px-4">
        <Loader />
        <span className="font-medium text-sm sm:text-base animate-pulse">Loading Student Profile....</span>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4 text-red-500 font-semibold bg-gray-50 text-center text-sm sm:text-base">
        Student not found
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'academic', label: 'Academic', icon: <BookOpen size={16} /> },
    { id: 'parents', label: 'Parents', icon: <Users size={16} /> },
    { id: 'address', label: 'Address', icon: <MapPin size={16} /> },
    { id: 'transport', label: 'Transport', icon: <Bus size={16} /> },
  ]

  return (
    <div className="min-h-screen ">


      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left Side */}

  <div className="flex items-start gap-2">

    {/* ICON */}
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
      <User className="w-5 h-5 text-red-500" />
    </div>

    {/* TEXT */}
    <div>

      <h1 className="text-xl font-bold text-slate-800 leading-none">
        My Profile
      </h1>

      <p className="text-sm text-slate-500 mt-2 font-medium">
        Student Profile Information
      </p>

    </div>

  </div>
</div>
      

          {/* Right Side */}
          {/* <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2">
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Student ID
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                {student.studentId || 'N/A'}
              </p>
            </div>
            <div
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border text-xs sm:text-sm font-bold shadow-sm
                ${student.status === 'Studying'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
            >
              {student.status || 'N/A'}
            </div>
          </div> */}
        </div>
    

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-4">

        {/* Left Sidebar */}
        <div className="lg:col-span-1 w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 transition-all duration-300 hover:shadow-md">
            {/* Profile Image & Avatar */}
            <div className="text-center mb-5">
              <div className="relative inline-block">
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto mb-3 border-4 border-blue-50 object-cover shadow-sm"
                />
                <span
                  className={`absolute bottom-4 right-2 w-3.5 h-3.5 rounded-full border-2 border-white ${student.status === 'Studying' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                ></span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight break-words px-2">
                {student.firstName} {student.middleName} {student.lastName}
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                Student Account
              </p>
            </div>

            {/* Quick Info Items */}
            <div className="space-y-2.5 border-t border-gray-100 pt-1 text-xs sm:text-sm">
              <InfoItem label="Student ID" value={student.studentId} />
              <InfoItem label="Class" value={student.currentClass?.name} />
              <InfoItem label="Section" value={student.currentSection?.name} />
              <InfoItem label="Session" value={student.session?.sessionName} />
              <InfoItem label="Roll no." value={student.rollNumber || '-'} />
              <InfoItem
                label="Status"
                value={student.status}
                valueColor="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Main Tabs and Content Content */}
        <div className="lg:col-span-3 w-full space-y-6">

          {/* Custom Horizontal Scrollable Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex w-full overflow-x-auto scrollbar-none border-b border-gray-100/60">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[100px] sm:min-w-0 px-3 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                      : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50/50'
                    }`}
                >
                  <span className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Render Active Tab Component */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 min-h-[350px]">
            {activeTab === 'profile' && <ProfileTab student={student} />}
            {activeTab === 'academic' && <AcademicTab student={student} />}
            {activeTab === 'parents' && <ParentsTab student={student} />}
            {activeTab === 'address' && <AddressTab student={student} />}
            {activeTab === 'transport' && <TransportTab student={student} />}
          </div>

        </div>
      </div>
    </div>

  )
}

/* ==========================================
   TAB SUB-COMPONENTS (Optimized Formats)
   ========================================== */

function ProfileTab({ student }) {
  return (
    <Section title="Personal Details">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
        <DataRow label="First Name" value={student.firstName || '-'} />
        <DataRow label="Middle Name" value={student.middleName || '-'} />
        <DataRow label="Last Name" value={student.lastName || '-'} />
        <DataRow label="Phone" value={student.phone || '-'} />
        <DataRow label="Gender" value={student.gender || '-'} />
        <DataRow label="DOB" value={formatDateDMY(student.dob)} />
        <DataRow label="Category" value={student.category || '-'} />
        <DataRow label="Religion" value={student.religion || '-'} />
        <DataRow label="Aadhar Number" value={student.studentAdhaarNumber || '-'} />
        <DataRow label="Income" value={student.income || '-'} />
        <DataRow label="Student ID" value={student.studentId || '-'} />
        <DataRow label="PEN No" value={student.penNo || '-'} />
        <DataRow label="APAR ID" value={student.aparId || '-'} />
        <DataRow label="Status" value={student.status || '-'} />
        <DataRow label="Medium" value={student.medium || '-'} />
        <DataRow label="Transport Required" value={student.transportRequired || '-'} />
      </div>
    </Section>
  )
}

function AcademicTab({ student }) {
  return (
    <Section title="Academic Information">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
        <DataRow label="Student ID" value={student.studentId || '-'} />
        <DataRow label="Session" value={student.session?.sessionName || '-'} />
        <DataRow label="Class" value={student.currentClass?.name || '-'} />
        <DataRow label="Section" value={student.currentSection?.name || '-'} />
        <DataRow label="Medium" value={student.medium || '-'} />
        <DataRow label="Form No" value={student.formNo || '-'} />
        <DataRow label="PEN No" value={student.penNo || '-'} />
        <DataRow label="APAR ID" value={student.aparId || '-'} />
        <DataRow label="Status" value={student.status || '-'} />
        <DataRow label="Result Status" value={student.resultStatus || '-'} />
      </div>
    </Section>
  )
}

function ParentsTab({ student }) {
  return (
    <Section title="Parent Information">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
        <DataRow label="Father Name" value={student.fatherName || '-'} />
        <DataRow label="Father Occupation" value={student.fatherOccupation || '-'} />
        <DataRow label="Father Aadhar" value={student.fatherAdhaarNumber || '-'} />
        <DataRow label="Mother Name" value={student.motherName || '-'} />
        <DataRow label="Mother Occupation" value={student.motherOccupation || '-'} />
        <DataRow label="Mother Aadhar" value={student.motherAdhaarNumber || '-'} />
        <DataRow label="Guardian Name" value={student.guardianName || '-'} />
        <DataRow label="Guardian Phone" value={student.guardianPhone || '-'} />
      </div>
    </Section>
  )
}

function AddressTab({ student }) {
  const getFullAddress = (addr) => {
    if (!addr) return '-'
    const parts = [addr.Address1, addr.Address2, addr.City, addr.State, addr.Pin].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : '-'
  }

  return (
    <Section title="Address Information">
      <div className="grid grid-cols-1 gap-4">
        <DataRow label="Present Address" value={getFullAddress(student.address?.present)} />
        <DataRow label="Permanent Address" value={getFullAddress(student.address?.permanent)} />
      </div>
    </Section>
  )
}

function TransportTab({ student }) {
  return (
    <Section title="Transport Information">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
        <DataRow label="Transport Required" value={student.transportRequired || '-'} />
        <DataRow label="Transport Type" value={student.transportType || '-'} />
        <DataRow label="Route Name" value={student.routeId?.routeName || '-'} />
        <DataRow label="Route Code" value={student.routeId?.routeCode || '-'} />
        <DataRow label="Stop Name" value={student.stopId?.stopName || '-'} />
        <DataRow label="Transport Amount" value={student.transportAmount ? `₹${student.transportAmount}` : '-'} />
      </div>
    </Section>
  )
}

/* ==========================================
   UI HELPER COMPONENTS
   ========================================== */

function Section({ title, children }) {
  return (
    <div className="w-full">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100">
        {title}
      </h3>
      {children}
    </div>
  )
}

function DataRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 border-b border-slate-50/60 text-xs sm:text-sm gap-1 sm:gap-4 w-full">
      <span className="text-slate-500 font-medium shrink-0">{label}</span>
      <span className="text-slate-800 font-semibold text-left sm:text-right break-words max-w-full sm:max-w-[65%]">
        {value}
      </span>
    </div>
  )
}

function InfoItem({ label, value, valueColor = 'text-gray-800 font-semibold' }) {
  return (
    <div className="flex justify-between items-center text-xs sm:text-sm py-1.5 border-b border-gray-50 last:border-0 gap-2">
      <span className="text-gray-500 font-medium shrink-0">{label}</span>
      <span className={`${valueColor} text-right break-all`}>{value}</span>
    </div>
  )
}