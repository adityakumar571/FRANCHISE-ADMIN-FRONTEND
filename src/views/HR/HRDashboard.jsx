/* eslint-disable prettier/prettier */
import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Tag, Empty, Progress, Skeleton } from 'antd'
import {
  Users, BookOpen, UserCheck, UserX, Coffee,
  Building2, Briefcase, TrendingUp, TrendingDown, Clock,
  CheckCircle2, XCircle, AlertCircle, Receipt, UserPlus,
  Wallet, FileText, PauseCircle, CalendarDays, ChevronRight,
  IndianRupee, BarChart2, ClipboardList,
} from 'lucide-react'
import { getRequest } from '../../Helpers'
import toast from 'react-hot-toast'
import DashboardStatCard from '../dashboard/Stats/DashboardStatCard'
import QuickActionCard from '../dashboard/Stats/QuickActionCard'
import NoticeHomeWorkStatsCard from '../dashboard/Stats/NoticeHomeWorkStats'

// ─────────────────────────────────────────────────────────────────────────────
// Animated count-up number
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '' }) {
  const [display, setDisplay] = useState(0)
  const numeric = typeof value === 'string'
    ? parseFloat(value.replace(/[^0-9.]/g, ''))
    : (value || 0)

  useEffect(() => {
    setDisplay(0)
    if (!numeric) return
    let start = 0
    const duration = 1200
    const increment = numeric / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= numeric) { setDisplay(numeric); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [numeric])

  const format = (n) => {
    if (prefix === '₹') {
      if (n >= 10000000) return `${prefix}${(n / 10000000).toFixed(2)} Cr`
      if (n >= 100000)   return `${prefix}${(n / 100000).toFixed(2)} L`
      if (n >= 1000)     return `${prefix}${(n / 1000).toFixed(1)} K`
      return `${prefix}${Math.floor(n).toLocaleString('en-IN')}`
    }
    return `${prefix}${Math.floor(n).toLocaleString('en-IN')}`
  }

  return <span title={prefix + numeric.toLocaleString('en-IN')}>{format(display)}</span>
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loading layout
// ─────────────────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-5 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton.Input style={{ width: 220, height: 28 }} active />
          <Skeleton.Input style={{ width: 160, height: 16 }} active size="small" />
        </div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200">
            <Skeleton.Input style={{ width: 90, height: 12 }} active size="small" />
            <Skeleton.Input style={{ width: 120, height: 36 }} active className="mt-3" />
            <Skeleton.Input style={{ width: 140, height: 12 }} active size="small" className="mt-3" />
            <Skeleton.Input style={{ width: '100%', height: 6 }} active size="small" className="mt-3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
            <Skeleton.Avatar size={40} active shape="square" style={{ borderRadius: 10 }} />
            <div className="space-y-2">
              <Skeleton.Input style={{ width: 55, height: 11 }} active size="small" />
              <Skeleton.Input style={{ width: 40, height: 22 }} active />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 h-52">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section wrappers (same feel as Admin)
// ─────────────────────────────────────────────────────────────────────────────
const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
)

const SectionHeading = ({ icon: Icon, iconColor = 'text-[#042954]', children, right }) => (
  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
    <h2 className="text-[15px] font-bold text-slate-700 flex items-center gap-2">
      <Icon className={`w-4 h-4 ${iconColor}`} />
      {children}
    </h2>
    {right}
  </div>
)

// Info tile — same compact look used in payroll/accounts
const InfoTile = ({ label, value, icon: Icon, color, bg, sub }) => (
  <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400 leading-tight">{label}</p>
      <p className="text-sm font-bold text-slate-700 truncate">
        {value}{sub && <span className="text-[10px] font-normal text-slate-400 ml-1">{sub}</span>}
      </p>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const HRDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  useEffect(() => {
    setLoading(true)
    getRequest('hr/dashboard')
      .then((res) => setStats(res?.data?.data))
      .catch(() => toast.error('Failed to load HR dashboard'))
      .finally(() => setLoading(false))
  }, [])

  // ── destructure ───────────────────────────────────────────────────────────
  const overview      = stats?.staffOverview       || {}
  const attendance    = stats?.attendance          || {}
  const leaves        = stats?.leaves              || {}
  const payroll       = stats?.payroll             || {}
  const accounts      = stats?.accounts            || {}
  const deptData      = stats?.departmentWiseStaff || []
  const recentStaff   = stats?.recentStaff         ?? []
  const pendingLeaves = leaves?.pendingList        ?? []
  const attRate       = attendance.attendanceRate  ?? 0

  const now = new Date()
  const newJoinings = recentStaff.filter((s) => {
    const d = new Date(s.dateOfJoining)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  // Department donut (SVG)
  const deptTotal  = deptData.reduce((s, d) => s + d.count, 0) || 1
  const deptColors = ['#042954', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']
  const CIRC = 2 * Math.PI * 36
  let dashOffset = 0
  const donutSegments = deptData.map((d, i) => {
    const dash = (d.count / deptTotal) * CIRC
    const seg  = { offset: dashOffset, dash, color: deptColors[i % deptColors.length] }
    dashOffset += dash
    return seg
  })

  const payrollProgress = payroll.totalSalaryBill > 0
    ? Math.min(100, Math.round((payroll.totalDisbursed / payroll.totalSalaryBill) * 100))
    : 0

  const fmt = (n) => (n ?? 0).toLocaleString('en-IN')

  if (loading) return <DashboardSkeleton />

  return (
    <div className="min-h-screen space-y-4">

      {/* ══ HEADER ══ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">HR Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">Overview of staff, attendance &amp; payroll</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-sm">
          <span className="text-xs font-medium text-slate-600">{today}</span>
        </div>
      </div>

      {/* ══ QUICK ACTIONS ══ */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <QuickActionCard label="Add Staff"       icon={UserPlus}  path="/hr/staff/add"      navigate={navigate} color="#042954" />
        <QuickActionCard label="Attendance"      icon={UserCheck} path="/hr/attendance"     navigate={navigate} color="#2d6a4f" />
        <QuickActionCard label="Leave Approval"  icon={Coffee}    path="/hr/leave/approval" navigate={navigate} color="#d97706" />
        <QuickActionCard label="Departments"     icon={Building2} path="/hr/departments"    navigate={navigate} color="#7c3aed" />
        <QuickActionCard label="Designations"    icon={Briefcase} path="/hr/designations"   navigate={navigate} color="#db2777" />
        <QuickActionCard label="Staff List"      icon={Users}     path="/hr/staff"          navigate={navigate} color="#0891b2" />
      </div>

      {/* ══ STAFF OVERVIEW STATS ══ */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Staff Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <DashboardStatCard
            title="Total Staff"
            value={overview.total || 0}
            icon={Users}
            color="#042954"
            badge={`${overview.active || 0} Active Staff`}
            sub={`${overview.inactive || 0} inactive members`}
            progress={overview.total > 0 ? Math.round(((overview.active || 0) / overview.total) * 100) : 0}
          />
          <DashboardStatCard
            title="Teaching Staff"
            value={overview.teaching || 0}
            icon={BookOpen}
            color="#2d6a4f"
            badge={`${overview.teaching || 0} Teachers`}
            sub="Academic teaching members"
            progress={overview.total > 0 ? Math.round(((overview.teaching || 0) / overview.total) * 100) : 0}
          />
          <DashboardStatCard
            title="Non-Teaching Staff"
            value={overview.nonTeaching || 0}
            icon={Briefcase}
            color="#1a4a7a"
            badge={`${overview.nonTeaching || 0} Non-Teaching`}
            sub="Administrative & support staff"
            progress={overview.total > 0 ? Math.round(((overview.nonTeaching || 0) / overview.total) * 100) : 0}
          />
          <DashboardStatCard
            title="Inactive Staff"
            value={overview.inactive || 0}
            icon={UserX}
            color="#7a2d2d"
            badge={`${overview.inactive || 0} Inactive`}
            sub="Currently not working"
            progress={overview.total > 0 ? Math.round(((overview.inactive || 0) / overview.total) * 100) : 0}
          />
        </div>
      </div>

      {/* ══ QUICK STATS (Attendance, Leave, Payroll, Accounts) ══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <NoticeHomeWorkStatsCard
          title="Today Attendance"
          value={attRate}
          suffix="%"
          icon={UserCheck}
          color="#2d6a4f"
          badge={`${attendance.present || 0} Present`}
          sub={`${attendance.absent || 0} absent · ${attendance.onLeave || 0} on leave`}
        />
        <NoticeHomeWorkStatsCard
          title="Pending Leaves"
          value={leaves.pendingCount || 0}
          icon={Coffee}
          color="#d97706"
          badge={`${leaves.approvedThisMonth || 0} Approved This Month`}
          sub={`${leaves.rejectedThisMonth || 0} rejected this month`}
        />
        <NoticeHomeWorkStatsCard
          title="Payroll Generated"
          value={payroll.generated || 0}
          icon={FileText}
          color="#042954"
          badge={`${payrollProgress}% Disbursed`}
          sub={`${payroll.paidCount || 0} paid · ${payroll.unpaidCount || 0} unpaid`}
        />
        <NoticeHomeWorkStatsCard
          title="Accounts Balance"
          value={(accounts.netBalance ?? 0) >= 0 ? accounts.netBalance || 0 : Math.abs(accounts.netBalance || 0)}
          prefix="₹"
          icon={Wallet}
          color={(accounts.netBalance ?? 0) >= 0 ? '#2d6a4f' : '#7a2d2d'}
          badge={(accounts.netBalance ?? 0) >= 0 ? 'Net Surplus' : 'Net Deficit'}
          sub={`${accounts.voucherCount || 0} vouchers this month`}
        />
      </div>

      {/* ══ ROW: Attendance + Leave Summary ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Attendance Overview */}
        <SectionCard className="lg:col-span-3">
          <SectionHeading
            icon={UserCheck}
            iconColor="text-emerald-600"
            right={
              attendance.date && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {new Date(attendance.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )
            }
          >
            Attendance Overview
          </SectionHeading>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0 flex flex-col items-center">
              <Progress
                type="circle"
                percent={attRate}
                size={120}
                strokeColor={attRate >= 75 ? '#10b981' : attRate >= 50 ? '#f59e0b' : '#ef4444'}
                trailColor="#f1f5f9"
                format={() => (
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-slate-800">{attRate}%</span>
                    <span className="text-[10px] text-slate-400">Attendance</span>
                  </div>
                )}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 w-full">
              <InfoTile label="Marked"      value={fmt(attendance.markedCount)} icon={UserCheck}   color="text-teal-600"    bg="bg-teal-100" />
              <InfoTile label="Present"     value={fmt(attendance.present)}     icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-100" />
              <InfoTile label="Absent"      value={fmt(attendance.absent)}      icon={UserX}        color="text-red-500"     bg="bg-red-100" />
              <InfoTile label="On Leave"    value={fmt(attendance.onLeave)}     icon={Coffee}       color="text-yellow-600"  bg="bg-yellow-100" />
              <InfoTile label="Weekly Off"  value={fmt(attendance.weeklyOff)}   icon={AlertCircle}  color="text-purple-500"  bg="bg-purple-100" />
              <InfoTile label="Not Marked"  value={fmt(attendance.notMarked)}   icon={Clock}        color="text-blue-600"    bg="bg-blue-100" />
            </div>
          </div>
        </SectionCard>

        {/* Leave Summary */}
        <SectionCard className="lg:col-span-2">
          <SectionHeading icon={Coffee} iconColor="text-yellow-600">Leave Summary</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <InfoTile label="Pending"        value={fmt(leaves.pendingCount)}      icon={AlertCircle}  color="text-yellow-600"  bg="bg-yellow-100" />
            <InfoTile label="Approved / Mo." value={fmt(leaves.approvedThisMonth)} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-100" />
            <InfoTile label="Rejected / Mo." value={fmt(leaves.rejectedThisMonth ?? 0)} icon={XCircle} color="text-red-500"    bg="bg-red-100" />
          </div>
          <p className="text-xs font-bold text-slate-500 mb-2">Pending Leave Requests</p>
          {pendingLeaves.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pendingLeaves.map((l) => (
                <div
                  key={l._id}
                  onClick={() => navigate('/hr/leave/approval')}
                  className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-slate-50 rounded-lg px-1 transition"
                >
                  <Avatar style={{ backgroundColor: '#dbeafe', color: '#042954', flexShrink: 0 }}>
                    {l.staff?.employeeName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">{l.staff?.employeeName}</p>
                    <p className="text-xs text-slate-400 truncate">{l.staff?.employeeCode} · {l.staff?.designation?.name}</p>
                  </div>
                  <Tag color="orange" className="!m-0 flex-shrink-0 hidden sm:inline-block">{l.leaveType}</Tag>
                  <Tag color="gold" className="!m-0 flex-shrink-0">Pending</Tag>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <Empty description="No pending leave requests" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
          <button onClick={() => navigate('/hr/leave/approval')} className="mt-3 text-xs text-[#042954] hover:underline flex items-center gap-0.5 font-semibold">
            View All Pending Leaves <ChevronRight className="w-3 h-3" />
          </button>
        </SectionCard>
      </div>

      {/* ══ ROW: Payroll + Accounts ══ */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Payroll & Accounts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <DashboardStatCard
            title="Total Salary Bill"
            value={payroll.totalSalaryBill || 0}
            prefix="₹"
            icon={Wallet}
            color="#1a4a7a"
            badge={`${payroll.month || ''} Payroll`}
            sub={`${payroll.generated || 0} payslips generated`}
            progress={100}
          />
          <DashboardStatCard
            title="Paid Salary"
            value={payroll.paidSalary || 0}
            prefix="₹"
            icon={CheckCircle2}
            color="#2d6a4f"
            badge={`${payroll.paidCount || 0} Staff Paid`}
            sub="Salary successfully disbursed"
            progress={payrollProgress}
          />
          <DashboardStatCard
            title="Unpaid Salary"
            value={payroll.unpaidSalary || 0}
            prefix="₹"
            icon={AlertCircle}
            color="#7a2d2d"
            badge={`${payroll.unpaidCount || 0} Staff Unpaid`}
            sub="Pending salary payment"
            progress={payroll.totalSalaryBill > 0 ? Math.round(((payroll.unpaidSalary || 0) / payroll.totalSalaryBill) * 100) : 0}
          />
          <DashboardStatCard
            title="Total Disbursed"
            value={payroll.totalDisbursed || 0}
            prefix="₹"
            icon={IndianRupee}
            color="#5c6b73"
            badge={`${payrollProgress}% of Bill Disbursed`}
            sub={`${payroll.partialCount || 0} partial · ${payroll.onHoldCount || 0} on hold`}
            progress={payrollProgress}
          />
        </div>
      </div>

      {/* ══ Accounts Summary ══ */}
      {accounts?.month && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <DashboardStatCard
            title="Total Income"
            value={accounts.totalIncome || 0}
            prefix="₹"
            icon={TrendingUp}
            color="#2d6a4f"
            badge={`${accounts.month} Income`}
            sub="Total credit entries"
            progress={100}
          />
          <DashboardStatCard
            title="Total Expense"
            value={accounts.totalExpense || 0}
            prefix="₹"
            icon={TrendingDown}
            color="#7a2d2d"
            badge={`${accounts.month} Expense`}
            sub="Total debit entries"
            progress={accounts.totalIncome > 0 ? Math.min(100, Math.round(((accounts.totalExpense || 0) / accounts.totalIncome) * 100)) : 0}
          />
          <DashboardStatCard
            title="Net Balance"
            value={Math.abs(accounts.netBalance || 0)}
            prefix="₹"
            icon={Wallet}
            color={(accounts.netBalance ?? 0) >= 0 ? '#2d6a4f' : '#7a2d2d'}
            badge={(accounts.netBalance ?? 0) >= 0 ? 'Surplus Balance' : 'Deficit Balance'}
            sub={`${accounts.voucherCount || 0} vouchers this month`}
            progress={100}
          />
          <DashboardStatCard
            title="Vouchers"
            value={accounts.voucherCount || 0}
            icon={Receipt}
            color="#3d5a80"
            badge={`${accounts.month} Vouchers`}
            sub="Income + expense entries"
            progress={100}
          />
        </div>
      )}

      {/* Payroll progress alert */}
      {payroll.unpaidCount > 0 && (
        <div
          onClick={() => navigate('/hr/payroll')}
          className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-red-100/70 transition"
        >
          <span className="text-sm font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {payroll.unpaidCount} staff unpaid — ₹{fmt(payroll.unpaidSalary)} pending
          </span>
          <span className="text-xs text-red-500 font-semibold flex items-center gap-0.5">
            View Payroll <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}

      {/* ══ ROW: Department Distribution + Recent Staff ══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department donut */}
        {deptData.length > 0 && (
          <SectionCard>
            <SectionHeading icon={Building2} iconColor="text-purple-600">
              Department-wise Staff Distribution
            </SectionHeading>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative flex-shrink-0">
                <svg width="130" height="130" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="36" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                  {donutSegments.map((seg, i) => (
                    <circle
                      key={i} cx="48" cy="48" r="36" fill="none"
                      stroke={seg.color} strokeWidth="16"
                      strokeDasharray={`${seg.dash} ${CIRC - seg.dash}`}
                      strokeDashoffset={-seg.offset + CIRC / 4}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px', transition: 'stroke-dasharray 700ms ease' }}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-slate-700">{deptTotal}</span>
                  <span className="text-[10px] text-slate-400">Total</span>
                </div>
              </div>
              <div className="flex-1 w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] text-slate-400 uppercase">
                      <th className="pb-2 font-semibold">Department</th>
                      <th className="pb-2 font-semibold text-right">Staff</th>
                      <th className="pb-2 font-semibold text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptData.map((d, i) => {
                      const pct = Math.round((d.count / deptTotal) * 100)
                      return (
                        <tr key={d._id} onClick={() => navigate(`/hr/staff?department=${d._id}`)}
                          className="cursor-pointer hover:bg-slate-50 transition">
                          <td className="py-1.5 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: deptColors[i % deptColors.length] }} />
                            <span className="truncate text-slate-700">{d.name}</span>
                          </td>
                          <td className="py-1.5 text-right font-bold text-slate-700">{d.count}</td>
                          <td className="py-1.5 text-right text-slate-400">{pct}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Recent Staff */}
        <SectionCard>
          <SectionHeading
            icon={Users}
            right={
              <button onClick={() => navigate('/hr/staff')} className="text-xs text-[#042954] hover:underline flex items-center gap-0.5 font-semibold">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            }
          >
            Recent Staff
          </SectionHeading>
          {recentStaff.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentStaff.slice(0, 5).map((s) => (
                <div
                  key={s._id}
                  onClick={() => navigate(`/hr/staff/${s._id}`)}
                  className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-slate-50 rounded-lg px-1 transition"
                >
                  {s.photo
                    ? <Avatar src={s.photo} size={36} />
                    : <Avatar size={36} style={{ backgroundColor: '#042954' }}>{s.employeeName?.charAt(0)?.toUpperCase()}</Avatar>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{s.employeeName}</p>
                    <p className="text-xs text-slate-400 truncate">{s.employeeCode} · {s.designation?.name}</p>
                  </div>
                  <Tag color={s.staffType === 'Teaching' ? 'blue' : 'orange'} className="!m-0 flex-shrink-0 hidden sm:inline-block">
                    {s.staffType}
                  </Tag>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-slate-400">Joined</p>
                    <p className="text-xs text-slate-600 font-semibold">
                      {new Date(s.dateOfJoining).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="No staff records yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
          {newJoinings > 0 && (
            <p className="mt-2 text-[11px] text-slate-400 font-medium">{newJoinings} new joining(s) this month</p>
          )}
        </SectionCard>
      </div>

    </div>
  )
}

export default HRDashboard
