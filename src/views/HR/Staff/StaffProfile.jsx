import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, User, Mail, Phone, Calendar, MapPin, Building2, Briefcase, CreditCard, BadgeIndianRupee } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Loader from '../../../components/Loading/Loader'

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const ATT_META = {
  Present:       { code: 'P',  cls: 'bg-green-100 text-green-700' },
  Absent:        { code: 'A',  cls: 'bg-red-100 text-red-700' },
  'Half Day':    { code: 'H',  cls: 'bg-yellow-100 text-yellow-700' },
  'Paid Leave':  { code: 'PL', cls: 'bg-blue-100 text-blue-700' },
  'Unpaid Leave':{ code: 'UL', cls: 'bg-orange-100 text-orange-700' },
  Holiday:       { code: 'HO', cls: 'bg-purple-100 text-purple-700' },
  'Weekly Off':  { code: 'WO', cls: 'bg-gray-100 text-gray-500' },
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
      <Icon className="w-3.5 h-3.5 text-[#0c3b73]" />
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || '—'}</p>
    </div>
  </div>
)

const LeaveStatusBadge = ({ status }) => {
  const map = {
    Pending:  'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

const StaffProfile = () => {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [staff, setStaff]         = useState(null)
  const [loading, setLoading]     = useState(false)
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves]       = useState([])
  const [attLoading, setAttLoading] = useState(false)
  const [leaveLoading, setLeaveLoading] = useState(false)

  /* ── fetch staff profile ── */
  useEffect(() => {
    if (!id) return
    setLoading(true)
    getRequest(`hr/staff/${id}`)
      .then((res) => setStaff(res?.data?.data || null))
      .catch(() => toast.error('Failed to load staff profile'))
      .finally(() => setLoading(false))
  }, [id])

  /* ── fetch recent attendance ── */
  useEffect(() => {
    if (!id) return
    setAttLoading(true)
    getRequest(`hr/attendance/staff?staffId=${id}&month=${getCurrentMonth()}`)
      .then((res) => {
        const records = res?.data?.data || []
        // show last 10 days
        setAttendance(records.slice(-10))
      })
      .catch(() => {})
      .finally(() => setAttLoading(false))
  }, [id])

  /* ── fetch recent leaves ── */
  useEffect(() => {
    if (!id) return
    setLeaveLoading(true)
    getRequest(`hr/leaves?staffId=${id}&limit=5`)
      .then((res) => setLeaves(res?.data?.data?.leaves || []))
      .catch(() => {})
      .finally(() => setLeaveLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="text-sm text-gray-500 mt-2">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Staff profile not found.</p>
        <button onClick={() => navigate('/hr/staff')} className="text-[#0c3b73] hover:underline text-sm flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Staff List
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-4">
      {/* TOP BAR */}
      <div className="px-4 py-3 bg-white rounded border flex items-center justify-between">
        <button
          onClick={() => navigate('/hr/staff')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c3b73]"
        >
          <ArrowLeft size={16} /> Back to Staff List
        </button>
        <button
          onClick={() => navigate(`/hr/staff/edit/${id}`)}
          className="flex items-center gap-2 bg-[#0c3b73] hover:bg-blue-800 text-white px-4 py-2 rounded text-sm"
        >
          <Edit size={14} /> Edit Profile
        </button>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white border rounded-lg p-5">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* LEFT — Photo + Name */}
          <div className="flex flex-col items-center gap-3 sm:w-48 flex-shrink-0">
            {staff.photo ? (
              <img
                src={staff.photo}
                alt={staff.employeeName}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#0c3b73] shadow"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#0c3b73] text-white flex items-center justify-center text-3xl font-bold shadow">
                {staff.employeeName?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="text-center">
              <h2 className="text-base font-bold text-gray-800">{staff.employeeName}</h2>
              <span className="mt-1 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-mono">
                {staff.employeeCode || '—'}
              </span>
              <div className="mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  staff.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — Info Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoRow icon={Building2} label="Department"       value={staff.department?.name} />
            <InfoRow icon={Briefcase} label="Designation"      value={staff.designation?.name} />
            <InfoRow icon={User}      label="Staff Type"        value={staff.staffType} />
            <InfoRow icon={User}      label="Employment Type"   value={staff.employmentType} />
            <InfoRow icon={Phone}     label="Mobile"            value={staff.mobile} />
            <InfoRow icon={Mail}      label="Email"             value={staff.email} />
            <InfoRow icon={Calendar}  label="Date of Birth"     value={staff.dob?.slice(0, 10)} />
            <InfoRow icon={Calendar}  label="Date of Joining"   value={staff.dateOfJoining?.slice(0, 10)} />
            <InfoRow icon={MapPin}    label="Address"           value={staff.address} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BANK DETAILS */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0c3b73]" /> Bank Details
          </h3>
          <div className="space-y-3">
            <InfoRow icon={Building2} label="Bank Name"      value={staff.bankDetails?.bankName} />
            <InfoRow icon={CreditCard} label="Account Number" value={staff.bankDetails?.accountNumber} />
            <InfoRow icon={CreditCard} label="IFSC Code"      value={staff.bankDetails?.ifsc} />
          </div>
        </div>

        {/* SALARY */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BadgeIndianRupee className="w-4 h-4 text-[#0c3b73]" /> Salary Details
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
              <BadgeIndianRupee className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Monthly Salary</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{staff.monthlySalary ? Number(staff.monthlySalary).toLocaleString('en-IN') : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RECENT ATTENDANCE */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0c3b73]" /> Recent Attendance (Last 10 days)
          </h3>
          {attLoading ? (
            <Loader />
          ) : attendance.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No attendance records this month</p>
          ) : (
            <div className="space-y-2">
              {attendance.map((att, i) => {
                const meta = ATT_META[att.status]
                return (
                  <div key={att._id || i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <span className="text-sm text-gray-600">{att.date?.slice(0, 10) || '—'}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${meta?.cls || 'bg-gray-100 text-gray-600'}`}>
                      {meta?.code || att.status || '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RECENT LEAVES */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0c3b73]" /> Recent Leave History
          </h3>
          {leaveLoading ? (
            <Loader />
          ) : leaves.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No leave records found</p>
          ) : (
            <div className="space-y-2">
              {leaves.map((lv, i) => (
                <div key={lv._id || i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">{lv.leaveType}</p>
                    <p className="text-xs text-gray-400">
                      {lv.fromDate?.slice(0, 10)} → {lv.toDate?.slice(0, 10)}
                      <span className="ml-1">({lv.totalDays} days)</span>
                    </p>
                  </div>
                  <LeaveStatusBadge status={lv.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffProfile
